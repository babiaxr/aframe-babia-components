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

from elasticsearch import Elasticsearch
from elasticsearch.connection import create_ssl_context


HTTPS_CHECK_CERT = False
INDEX_DATA_FILE = 'index_backup.json'
CODECITY_OUTPUT_DATA = 'data.json'


def main():
    args = parse_args()

    if args.debug:
        logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(message)s')
        logging.debug("Debug mode activated")
    else:
        logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)

    if args.elastic_url and args.index:
        if os.path.exists(INDEX_DATA_FILE):
            os.remove(INDEX_DATA_FILE)
        get_index_data(args.elastic_url, args.index)

    if args.data_file:
        entities_data = proccess_data(args.data_file, args.build)
    else:
        entities_data = proccess_data(INDEX_DATA_FILE, args.build)

    codecity_data = add_layout(entities_data, args.type)

    dump_codecity_data(codecity_data)


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
    parser.add_argument('-df', '--data-file', required=False,
                        help='Instead of the elastic, load data by a file')

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


def proccess_data(file=None, index=None):
    key_field = "repo_name"
    data = {}

    file = open(file, 'r')
    rows = file.readlines()

    for line in rows:
        item = json.loads(line)

        if item[key_field] not in data:
            entity = generate_entity(item, key_field)
            data[item[key_field]] = entity
        else:
            data[item[key_field]]['height'] += 1

    return data


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
