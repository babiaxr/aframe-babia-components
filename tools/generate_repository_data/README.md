# Generate data from a repository

## Requeriments

1. ElasticSearch 6 deployed. There is a docker-compose file to deploy it locally [here](./utils/docker-compose.yml)
2. "python-dev" and "cloc" installed
```
sudo apt-get install python3-dev
sudo apt-get install cloc
```

## Steps

1. Create a python3 virtual environment and activate it (optional).

```
python3 -m venv /tmp/babiaxr
source /tmp/babiaxr/bin/activate
```

2. Install requirements

```
pip install -r requirements.txt
```

3. Execute the code with the following arguments

```
python3 cocom_graal2es.py --repo <your_repo_url> --es-url <elasticsearch_url> --raw-index <elasticsearch_raw_index> --enriched-index <elasticsearch_enriched_index>
```

## Examples

```
python3 cocom_graal2es.py --repo https://github.com/chaoss/grimoirelab-perceval.git --es-url http://localhost:9200 --raw-index perceval_cocom_raw --enriched-index perceval_cocom_enriched
```
