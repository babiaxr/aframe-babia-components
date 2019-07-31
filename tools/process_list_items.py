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

CODECITY_OUTPUT_DATA = '../examples/codecity/test_areas/data.json'
HEIGHT_LAYERS = 0.1
SEPARATION_LAYERS = 0.1


def main():


    objects = [{"id": ".", "value": 12},
           {"id": "subdir1", "value": 36},
           #{"id": "subdir7", "value": 32},
           #{"id": "subdir2", "value": 46},
           {"id": "subdir2", "value": 46, "children": [
               {"id": "subdir2_1", "value": 26, "children": [
                   {"id": "subdir5_1", "value": 14},
                   {"id": "subdir5_2", "value": 3},
                   {"id": "subdir5_2", "value": 4},
                   {"id": "subdir5_2", "value": 5},
                   {"id": "subdir5_3", "value": 2, "height": 10},
                   {"id": "subdir5_3", "value": 1},
               ]},
               {"id": "subdir2_2", "value": 12},
               {"id": "subdir2_3", "value": 8}
           ]},
           {"id": "subdir3", "value": 16},
           {"id": "subdir4", "value": 40, 'children': [
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 10},
               {"id": "subdir5", "value": 10}
           ]},
           #{"id": "subdir5", "value": 5},
           {"id": "subdir5", "value": 5, "children": [
               {"id": "subdir5_1", "value": 3, "children": [
                   {"id": "subdir5_1", "value": 1},
                   {"id": "subdir5_2", "value": 1},
                   {"id": "subdir5_3", "value": 0.5},
                   {"id": "subdir5_3", "value": 0.3},
                   {"id": "subdir5_3", "value": 0.1},
                   {"id": "subdir5_3", "value": 0.1},
               ]},
               {"id": "subdir5_2", "value": 1},
               {"id": "subdir5_3", "value": 1}
           ]},
           {"id": "subdir6", "value": 15},
           ]

    objects_test = [{"id": ".", "value": 12},
           {"id": "subdir1", "value": 4},
           {"id": "subdir7", "value": 32},
           {"id": "subdir2", "value": 46},
           {"id": "subdir3", "value": 16},
           {"id": "subdir4", "value": 40, 'children': [
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 5},
               {"id": "subdir5", "value": 10},
               {"id": "subdir5", "value": 10}
           ]},
           {"id": "subdir5", "value": 5},
           {"id": "subdir6", "value": 10},
           {"id": "subdir8", "value": 5}
           ]

    objects_one_children = [{"id": ".", "value": 10, 'children': [
               {"id": "subdir5", "value": 2, "height": 2},
               {"id": "subdir5", "value": 2, "height": 3},{"id": "subdir5", "value": 2, "height": 2},{"id": "subdir5", "value": 2, "height": 2},
               {"id": "subdir5", "value": 2, "height": 3}]},
                            {"id": "subdir1", "value": 10},
                            {"id": "subdir7", "value": 10},
                            {"id": "subdir2", "value": 10},
                            {"id": "subdir3", "value": 10},
                            {"id": "subdir4", "value": 10},
                            {"id": "subdir5", "value": 10},
                            {"id": "subdir6", "value": 10},
                            {"id": "subdir8", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir6", "value": 10},
                            {"id": "subdir8", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir6", "value": 10},
                            {"id": "subdir8", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir9", "value": 10},
                            {"id": "subdir9", "value": 10},


           ]

    objects_two = [{"id": ".", "value": 10},
                    {"id": "subdir1", "value": 20}]

    entities = process_list(objects_one_children)
    dump_codecity_data(entities)


def process_list(objects):
    ratio_x = 1
    ratio_y = 1
    value_total = get_root_value(objects)

    root_posx = 0
    root_posy = 0

    len_x = math.sqrt(value_total * ratio_x / ratio_y)
    len_y = math.sqrt(value_total * ratio_y / ratio_x)

    objects.sort(key=lambda x: x['value'], reverse=True)
    objects_splited = build_sublists(objects)

    # TODO: los primeros len_[] ESTÁN AL REVES, por que necesita estar invertidos para que funciione con rectangulos
    get_sizes(objects_splited, len_y, len_x, root_posx, root_posy, False)
    get_child_sizes(objects)
    entities = {
        'root': {
            'key': 'root',
            'height': HEIGHT_LAYERS,
            'width': len_x,
            'depth': len_y,
            'position': {
                'x': root_posx + len_x/2,
                'y': 0,
                'z': root_posy + len_y/2
            },
            'children': {}
        }
    }
    generate_entities(objects, entities['root']['children'], HEIGHT_LAYERS, 1)
    # j = get_size(objects_splited[0][0], len_x, len_y)

    print("end")
    return entities


def get_root_value(list):
    value = 0
    for i in list:
        value += i['value']
    return value


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


def get_sizes(objects_splitted, len_x, len_y, parent_x, parent_y, rotate):
    size = get_size(objects_splitted, len_x, len_y, rotate)
    for i, sublist in enumerate(objects_splitted):
        # If it's not a terminal
        if isinstance(sublist, list):
            if i == 0:
                if not rotate:
                    get_sizes(sublist, size[i][0], size[i][1], parent_x, parent_y, rotate=not rotate)
                    sublist.append({'x': parent_x, 'y': parent_y})
                    # TODO Otra vez invertido en el terminal pos el parent_x e y por que antes se ha cambiado el rotate
                    add_terminal_pos(sublist, parent_x, parent_y, rotate)
                else:
                    # TODO OJO ESE cambiado Es por que hay que darle la vuelta otra vez como en la funcion get_size
                    get_sizes(sublist, size[i][1], size[i][0], parent_x, parent_y, rotate=not rotate)
                    sublist.append({'x': parent_x, 'y': parent_y})
                    add_terminal_pos(sublist, parent_x, parent_y, rotate)
            if i == 1:
                if not rotate:
                    get_sizes(sublist, size[i][0], size[i][1], parent_x + size[0][0], parent_y, rotate=not rotate)
                    sublist.append({'x': parent_x + size[0][0], 'y': parent_y})
                    # TODO Otra vez invertido en el terminal pos el parent_x e y por que antes se ha cambiado el rotate
                    add_terminal_pos(sublist, parent_x + size[0][0], parent_y, rotate)
                else:
                    # TODO OJO ESE cambiado Es por que hay que darle la vuelta otra vez como en la funcion get_size
                    get_sizes(sublist, size[i][1], size[i][0], parent_x, parent_y + size[0][1], rotate=not rotate)
                    sublist.append({'x': parent_x, 'y': parent_y + size[0][1]})
                    add_terminal_pos(sublist, parent_x, parent_y + size[0][1], rotate)
        else:
            # TODO Significa que solo tiene dos elementos hijo, por lo que el tratamiento es distinto, aun que habría que refactorizar
            if ('pos' not in sublist) or ('pos_raw' not in sublist):
                if i == 0:
                    sublist['pos_raw'] = {'x': parent_x, 'y': parent_y}
                    sublist['pos_new'] = {'x': parent_x + (size[0][0] / 2), 'y': parent_y + (size[0][1] / 2)}
                elif i == 1:
                    # TODO por que aqui es rotate y not rotate
                    if rotate:
                        sublist['pos_raw'] = {'x': parent_x, 'y': parent_y + size[0][1]}
                        sublist['pos_new'] = {'x': parent_x + (size[1][0] / 2), 'y': parent_y + size[0][1] + (size[1][1] / 2)}
                    else:
                        sublist['pos_raw'] = {'x': parent_x + size[0][0], 'y': parent_y}
                        sublist['pos_new'] = {'x': parent_x + size[0][0] + (size[1][0] / 2), 'y': parent_y + (size[1][1] / 2)}

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


def add_terminal_pos(lista, parent_x, parent_y, rotate):
    for i, sublist in enumerate(lista):
        if isinstance(sublist, dict):
            if i == 0:
                sublist['pos_raw'] = {'x': parent_x, 'y': parent_y}
                sublist['pos_new'] = {'x': parent_x + (lista[0]['size'][0]/2), 'y': parent_y + (lista[0]['size'][1]/2)}
            elif i == 1:
                if not rotate:
                    sublist['pos_raw'] = {'x': parent_x, 'y': parent_y + lista[0]['size'][1]}
                    sublist['pos_new'] = {'x': parent_x + (lista[1]['size'][0]/2), 'y': parent_y + (lista[1]['size'][1]/2) + lista[0]['size'][1]}
                else:
                    # TODO OJO ESE cambiado Es por que hay que darle la vuelta otra vez como en la funcion get_size
                    sublist['pos_raw'] = {'x': parent_x + lista[0]['size'][0], 'y': parent_y}
                    sublist['pos_new'] = {'x': parent_x + lista[0]['size'][0] + (lista[1]['size'][0]/2), 'y': parent_y + (lista[1]['size'][1]/2)}


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
            # TODO: los primeros item['size'][x] ESTÁN AL REVES, por que necesita estar invertidos para que funciione con rectangulos
            get_sizes(children_splited, item['size'][1], item['size'][0], item['pos_raw']['x'], item['pos_raw']['y'], False)
            get_child_sizes(item['children'])


def generate_entities(lista, entities, height, index):
    for i, item in enumerate(lista):
        if not isinstance(item, tuple):
            entities[i] = {
                'key': item['id'],
                'height': item['height'] if 'height' in item else height,
                'width': item['size'][0] - SEPARATION_LAYERS,
                'depth': item['size'][1] - SEPARATION_LAYERS,
                'position': {
                    'x': item['pos_new']['x'],
                    'y': HEIGHT_LAYERS * index,
                    'z': item['pos_new']['y']
                }
            }
            if 'children' in item:
                entities[i]['children'] = {}
                generate_entities(item['children'], entities[i]['children'], height = HEIGHT_LAYERS, index= index+1)


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

