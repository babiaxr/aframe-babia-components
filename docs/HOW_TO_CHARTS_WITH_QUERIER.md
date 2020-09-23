# How to make charts

The user guide in order to use this components for building charts with A-Frame.

Thing you need:

1. An entity with one of the `babiaxr-querier` components.
2. Another entity that must have the next components:
    
    1. `babiaxr-filterdata`: filter data selecting the id of the entity that has the `babiaxr-querier` component.
    2. Then, select the chart that you want...

Before using them, you need to understand how the components send data with each other.

![Diagram](https://imgur.com/QoQKvm1.png)


## Pie chart

1. Add the component `babiaxr-vismapper` to same entity that has the `babiaxr-filterdata` component with the next attributes:
    - `slice`: the field of the data filtered by `babiaxr-filterdata` that will define each slice of the pie. (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the size of the slices.

2. Finally, add the component `babiaxr-piechart` (with its optional params if you want):

![Example](https://i.imgur.com/pB327Pn.png)

[Click here to go a live example](https://babiaxr.gitlab.io/aframe-babia-components/examples/charts_querier/pie_chart_querier/)

## Simple bar chart (2D bars chart)

1. Add the component `babiaxr-vismapper` to same entity that has the `babiaxr-filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the height of the bars.

2. Finally, add the component `babiaxr-simplebarchart` (with its optional params if you want):

![Example](https://i.imgur.com/RZBaaPg.png)



[Click here to go a live example](https://babiaxr.gitlab.io/aframe-babia-components/examples/charts_querier/simplebar_chart_querier/)


## 3D bar chart

1. Add the component `babiaxr-vismapper` to same entity that has the `babiaxr-filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the z-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the height of the bars.

2. Finally, add the component `babiaxr-3dbarchart` (with its optional params if you want):

![Example](https://i.imgur.com/Kolrz1I.png)



[Click here to go a live example](https://babiaxr.gitlab.io/aframe-babia-components/examples/charts_querier/3dbars_chart_querier/)


## Bubbles chart

1. Add the component `babiaxr-vismapper` to same entity that has the `babiaxr-filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the z-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the height of the bubbles.
    - `radius`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the radius/size of the bubbles.

2. Finally, add the component `babiaxr-bubbleschart` (with its optional params if you want):

![Example](https://i.imgur.com/5cw40tj.png)


[Click here to go a live example](https://babiaxr.gitlab.io/aframe-babia-components/examples/charts_querier/bubbles_chart_querier/)


## 3D Cylinder chart

1. Add the component `babiaxr-vismapper` to same entity that has the `babiaxr-filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the z-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the height of the cylinders.
    - `radius`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the radius/size of the cylinders.

2. Finally, add the component `babiaxr-3dcylinderchart` (with its optional params if you want):

![Example](https://i.imgur.com/2OAOBhW.png)


[Click here to go a live example](https://babiaxr.gitlab.io/aframe-babia-components/examples/charts_querier/3dcylinder_chart_querier/)


## Cylinder chart (2D cylinders)

1. Add the component `babiaxr-vismapper` to same entity that has the `babiaxr-filterdata` component with the next attributes:
    - `x-axis`: the field of the data filtered by `babiaxr-filterdata` that will define the tags of the x-axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the height of the cylinders.
    - `radius`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the radius/size of the cylinders.

2. Finally, add the component `babiaxr-cylinderchart` (with its optional params if you want):

![Example](https://i.imgur.com/frDHfoB.png)


[Click here to go a live example](https://babiaxr.gitlab.io/aframe-babia-components/examples/charts_querier/cylinder_chart_querier/)

## Doughnut chart

1. Add the component `babiaxr-vismapper` to same entity that has the `babiaxr-filterdata` component with the next attributes:
    - `slice`: the field of the data filtered by `babiaxr-filterdata` that will define each slice of the pie. (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data filtered by `babiaxr-filterdata` that will define the size of the slices.

2. Finally, add the component `babiaxr-doughnutchart` (with its optional params if you want):

![Example](https://i.imgur.com/LtWp1Bn.png)

[Click here to go a live example](https://babiaxr.gitlab.io/aframe-babia-components/examples/charts_querier/doughnut_chart_querier/)


### [Full examples](https://babiaxr.gitlab.io/aframe-babia-components)
#### More content will be added soon... 