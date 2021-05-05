# TEMPORAL EVOLUTION (Work in Progress)

## New parameters for babia-bars and babia-barsmap

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| keepHeight          | Keep the height of the chart using temporal evolution | boolean | true |
| incremental          | Indicate if received data is incremental or absolute | boolean | false |
| index        | (ONLY BABIA-BARS) Attribute of the element used to name the bars | string | x_axis |

## How to use in an example

To include the time evolution in a component (only bars and barsmap), just need to change the querier component's data using, for example, a simple script.

New data can be `absolute` or `incremental`. The component uses `absolute` by default. You can change it indicating `incremental: true` to the component's parameters.

If you want to delete an element, that element must indicate the attribute `'_not': true`.