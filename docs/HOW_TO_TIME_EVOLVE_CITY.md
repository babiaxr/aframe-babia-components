# How to create a time evolving software city

This doc gather all the information of how to use the scripts and the needed steps in order to make a time evolving city.

## 1. Graal cocom analysis

For the analysis, we use [Graal](https://github.com/chaoss/grimoirelab-graal), specifically, the [cocom analysis](https://github.com/chaoss/grimoirelab-graal#backends).

Please, [go here](../tools/README.md#get-cocom-data-from-a-repository) to know how to generate the data.

## 2. Generate codecity tree structure

There is a code in the [tools](../tools) that generate the data needed for the component, please, [go here](../tools/README.md#generate-codecity-data-from-es) to know how to do it.

This process will generate a `main_data.json` file.

## 3. Build the scene

The component to use is `babiaxr-codecity`, it has several arguments, most of them are optional, specifically:

- `data`: mandatory, the data retrieved from the 2. section.
- `absolute`: Absolute size (width and depth will be used for proportions)
- `width`: Width of the entire city.
- `depth`: Depth of the entire city.
- `split`: Algoritm to split rectangle in buildings: naive, pivot
- `farea`: Field in data items to represent as area
- `fmaxarea`: Field in data items to represent as max_area
- `fheight`: Field in data items to represent as area
- `titles`: Titles on top of the buildings when hovering
- `buffered`: Use buffered geometries (improves performance)
- `building_color`: Color of the buildings
- `base`: build the base or not
- `base_color`: color of the base
- `border`: Size of border around buildings (streets are built on it)
- `extra`: Extra factor for total area with respect to built area
- `zone_elevation`: Zone: elevation for each "depth" of quarters, over the previous one
- `unicolor`: Unique color for each zone
- `wireframe`: Show materials as wireframe
- `time_evolution_delta`: Time evolution time changing between snapshots
- `time_evolution_init`: Time evolution time changing between snapshots
- `time_evolution_past_present`: Time evolution direction
- `ui_navbar`: UI navbar ID if exists.

### Examples

Time evolution simple city:

```
<a-entity position="0 0 -3" id="codecity" babiaxr-codecity='width: 20; depth: 20; streets: true; color: green;
            extra: 1.5; base_thick: 0.3; split: pivot; titles: true;
            data: main_data.json'>
</a-entity>

```

Time evolution commit by commit city with ui navbar:
```
<a-entity position="0 0 -3" id="codecity"
    babiaxr-codecity='width: 20; depth: 20; streets: true; color: green;
            extra: 1.5; base_thick: 0.3; split: pivot; titles: true; time_evolution_delta: 500;
            data: main_data.json; time_evolution_init: data_0; ui_navbar: navigationbar'>
</a-entity>

```