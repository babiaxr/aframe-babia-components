# Release Notes for BabiaXR

This doc gathers all the information about the releases made by the Springs/Milestones of BabiaXR.

## Release notes

### NPM 1.2.9 version

`babia-pie` & `babia-doughnut` Fix animation issue when more than one in the scene.

### NPM 1.2.8 version

`babia-boats` Improved with some attributes and bug fixes.

### NPM 1.2.6 version

Added `babia-experiment` and eveything related to the experiments feature.


### NPM 1.2.5 version

#### Colors palettes

- Added the feature of change the color palette just adding an array:

```
 <a-entity babia-barsmap='animation: true; x_axis: name; z_axis: age; height: size; legend: true; from: queriertest; palette: ["#ffb02e", "#8600c4", "#007700", "#00388c", "#df0084", "#00c4ff"]' position="-10 0 0" rotation="0 0 0"></a-entity>

```

### NPM 1.2.4 version

#### Range Selector

- Included this new component
- Default value now can be custom

#### barsmap

- When data changes the bars now changes, fixed the bug

#### Legends

- Add lookat and scale to the legends in bars, cyls, doughnut, pie and bubbles

### No-name

> NPM 1.2.3 version

#### Querycsv

Included this new component

### ReLIFE

> NPM 1.2.2 version

#### Hot fixes in 1.2.2

Bugs related to boats and load GLTF with webpack4

#### Hot fixes in 1.2.1

Bugs related to boats and UI

### Queens Blade

#### Async

All components works using NOTIBUFFER and ASYNC calls, big new feautre that improves performance, see [NOTIBUFFER API](./APIs/NOTIBUFFER.md)

#### Time evolution boats

Time evolution boats has been added, used with a selector, see this [tutorial](./Tutorials/temporal_evol_with_boats.md)

#### Selector

Selector adapted to all the components

### Pokemon

> NPM 1.1.4 version

#### Network component changes

- Legends are now smaller (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/209)

#### Barsmap component changes

- Fix bug when legend dissapear (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/210)

#### Cylsmap component changes

- Legends are closer now to the visualizer (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/208)

#### UI component changes

- Allow to select more than one graph (selector) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/206)
- Add eventListener feature to have the ownership (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/205)


#### Multiuser feature changes

- Add eventListener feature to have the ownership (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/205)
- New demo with the lounge (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/199)

#### Time evolution feature

- Selector with more visualizers (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/203)

#### Async feature

- Async filter (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/220)
- Loop fetch for retrieving data (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/215)
- Format code (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/219)
- Documentation (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/212)

### One Punch Man

> NPM 1.1.3 version

#### Multiuser NEW

- Define watchers in components for showing a log message when an attribute is changed (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/173)
- Added demos (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/179) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/182) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/116) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/178) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/191) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/183) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/193) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/196)
- Add docs (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/186) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/211)
- Research about RTC servers (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/177)

#### Async WIP

- First research (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/188)

#### Boats component changes

- Fix bug with the quarter base (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/159)

#### Web changes

- Fix documentation link (https://gitlab.com/babiaxr/babiaxr.gitlab.io/-/issues/20)
- Fix issues in How to use totem component (deleted) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/157)
- Sync docs (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/137)
- New museum demo (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/198)

#### UI changes

- More than one UI in the same scene (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/192)

#### Time evolution feature  and selector component NEW

- Desing of the components (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/176)
- Velocity control component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/175)
- Navigator component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/185)
- Skip controller component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/194)
- Improve selector component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/190)
- Slider component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/108)
- Navigation controls component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/174)
- Fixed minor bugs (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/201) (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/207)
- Added doc (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/180)

#### Network component changes

- Fix raycaster bug on Oculus (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/169)

#### Axis component changes

- Added names on axis (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/197)

### Naruto

> NPM 1.1.2 version

#### Boats component changes

- Fix bug with the quarter base (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/159)

#### Network componente NEW

- New component added for building node graphs
- Assess options and make proposals (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/152, https://gitlab.com/babiaxr/aframe-babia-components/-/issues/163)
- Tested perfomance (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/164)
- Doc added (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/162)
- Adapted to queriers (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/165)

#### Web changes

- How to debug with Quest (tutorial) (https://gitlab.com/babiaxr/babiaxr.gitlab.io/-/issues/19)
- Add link to source code in examples (https://gitlab.com/babiaxr/babiaxr.gitlab.io/-/issues/8)
- Add favicon (https://gitlab.com/babiaxr/babiaxr.gitlab.io/-/issues/19)
- Add table of contents (https://gitlab.com/babiaxr/babiaxr.gitlab.io/-/issues/11)
- Add get started to left side menu (https://gitlab.com/babiaxr/babiaxr.gitlab.io/-/issues/19)

#### New time evolution

- Implement temporal evolution in barsmap (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/167)

### Mazinger Z

#### New time evolution

- Design workflow for the temporal evolution (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/144)
- Bars adapted to the new desing (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/155)

##### Docs

- Debug and test with Oculus (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/158)

### Light

> NPM 1.1.1 version

#### Stack changes

- Components renaming (simpler names), all doc is updated (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/118).

#### Boats component changes

- Add building color as numeric metric, with a HSL gradient algorithim (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/140)
- Show legend when clicking on a quarter (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/133)
- Keep legend when clicking on a building (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/138)
- Bug solved on `getLevels` function (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/134)
- Scenes for a research experiment designed (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/136)
- Show metrics on legends (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/107)
- Bug with the legend scaling solved (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/129)
- Allow to modify quarter height (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/128)

#### User Interface component changes

- Add documentation for the component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/131)
- Bug solved on the metrics buttons layout (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/135)
- Bug solved when the data retriever component changes (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/126)
- Bug solved on the buttons click behavior in the Ocuslus Quest (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/132)
- Bug solved about the raycaster and the buttons (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/130)
- Bug solved about the repeated data sources (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/123)
- Bug solved when changing between area and depth/width in the boats component (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/124)


#### City component changes

- Show metrics on legends (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/107)
- Bug with the legend scaling solved (https://gitlab.com/babiaxr/aframe-babia-components/-/issues/129)

### Kakegurui

> NPM 1.1.0 version

- New STACK (see [STACK.md](./others/STACK.md))
- Al the documentation updated with the islands and city visualizations and the new way to build scenes.


### Inuyasha

> NPM 1.0.12 version

- Added testing for the components
- First iteraction of adding the vismapper component to codecity
- [Demo with screenshots](https://babiaxr.gitlab.io/aframe-babia-components/).

### Haikyu!!

> NPM 1.0.11 version

- Changed the name of the components to `babiaxr- `.
- Created vismapper's interface for **Oculus Quest**.
- Added new demo with all updates until now.
- Fixed raycaster bugs.
- Updated the [website](https://babiaxr.gitlab.io) with new guides and information about the BabiaXR components.

### Gantz

- Updated the [website](https://babiaxr.gitlab.io) with new documentation.

### Fairy Tail

- Added filters in filterdata component.
- Created a UI interface in vismapper component.
- Changed the names of the babia-components (ex. `babia-3dbarchart`).
- Created documentation and scripts about [How to create a time evolving software city](https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/HOW_TO_TIME_EVOLVE_CITY.md)

### Excel Saga

- Added some unit tests for codecity component.
- Updated [CONTRIBUTING.md](https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/CONTRIBUTING.md#testing-code-in-babiaxr) with infomation about `how to test code in BabiaXR`. 

### Detective Conan

> NPM 1.0.10 version

- Main page of babiaXR updated (with a blog!).
- Demo for VISSOFT paper prepared (https://thesis-dlumbrer.gitlab.io/vissoft2020/).
- UI Navbar now supports big time points (defining the points per line).
- UI Navbar supports multiple components aiming.

### Cowboy Bepop

> NPM 1.0.9 version

- Quarter and building legends in CodeCity chart.
- UI navigation bar component created for time evolution visualization (more information in README).
- Event controller component created for use the ui nav bar with the common visualizations (more information in README).
- The examples has been adapted for using it with the Oculus Quest device.
- Added time evolution codecity examples for commit by commit, year by year, month by month and week by week examples for Perceval and Sortinghat projects.

### Bobobo

> NPM 1.0.8 version

- Added scale to the charts
- Added titles to the charts
- Created Terrain component
- Added time evolution commit by commit for codecity (from present to past)

### Akira

> NPM 1.0.7 version

- Added demo with COVID-19 data.
- Improvement of CodeCity time evolution, showing empty fences on the files that used to exist but don't exist in the current time snapshot. Area of the buildings set to the max area of all its history.
- Added color palette option to visualizations.
- Added `querier_es` to query ElasticSearch Databases.
- Added cylinder (3D an 3D) and doughnut charts to the components set.
- Added animation to the visualizations (except pie and doughnut chart).
- Added Totem chart in order to change the data of some visualizations dynamically.



## Springs/Milestones

| Name        | Start date           | End Date   | Information | Board | Release Notes | NPM version |
| --------        | -----------           | ----   | ----- | ------ | ------ | ------- |
| Akira         | 2020-04-22   |   2020-05-06  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/2) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Akira) | [Link](#akira) | 1.0.7 |
| Bobobo         | 2020-05-06   |   2020-05-20 | [Link](https://gitlab.com/groups/babiaxr/-/milestones/3) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Bobobo) | [Link](#bobobo) | 1.0.8 |
| Cowboy Bepop         | 2020-05-20   |  2020-06-11  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/4) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Cowboy%20Bepop) | [Link](#cowboy-bepop) | 1.0.9 |
| Detective Conan         | 2020-06-10   |  2020-06-24  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/5) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Detective%20Conan) | [Link](#detective-conan) | 1.0.10 |
| Excel Saga        | 2020-06-24  |  2020-07-08  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/6) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Excel%20Saga) | [Link](#excel-saga) | - |
| Fairy Tail        | 2020-07-22   |  2020-08-05  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/7) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Fairy%20Tail) | [Link](#fairy-tail) | - |
| Gantz         | 2020-08-19   |  2020-09-02  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/8) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Gantz) | [Link](#gantz) | - |
| Haikyu!!         | 2020-09-09   |  2020-10-22  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/9) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Haikyu!!) | [Link](#haikyu!!)  | 1.0.11 |
| Inuyasha        | 2020-10-22   |  2020-11-05  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/10) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Inuyasha) | [Link](#inuyasha)  | 1.0.12 |
| Kakegurui        | -   |  -  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/12) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Kakegurui) | [Link](#kakegurui)  | 1.1.0 |
| Light        | -   |  2021-03-08  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/13) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Light) | [Link](#light)  | 1.1.1 |
| Mazinger Z        | -   |  2021-04-21  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/14) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&milestone_title=Mazinger%20Z) | [Link](#mazinger-z)  | - |
| Naruto        | -   |  2021-05-04  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/15) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&milestone_title=Naruto) | [Link](#naruto)  | 1.1.2 |
| One Punch Man        | 2021-05-04   |  2021-06-07  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/16) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&milestone_title=One%20Punch%20Man) | [Link](#one-punch-man)  | 1.1.3 |
| Pokemon        | 2021-06-07   |  2021-06-26 | [Link](https://gitlab.com/groups/babiaxr/-/milestones/17) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&milestone_title=Pokemon) | [Link](#pokemon)  | 1.1.4 |
| Queens Blade        | 2021-06-26   |  2021-09-29 | [Link](https://gitlab.com/groups/babiaxr/-/milestones/18) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&milestone_title=Queens%20Blade) | [Link](#queens-blade)  | 1.2.1 |

**DEPRECATED**
