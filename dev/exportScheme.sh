#!/bin/bash
echo "Hello"
sudo DB_CLIENT=sqlite3 DB_FILENAME=./database/data.db npx directus schema snapshot --yes ./scheme.yaml && echo 'Scheme 
exported to ./scheme.yaml'
