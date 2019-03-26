# How to make charts

The user guide in order to use this components for building charts with A-Frame.

Thing you need:

1. An entity with one of the `querier` components.
2. Another entity that must have the next components:
    
    1. `filterdata`: without filter (for now), just selecting the id of the entity that has the `querier` component.
    2. Then, select the chart that you want...



## Pie chart

1. Add the component `vismapper` to same entity that has the `filterdata` component with the next attributes:
    - `slice`: the field of the data filtered by `filterdata` that will define each slice of the pie. (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `filterdata` that will define the size of the slices.

2. Finally, add the component `piechart` (with its optional params if you want):

![Example](https://i.imgur.com/pB327Pn.png)

[Click here to go a live example](https://dlumbrer.github.io/aframe-visdata-components/examples/pie_chart/)

## Simple bar chart (2D bars chart)

1. Add the component `vismapper` to same entity that has the `filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `filterdata` that will define the height of the bars.

2. Finally, add the component `simplebarchart` (with its optional params if you want):

![Example](https://i.imgur.com/RZBaaPg.png)



[Click here to go a live example](https://dlumbrer.github.io/aframe-visdata-components/examples/simplebar_chart/)


## 3D bar chart

1. Add the component `vismapper` to same entity that has the `filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z-axis`: the field of the data filtered by `filterdata` that will define the tags of the z-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `filterdata` that will define the height of the bars.

2. Finally, add the component `geo3dbarchart` (with its optional params if you want):

![Example](https://i.imgur.com/Kolrz1I.png)



[Click here to go a live example](https://dlumbrer.github.io/aframe-visdata-components/examples/3dbars_chart/)


## Bubbles chart

1. Add the component `vismapper` to same entity that has the `filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z-axis`: the field of the data filtered by `filterdata` that will define the tags of the z-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `filterdata` that will define the height of the bubbles.
    - `radius`: the **numeric** field of the data filtered by `filterdata` that will define the radius/size of the bubbles.

2. Finally, add the component `bubbleschart` (with its optional params if you want):

![Example](https://i.imgur.com/5cw40tj.png)



[Click here to go a live example](https://dlumbrer.github.io/aframe-visdata-components/examples/bubbles_chart/)




### [Full examples](https://dlumbrer.github.io/aframe-visdata-components)
#### More content will be added soon... 