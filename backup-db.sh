#!/bin/bash
echo \"$(date +'%Y-%m-%dT%H:%M') Creating backup db dump ...\"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SCRIPT_DIR/../db-backups"


# loads .env file relevant variables
export $(grep -E '^(POSTGRES_DB|POSTGRES_USER)=' $SCRIPT_DIR/.env | xargs)

if [ -z "$POSTGRES_DB" ]; then
    echo "POSTGRES_DB is not set"
    exit 1
fi

if [ -z "$POSTGRES_USER" ]; then
    echo "POSTGRES_USER is not set"
    exit 1
fi

docker compose -f $SCRIPT_DIR/docker-compose.prod.yml exec -it postgres pg_dump -U $POSTGRES_USER -d $POSTGRES_DB  > $SCRIPT_DIR/../db-backups/dump-$(date +'%Y-%m-%dT%H:%M').sql

if [ $? -eq 0 ]; then
    echo Success !
else
    echo Failed !
fi