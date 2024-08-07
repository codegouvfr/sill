#!/bin/bash
echo \"$(date +'%Y-%m-%dT%H:%M') Creating backup db dump ...\"

mkdir -p ../db-backups

# loads .env file relevant variables
export $(grep -E '^(POSTGRES_DB|POSTGRES_USER)=' ./.env | xargs)

if [ -z "$POSTGRES_DB" ]; then
    echo "POSTGRES_DB is not set"
    exit 1
fi

if [ -z "$POSTGRES_USER" ]; then
    echo "POSTGRES_USER is not set"
    exit 1
fi

docker compose -f docker-compose.prod.yml exec -it postgres pg_dump -U $POSTGRES_USER -d $POSTGRES_DB  > ../db-backups/dump-$(date +'%Y-%m-%dT%H:%M').sql

if [ $? -eq 0 ]; then
    echo Success !
else
    echo Failed !
fi