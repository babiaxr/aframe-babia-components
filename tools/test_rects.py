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


def main():
    ratio_x = 1
    ratio_y = 2
    value_total = 170

    objects = [{"id": ".", "value": 12},
           {"id": "subdir1", "value": 36},
           {"id": "subdir2", "value": 46},
           {"id": "subdir3", "value": 16},
           {"id": "subdir4", "value": 40},
           {"id": "subdir5", "value": 5},
           {"id": "subdir6", "value": 15}
           ]

    len_x = math.sqrt(value_total * ratio_x / ratio_y)
    len_y = math.sqrt(value_total * ratio_y / ratio_x)

    objects.sort(key=lambda x: x['value'], reverse=True)
    objects_splited = build_sublists(objects)


    get_sizes(objects_splited, len_x, len_y)
    print("end")


def split_objects(objects):
    list1 = []
    list2 = []
    for i, object in enumerate(objects):
        if (i % 2) == 0:
           list1.append(object)
        else:
           list2.append(object)
    return [list1, list2]


def build_sublists(objects):

    if len(objects) <= 2:
       return objects
    else:
       [objects1, objects2] = split_objects(objects)
       sublist1 = build_sublists(objects1)
       sublist2 = build_sublists(objects2)
       return [sublist1, sublist2]

5
def get_sizes(objects_splitted, len_x, len_y):
    size = get_size(objects_splitted, len_x, len_y)
    for i, sublist in enumerate(objects_splitted):
        get_sizes(sublist, size[i][0], size[i][1])
    objects_splitted.append(size)
    print("jose")



def get_size(lista, len1, len2):

    lena2 = len1
    lenb2 = len1

    valuea = add_value(lista[0], "value")
    valueb = add_value(lista[1], "value")

    lena1 = len2 * (valuea / (valuea + valueb))
    lenb1 = len2 * (valueb / (valuea + valueb))

    return [lena1, lena2], [lenb1, lenb2]


def add_value(lista, field):
    count = 0
    for i in lista:
        if isinstance(i, list):
            count += add_value(i, field)
        else:
            count += i[field]
    return count


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        s = "\n\nReceived Ctrl-C or other break signal. Exiting.\n"
        sys.stdout.write(s)
        sys.exit(0)

