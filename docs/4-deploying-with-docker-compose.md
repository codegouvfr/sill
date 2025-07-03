<!-- SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr> -->
<!-- SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- SPDX-License-Identifier: Etalab-2.0 -->

## Deploying the web app with docker-compose

# Requirements

To deploy the app using docker compose you need :
- Docker
- Docker Compose
- An OIDC provider like Keycloak, that is already independently deployed

There is an example of how to deploy the sill web app with docker-compose [here](https://github.com/codegouvfr/sill/tree/main/deployments/docker-compose-example).

You can copy paste the folder. Than you will need `.env` file to configure the environnement variables. You can get it by copying the `.env.sample` file from the sill-api repository and modifying it to your needs.

```bash
cp .env.sample .env
```

Than ajust the variables in the `.env` file to match your OIDC provider, your database and all. [More details about the variables can be found here]()

You can change the way you handle the frontal part in the [nging configuration file](https://github.com/codegouvfr/sill/blob/main/deployments/docker-compose-example/nginx/default.conf).
The provided example is basic, and for example it does not provide support for `https` (you would need to configure it with you SSL certificates).

Once everything is configured, you can run the following command to start the web app:

```bash
docker compose build --pull
docker compose up -d
```

