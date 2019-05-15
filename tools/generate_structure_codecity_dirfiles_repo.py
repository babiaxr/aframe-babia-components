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

import argparse
import json
import logging
import math
import os
import ssl
import sys
from functools import reduce

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

    dir_data = get_dir_data("../examples")

    enrich_dir_data(dir_data)

    entities = {}
    entities = generate_entities(entities, dir_data)

    dump_codecity_data(entities)


def parse_args():
    parser = argparse.ArgumentParser(usage="usage: generate_structure_codecity_dirfiles_repo.py [options]",
                                     description="Generate the structure needed to feed the geocodecitycomponent")
    parser.add_argument('-g', '--debug', action='store_true')
    parser.add_argument('-r', '--repo-url', required=True,
                        help='URL of the repository')
    parser.add_argument('--csvfile', required=False,
                        help='Generate a CSV file instead a JSON')
    parser.add_argument('-t', '--type', required=False, help='Type of the codecity layout')

    return parser.parse_args()


def get_dir_data(rootdir):
    dir = {}
    rootdir = rootdir.rstrip(os.sep)
    start = rootdir.rfind(os.sep) + 1
    for path, dirs, files in os.walk(rootdir):
        folders = path[start:].split(os.sep)
        subdir = dict.fromkeys(files)
        parent = reduce(dict.get, folders[:-1], dir)
        for item in subdir:
            size = os.stat(os.path.join(path, item)).st_size
            subdir[item] = dict()
            subdir[item]['size'] = size
            subdir[item]['type'] = 'file'
        parent[folders[-1]] = subdir
    return dir


def enrich_dir_data(dir_data):
    childs_files = 0
    if isinstance(dir_data, dict):
        if 'type' not in dir_data or dir_data['type'] is not 'file':
            childs = len(dir_data.items())
            for k, v in dir_data.items():
                if isinstance(v, dict) and 'type' in v and v['type'] is 'file':
                    childs_files += 1
                childs += enrich_dir_data(v)[0]
                childs_files += enrich_dir_data(v)[1]
            dir_data['babia_nchilds'] = childs
            dir_data['babia_nchilds_files'] = childs_files
            return (childs, childs_files)
    return (0, 0)


def generate_entities(entities, dir_data):
    offsetx = 0

    for k, v in dir_data.items():
        if isinstance(v, dict):
            entity = {
                'key': k,
                'depth': 1,
                'height': v['size'] if isinstance(v, dict) and ('type' in v and v['type'] is 'file') else 1,
                'width': v['babia_nchilds_files'] if isinstance(v, dict) and ('type' not in v or v['type'] is not 'file') else 1,
                'position': {
                    'x': offsetx,
                    'y': 0,
                    'z': 0
                }
            }
            entities[k] = entity
            offsetx += v['babia_nchilds_files'] if isinstance(v, dict) and ('type' not in v or v['type'] is not 'file') else 1
            if 'children' not in entities[k]:
                entities[k]['children'] = {}

            generate_entities(entities[k]['children'], v)
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

