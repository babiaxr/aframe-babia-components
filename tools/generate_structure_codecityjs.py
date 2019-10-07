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
import tools.process_list_items as pli
from sklearn import preprocessing
import datetime as dt

from elasticsearch import Elasticsearch
from elasticsearch.connection import create_ssl_context


HTTPS_CHECK_CERT = False
INDEX_DATA_FILE = 'index_backup_graal_cocom.json'
DATAFRAME_CSV_EXPORT_FILE = 'index_dataframe_graal_cocom.csv'
DATAFRAME_CSV_ENRICHED_EXPORT_FILE = 'index_dataframe_graal_cocom_enriched.csv'

CODECITY_OUTPUT_DATA = './'

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
            df = get_dataframe(args.index_file, args.build)
        elif not args.index_file and not args.dataframe:
            df = get_dataframe(INDEX_DATA_FILE, args.build)

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
        df = enrich_data(df)

        # Export enriched dataframe
        if args.export_enriched_dataframe:
            logging.debug("Exporting enriched index data to csv")
            df.to_csv(DATAFRAME_CSV_ENRICHED_EXPORT_FILE)
    else:
        # We have the enriched dataframe, so we can go with it
        logging.debug("Loading enriched dataframe from csv file")
        df = pd.read_csv(args.enriched_dataframe)

    if args.time_evolution:
        df[DATE_FIELD] = pd.to_datetime(df[DATE_FIELD])
        for i in range(0, 3):
            data = extract_data(df, dt.datetime.now(pytz.utc) - dt.timedelta(days=i*100))
            # entities = pli.process_list(data, init_pos_x, init_pos_y) OLD ONE
            # entities = generate_entities(data, [])
            if i > 0:
                entities = find_children(data, [])
            else:
                entities = generate_entities(data, [])
            dump_codecity_data(entities, "data_{}.json".format(i))
            #init_pos_x = entities['root']['position']['x']*2 + 2
            #init_pos_y = entities['root']['position']['z']*2 + 2
    else:
        df[DATE_FIELD] = pd.to_datetime(df[DATE_FIELD])
        data = extract_data(df, dt.datetime.now(pytz.utc))
        # entities = pli.process_list(data, 0, 0)
        entities = generate_entities(data, [])
        dump_codecity_data(entities, "data.json")

    #df_gr = df[df['project']=="GrimoireLab"]

    #codecity_data = add_layout(entities_data, args.type)

    #dump_codecity_data(codecity_data)
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
                "block": item['id'],
                "blocks": []
            }
            generate_entities(item['children'], new_item['blocks'])
            entities.append(new_item)
        else:
            # TODO: Bypass if
            if 'children' not in item:
                continue
            new_item = {
                "block": item['id'],
                "items": []
            }
            for n, leaf in enumerate(item['children']):
                # TODO: Bypass if
                if 'height' not in leaf:
                    continue
                new_leaf = {
                    "id": leaf['id'],
                    "area": leaf['value'],
                    "height": leaf['height']
                }
                new_item['items'].append(new_leaf)
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
    parser.add_argument('--build', required=False,
                        help='Define the field that will be the buildings')
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
    parser.add_argument('-time', '--time-evolution', action='store_true',
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


def get_dataframe(file=None, index=None):
    df = pd.DataFrame()

    file = open(file, 'r')
    rows = file.readlines()

    for i, line in enumerate(rows):
        item = json.loads(line)
        logging.debug("Inserting item {}/{} to csv".format(i, len(rows)))
        df = df.append(item, ignore_index=True)
        if i == 30000:
            break

        '''
        if item[key_field] not in data:
            entity = generate_entity(item, key_field)
            data[item[key_field]] = entity
        else:
            data[item[key_field]]['height'] += 1
        '''

    return df


def enrich_data(df):
    # TODO: filter by project here
    df = df[df['origin'] == "https://github.com/chaoss/grimoirelab-perceval"]

    print(df.head())
    # Divide path in subfolders
    for i, row in df.iterrows():
        logging.debug(row['file_path'])
        tree_folder = row['file_path'].split(os.sep)
        df.set_value(i, 'file_path_list', str(tree_folder))
        df.set_value(i, 'n_folders', len(tree_folder))
        for n, item in enumerate(tree_folder):
            df.set_value(i, 'folder_{}'.format(n), item)

    # Normalize height
    df = normalize_column(df, HEIGHT_FIELD, 5)
    df = normalize_column(df, AREA_FIELD, 1)

    return df


def normalize_column(df, field, scalar):
    x = df[[field]].values.astype(float)
    min_max_scaler = preprocessing.MinMaxScaler()
    x_scaled = min_max_scaler.fit_transform(x)
    df['{}_normalized'.format(field)] = pd.DataFrame(x_scaled) * scalar
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
            #"value": df_project['loc'].sum()
            "value": len(df_project.index) * 10
        }

        for repository in df_project['origin'].unique():
            df_repo = df_project[df_project['origin'] == repository]
            entity_repo = {
                "id": str(repository),
                "children": [],
                #"value": df_repo['loc'].sum(),
                "value": len(df_repo.index) * 10
            }
            build_folders(df_repo, entity_repo['children'], 0, df['n_folders'].max())

            entity_project['children'].append(entity_repo)

        entities.append(entity_project)

    return entities


def filter_closest_date(df, date):
    df_filtered = pd.DataFrame()


    for file in df['file_path'].unique():
        df_file = df[df['file_path'] == file]
        diff = (df_file[DATE_FIELD] - date)
        indexmax = (diff[(diff < pd.to_timedelta(0))].idxmax())
        df_filtered = df_filtered.append(df_file.ix[[indexmax]])

    return df_filtered


def build_folders(df, arr, index, max_levels):
    # leafs folder
    leafs_folder = {"id": ".", 'children': []}

    for folder in df['folder_{}'.format(index)].unique():
        df_folder = df[df['folder_{}'.format(index)] == folder]
        if str(folder) != 'nan':
            # Is leaf or not in order to put height
            if (index == max_levels-1) or (len(df_folder['folder_{}'.format(index + 1)].unique()) == 1 and str(df_folder['folder_{}'.format(index + 1)].unique()[0]) == 'nan'):
                leaf = {"id": str(folder), 'height': max(df_folder['{}_normalized'.format(HEIGHT_FIELD)].sum(), 0.1), 'value': 1*10}
                leafs_folder['children'].append(leaf)
                #entity_folder['height'] = max(df_folder['{}_normalized'.format(HEIGHT_FIELD)].sum(), 0.1)
                #entity_folder['value'] = 1 * 10
            else:
                entity_folder = {"id": str(folder), 'children': [], 'value': len(df_folder.index) * 10}
                build_folders(df_folder, entity_folder['children'], index + 1, max_levels)
                arr.append(entity_folder)

    # Adds if filled
    if len(leafs_folder['children']) > 0:
        arr.append(leafs_folder)


# def path_to_columns_git_aoc(row):
#     logging.debug(row['file_path_list'])
#     for i, item in enumerate(row['file_path_list']):
#         row['folder_{}'.format(i)] = item
#     row['n_folders'] = len(row['file_path_list'])
#
#
# def extract_data_old_metrics_git(df):
#     print(df.head())
#     entities = []
#     val_parent = 0
#     for project in df['project'].unique():
#         entity = {
#             "id": project,
#             "children": []
#         }
#         entities.append(entity)
#         df_pr = df[df['project'] == project]
#         for repo in df_pr['repo_name'].unique():
#             df_repo = df_pr[df_pr['repo_name'] == repo]
#
#             value = len(df_repo['Author_name'].unique())
#             val_parent += value
#
#             entity_repo = {
#                 "id": repo,
#                 "value": value
#             }
#             entity['children'].append(entity_repo)
#
#         entity['value'] = val_parent
#
#     return entities


# def generate_entity(item, key):
#     entity = {
#         'key': item[key],
#         'height': 1,
#         'width': 1,
#         'depth': 1,
#     }
#     return entity


def add_layout(entities, type):
    data = {}
    if type == 'cascade':
        data = add_cascade_layout(entities)
    if type == 'cube':
        data = add_cube_layout(entities)

    return data


def add_cascade_layout(entities):
    x_pos = 0
    offset_prev = 0

    for name, entity in entities.items():
        x_pos += offset_prev
        entity['position'] = {
            'x': x_pos,
            'y': 0,
            'z': 0
        }
        offset_prev = entity['width']

    return entities


def add_cube_layout(entities):
    x_pos = 0
    z_pos = 0
    offsetz_prev = 0
    offsetx_prev = 0
    side_len = math.sqrt(len(entities.items()))
    count_items = 0

    for name, entity in entities.items():
        x_pos += offsetx_prev
        entity['position'] = {
            'x': x_pos,
            'y': 0,
            'z': z_pos
        }
        count_items += 1
        if count_items > side_len:
            count_items = 0
            x_pos = 0
            z_pos += offsetz_prev
            offsetz_prev = entity['depth']
            offsetx_prev = 0
            continue
        offsetx_prev = entity['width']

    return entities


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
