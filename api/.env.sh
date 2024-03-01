#!/bin/bash

export CONFIGURATION=$(cat << EOF
{
  "keycloakParams": {
    "url": "$SILL_KEYCLOAK_URL",
    "realm": "$SILL_KEYCLOAK_REALM",
    "clientId": "$SILL_KEYCLOAK_CLIENT_ID",
    "adminPassword": "$SILL_KEYCLOAK_ADMIN_PASSWORD",
    "organizationUserProfileAttributeName": "$SILL_KEYCLOAK_ORGANIZATION_USER_PROFILE_ATTRIBUTE_NAME"
  },
  "readmeUrl": "$SILL_README_URL",
  "termsOfServiceUrl": "$SILL_TERMS_OF_SERVICE_URL",
  "jwtClaimByUserKey": {
    "id": "$SILL_JWT_ID",
    "email": "$SILL_JWT_EMAIL",
    "organization": "$SILL_JWT_ORGANIZATION"
  },
  "dataRepoSshUrl": "$SILL_DATA_REPO_SSH_URL",
  "sshPrivateKeyForGitName": "$SILL_SSH_NAME",
  "sshPrivateKeyForGit": "$SILL_SSH_PRIVATE_KEY",
  "githubPersonalAccessTokenForApiRateLimit": "$SILL_GITHUB_TOKEN",
  "githubWebhookSecret": "$SILL_WEBHOOK_SECRET",
  "port": $SILL_API_PORT,
  "isDevEnvironnement": $SILL_IS_DEV_ENVIRONNEMENT,
  "externalSoftwareDataOrigin": $SILL_EXTERNAL_SOFTWARE_DATA_ORIGIN
}
EOF
) 

$@
