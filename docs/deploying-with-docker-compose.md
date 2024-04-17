## Deploying the web app with docker-compose

There is an example of how to deploy the sill web app with docker-compose [here](https://github.com/codegouvfr/sill/tree/main/deployments/docker-compose-example).

You can copy paste the folder. Than you will need `.env` file to configure the environnement variables. You can get it by copying the `.env.sample` file from the sill-api repository and modifying it to your needs.

```bash
cp .env.sample .env
```

You will need to provide an ssh key in SILL_SSH_PRIVATE_KEY, and it should have the access to the repo you provide in SILL_DATA_REPO_SSH_URL

You will also need to provide a SILL_GITHUB_TOKEN.

You can change the way you handle the frontal part in the [nging configuration file](https://github.com/codegouvfr/sill/blob/main/deployments/docker-compose-example/nginx/default.conf).
The provided example is basic, and for example it does not provide support for `https` (you would need to configure it with you SSL certificates).

Once everything is configured, you can run the following command to start the web app:

```bash
docker compose build --pull
docker compose up -d
```

