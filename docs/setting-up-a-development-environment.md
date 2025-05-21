## Install depencies

To set up our dev environment we rely on the following softwares

1. [Docker](https://docs.docker.com/engine/install/) & Docker compose plugin 
2. [Node](https://nodejs.org/en/download/package-manager/current)
3. [Yarn](https://classic.yarnpkg.com/en/docs/install#debian-stable)

It is much easier to navigate the code with VSCode (We recommend the free distribution [VSCodium](https://code.gouv.fr/sill/software?name=VSCodium)).

## Run local databases

To launch local databases, you can quickly do that by running the following command

`docker compose -f docker-compose.ressources.yml up`

This will also start the keycloak server, with a basic configuration (at the root of the project:`keycloak-dev-realm.json`).

## Defining the sill-api parameter

We use a `.env` file to provide the parameter required to run `sill-api`.

Makes sure to put the name of your SSH key and the private key (generated when you created the sill-data repo) in your `~/.bash_profile` example:

### This what your `.env` file should look like
```
OIDC_ISSUER_URI=http://localhost:8081/auth/realms/codegouv
OIDC_CLIENT_ID=sill
TERMS_OF_SERVICE_URL=https://code.gouv.fr/sill/tos_fr.md
GITHUB_TOKEN=ghp_xxxxxx
API_PORT=3084
IS_DEV_ENVIRONNEMENT=true
DATABASE_URL=postgresql://sill:pg_password@localhost:5432/sill
```

## Install dev packages and run
```bash
# Only the first time

git clone https://github.com/codegouvfr/sill
yarn
yarn build

# Everyday
yarn dev # this uses turborepo : it runs `yarn dev` in both `web` and `api` packages

# ⚠️there is no hot reload for the api, you need to restart the server manually ⚠️

# The app is running on http://localhost:3000
# and the api on http://localhost:3084
```

If you use vscode or vscodium, you can run it from the run and debug menu.

## Releasing a new version

As the web app and the api are in the same repository, the version number is aligned. It is the version number of the `package.json` in the root of the repository.

When you want to push a new release, you need to update the version number in package.json. Update [the package.json version number](https://github.com/codegouvfr/sill/blob/7290a32809e0ca4964e6d0eccfc6af037d7c6771/package.json#L3) and push.

When the updated package.json version is on main (weather it's pushed or merged), the CI will :
1. create a pre-release on GitHub
2. build the corresponding api and web docker-images
3. poke the preprod server to pull the new images
4. the preprod should than be deployed with the new version

To push a version to production, you have to approve it on the GitHub action.

5. once validated, the CI will trigger a deploy on production
6. an actual release is created on GitHub

