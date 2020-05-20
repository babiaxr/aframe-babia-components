# Release Notes for BabiaXR

This doc gathers all the information about the releases made by the Springs/Milestones of BabiaXR.

## Springs/Milestones

| Name        | Start date           | End Date   | Information | Board | Release Notes | NPM version |
| --------        | -----------           | ----   | ----- | ------ | ------ | ------- |
| Akira         | 2020-04-22   |   2020-05-06  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/2) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Akira) | [Link](#akira) | 1.0.7 |
| Bobobo         | 2020-05-06   |   2020-05-20 | [Link](https://gitlab.com/groups/babiaxr/-/milestones/3) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Bobobo) | [Link](#bobobo) | 1.0.8 |
| Cowboy Bepop         | 2020-05-20   |  2020-06-03  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/4) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Cowboy%20Bepop) | TBD | TBD |
| Detective Conan         | 2020-06-03   |  2020-06-17  | [Link](https://gitlab.com/groups/babiaxr/-/milestones/5) | [Link](https://gitlab.com/groups/babiaxr/-/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Detective%20Conan) | TBD | TBD |


## Release notes

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