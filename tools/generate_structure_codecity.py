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
import tools.process_list_items as pli

from elasticsearch import Elasticsearch
from elasticsearch.connection import create_ssl_context


HTTPS_CHECK_CERT = False
INDEX_DATA_FILE = 'index_backup.json'
DATAFRAME_CSV_EXPORT_FILE = 'index_dataframe.csv'

CODECITY_OUTPUT_DATA = '../examples/test_codecity_git_index/data.json'


def main():
    args = parse_args()

    if args.debug:
        logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(message)s')
        logging.debug("Debug mode activated")
    else:
        logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)

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

    # And go with df now
    data = extract_data(df)

    entities = pli.process_list(data)
    dump_codecity_data(entities)
    #df_gr = df[df['project']=="GrimoireLab"]

    #codecity_data = add_layout(entities_data, args.type)

    #dump_codecity_data(codecity_data)
    print("exit")

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
    parser.add_argument('-exdf', '--export-dataframe', action='store_true',
                        help='Export the dataframe of the index data"')

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
            with open(INDEX_DATA_FILE, 'a') as f:
                json.dump(item['_source'], f)
                f.write('\n')

        page = es.scroll(scroll_id=sid, scroll='1m')
        sid = page['_scroll_id']
        scroll_size = len(page['hits']['hits'])


def get_dataframe(file=None, index=None):
    df = pd.DataFrame()
    key_field = "repo_name"
    data = {}

    file = open(file, 'r')
    rows = file.readlines()

    for i, line in enumerate(rows):
        item = json.loads(line)
        logging.debug("Inserting item {}/{} to csv".format(i, len(rows)))
        df = df.append(item, ignore_index=True)

        '''
        if item[key_field] not in data:
            entity = generate_entity(item, key_field)
            data[item[key_field]] = entity
        else:
            data[item[key_field]]['height'] += 1
        '''

    return df


def extract_data(df):
    print(df.head())
    entities = []

    for project in df['repo_name'].unique():
        entity = {
            "id": project,
            "value": 10
        }
        entities.append(entity)
        df_pr = df[df['project'] == project]

    return entities


def generate_entity(item, key):
    entity = {
        'key': item[key],
        'height': 1,
        'width': 1,
        'depth': 1,
    }
    return entity


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


def dump_codecity_data(data=None):
    with open(CODECITY_OUTPUT_DATA, 'w') as f:
        json.dump(data, f)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        s = "\n\nReceived Ctrl-C or other break signal. Exiting.\n"
        sys.stdout.write(s)
        sys.exit(0)
