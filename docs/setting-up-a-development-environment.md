## Defining the sill-api parameter

There are 3 ways to provide the parameter required to run `sill-api`.  
1. Using a `.env` file at the root of the project.
2. Sourcing environement variables
3. Edit the `.env.local.sh` file.

Makes sure to put the name of your SSH key and the private key (generated when you created the sill-data repo) in your `~/.bash_profile` example:

### Option 1: Using a .env file
```
SILL_KEYCLOAK_URL=https://auth.code.gouv.fr/auth
SILL_KEYCLOAK_REALM=codegouv
SILL_KEYCLOAK_CLIENT_ID=sill
SILL_KEYCLOAK_ADMIN_PASSWORD=xxxxxx
SILL_KEYCLOAK_ORGANIZATION_USER_PROFILE_ATTRIBUTE_NAME=agencyName
SILL_README_URL=https://git.sr.ht/~codegouvfr/logiciels-libres/blob/main/sill.md
SILL_TERMS_OF_SERVICE_URL=https://code.gouv.fr/sill/tos_fr.md
SILL_JWT_ID=sub
SILL_JWT_EMAIL=email
SILL_JWT_ORGANIZATION=organization
SILL_DATA_REPO_SSH_URL=git@github.com:codegouvfr/sill-data-test.git
SILL_SSH_NAME=id_ed25xxxxx
SILL_SSH_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----\nxxxx\nxxxx\nxxxx\nAxxxx\nxxxx\n-----END OPENSSH PRIVATE KEY-----\n"
SILL_GITHUB_TOKEN=ghp_xxxxxx
SILL_WEBHOOK_SECRET=xxxxxxx
SILL_API_PORT=3084
SILL_IS_DEV_ENVIRONNEMENT=true
```


### Option 2: Sourcing environment variables
```
export SILL_KEYCLOAK_URL=https://auth.code.gouv.fr/auth
export SILL_KEYCLOAK_REALM=codegouv
export SILL_KEYCLOAK_CLIENT_ID=sill
export SILL_KEYCLOAK_ADMIN_PASSWORD=xxxxxx
export SILL_KEYCLOAK_ORGANIZATION_USER_PROFILE_ATTRIBUTE_NAME=agencyName
export SILL_README_URL=https://git.sr.ht/~codegouvfr/logiciels-libres/blob/main/sill.md
export SILL_TERMS_OF_SERVICE_URL=https://code.gouv.fr/sill/tos_fr.md
export SILL_JWT_ID=sub
export SILL_JWT_EMAIL=email
export SILL_JWT_ORGANIZATION=organization
export SILL_DATA_REPO_SSH_URL=git@github.com:codegouvfr/sill-data-test.git
export SILL_SSH_NAME=id_ed25xxxxx
export SILL_SSH_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----\nxxxx\nxxxx\nxxxx\nAxxxx\nxxxx\n-----END OPENSSH PRIVATE KEY-----\n"
export SILL_GITHUB_TOKEN=ghp_xxxxxx
export SILL_WEBHOOK_SECRET=xxxxxxx
export SILL_API_PORT=3084
export SILL_IS_DEV_ENVIRONNEMENT=true
```

### Option 2: Editing `.env.local.sh`

If you dont like having to source thoses env variables you can provide them
by editing the `.env.local.sh` at the root of the `sill/api` project.  
 

`~/sill/sill-api/.env.local.sh`
```sh
#!/bin/bash

export CONFIGURATION=$(cat << EOF
{
  "keycloakParams": {
    "url": "https://auth.code.gouv.fr/auth",
    "realm": "codegouv",
    "clientId": "sill",
    "adminPassword": "xxxxxx",
    "organizationUserProfileAttributeName": "agencyName"
  },
  "readmeUrl": "https://git.sr.ht/~codegouvfr/logiciels-libres/blob/main/sill.md",
  "termsOfServiceUrl": "https://code.gouv.fr/sill/tos_fr.md",
  "jwtClaimByUserKey": {
    "id": "sub",
    "email": "email",
    "organization": "organization"
  },
  "dataRepoSshUrl": "git@github.com:codegouvfr/sill-data-test.git",
  "sshPrivateKeyForGitName": "id_ed25xxxxx",
  "sshPrivateKeyForGit": "-----BEGIN OPENSSH PRIVATE KEY-----\nxxxx\nxxxx\nxxxx\nAxxxx\nxxxx\n-----END OPENSSH PRIVATE KEY-----\n",
  "githubPersonalAccessTokenForApiRateLimit": "ghp_xxxxxx",
  "githubWebhookSecret": "xxxxxxx",
  "port": 3084,
  "isDevEnvironnement": true
}
EOF
) 

$@
```

You'll need [Node](https://nodejs.org/) and [Yarn 1.x](https://classic.yarnpkg.com/lang/en/). (Find [here](https://docs.gitlanding.dev/#step-by-step-guide) instructions by OS on how to install them)

It is much easier to navigate the code with VSCode (We recommend the free distribution [VSCodium](https://code.gouv.fr/sill/software?name=VSCodium)).

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

