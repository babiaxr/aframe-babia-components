#!/bin/bash

CURRENT=`pwd`

echo "Creating python3 virtual env at /tmp/babiaxr"
python3 -m venv /tmp/babiaxr

echo "Activating venv..."
set -e
source /tmp/babiaxr/bin/activate

echo "Cloning mordred at /tmp/grimoirelab-sirmordred"
MORDRED=/tmp/grimoirelab-sirmordred
if [ ! -d "$MORDRED" ]; then
    git clone https://github.com/chaoss/grimoirelab-sirmordred
fi


echo "Installing dependencies"
pip install -r $MORDRED/requirements.txt
pip install -r requirements.txt

echo "Installing mordred"
cd $MORDRED
python3 setup.py install

echo "Executing Graal"
cd $CURRENT
python3 $MORDRED/utils/micro.py --cfg config/setup.cfg --raw --enrich --backends cocom

echo "Deactivating venv..."
deactivate
