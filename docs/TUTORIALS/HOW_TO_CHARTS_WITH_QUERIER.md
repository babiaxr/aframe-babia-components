# How to make charts

The user guide in order to use this components for building charts with A-Frame.

Thing you need:

1. An entity with one of the `babiaxr-querier` components for querying the selected data.
  
2. Optional: Use the component `babia-filter` selecting the querier entity (or putting it in the same entity) to filter the data.
    
3. Then, select the chart that you want...

- **NOTE**: Use the component `babia-treebuilder` selecting the querier/filterdata entity (or putting it in the same entity) to generate a tree data format for the `babia-city` and `babiaxr-islands` visualizations.

Before using them, you need to understand how the components send data with each other, see [how is the components STACK/WORKFLOW](../others/STACK.md).


## Pie

1. Add the component `babia-pie` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the filterdata/querier where the data for the chart is stored.
    - `key`: the field of the data that will define each slice of the pie. (Make sure that this field has unique values!)
    - `size`: the **numeric** field of the data that will define the size of the slices.

![Example](https://i.imgur.com/pB327Pn.png)


## Simple bar chart (2D bars chart)

1. Add the component `babiaxr-simplebarchart` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the filterdata/querier where the data for the chart is stored.
    - `x_axis`: the field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data that will define the height of the bars.

![Example](https://i.imgur.com/RZBaaPg.png)


## Bars Map

1. Add the component `babia-barsmap` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the filterdata/querier where the data for the chart is stored.
    - `x_axis`: the field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z_axis`: the field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data that will define the height of the bars.

![Example](https://i.imgur.com/Kolrz1I.png)


## Bubbles

1. Add the component `babia-bubbles` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the filterdata/querier where the data for the chart is stored.
    - `x_axis`: the field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z_axis`: the field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data that will define the height of the bubbles.
    - `radius`: the **numeric** field of the data that will define the radius/size of the bubbles.

![Example](https://i.imgur.com/5cw40tj.png)


## Cylinders Map

1. Add the component `babia-cylsmap` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the filterdata/querier where the data for the chart is stored.
    - `x_axis`: the field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `z_axis`: the field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data that will define the height of the cylinders.
    - `radius`: the **numeric** field of the data that will define the radius/size of the cylinders.


![Example](https://i.imgur.com/2OAOBhW.png)



## Cylinders

1. Add the component `babia-cyls` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the filterdata/querier where the data for the chart is stored.
    - `x_axis`: the field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!)
    - `height`: the **numeric** field of the data that will define the height of the cylinders.
    - `radius`: the **numeric** field of the data that will define the radius/size of the cylinders.

2. Finally, add the component `babia-cyls` (with its optional params if you want):

![Example](https://i.imgur.com/frDHfoB.png)


## Doughnut

1. Add the component `babia-doughnut` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the filterdata/querier where the data for the chart is stored.
    - `key`: the field of the data that will define each slice of the pie. (Make sure that this field has unique values!)
    - `size`: the **numeric** field of the data that will define the size of the slices.

![Example](https://i.imgur.com/LtWp1Bn.png)


## City

**NOTE**: This chart needs a `babia-treebuilder` component for having a tree data format.

1. Add the component `babia-city` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the **treebuilder** where the data for the chart is stored.
    - `fheight`: the **numeric** field of the data that will define the height of the buildings.
    - `farea`: the **area** field of the data that will define the area of the buildings.

![Example](https://i.imgur.com/vWXzfPb.png)

## Island chart

**NOTE**: This chart needs a `babia-treebuilder` component for having a tree data format.

1. Add the component `babiaxr-island` (see the [API](../APIs/CHARTS.md) for more details), defining at least these attributes:
    - `from`: the **treebuilder** where the data for the chart is stored.
    - `height`: the **numeric** field of the data that will define the height of the buildings.
    - `area`: the **area** field of the data that will define the area of the buildings. **DON'T USE IT WITH WIDTH/DEPTH PARAMETERS**.
    - `width`: the **area** field of the data that will define the width of the buildings. **DON'T USE IT WITH AREA PARAMETERS**.
    - `depth`: the **area** field of the data that will define the depth of the buildings. **DON'T USE IT WITH AREA PARAMETERS**.

![Example](https://i.imgur.com/kvqoCBN.png)



## [Full examples here](https://babiaxr.gitlab.io/aframe-babia-components)
#### More content will be added soon... 