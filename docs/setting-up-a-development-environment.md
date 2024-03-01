You can copy the `.env.sample` to `.env` with the following command:

```bash
cp .env.sample .env
```

Then you can edit the `.env` file to set the environment variables.

You will need to setup the SSH keys.
These are your github SSH keys. The SSH keys you would use to access to the repo which will be in the `SILL_DATA_REPO_SSH_URL` env variable.
You need to provide the name of your SSH key too.
In your local, you can find them in your `~/.ssh` folder.

Exemple :

```
SILL_DATA_REPO_SSH_URL=git@github.com:codegouvfr/sill-data-test.git
SILL_SSH_NAME=your_ssh_key_name
SILL_SSH_PRIVATE_KEY=your_ssh_key
```

You also need to configuer Keycloak. Most of the information in the `.env.sample` are already set up for you. You just need to set the `SILL_KEYCLOAK_ADMIN_PASSWORD` variable (ask the team).

```
SILL_KEYCLOAK_URL=https://auth.code.gouv.fr/auth
SILL_KEYCLOAK_REALM=codegouv
SILL_KEYCLOAK_CLIENT_ID=sill
SILL_KEYCLOAK_ADMIN_PASSWORD=xxx_to_provide_it_xxx
SILL_KEYCLOAK_ORGANIZATION_USER_PROFILE_ATTRIBUTE_NAME=agencyName
```

You'll need [Node](https://nodejs.org/) and [Yarn 1.x](https://classic.yarnpkg.com/lang/en/). (Find [here](https://docs.gitlanding.dev/#step-by-step-guide) instructions by OS on how to install them)

It is much easier to navigate the code with VSCode (We recommend the free distribution [VSCodium](https://code.gouv.fr/sill/software?name=VSCodium)).

```bash
# Only the first time

mkdir ~/sill

cd ~/sill
git clone https://github.com/codegouvfr/sill-web
cd sill-web
yarn

cd ~/sill
git clone https://github.com/codegouvfr/sill-api
cd sill-api
yarn
yarn build
yarn link-in-web

# Everyday

cd ~/sill/sill-api
npx tsc -w

# Open a new terminal
cd ~/sill/sill-api
yarn dev # Note, there is no hot reload.

# Open a new terminal
cd ~/sill/sill-web
yarn start

# The app is running on http://localhost:3000
```

## Releasing a new version

### Frontend (sill-web)

Update [the package.json version number](https://github.com/codegouvfr/sill-web/blob/faeeb89792ee1174fd345717a94ca6677a2adb42/package.json#L4) and push.

### Backend (sill-api)

Same, update [the package.json version number](https://github.com/codegouvfr/sill-api/blob/77703b6ec2874792ad7d858f29b53109ee590de1/package.json#L3) and push. Don't forget however [to wait](https://github.com/codegouvfr/sill-api/actions) for the latest version [to be published on NPM](https://www.npmjs.com/package/sill-api). And update the version [sill-web's package.json](https://github.com/codegouvfr/sill-web/blob/faeeb89792ee1174fd345717a94ca6677a2adb42/package.json#L48). (You'll need to update the package.lock as well by running `yarn` again, you can just run `yarn add @codegouvfr/sill`, it's faster).
