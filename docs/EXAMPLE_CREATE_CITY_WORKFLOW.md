# Tutorial of creating a time evolving city (local demo)

In this case we are going to create a city of the project [perceval](https://github.com/chaoss/grimoirelab-perceval) and [sortinghat](https://github.com/chaoss/grimoirelab-sortinghat).

## 1. Deploy ElasticSearch and MySQL

In order to proceed with this tutorial, you must have deployed an ElasticSearch 6 and a MySQL.

If you are using docker, you can use this docker-compose files:

For ElasticSearch 6:
```
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch-oss:6.1.0
  ports:
    - "9200:9200"
  environment:
    - ES_JAVA_OPTS=-Xms2g -Xmx2g


```

For MySQL:
```
# Use root/example as user/password credentials
version: '3.1'

services:

  db:
    image: mysql
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: babiaxr
    ports:
      - 3308:3306

  adminer:
    image: adminer
    ports:
      - 8080:8080
```

Then, create an empty DB on MySQL

## 2. Get CoCom data from the repository

1. Create a `config` folder with two files inside: `setup.cfg` and `projects.json`

2. Go to `config/setup.cfg` and change the next sections:

    ```
    [es_collection]
    url = http://localhost:9200

    [es_enrichment]
    url = http://localhost:9200

    [sortinghat]
    ...
    host = localhost
    user = root
    password = babiaxr
    database = babiaxrdb
    ...

    [cocom]
    ...
    raw_index =  perceval_raw
    enriched_index = perceval_enriched
    category = code_complexity_lizard_repository
    ...

    [enrich_cocom_analysis]
    ...
    out_index =  perceval_cocom
    ...
    ```

3. Add the repository url into the `config/projects.json`

    ```
    {
        "babiaxr": {
            "cocom": [
                "https://github.com/chaoss/grimoirelab-perceval"
            ]
        }
    }

    ```

4. Make sure that you have Python3 installed.

5. Install the `tools/requirements.txt` python requirements: `pip3 install -r tools/requirements.txt`

6. Copy the file `tools/graal_codecity.sh` into the same path of the `config` folder.

7. Execute the `graal_codecity.sh`

Once the file is executed you will have the data of the repository analyzed with Graal in the ElasticSearch database, using the Cocom analysis.

## 3. Generate CodeCityJS data

We are going to analyze the city evolving week by week. For producing the data needed to build the city, we need to execute the code `tools/generate_structure_codecityjs.py` with the following parameters:

```
python3 generate_structure_codecityjs.py 
--debug
--export-enriched-dataframe
./enriched_dataframe_backup_perceval_cocom.json.csv
--export-dataframe
./raw_dataframe_backup_perceval_cocom.json.csv
-e
http://localhost:9200
-i
perceval_cocom
-if
./index_backup_perceval_cocom.json
--repo
https://github.com/chaoss/grimoirelab-perceval
-time
--delta-days
7
--samples
100000
-afield
loc
-hfield
num_funs
-dfield
grimoire_creation_date
-o
.
```

This code will generate a json with the name `main_data.json` (and other files of backup) with all the data needed for the time evolving city.

## 4. Create the 3D/VR A-frame scene

A-Frame works on top of HTML, so we just need to create an HTML with the dependencies linked and the distribution file of the babia-components.

0. Go to your workspasce

1. Get the `main_data.json` file of the previous step and move it to the workspace.

2. Copy the file `dist/aframe-babia-components.min.js` into the workspace.

3. Create an `index.html` file (at the same level of the other files)  and fill it with:
```
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>A-Frame CodeCity Component - Time evolution</title>
  <meta name="description" content="Basic example for CodeCity component.">
  </meta>
  <script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.0/dist/aframe-extras.min.js"></script>
  <script src="./aframe-babia-components.min.js"></script>
  <script src="https://unpkg.com/aframe-environment-component@1.0.0/dist/aframe-environment-component.min.js"></script>
  <script src="https://unpkg.com/@editvr/aframe-dialog-popup-component@1.7.3/dist/aframe-dialog-popup-component.min.js"></script>
  <script
    src="https://unpkg.com/aframe-geometry-merger-component/dist/aframe-geometry-merger-component.min.js"></script>
  <script
    src="https://unpkg.com/aframe-text-geometry-component@0.5.1/dist/aframe-text-geometry-component.min.js"></script>
</head>

<body>

  <a-scene id="scene" renderer="antialias: true">

    <a-entity environment="playArea: 2"></a-entity>

    <a-entity position="0 0 -3" id="codecity" babiaxr-codecity='width: 20; depth: 20; streets: true; color: green;
              extra: 1.5; base_thick: 0.3; split: pivot; titles: true;
              data: main_data.json; ui_navbar: navigationbar'>
    </a-entity>

    <a-entity id="navigationbar" babiaxr-navigation-bar= 'to: left; start_point: 251; points_by_line: 60; size: 8' position='-20 15 0' scale="3 3 3"></a-entity>

    <a-entity movement-controls="fly: true" position="0 1.2 12">
      <a-entity camera position="0 3 4" look-controls></a-entity>
      <a-entity laser-controls
      raycaster="objects: .babiaxraycasterclass, #navbarpopup, #navbarpopup--close-icon, #iteractionpopup, #iteractionpopup--close-icon, 
      #cityinformation, #cityinformation--close-icon"></a-entity>
      <a-entity cursor="rayOrigin:mouse" 
      raycaster="objects: .babiaxraycasterclass, #navbarpopup, #navbarpopup--close-icon, #iteractionpopup, #iteractionpopup--close-icon, 
      #cityinformation, #cityinformation--close-icon"></a-entity>
      <a-entity></a-entity>
    </a-entity>

  </a-scene>

</body>

</html>

```

4. Then, deploy a http server (python simple http sever, http-server from nodejs, etc.) in order to serve the `index.html` file. You'll see the city and the navigation nav bar for moving between time snapshots.

## Credits

This tutorial was made following the following docs. Please, check them in order to see the other parameters that can be modified in order to change the city layout or the time evolution snapshots:

- [Data retrieval doc](../tools/README.md)
- [How to time evolve city](./HOW_TO_TIME_EVOLVE_CITY.md)