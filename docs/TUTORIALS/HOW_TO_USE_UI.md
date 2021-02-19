# How to use UI component

This tutorial teaches you how works the interface and how to use it.

First, let's talk about how builds. We need:

1. A **visualizer** that we want to target.
2. Optional: If you want more datafiles than the data included in the visualizer, you need to add them into the scene using `babiaxr-filter` or `babiaxr-querier_json`.

When we have these elements, we'll add the interface code indicating the ID of the target visualizer.

```html
    <a-entity babia-ui = 'target: visualizerid'></a-entity>
```

Then, the interface will be created from the datafiles inside the scene and the data that the visualizer uses.

![img1](https://i.imgur.com/3QNGvyN.png)

OK, now let's explain how to use it.

How you can see in the picture, UI has 3 rows: 
1. **Data**: a list of the datasets found in the scene.
2. **Height**: parameter height of the target visualizer (height of each bar).
3. **X_axis**: parameter x_axis of the target visualizer (tags of the X-axis).
The black buttons are the properties and the white buttons the metrics that we can select. The grey buttons are the selected metrics.

Now, try to click on any white button in the row `Data`. 

![img2](https://i.imgur.com/VTEPP5e.png)

The visualizer will update with the new data. 

>**Note**: If you have another datafile with other metrics (keys in JSON), the UI will update with the new metrics. But the visualizer will show nothing because you'll need to indicate the new metrics to build it.

Now let's change its metrics. If you click on `issues` in the row `Height`, the height of the bars will change. 

![img3](https://i.imgur.com/qTiOBtz.png)

Those heights correspond to the values `issues` in that datafile.

Let's do the same with `X_axis`. 

Select, for example, `date`. The visualizer will change its tags to dates as indicated in the data file.

![img4](https://i.imgur.com/5LqCDDa.png)

>**Note**: Be careful when you select the tags of the axis.

