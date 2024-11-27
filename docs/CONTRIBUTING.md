# Contributing to BabiaXR

This guide collects information about how to deploy BabiaXR locally, how to create a new component and add it to the BabiaXR set and how to create the distribution files.


> :warning: **IMPORTANT**  : BabiaXR is a set of A-Frame components based on [**angle**](https://www.npmjs.com/package/angle), for further information, please visit the angle main page.


## Table of Contents

A high level overview of our contributing guidelines.

- [Contributing process to the project](#contributing-process-to-the-project)
    - [Team organization](#team-organization)
    - [Pending tasks](#pending-tasks)
    - [How to MR](#how-to-mr)
- [Deploy a dev server locally](#deploy-a-dev-server-locally)
- [Build distribution files](#build-distribution-files)
- [Develop code in BabiaXR](#develop-code-in-babiaxr)
- [Testing code in BabiaXR](#testing-code-in-babiaxr)


## Contributing process to the project

BabiaXR is an open-source project hosted on [GitLab](https://gitlab.com/babiaxr).
All the information about the tasks, the repositories with the code and the webpage are there, if you are on GitHub, please visit https://gitlab.com/babiaxr.

### Team organization

The core developers organize the development using sprints of two weeks of duration, each sprint is defined as a Milestone of GitLab. In each milestone, some tasks are worked on, and the organization of the tasks is as follows:

- Topics/Subjects of the tasks are defined as issues in GitLab with the `Theme` tag.
- Epics are big and complex tasks that have smaller and defined subtasks as children, each epic has a topic assigned. Once all the tasks of an epic are resolved, the epic will be resolved as well. Epics defined as issues in GitLab with the `Epic` tag.
- The common tasks are issues on GitLab and these issues depend on an epic or are a bug/feature.

#### Sprints/Milestones

Please, for further information about the sprints, go to the [RELEASE_NOTES.md](https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/RELEASE_NOTES.md) doc.

### Pending tasks

We follow a Kanban process for each task, hosted as a board on GitLab.
In the "To Do" list there are the tasks that are prepared to do.
In order to see the tasks related to the current sprint/milestone, please filter the kanban/tasks list by milestones:

- Kanban: https://gitlab.com/groups/babiaxr/-/boards
- Tasks list: https://gitlab.com/groups/babiaxr/-/issues

### How to Merge Request (MR)

In order to submit a MR, please follow the next steps:

1. Fork the target repository of BabiaXR on GitLab.
2. Do the development/action (see next section).
3. Submit a MR referring the task/issue if the development resolves it.

## Deploy a dev server locally

The steps to reproduce and deploy a dev server for developing babiaXR are:

1. Clone the repository:
    ```
    git clone https://gitlab.com/babiaxr/aframe-babia-components
    ```

2. Install the dependencies:
    ```
    cd aframe-babia-components
    npm install
    ```

3. Deploy the dev server:

    - Without SSL:
        ```
        npm run dev
        ```
        or
        ```
        npm start
        ```
    - With SSL:
        ```
        npm run ssldev
        ```
    - With SSL, access from all hosts
        ```
        npm run ssldevall
        ```

Each change in a file will automatically update the dev server.

**Warning notice:** `npm run ssldevall` will listen connections in 0.0.0.0,
which means "all network devices in this host, including localhost".
This implies that the HTTPS server will accept connections from anywhere
in the internet. While this is quite convenient for connecting external
devices (e.g., a VR device), it also exposes your directory to anyone
with HTTPS access to the 8080 port on your host. Use `ssldevall` at your own risk.


## Build distribution files

In order to build a distribution release for BabiaXR, just need to execute the next command:

```
npm run dist
```

The webpack service of [**angle**](https://www.npmjs.com/package/angle) will take the `index.js` file and will fetch the needed files and collect them into the distribution files.
Therefore, the command will generate two distribution files, `aframe-babia-components.js` and `aframe-babia-components.min.js` inside the `dist/` folder.


## Develop code in BabiaXR

In order to develop code for BabiaXR, e.g. a new component, you have to add it to the `index.js` file using `require` sintax:

```
// index.js file
...
require('your_file_path')
...
```

This is neccessary since the distribution files are based on the information of the `index.js` file (see [Build distribution files](#build-distribution-files) section
). Once the file is added, you can now deploy the dev server and 


## Testing code in BabiaXR

Currently, we use `cypress` testing runner.

Before starting the testing, you need to start the server (with SSL):
```
npm run ssldev
```

To start testing, execute the next command:
```
npm run test
```
This will run all the test that you have created in the `tests` folder. 

When a test file includes to create snapshots or videos, those will be saved into the `/screenshots` and `/videos` folders.

While development, if you want to execute some tests, you can run cypress using:
```
npm run devtest
```

If you want to test only one browser (`firefox` or `chrome`):
```
npm run test:firefox
```
or 
```
npm run test:chrome
```

## Certificates for npm run ssldev to work

This repository comes with certificates that are used by webpack to configure the HTTPS server.
They are self-signed, which means they need to be accepted in the browser: Usually you
will get a warning about certificates not being correct, and will be prompted to acept them.
These certificates have been built as follows:

```
openssl genrsa -out babia_key.pem
openssl req -new -key babia_key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey babia_key.pem -out babia_cert.pem
rm csr.pem
```

More details in [How to create a HTTPS server](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/) (Node.js documentation).

We are using those certificates to avoid webpack generating new certificates with every new run,
which means having to accept them in browser with every new run.
