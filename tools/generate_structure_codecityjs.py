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

from elasticsearch import Elasticsearch
from elasticsearch.connection import create_ssl_context


HTTPS_CHECK_CERT = False
INDEX_DATA_FILE = 'index_backups/index_backup_graal_cocom_incubator.json'
DATAFRAME_CSV_EXPORT_FILE = 'df_backups/index_dataframe_graal_cocom_incubator_perceval.csv'
DATAFRAME_CSV_ENRICHED_EXPORT_FILE = 'df_backups/index_dataframe_graal_cocom_incubator_enriched_perceval.csv'

CODECITY_OUTPUT_DATA = '../examples/codecityjs/time_evolution/'

HEIGHT_FIELD = 'loc'
AREA_FIELD = 'num_funs'
DATE_FIELD = 'grimoire_creation_date'


def main():
    args = parse_args()

    if args.debug:
        logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(message)s')
        logging.debug("Debug mode activated")
    else:
        logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)

    if not args.enriched_dataframe:
        # Retrieve index and generate index backup
        if args.elastic_url and args.index and not (args.index_file or args.dataframe):
            if os.path.exists(INDEX_DATA_FILE):
                os.remove(INDEX_DATA_FILE)
            get_index_data(args.elastic_url, args.index)

        # Generate dataframe
        if args.index_file:
            df = get_dataframe(args.index_file, args.repo)
        elif not args.index_file and not args.dataframe:
            df = get_dataframe(INDEX_DATA_FILE, args.repo)

        # Export dataframe
        if args.export_dataframe:
            logging.debug("Exporting index data to csv")
            df.to_csv(DATAFRAME_CSV_EXPORT_FILE)

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
            df.to_csv(DATAFRAME_CSV_ENRICHED_EXPORT_FILE)
    else:
        # We have the enriched dataframe, so we can go with it
        logging.debug("Loading enriched dataframe from csv file")
        df = pd.read_csv(args.enriched_dataframe)

    if args.time_evolution:
        main_json = {
            "date_field": DATE_FIELD,
            "sampling_days": args.time_evolution,
            "init_data": "data_0_tree.json",
            "time_evolution": True,
            "data_files": []
        }
        
        df[DATE_FIELD] = pd.to_datetime(df[DATE_FIELD])
        # TODO: Change
        #for i in range(0, N_TIME_EVOLUTION):
        not_ok = False
        i = 0
        while i < int(args.samples):
            logging.debug("{} lap of time evolution".format(i))
            data = extract_data(df, dt.datetime.now(pytz.utc) - dt.timedelta(days=i*float(args.time_evolution)))
            entities_simple = find_children(data, [])
            entities_tree = generate_entities(data, [])
            dump_codecity_data(entities_simple, "data_{}.json".format(i))
            dump_codecity_data(entities_tree[0], "data_{}_tree.json".format(i))

            main_json["data_files"].append({
                'date': dt.datetime.timestamp(dt.datetime.now(pytz.utc) - dt.timedelta(days=i*float(args.time_evolution))),
                'file': "data_{}.json".format(i)
            })
            i += 1
            
        # Export the main
        dump_codecity_data(main_json, "main_data.json")
    else:
        df[DATE_FIELD] = pd.to_datetime(df[DATE_FIELD])
        data = extract_data(df, dt.datetime.now(pytz.utc))
        entities = generate_entities(data, [])
        dump_codecity_data(entities, "data.json")

    print("exit")


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
    parser.add_argument('-exdf', '--export-dataframe', action='store_true',
                        help='Export the dataframe of the index data"')
    parser.add_argument('-exedf', '--export-enriched-dataframe', action='store_true',
                        help='Export the enriched dataframe of the index data"')
    parser.add_argument('-time', '--time-evolution', required=False,
                        help='Time evolution analisys')
    parser.add_argument('-s', '--samples', required=False,
                        help='Time evolution analisys')

    return parser.parse_args()


def get_index_data(es_url=None, index=None):
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
            with open(INDEX_DATA_FILE, 'a') as f:
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

    # Normalize height
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
    df = filter_closest_date(df_raw, date)
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

    return df_filtered


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
                    
                leaf = {
                    "id": df_folder['file_path'].values[0],
                    "name": str(folder),
                    'height': height_final,
                    'area': df_folder['{}_normalized'.format(AREA_FIELD)].sum(),
                    'max_area': df_raw_filtered['{}_normalized'.format(AREA_FIELD)].max()
                }
                leafs_folder['children'].append(leaf)
            # Is parent of leaf
            elif (index == max_levels-2) or \
                    (len(df_folder['folder_{}'.format(index + 2)].unique()) == 1 and
                     str(df_folder['folder_{}'.format(index + 2)].unique()[0]) == 'nan'):
                df_raw_filtered = df_raw[df_raw['folder_acc_{}'.format(index)] == acc_folder]
                entity_folder = {
                    "id": str(folder),
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
                    "id": str(folder),
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
