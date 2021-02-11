# Release Notes for BabiaXR

This doc gathers all the information about the releases made by the Springs/Milestones of BabiaXR.

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
| Kakegurui        | 2020-10-22   |  2020-11-05  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/12) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Kakegurui) | [Link](#kakegurui)  | 1.1.0 |


## Release notes

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