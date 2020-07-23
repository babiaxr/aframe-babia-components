# Tools directory for geocodecityjs data process

This folder conatins several scripts in order to get the data for the different BabiaXR components.

## Table of Contents

- [Get cocom data from a repository](#get-cocom-data-from-a-repository)
- [Generate codecity data from ES](#generate-codecity-data-from-es)

## Get cocom data from a repository

> Important: You must have deployed an ElasticSearch 6 and a MySQL.

1. Go to `config/setup.cfg` and change the next sections:

    ```
    [es_collection]
    url = <your_ElasticSearch_url>

    [es_enrichment]
    url = <your_ElasticSearch_url>

    [sortinghat]
    ...
    host = <your_MySQL_endpoint>
    user = <your_MySQL_username>
    password = <your_MySQL_password>
    database = <your_MySQL_database (can be an empty DB)>
    ...

    [cocom]
    ...
    raw_index =  <index_name_where_the_enriched_data_will_be>
    enriched_index = <index_name_where_the_data_will_be>
    category = code_complexity_lizard_repository
    ...

    [enrich_cocom_analysis]
    ...
    out_index =  <index_name_where_the_study_data_will_be>
    ...
    ```

2. Add the repository url into the `config/projects.json`

    ```
    {
        "babiaxr": {
            "cocom": [
                "<your_repo_url>"
            ]
        }
    }

    ```

3. Make sure that you have Python3 installed.

4. Execute the `graal_codecity.sh`

Once the file is executed you will have the data of the repository analyzed with Graal, using the Coco analysis.

## Generate codecity data from ES

> Important: Make sure that you have an ElasticSearch up with cocom data analyzed with Graal (see "[Get cocom data from a repository](#get-cocom-data-from-a-repository)")

For generating the codecity data for using it with the `geocodecityjs` component, you must follow the next steps:

0. Optional: Create a venv of Python3
1. Install requirements (`./requirements.txt`): `pip install -r requirements.txt`
2. Execute `generate_structure_codecityjs.py` with Python3, make sure that you selected the right arguments, the next list explains them:
    - `-h, --help`: shows the help and a description of the available arguments.
    - `-g, --debug`: shows debug traces in the execution process.
    - `-e, --elastic-url`: define the ElasticSearch URL where the data is stored, the `-i, --index` must be defined and it does not work if the `-df` or `-edf` arguments are active.
    - `-i, --index`: ElasticSearch index where the data is stored.
    - `--repo`: define the repo that will be the codecity.
    - `-if, --index-file`: by default, the code saves the index in a JSON format. This command is used to load the data from this index file instead from ElasticSearch. Quicker than load the date from ElasticSearch directly.
    - `-exdf, --export-dataframe`: exports a dataframe with the data of the index.
    - `-df, --dataframe`: load the data from the exported dataframe instead from ElasticSearch. Quicker than load the data from the index file.
    - `-exedf, --export-enriched-dataframe`: exports a dataframe with the data of the index enriched (with more columns that have the information for the codecityjs data building process).
    - `-edf, --enriched-dataframe`: load the data from the exported enriched dataframe instead from ElasticSearch. Quicker than load the data from the raw dataframe.
    - `-time, --time-evolution`: Active the time evolution analisys.
    - `-ddays, --delta-days`: Sampling days for the time evolution (must be added with the `-s, --samples` argument and not with the `-cbc, --commitbycommit` argument)
    - `-s, --samples`: samples of the time evolution analysis (must be added with the `-ddays, --delta-days` argument and not with the `-cbc, --commitbycommit` argument)
    - `-cbc, --commitbycommit`: Time evolution analysis commit by commit from the master branch (not working with the `-s` and `-ddays` arguments)
    - `-o, --output-file`: path where the file with the data will be exported.
    - `-exsnap, --export-snapshots`: Export snapshots of each time snapshot analyzed in the time evolution.
    - `-hfield, --height-field`: Field that will define the height of the buildings.
    - `-afield, --aeight-field`: Field that will define the area of the buildings.
    - `-dfield, --date-field`: Define the field that will be used as date.

3. The returned file have all the needed data for build a city with the `geocodecityjs` component.

### Execution examples


Week by week time evolution (from a dataframe):
```
python3 generate_structure_codecityjs.py 
--debug
-time
--delta-days
7
--samples
100000
--repo
https://github.com/chaoss/grimoirelab-perceval
--export-enriched-dataframe
/home/dmoreno/devel/phdworkspace/vissoft2020/repr_package/df_backups/index_dataframe_graal_cocom_incubator_enriched_perceval_commitbycommit.csv
-df
/home/dmoreno/devel/phdworkspace/vissoft2020/repr_package/df_backups/index_dataframe_graal_cocom_incubator_perceval_commitbycommit.csv
-o
/home/dmoreno/devel/phdworkspace/vissoft2020/repr_package/examples/codecityjs/time_evolution_perceval_weeks_inverse/
-afield
loc
-hfield
num_funs
-dfield
grimoire_creation_date
```


Commit by commit time evolution (from a dataframe): 
```
python3 generate_structure_codecityjs.py 
--debug
-time
--commitbycommit
--repo
https://github.com/chaoss/grimoirelab-sortinghat
--export-enriched-dataframe
/home/dmoreno/devel/phdworkspace/vissoft2020/repr_package/df_backups/index_dataframe_graal_cocom_incubator_enriched_sortinghat_commitbycommit.csv
-df
/home/dmoreno/devel/phdworkspace/vissoft2020/repr_package/df_backups/index_dataframe_graal_cocom_incubator_sortinghat_commitbycommit.csv
-o
/home/dmoreno/devel/phdworkspace/vissoft2020/repr_package/examples/codecityjs/time_evolution_sortinghat_commitbycommit_inverse/
-afield
loc
-hfield
num_funs
-dfield
grimoire_creation_date
```


Commit by Commit time evolution (from an index file):
```
python3 generate_structure_codecityjs.py 
--debug
-time
--repo
https://github.com/chaoss/grimoirelab-perceval
--export-enriched-dataframe
--export-dataframe
-if
index_backups/index_backup_graal_cocom_incubator.json
--commitbycommit
-o
/home/dmoreno/devel/phdworkspace/vissoft2020/repr_package/examples/codecityjs/time_evolution_sortinghat_commitbycommit_inverse/
-afield
loc
-hfield
num_funs
-dfield
grimoire_creation_date
```

Commit by commit time evolution (from an ElasticSearch):
```
python3 generate_structure_codecityjs.py 
--debug
--export-enriched-dataframe
--export-dataframe
-e
https://***:***@elasticsearch_url
-i
cocom_perceval_200519_codecity_enrich
--repo
https://github.com/chaoss/grimoirelab-perceval
--commitbycommit
-time
-afield
loc
-hfield
num_funs
-dfield
grimoire_creation_date
```