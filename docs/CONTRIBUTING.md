# Contributing to BabiaXR

This guide collects information about how to deploy babiaXR locally, how to create a new component and add it to the babiaXR set and how to create the distribution files.


> :warning: **IMPORTANT**  : BabiaXR is a set of A-Frame components based on [**Angle**](https://www.npmjs.com/package/angle), for further information, please visit the angle main page.

## Deploy a dev server locally

The steps to reproduce and deploy a dev server for developing babiaXR are:

1. Clone the repository:
    ```
    git clone https://github.com/babiaxr/aframe-babia-components
    ```

2. Install the dependencies:
    ```
    cd aframe-babia-components
    npm install
    ```

3. Deploy the dev server:
    ```
    npm run dev
    ```
    or
    ```
    npm start
    ```

Each change in a file will automatically update the dev server.


## Build distribution files

In order to build a distribution release for babiaXR, just need to execute the next command:

```
npm run dist
```

The webpack service of [**angle**](https://www.npmjs.com/package/angle) will take the `index.js` file and will fetch the needed files and collect them into the distribution files.
Therefore, the command will generate two distribution files, `aframe-babia-components.js` and `aframe-babia-components.min.js` inside the `dist/` folder.


## Develop in babiaXR

In order to develop code for babia, e.g. a new component, you have to add it to the `index.js` file using `require` sintax:

```
// index.js file
...
require('your_file_path')
...
```

This is neccessary since the distribution files are based on the information of the `index.js` file (see [Build distribution files](#build-distribution-files) section
). Once the file is added, you can now deploy the dev server and 