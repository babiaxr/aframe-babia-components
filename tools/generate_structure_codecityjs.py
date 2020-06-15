#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Simple script to create the admin super user
#
# Copyright (C) 2019
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
#
# Authors:
#   David Moreno Lumbreras <dmorenolumb@gmail.com>
#
#
import argparse
import json
import logging
import math
import os
import ssl
import sys
import pandas as pd
import pytz
from sklearn import preprocessing
import datetime as dt
import copy

from elasticsearch import Elasticsearch
from elasticsearch.connection import create_ssl_context


HTTPS_CHECK_CERT = False
CODECITY_OUTPUT_DATA = ''

HEIGHT_FIELD = ''
AREA_FIELD = ''
DATE_FIELD = ''

ENTITIES_SIMPLE_ACC = []


def main():
    global ENTITIES_SIMPLE_ACC, CODECITY_OUTPUT_DATA, HEIGHT_FIELD, AREA_FIELD, DATE_FIELD
    args = parse_args()

    if args.debug:
        logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(message)s')
        logging.debug("Debug mode activated")
    else:
        logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    
    if not args.output_file:
        sys.exit('Error, no elastic url and index or dataframe/index_file defined, please see help [-h]')
    else:
        CODECITY_OUTPUT_DATA = args.output_file
        
    if not args.height_field or not args.area_field or not args.date_field:
        sys.exit('Error, you must define the height area and date field of the index to define the metrics'
                 'of the city, please see help [-h]')
    else:
        HEIGHT_FIELD = args.height_field
        AREA_FIELD = args.area_field
        DATE_FIELD = args.date_field

    if not args.enriched_dataframe:
        # Retrieve index and generate index backup
        if args.elastic_url and args.index and not (args.index_file or args.dataframe):
            if os.path.exists(args.index_file):
                os.remove(args.index_file)
            get_index_data(args.elastic_url, args.index, args.index_file)

        # Generate dataframe
        if args.index_file:
            df = get_dataframe(args.index_file, args.repo)
        elif not args.index_file and not args.dataframe:
            sys.exit('Error, no dataframe/index_file defined, please see help [-h]')

        # Export dataframe
        if args.export_dataframe:
            logging.debug("Exporting index data to csv")
            df.to_csv(args.export_dataframe)

        # Load dataframe from file
        if args.dataframe:
            logging.debug("Loading dataframe from csv file")
            df = pd.read_csv(args.dataframe)

        # Check that at leas the dataframe is defined
        if not args.dataframe and not args.index_file and not (args.elastic_url and args.index):
            sys.exit('Error, no elastic url and index or dataframe/index_file defined, please see help [-h]')

        # Enrich data adding columns of each folder
        df = enrich_data(df, args.repo)

        # Export enriched dataframe
        if args.export_enriched_dataframe:
            logging.debug("Exporting enriched index data to csv")
            df.to_csv(args.export_enriched_dataframe)
    else:
        # We have the enriched dataframe, so we can go with it
        logging.debug("Loading enriched dataframe from csv file")
        df = pd.read_csv(args.enriched_dataframe)

    if args.time_evolution:
        main_json = {
            "date_field": DATE_FIELD,
            "init_data": "data_0",
            "time_evolution": True,
            "time_evolution_commit_by_commit": False,
            "data_files": []
        }
        
        df[DATE_FIELD] = pd.to_datetime(df[DATE_FIELD])
        i = 0
        
        if args.delta_days and args.samples and not args.commitbycommit:
            main_json["sampling_days"] = args.delta_days
            # Time evolution defining samples number
            while i < int(args.samples):
                logging.debug("{} lap of time evolution".format(i))
                data, commit_sha = extract_data(df, dt.datetime.now(pytz.utc) - dt.timedelta(days=i*float(args.delta_days)))
                if data is None:
                    break
                entities_simple = find_children(data, [])
                entities_tree = generate_entities(data, [])
                if args.export_snapshots:
                    dump_codecity_data(entities_simple, "data_{}.json".format(i))
                    dump_codecity_data(entities_tree[0], "data_{}_tree.json".format(i))
    
                main_json["data_files"].append({
                    'date': dt.datetime.timestamp(
                        dt.datetime.now(pytz.utc) - dt.timedelta(days=i*float(args.delta_days))),
                    'file': "data_{}.json".format(i),
                    'key': "data_{}".format(i),
                    'key_tree': "data_{}_tree".format(i),
                    'commit_sha': commit_sha,
                    'data_{}'.format(i): entities_simple,
                    'data_{}_tree'.format(i): entities_tree[0]
                })
                i += 1
        elif not args.samples and args.commitbycommit:
            # Time evolution commit by commit
            main_json['time_evolution_commit_by_commit'] = True
            # First, get the first city, the most updated
            logging.debug("{} lap of time evolution, initial tree".format(i))
            data, _ = extract_data(df, dt.datetime.now(pytz.utc) - dt.timedelta(days=0))
            entities_simple = find_children(data, [])
            ENTITIES_SIMPLE_ACC = entities_simple
            entities_tree = generate_entities(data, [])
            if args.export_snapshots:
                dump_codecity_data(entities_simple, "data_{}.json".format(i))
                dump_codecity_data(entities_tree[0], "data_{}_tree.json".format(i))

            main_json["data_files"].append({
                'date': dt.datetime.timestamp(
                    dt.datetime.now(pytz.utc) - dt.timedelta(days=0)),
                'file': "data_{}.json".format(i),
                'key': "data_{}".format(i),
                'key_tree': "data_{}_tree".format(i),
                'data_{}'.format(i): copy.deepcopy(entities_simple),
                'data_{}_tree'.format(i): entities_tree[0]
            })
            
            # Go for the commits
            commit_list = get_commit_list(df,
                                          dt.datetime.now(pytz.utc) -
                                          dt.timedelta(days=0),
                                          main_json,
                                          args)
            main_json['commit_list'] = commit_list
            logging.debug("Commit by commit finished")
            
            
        # Export the main
        dump_codecity_data(main_json, "main_data.json")
    else:
        df[DATE_FIELD] = pd.to_datetime(df[DATE_FIELD])
        data, _ = extract_data(df, dt.datetime.now(pytz.utc))
        entities = generate_entities(data, [])
        dump_codecity_data(entities, "data.json")

    print("exit")


def get_commit_list(df, date, main_json, args):
    global ENTITIES_SIMPLE_ACC
    commit_list = []
    i = 1

    diff = (df[DATE_FIELD] - date)
    indexmax = (diff[(diff < pd.to_timedelta(0))].idxmax())
    last_commit = df.ix[indexmax]
    main_json["data_files"][0]['commit_sha'] = last_commit['commit_sha']
    
    while True:
        logging.debug("{} lap of time evolution commit by commit".format(i))
        
        commit_list.append(last_commit['commit_sha'])
        
        # Check if has parents
        if last_commit['commit_parents'] != '[]':
            splitted = last_commit['commit_parents'].split('\'')
            if len(splitted) > 3:
                next_commit = last_commit['commit_parents'].split('\'')[3]
            else:
                next_commit = last_commit['commit_parents'].split('\'')[1]
        else:
            break
    
        # Extract data from the commit
        df_next_commit = df[df['commit_sha'] == next_commit]
        next_files = eval(df_next_commit.iloc[0]['files_at_commit'])
        prev_files = eval(last_commit['files_at_commit'])
        df_next_commit['put_negative_height'] = False

        # Adds files that has been deleted
        rows_to_add = []
        difference = list(set(prev_files) - set(next_files))
        for to_delete in difference:
            row_to_delete = df[df['file_path'] == to_delete]
            if not row_to_delete.empty:
                row_to_delete['put_negative_height'] = True
                rows_to_add.append(row_to_delete.iloc[0])
        
        # Create final DF
        if len(rows_to_add) > 0:
            df_next_commit = df_next_commit.append(rows_to_add)
        
        # Extract data
        data = extract_data_from_df_filtered(df_next_commit, df_next_commit)
        
        # Save data
        entities_simple = find_children(data, [])

        ############ REVERSE - PAST to PRESENT ###############
        # Adds files that has been deleted reverse
        rows_to_add = []
        difference = list(set(next_files) - set(prev_files))
        for to_delete in difference:
            row_to_delete = df[df['file_path'] == to_delete]
            if not row_to_delete.empty:
                row_to_delete['put_negative_height'] = True
                rows_to_add.append(row_to_delete.iloc[0])

        # Create final DF
        if len(rows_to_add) > 0:
            df_next_commit = df_next_commit.append(rows_to_add)

        # Extract data
        data_reverse = extract_data_from_df_filtered(df_next_commit, df_next_commit)

        # Save data
        entities_simple_reverse = find_children(data_reverse, [])
        #######################################################
        
        # Acumulated entities to modify for changing the tree of the next snapshots
        for entity in ENTITIES_SIMPLE_ACC:
            for entity_for_changing in entities_simple:
                if entity['id'] == entity_for_changing['id']:
                    entity['height'] = entity_for_changing['height']
                    entity['area'] = entity_for_changing['area']
            
        
        # entities_tree = generate_entities(data, [])
        if args.export_snapshots:
            dump_codecity_data(entities_simple, "data_{}.json".format(i))
            # dump_codecity_data(entities_simple_all_commits_tree, "data_{}_tree.json".format(i))
            dump_codecity_data(ENTITIES_SIMPLE_ACC, "data_{}_allfiles.json".format(i))
        main_json["data_files"].append({
            'date': dt.datetime.timestamp(df_next_commit.iloc[0][DATE_FIELD]),
            'commit_sha': next_commit,
            'key': "data_{}".format(i),
            'key_tree': "data_{}_tree".format(i),
            'file': "data_{}.json".format(i),
            'data_{}'.format(i): entities_simple,
            'data_reverse_{}'.format(i): entities_simple_reverse,
            # 'data_{}_tree'.format(i): entities_simple_all_commits_tree
            'data_{}_allfiles'.format(i): copy.deepcopy(ENTITIES_SIMPLE_ACC)
        })
        
        # Increment last_commit and i var
        last_commit = df_next_commit.iloc[0]
        i += 1
    
    return commit_list


def find_children(data, entities):
    for i, item in enumerate(data):
        if 'children' in item:
            find_children(item['children'], entities)
        else:
            entities.append(item)
    return entities


def generate_entities(data, entities):
    for i, item in enumerate(data):
        if 'children' in item and 'children' in item['children'][0]:
            new_item = {
                "id": item['id'],
                "children": []
            }
            generate_entities(item['children'], new_item['children'])
            entities.append(new_item)
        else:
            
            # TODO: Bypass if
            if 'children' not in item:
                continue
            new_item = {
                "id": item['id'],
                "children": []
            }
            for n, leaf in enumerate(item['children']):
                # TODO: Bypass if
                if 'height' not in leaf:
                    continue
                new_leaf = {
                    "id": leaf['id'],
                    "area": leaf['area'],
                    "max_area": leaf['max_area'],
                    "height": leaf['height']
                }
                new_item['children'].append(new_leaf)
            entities.append(new_item)

    return entities


def parse_args():
    parser = argparse.ArgumentParser(usage="usage: generate_structure_codecity.py [options]",
                                     description="Generate the structure needed to feed the geocodecitycomponent")
    parser.add_argument("-e", "--elastic-url", required=False,
                        help="Elasticsearch URL with the metrics")
    parser.add_argument('-g', '--debug', action='store_true')
    parser.add_argument('-i', '--index', required=False, help='Index with the metrics')
    parser.add_argument('-t', '--type', required=False, help='Type of the codecity layout')
    parser.add_argument('--csvfile', required=False,
                        help='Generate a CSV file instead a JSON')
    parser.add_argument('--repo', required=True,
                        help='Define the repo that will be the city')
    parser.add_argument('-if', '--index-file', required=False,
                        help='Instead of the elastic, load data by a file')
    parser.add_argument('-df', '--dataframe', required=False,
                        help='Instead of the elastic, load data by dataframe')
    parser.add_argument('-edf', '--enriched-dataframe', required=False,
                        help='Instead of the elastic, load data by dataframe')
    parser.add_argument('-exdf', '--export-dataframe', required=False,
                        help='Export the dataframe of the index data"')
    parser.add_argument('-exedf', '--export-enriched-dataframe', required=False,
                        help='Export the enriched dataframe of the index data"')
    parser.add_argument('-time', '--time-evolution', required=False, action='store_true',
                        help='Time evolution analisys')
    parser.add_argument('-ddays', '--delta-days', required=False,
                        help='Sampling days for the time evolution analisys')
    parser.add_argument('-s', '--samples', required=False,
                        help='Time evolution analisys')
    parser.add_argument('-cbc', '--commitbycommit', required=False, action='store_true',
                        help='Time evolution analisys commit by commit')
    parser.add_argument('-exsnap', '--export-snapshots', required=False, action='store_true',
                        help='Time evolution analisys commit by commit')
    parser.add_argument('-o', '--output-file', required=True,
                        help='Define the path of the produced files')
    parser.add_argument('-hfield', '--height-field', required=True,
                        help='Define the field that will be used as building heights')
    parser.add_argument('-afield', '--area-field', required=True,
                        help='Define the field that will be used as building areas')
    parser.add_argument('-dfield', '--date-field', required=True,
                        help='Define the field that will be used as date')

    return parser.parse_args()


def get_index_data(es_url=None, index=None, index_file=None):
    ssl_context = create_ssl_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    es = Elasticsearch([es_url], timeout=120, max_retries=20, ssl_context=ssl_context, retry_on_timeout=True,
                       verify_certs=HTTPS_CHECK_CERT)

    if not es.indices.exists(index=index):
        print("Index %s doesnt exist!" % index)
        return

    page = es.search(
        index=index,
        scroll="1m",
        size=10,
        body={
            "query": {
                "match_all": {}
            }
        }
    )

    sid = page['_scroll_id']
    scroll_size = page['hits']['total']

    if scroll_size == 0:
        print("No data found!")
        return

    while scroll_size > 0:
        for item in page['hits']['hits']:
            logging.debug("Writing to json")
            with open(index_file, 'a') as f:
                json.dump(item['_source'], f)
                f.write('\n')

        page = es.scroll(scroll_id=sid, scroll='1m')
        sid = page['_scroll_id']
        scroll_size = len(page['hits']['hits'])


def get_dataframe(file, repo):
    df = pd.DataFrame()

    file = open(file, 'r')
    rows = file.readlines()

    i = 0
    while i < len(rows):
        line = rows[i]
        item = json.loads(line)
        # Filter by repo
        if repo in item['origin']:
            logging.debug("Inserting item {}/{} to csv".format(i, len(rows)))
            df = df.append(item, ignore_index=True)
        
        i = i + 1
        '''
        if item[key_field] not in data:
            entity = generate_entity(item, key_field)
            data[item[key_field]] = entity
        else:
            data[item[key_field]]['height'] += 1
        '''

    return df


def enrich_data(df, repo):
    # TODO: filter by project here
    df = df[df['origin'] == repo]

    print(df.head())
    # Divide path in subfolders
    for i, row in df.iterrows():
        logging.debug(row['file_path'])
        tree_folder = row['file_path'].split(os.sep)
        df.set_value(i, 'file_path_list', str(tree_folder))
        df.set_value(i, 'n_folders', len(tree_folder))
        acc = ""
        for n, item in enumerate(tree_folder):
            acc += "/" + item
            df.set_value(i, 'folder_{}'.format(n), item)
            df.set_value(i, 'folder_acc_{}'.format(n), acc)
        
        # Find when the file was created
        df_file = df[df['file_path'] == row['file_path']]
        creation_date = df_file[DATE_FIELD].min()
        df.set_value(i, 'file_created_on', creation_date)
        
        if row[DATE_FIELD] == creation_date:
            if 'commit_parents' in row and row['commit_parents'] != '[]':
                df.set_value(i, 'parent_commit_created', row['commit_parents'].split('\'')[1])
            else:
                df.set_value(i, 'parent_commit_created', "not parent")
        else:
            df.set_value(i, 'parent_commit_created', "none")

        
        

    # Normalize height
    df[HEIGHT_FIELD] = df[HEIGHT_FIELD].fillna(0.1)
    df = normalize_column(df, HEIGHT_FIELD, 0.1, 20)
    df[AREA_FIELD] = df[AREA_FIELD].fillna(0.1)
    df = normalize_column(df, AREA_FIELD, 1, 30)

    return df


def normalize_column(df, field, scalar_bottom, scalar_top):
    scaler = preprocessing.MinMaxScaler(feature_range=(scalar_bottom, scalar_top))
    df['{}_normalized'.format(field)] = scaler.fit_transform(df[[field]])
    return df


def extract_data(df_raw, date):
    # df = df_raw[df_raw[DATE_FIELD].str.contains('2018')]
    df, commit_sha = filter_closest_date(df_raw, date)
    if df.empty:
        return None, None
    entities = extract_data_from_df_filtered(df_raw, df)
    return entities, commit_sha
    
    
def extract_data_from_df_filtered(df_raw, df):
    entities = []

    for project in df['project'].unique():
        df_project = df[df['project'] == project]
        entity_project = {
            "id": str(project),
            "children": [],
            #'area': df_project['loc'].sum()
            'area': len(df_project.index)
        }

        for repository in df_project['origin'].unique():
            df_repo = df_project[df_project['origin'] == repository]
            entity_repo = {
                "id": str(repository),
                "children": [],
                #'area': df_repo['loc'].sum(),
                'area': len(df_repo.index)
            }
            build_folders(df_repo, entity_repo['children'], 0, df['n_folders'].max(), df_raw)

            entity_project['children'].append(entity_repo)

        entities.append(entity_project)

    return entities


def filter_closest_date(df, date):
    df_filtered = pd.DataFrame()
    for file in df['file_path'].unique():
        df_file = df[df['file_path'] == file]
        diff = (df_file[DATE_FIELD] - date)
        try:
            indexmax = (diff[(diff < pd.to_timedelta(0))].idxmax())
            df_filtered = df_filtered.append(df_file.ix[[indexmax]])
        except ValueError:
            continue
            
    # Get last commit of date
    if not df_filtered.empty:
        diff = (df_filtered[DATE_FIELD] - date)
        indexmax = (diff[(diff < pd.to_timedelta(0))].idxmax())
        commit_sha = df_filtered.ix[[indexmax]].iloc[0]['commit_sha']
    else:
        commit_sha = None

    return df_filtered, commit_sha


def build_folders(df, arr, index, max_levels, df_raw):
    # leafs folder
    leafs_folder = {"id": ".", 'children': []}

    for acc_folder in df['folder_acc_{}'.format(index)].unique():
        if str(acc_folder) != 'nan':
            folder = acc_folder.split("/")[-1]
        else:
            folder = acc_folder
        df_folder = df[df['folder_{}'.format(index)] == folder]
        if str(folder) != 'nan':
            # Is leaf or not in order to put height
            if (index == max_levels-1) or \
                    (len(df_folder['folder_{}'.format(index + 1)].unique()) == 1 and
                     str(df_folder['folder_{}'.format(index + 1)].unique()[0]) == 'nan'):
                df_raw_filtered = df_raw[df_raw['folder_acc_{}'.format(index)] == acc_folder]
                
                # Check if the file exists in the current snapshot
                if df_folder['ext'].isnull().values.any():
                    height_final = -0.2
                else:
                    height_final = max(df_folder['{}_normalized'.format(HEIGHT_FIELD)].sum(), 0.1)
                    
                # If commit by commit evolution and the flag put_negative_height is on
                if 'put_negative_height' in df_folder and df_folder.iloc[0]['put_negative_height']:
                    height_final = -0.2
                    
                leaf = {
                    "id": df_folder['file_path'].values[0],
                    "name": str(folder),
                    'height': height_final,
                    'area': df_folder['{}_normalized'.format(AREA_FIELD)].sum(),
                    'max_area': df_raw_filtered['{}_normalized'.format(AREA_FIELD)].max()
                }
                # Name of the folder that contains the leafs
                if index > 0:
                    leafs_folder['id'] = str('{}/.'.format(df_folder['folder_acc_{}'.format(index - 1)].unique()[0]))
                leafs_folder['children'].append(leaf)
            # Is parent of leaf
            elif (index == max_levels-2) or \
                    (len(df_folder['folder_{}'.format(index + 2)].unique()) == 1 and
                     str(df_folder['folder_{}'.format(index + 2)].unique()[0]) == 'nan'):
                df_raw_filtered = df_raw[df_raw['folder_acc_{}'.format(index)] == acc_folder]
                entity_folder = {
                    "id": str(acc_folder),
                    'children': [],
                    'area': len(df_raw_filtered['file_path'].unique())
                }
                build_folders(df_folder, entity_folder['children'], index + 1, max_levels, df_raw)
                
                # Add with height negative the files that will exist in the past but not exist in the present
                for j, row in df_raw_filtered.iterrows():
                    if not any(x["id"] == row['file_path'] for x in entity_folder['children'][0]['children']):
                        df_raw_filtered_leaf = df_raw[df_raw['folder_acc_{}'.format(index+1)]
                                                      == row['folder_acc_{}'.format(index+1)]]
                        leaf_not_now = {
                            "id": row['file_path'],
                            "name": str(row['folder_{}'.format(index+1)]),
                            'height': -0.2,
                            'area': row['{}_normalized'.format(AREA_FIELD)],
                            'max_area': df_raw_filtered_leaf['{}_normalized'.format(AREA_FIELD)].max()
                        }
                        entity_folder['children'][0]['children'].append(leaf_not_now)
                ###################################################################
                
                arr.append(entity_folder)
            else:
                # df_raw_filtered = df_raw[df_raw['folder_{}'.format(index)] == folder]
                entity_folder = {
                    "id": str(acc_folder),
                    'children': [],
                    'area': len(df_folder.index)
                }
                build_folders(df_folder, entity_folder['children'], index + 1, max_levels, df_raw)
                arr.append(entity_folder)

    # Adds if filled
    if len(leafs_folder['children']) > 0:
        arr.append(leafs_folder)


def dump_codecity_data(data, filename):
    with open(CODECITY_OUTPUT_DATA + filename, 'w') as f:
        json.dump(data, f)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        s = "\n\nReceived Ctrl-C or other break signal. Exiting.\n"
        sys.stdout.write(s)
        sys.exit(0)
