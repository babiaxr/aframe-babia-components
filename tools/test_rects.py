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

CODECITY_OUTPUT_DATA = '../examples/test_areas/data.json'


def main():
    ratio_x = 1
    ratio_y = 1
    value_total = 170

    objects = [{"id": ".", "value": 12},
           {"id": "subdir1", "value": 36},
           #{"id": "subdir7", "value": 32},
           #{"id": "subdir2", "value": 46},
           {"id": "subdir2", "value": 46, "children": [
               {"id": "subdir2_1", "value": 26},
               {"id": "subdir2_2", "value": 12},
               {"id": "subdir2_3", "value": 8}
           ]},
           {"id": "subdir3", "value": 16},
           {"id": "subdir4", "value": 40},
           #{"id": "subdir5", "value": 5},
           {"id": "subdir5", "value": 5, "children": [
               {"id": "subdir5_1", "value": 3},
               {"id": "subdir5_2", "value": 1},
               {"id": "subdir5_3", "value": 1}
           ]},
           {"id": "subdir6", "value": 15}
           ]

    root_posx = 10
    root_posy = 10

    len_x = math.sqrt(value_total * ratio_x / ratio_y)
    len_y = math.sqrt(value_total * ratio_y / ratio_x)

    objects.sort(key=lambda x: x['value'], reverse=True)
    objects_splited = build_sublists(objects)


    get_sizes(objects_splited, len_x, len_y, root_posx, root_posy, len_x, len_y, root_posx, root_posy, False)
    get_child_sizes(objects)
    entities = {
        'root': {
            'key': 'root',
            'height': 0.5,
            'width': len_x,
            'depth': len_y,
            'position': {
                'x': root_posx - len_x/2,
                'y': 0,
                'z': root_posy - len_y/2
            },
            'children': {}
        }
    }
    generate_entities(objects, entities['root']['children'], 1)
    # j = get_size(objects_splited[0][0], len_x, len_y)
    dump_codecity_data(entities)
    print("end")


def build_sublists(objects):

    if len(objects) <= 2:
        return objects
    else:
        [objects1, objects2] = split_objects(objects)
        sublist1 = build_sublists(objects1)
        sublist2 = build_sublists(objects2)
        return [sublist1, sublist2]


def split_objects(objects):
    list1 = []
    list2 = []
    for i, objeto in enumerate(objects):
        if (i % 2) == 0:
            list1.append(objeto)
        else:
            list2.append(objeto)
    return [list1, list2]


def get_sizes(objects_splitted, len_x, len_y, parent_x, parent_y, root_lenx, root_leny, root_posx, root_posy, rotate):
    size = get_size(objects_splitted, len_x, len_y, rotate)
    for i, sublist in enumerate(objects_splitted):
        # If it's not a terminal
        if isinstance(sublist, list):
            if i == 0:
                if not rotate:
                    get_sizes(sublist, size[i][0], size[i][1], parent_x, parent_y, root_lenx, root_leny, root_posx, root_posy, rotate=not rotate)
                    sublist.append({'x': parent_x, 'y': parent_y})
                    add_terminal_pos(sublist, parent_x, parent_y, root_lenx, root_leny, root_posx, root_posy, rotate)
                else:
                    # TODO OJO ESE cambiado Es por que hay que darle la vuelta otra vez como en la funcion get_size
                    get_sizes(sublist, size[i][1], size[i][0], parent_y, parent_x, root_lenx, root_leny, root_posx, root_posy, rotate=not rotate)
                    sublist.append({'x': parent_x, 'y': parent_y})
                    add_terminal_pos(sublist, parent_x, parent_y, root_lenx, root_leny, root_posx, root_posy, rotate)
            if i == 1:
                if not rotate:
                    get_sizes(sublist, size[i][0], size[i][1], parent_x + size[0][0], parent_y, root_lenx, root_leny, root_posx, root_posy, rotate=not rotate)
                    sublist.append({'x': parent_x + size[0][0], 'y': parent_y})
                    add_terminal_pos(sublist, parent_x + size[0][0], parent_y, root_lenx, root_leny, root_posx, root_posy, rotate)
                else:
                    # TODO OJO ESE cambiado Es por que hay que darle la vuelta otra vez como en la funcion get_size
                    get_sizes(sublist, size[i][1], size[i][0], parent_y, parent_x + size[0][0], root_lenx, root_leny, root_posx, root_posy, rotate=not rotate)
                    sublist.append({'x': parent_x, 'y': parent_y + size[0][1]})
                    add_terminal_pos(sublist, parent_x, parent_y + size[0][1], root_lenx, root_leny, root_posx, root_posy, rotate)

    # Check if it's a terminal and save it
    save_terminal_size(objects_splitted, size)
    # add_terminal_pos(objects_splitted, size, parent_x, parent_y, rotate)
    # Save in the middle
    objects_splitted.append(size)


def get_size(lista, len1, len2, rotate):
    if len(lista) > 1:
        lena2 = len1
        lenb2 = len1

        valuea = add_value(lista[0], "value")
        valueb = add_value(lista[1], "value")

        lena1 = len2 * (valuea / (valuea + valueb))
        lenb1 = len2 * (valueb / (valuea + valueb))

        if not rotate:
            return [lena1, lena2], [lenb1, lenb2]
        else:
            return [lena2, lena1], [lenb2, lenb1]
    else:
        if not rotate:
            return [len2, len1], [None, None]
        else:
            return [len1, len2], [None, None]


def add_value(lista, field):
    count = 0
    if not isinstance(lista, dict):
        for i in lista:
            if isinstance(i, list):
                count += add_value(i, field)
            else:
                count += i[field]
    else:
        count += lista[field]
    return count


def add_terminal_pos(lista, parent_x, parent_y, root_lenx, root_leny, root_posx, root_posy, rotate):
    for i, sublist in enumerate(lista):
        if isinstance(sublist, dict):
            if i == 0:
                sublist['pos'] = {'x': parent_x + (lista[0]['size'][0]/2) - (root_lenx/2) - root_posx, 'y': parent_y + (lista[0]['size'][1]/2) - (root_leny/2) - root_posy}
                sublist['pos_raw'] = {'x': parent_x, 'y': parent_y}
            elif i == 1:
                if not rotate:
                    sublist['pos'] = {'x': parent_x + (lista[1]['size'][0]/2) - (root_lenx/2) - root_posx, 'y': parent_y + lista[0]['size'][1] + (lista[1]['size'][1]/2) - (root_leny/2) - root_posy}
                    sublist['pos_raw'] = {'x': parent_x, 'y': parent_y + lista[0]['size'][1]}
                else:
                    # TODO OJO ESE cambiado Es por que hay que darle la vuelta otra vez como en la funcion get_size
                    sublist['pos'] = {'x': parent_x + lista[0]['size'][0] + (lista[1]['size'][0]/2) - (root_lenx/2) - root_posx, 'y': parent_y + (lista[1]['size'][1]/2) - (root_leny/2) - root_posy}
                    sublist['pos_raw'] = {'x': parent_x + lista[0]['size'][0], 'y': parent_y}


def save_terminal_size(lista, size):
    # Check if it is terminal
    if isinstance(lista[0], dict):
        lista[0]['size'] = size[0]
    # Check if it is more than 1 terminal item
    if len(lista) > 1 and isinstance(lista[1], dict):
        lista[1]['size'] = size[1]


def get_child_sizes(objects):
    for i, item in enumerate(objects):
        if 'children' in item:
            item['children'].sort(key=lambda x: x['value'], reverse=True)
            children_splited = build_sublists(item['children'])
            get_sizes(children_splited, item['size'][0], item['size'][1], item['pos_raw']['x'], item['pos_raw']['y'], item['size'][0], item['size'][1], item['pos_raw']['x'], item['pos_raw']['y'], True)


def generate_entities(lista, entities, height):
    for i, item in enumerate(lista):
        entities[i] = {
            'key': item['id'],
            'height': height,
            'width': item['size'][0],
            'depth': item['size'][1],
            'position': {
                'x': item['pos']['x'],
                'y': 0,
                'z': item['pos']['y']
            }
        }
        if 'children' in item:
            entities[i]['children'] = {}
            generate_entities(item['children'], entities[i]['children'], height = height + 1)


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

