## Chart components API

The installation contains the following components:

### babia-pie component

This component shows a pie chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| key          | The field of the data that will define each slice of the pie. (Make sure that this field has unique values!) | string | key |
| size          | The **numeric** field of the data that will define the size of the slices | string | size |
| legend          | Shows a legend when hovering a slice  | boolean | false |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"kbn_network","size":10},
{"key":"Maria","size":5},
...
]
```

### babia-doughnut component

This component shows a doughnut chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| key          | The field of the data that will define each slice of the pie. (Make sure that this field has unique values!) | string | key |
| size          | The **numeric** field of the data that will define the size of the slices | string | size |
| legend          | Shows a legend when hovering a slice  | boolean | false |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"kbn_network","size":10},
{"key":"Maria","size":5},
...
]
```

### babiaxr-simplebarchart component

This component shows a simple 2D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | x_axis |
| height          | the **numeric** field of the data that will define the height of the bars | string | height |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"x_axis":"kbn_network","height":10},
{"x_axis":"Maria","height":5},
...
]

```

### babia-barsmap component

This component shows a bars map.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | x_axis |
| z_axis          | The field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | z_axis |
| height          | the **numeric** field of the data that will define the height of the bars | string | height |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"x_axis":"David","z_axis":"2019","height":9},
{"x_axis":"David","z_axis":"2018","height":8},
...
]

```

### babia-bubbles component

This component shows a 3D Bubbles chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys) | string | x_axis |
| z_axis          | The field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | z_axis |
| height          | the **numeric** field of the data that will define the height of the bubbles | string | height |
| radius          | the **numeric** field of the data that will define the radius of the bubbles | string | radius |
| legend          | Shows a legend when hovering a bubble  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| radiusMax          | Adjusts bubbles' radius of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"x_axis":"David","z_axis":"2019","height":1,"radius":9},
{"x_axis":"David","z_axis":"2018","height":2,"radius":8},
...
]

```

### babia-cyls component


This component shows a cylinder chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | x_axis |
| height          | the **numeric** field of the data that will define the height of the cylynders | string | height |
| radius          | the **numeric** field of the data that will define the radius of the cylynders | string | radius |
| legend          | Shows a legend when hovering a cylinder  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| radiusMax          | Adjusts bubbles' radius of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"David","height":9,"radius":1},
{"key":"David","height":8,"radius":3},
...
]

```

### babia-cylsmap component

This component shows a 3D cylinder chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys) | string | x_axis |
| z_axis          | The field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | z_axis |
| height          | the **numeric** field of the data that will define the height of the cylynders | string | height |
| radius          | the **numeric** field of the data that will define the radius of the cylynders | string | radius |
| legend          | Shows a legend when hovering a cylinder  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| radiusMax          | Adjusts bubbles' radius of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"David","key2":"2019","height":1,"radius":9},
{"key":"David","key2":"2018","height":2,"radius":8},
...
]

```

### babia-city component

This component shows a city chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The treegenerator entity ID where  is the data for the chart | string | - |
| absolute          | Absolute size (width and depth will be used for proportions) | boolean | false |
| width          | Width of the entire city. | number | 20 |
| depth          | Depth of the entire city. | number | 20 |
| split          | Algoritm to split rectangle in buildings: naive, pivot | (naive or pivot) | naive |
| farea          | Field in data items to represent as building area | string | area |
| fmaxarea          | Field in data items to represent as building max_area | string | max_area |
| fheight          | Field in data items to represent as building height | string | height |
| titles          | Titles on top of the buildings when hovering | boolean | true |
| building_color          | Color of the buildings | color | #E6B9A1 |
| base          | build the base or not | boolean | true |
| base_thick          | Base thickness | number | 0.2 |
| base_color          | Base color | color | #98e690 |
| border          | Size of border around buildings (streets are built on it) | number | 1 |
| extra          | Extra factor for total area with respect to built area | number | 1.4 |
| zone_elevation          | Zone: elevation for each "depth" of quarters, over the previous one | number | 1 |
| unicolor          | Unique color for each zone | boolean | false |
| wireframe          | Show materials as wireframe | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
{"id": "Root",
         "children":
          [{"id": "BlockA",
            "children": [{"id": "BlockA0",
                      "children": [{"id": "A0A", "area": 2, "height": 1}, ...]},
...

```

### babia-boats component

This component shows a city in boats.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The treegenerator entity ID where  is the data for the chart | string | - |
| area          | Field in data items to represent as building area. **DON'T USE IT WITH WIDTH/DEPTH PARAMETERS**. | string | - |
| width          | Field in data items to represent as building area. **DON'T USE IT WITH AREA PARAMETERS**.| string | width |
| depth          | Field in data items to represent as building area. **DON'T USE IT WITH AREA PARAMETERS**. | string | depth |
| height          | Field in data items to represent as building height | string | height |
| building_separation  | Separation of the buildings by a numeric factor | number | 0.25 |
| border          | Size of border around buildings (streets are built on it) | number | 0.5 |
| extra          | Extra factor for total area with respect to built area | number | 1.0 |
| zone_elevation          | Zone: elevation for each "depth" of quarters, over the previous one | number | 0.3 |
| building_color          | Color of the buildings | color | #E6B9A1 |
| base_color          | Quarter color | color | #98e690 |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
{"id": "Root",
         "children":
          [{"id": "BlockA",
            "children": [{"id": "BlockA0",
                      "children": [{"id": "A0A", "area": 2, "height": 1}, ...]},
...

```



## babia-terrain Component
This component creates a terrain using vertices data.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| width          | Width of the terrain  | number | 1 |
| height          | Height of the terrain  | number | 1 |
| segmentsWidth          | Number of width segments  | number | 1 |
| segmentsHeight          | Number of height segments  | number | 1 |
| color          | Color of the terrain  | string | #FFFFFF |
| filled          | Fill the terrain  | boolean | false |
| data          | Data about vertices of the terrain  | array | - |

#### Data Format
Data length must be the same as the vertices = segmentsWidth x segmentsHeight.
```
data:   0, 3, 6, 3, 0, 0, 2, 4, 2,
        0, 2, 0, 0, 2, 4, 6, 4, 2,

        ...

        0, 2, 0, 0, 2, 4, 6, 4, 2,
        0, 3, 6, 3, 0, 0, 2, 4, 2
```


### COLOR PALETTES

![palettes](https://i.imgur.com/Ibk5bMo.png)

### FONTS

The title of the chart uses `typeface.json` files, which are Web Fonts converted to
JSON for three.js.  Typeface fonts can be generated from fonts using this
**[typeface font generator](http://gero3.github.io/facetype.js/)**. Select JSON
format and we recommend restricting the character set to only the characters
you need. You may also have to check *reverse font direction* if you get odd font results.

You can also find some sample generated fonts in the `examples/fonts` directory
in the [three.js repository](https://github.com/mrdoob/three.js).

By default, the text geometry component points to Helvetiker (Regular). Each
font is fairly large, from at least 60KB to hundreds of KBs.

To include a font for use with the text component, it is recommended to define
it in `<a-asset-item>` and point at it with a selector.