---
linktitle: "how_to_debug"
date: 2022-10-05T12:40:05+02:00
title: How to prepare an experiment environment
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "debug", "launch", "VR", "guide"]
---

# How to prepare an experiment environment

BabiaXR allows you to conduct experiment with any kind of data or any kind of scene created with A-Frame, just using one of the components. This allows you to compare your scene easily between VR and On-Screen. This guide will show you how to prepare the scene step by step for creating the environment for the experiment.

## 1. Create your Scene

First of all, you have to define the scene and build it, in BabiaXR you have a complete set of components and tutorials for creating scenes with different visualizations.

## 2. Using the `babia-experiment` component

Once the scene for conducting the experiment is defined, next step is to add an entity as the parent of the scene, following this structure:

```html
...
<a-scene>
    <a-assets>
        <!-- Your assets here -->
    </a-assets>

    <a-entity babia-experiment>
        <!-- Your scene here -->
    </a-entity>
</a-scene>
...
```

Every chart under the `babia-experiment` will be hidden by default, so the participant cannot see the charts until he clicks on the "Start!" button.

Now, let's configure the experiment following the requirements.

## 3. Define tasks

### 3.1 More than one task experiment

If the exepriment to conduct consist in more than one task, you have to use the `babia-task` experiment in an isolated entity as direct **children** form the entity where the `babia-experiment` component is defined. Those entities **must have an unique identifier**. Specifically following this structure:

```html
...
<a-scene>
    <a-assets>
        <!-- Your assets here -->
    </a-assets>

    <a-entity babia-experiment>
        <a-entity id="task1" babia-task></a-entity>
        <a-entity id="task2" babia-task></a-entity>
        ...
        <a-entity id="taskN" babia-task></a-entity>
        <!-- Your scene here -->
    </a-entity>
</a-scene>
...
```

By default the tasks will show in the same position, so you need to use the attribue `offsetX` for positioning the tasks with offset in the X axis. [Link to the docs](../APIs/OTHERS.md) for more info about the attributes.

### 3.2 One task experiment

You can use just the `babia-experiment` component if the experiment to conduct consist in just one task. Nothing more to add.

## 4. Define tasks types

There are three ways to show the information/description of the task/tasks to perform the experiment, using a Poster, an Audio or a Video. The attributes described here work with the `babia-experiment` and `babia-task` component.

[Link to the docs](../APIs/OTHERS.md) for more info about the attributes.

### 4.1 Texts tasks in a poster

Attributes to define:

- `taskTitle`: Defines the title of the task
- `taskDescription`: Defines the description of the task
- `openTaskImg`: Defines the img of the popup icon of the task poster 
- `closeTaskImg`: Defines the img of the popup icon of the task poster (for closing)

Example:

![Imgur](https://imgur.com/rDlGJXP.png)


### 4.2 Audio description tasks

Attributes to define:

- `taskAudio`: If the task is defined by an audio, must be set at "true"
- `taskAudioUrl`: URL of the mp3 audio for defining the task

Example:

![Example](https://imgur.com/COSYjY5.gif)

### 4.3 Video description tasks

**Important**: The video must be loaded as an A-Frame asset.

Attributes to define:

- `taskVideo`: If the task is defined by a video, must be set at "true"
- `taskVideoId`: ID of the asset with the video for defining the task 

Example:

![Example](https://imgur.com/ve3SPnF.gif)


## 5. Record answers and position

By default, during the experiment, the scene will record the position of the camera and the rotation in order to check if the answers provided fit with the movements of the participants. This information is stored each `recordDelta`, as an attribute of `babia-experiment` defined by default in 3000 milliseconds.

For recording the audio, the attribute `recordAudio` is set at true for recording the microphone of the device in order to get the answers outloud. In our experience, making VR experiments introduces a big deal for recording the answers of the participants, since in VR the input options as a keyboard are not fully explored yet. So we decide to use the voice and record the answers using the microphone.


## 6. Define the end of the experiment

There are two ways of finishing the experiment:

### 6.1 Clicking on the finish button

By default, the attribute `finishButton` is set at true, so when the user clicks on the start button and the experiment begins, a button called "Finish!" appears, when the users clicks on it, the experiment finishs and the recordings are downloaded.

![Example](https://imgur.com/6FTPWbs.gif)


### 6.2 Defining a time limit

Using the `timeLimitEnding` flag, set at true, we can define a time limit for the experiment. The `timeLimitTime` attribute, in seconds, is the maximum time that the participant will have for conducting the tasks.

By default, when the time limit is reached, there will be an alert prompt notifiying the user that the time is done, but the charts will keep visible until the participant clicks on the Finish button. But if you want to force the user to finish the experiment, the `forceFinishWhenTimeLimit` attribute, set at true, will add the feature of hiding the charts and downloading the recorded data once the time limit is reached, forcing the user to finish.

## Others

### Feedback and Demographics surveys

Feedback and demographics can be defined as tasks, or maybe the experimenter wants to do it outside the scene, so using `babia-task` you can choose between adding them to the scene or not


### Useful other documentation

[Docs of the `babia experiment` and `babia-task`](../APIs/OTHERS.md) APIs with all the attributes, default values and descriptions.