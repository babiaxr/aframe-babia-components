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
import os
import sys
import configparser


def main():
    args = parse_args()
    
    read_change_cfg(args)
    generate_projects_file(args.repo)
    
    os.system("python3 ./utils/micro.py --cfg ./utils/config/setup.cfg --raw --enrich --backends cocom")


def parse_args():
    parser = argparse.ArgumentParser(usage="usage: cocom_graal2es.py [options]",
                                     description="Generate the structure needed to feed the geocodecitycomponent")
    parser.add_argument("-esurl", "--es-url", required=False,
                        help="Elasticsearch URL")
    parser.add_argument("-repo", "--repo", required=True,
                        help="Repository url to analyze")
    parser.add_argument("-raw", "--raw-index", required=False,
                        help="Raw index of ElasticSearch where the raw data is gonna be stored")
    parser.add_argument("-enrich", "--enriched-index", required=False,
                        help="Raw index of ElasticSearch where the raw data is gonna be stored")

    return parser.parse_args()


def read_change_cfg(args):
    config_parser = configparser.RawConfigParser()
    config_parser.read("./utils/config/setup.cfg")
    
    if args.es_url:
        config_parser['es_collection']['url'] = args.es_url
        config_parser['es_enrichment']['url'] = args.es_url
    
    if args.raw_index:
        config_parser.set('cocom', 'raw_index', args.raw_index)
    else:
        config_parser.set('cocom', 'raw_index', 'cocom_babiaxr_enriched_{}'.format(args.repo))

    if args.enriched_index:
        config_parser.set('cocom', 'enriched_index', args.enriched_index)
    else:
        config_parser.set('cocom', 'enriched_index', 'cocom_babiaxr_enriched_{}'.format(args.repo))

    config_parser.set('enrich_cocom_analysis', 'out_index', 'cocom_babiaxr_study_{}'.format(args.repo))

    with open('./utils/config/setup.cfg', 'w') as configfile:
        config_parser.write(configfile)
        
        
def generate_projects_file(repo):
    data = {
        "babiaxr": {
            "cocom": [
                repo
            ]
        }
    }

    with open('./utils/config/projects.json', 'w') as outfile:
        json.dump(data, outfile)
    

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        s = "\n\nReceived Ctrl-C or other break signal. Exiting.\n"
        sys.stdout.write(s)
        sys.exit(0)
