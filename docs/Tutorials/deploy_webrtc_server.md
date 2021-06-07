---
linktitle: "multiuser"
date: 2021-06-07T22:20:00+02:00
title: Deploying a WebRTC (easyrtc) server
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "networked", "guide", "multiuser", "syncronization", "webrtc"]
---

# How to deploy a WebRTC (easyrtc) server

This tutorial has the aim of guide you through the steps for deploying a WebRTC server and try it with the multiuser feature of BabiaXR.

Specifically, this guide is for deploying an [EasyRTC](https://easyrtc.com/) server.

- GitHub Repo: https://github.com/open-easyrtc/open-easyrtc

## Deploying using JavaScript (local)

The steps for deploying an Open EasyRTC server using JavaScript (**required node 13.8.0**) are the next ones:

```
git clone https://github.com/open-easyrtc/open-easyrtc
cd open-easyrtc
npm install --production
cd server_example
```

- Non-secured server
    ```
    node server.js
    ```

- SSL autosigned localhost server
    ```
    node server_ssl.js
    ```

- SSL with custom certs
    1. Go to `server_ssl.js` file and modify the following lines:
    ```
    // Start Express https server on port 8443
    var webServer = https.createServer({
        key:  fs.readFileSync(__dirname + "your_path_to_key"),
        cert: fs.readFileSync(__dirname + "your_path_to_cert")
    }, httpApp);
    ```
    2. Then deploy the server
    ```
    node server_ssl.js
    ```

## Deploying using Docker

First of all you have to have installed [Docker](https://www.docker.com/) and [docker-compose](https://www.docker.com/) (optional)

### Dockerfiles

The docker images are allocated in a repository:

- Dockerfile for the nonssl version: https://gitlab.com/babiaxr/open-easyrtc/-/blob/master/server_example/Dockerfile
- Dockerfile for the ssl version autosigned localhost: https://gitlab.com/babiaxr/open-easyrtc/-/blob/master/server_example/Dockerfile_ssl_autosigned
- Dockerfile for the ssl version with custom certs: __WIP__

### Docker-hub tags:

- non-ssl version: `babiaxr/easyrtc:nonssl`
- ssl autosgined version: `babiaxr/easyrtc:sslautosigned`
- ssl custom certs: __WIP__ 

### Deploy with docker

- non-ssl version: `docker run -it -d -p 8080:8080 babiaxr/easyrtc:nonssl`
- ssl autosgined version: `docker run -it -d -p 8443:8443 babiaxr/easyrtc:sslautosigned`
- ssl custom certs: __WIP__ 



### Deploy with docker-compose

- non-ssl version:

```
version: "3.1"

services:
  easyrtc-server:
    image: babiaxr/easyrtc:nonssl
    container_name: easyrtc-server
    build:
      context: .
      args:
        EASYRTC_BRANCH: "master"
    command: server_ssl
    volumes:
      - ./certs:/usr/src/app/certs:ro
    networks:
      - frontend
    ports:
      - "8080:8080"
    tty: true
    stdin_open: true
    volumes:
      - ./static:/static:ro

networks:
  frontend:
  backend:

```

- ssl autosgined version:

```
version: "3.1"

services:
  easyrtc-server:
    image: babiaxr/easyrtc:sslautosigned
    container_name: easyrtc-server
    build:
      context: .
      args:
        EASYRTC_BRANCH: "master"
    command: server_ssl
    volumes:
      - ./certs:/usr/src/app/certs:ro
    networks:
      - frontend
    ports:
      - "8443:8443"
    tty: true
    stdin_open: true
    volumes:
      - ./static:/static:ro

networks:
  frontend:
  backend:

```

- ssl custom certs: __WIP__ 
