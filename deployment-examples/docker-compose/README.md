# Deploying a Catalogi instance

This is a simple example of how to deploy a Catalogi instance, using Docker and Docker Compose.

## Requirements

- Docker
- Docker Compose

## Configure

First, copy the  `.env.sample` and name it `.env` in the root of the project.

```bash
cp .env.sample .env
```

Then, edit the `.env` file to set the environment variables. 
You can use the default values for dev.

## Auth Configuration

The deployment uses https://auth.code.gouv.fr as the OIDC provider. It is the original first project using Catalogi, this is why it is used as the default. However, you should use your own OIDC provider (or use Keycloak to create your own).
