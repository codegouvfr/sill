<!-- SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr> -->
<!-- SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- SPDX-License-Identifier: Etalab-2.0 -->

# Simple Keycloak with Docker Compose

This directory contains a production-ready Keycloak setup using Docker Compose with PostgreSQL as the database backend and Nginx as a reverse proxy. The configuration is designed for simple email/password authentication with minimal user data requirements.

**Note**: This setup uses port 8092 for Keycloak to avoid conflicts with other services in the catalogi project (ports 8090-8091 are used by the main deployment example).

## ⚠️ Disclaimer

This Keycloak setup is provided as-is and comes with the following important considerations:

1. **Security**: While this configuration includes basic security measures, it is your responsibility to:

   - Implement proper security measures for your specific use case
   - Regularly update dependencies and apply security patches
   - Configure appropriate password policies and security settings
   - Set up proper monitoring and alerting

2. **Production Use**: Before deploying to production:

   - Review and customize all security settings
   - Set up proper backup and disaster recovery procedures
   - Configure appropriate logging and monitoring
   - Test thoroughly in a staging environment
   - Ensure compliance with your organization's security policies

3. **Maintenance**: Regular maintenance is required:

   - Keep Docker images updated
   - Monitor database size and performance
   - Review and rotate credentials regularly
   - Monitor system logs for security issues

4. **Support**: This is a community-maintained example:
   - No official support is provided
   - Issues should be reported through the project's issue tracker
   - For production deployments, consider consulting with security experts

## Features

- **Production-ready**: Uses PostgreSQL database backend instead of development H2 database
- **Nginx Reverse Proxy**: Secure HTTPS termination and proper header handling
- **Simple authentication**: Email and password only, no additional user attributes required
- **Easy setup**: Single command deployment with Docker Compose
- **Health checks**: Built-in health monitoring for all services
- **Configurable**: Environment variables for easy customization
- **Secure defaults**: Brute force protection and other security features enabled

## Quick Start

1. **Clone and navigate to the directory**:

   ```bash
   cd deployment-examples/keycloak-docker-compose
   ```

2. **Create environment file**:

   ```bash
   cp .env.sample .env
   ```

3. **Edit environment variables** (important for production):

   ```bash
   nano .env
   ```

   **⚠️ Important**: Change the default passwords in production:

   - `POSTGRES_PASSWORD`
   - `KEYCLOAK_ADMIN_PASSWORD`
   - `KC_HOSTNAME` (set to your domain)

4. **Start the services**:

   ```bash
   docker-compose up -d
   ```

5. **Wait for services to be ready** (takes 1-2 minutes):

   ```bash
   docker-compose logs -f keycloak
   ```

6. **Access Keycloak**:
   - **Admin Console**: http://localhost:8092/admin
   - **Login**: Use the admin credentials from your `.env` file
   - **User Realm**: http://localhost:8092/realms/simple

## Configuration

### Environment Variables

| Variable                  | Default                   | Description                          |
| ------------------------- | ------------------------- | ------------------------------------ |
| `POSTGRES_DB`             | `keycloak`                | PostgreSQL database name             |
| `POSTGRES_USER`           | `keycloak`                | PostgreSQL username                  |
| `POSTGRES_PASSWORD`       | `change_me_in_production` | PostgreSQL password                  |
| `KEYCLOAK_ADMIN`          | `admin`                   | Keycloak admin username              |
| `KEYCLOAK_ADMIN_PASSWORD` | `change_me_in_production` | Keycloak admin password              |
| `KC_HOSTNAME`             | `localhost`               | Keycloak hostname                    |
| `KC_HOSTNAME_PORT`        | `8082`                    | Keycloak port                        |
| `KEYCLOAK_PORT`           | `8082`                    | Host port for Keycloak               |
| `KC_LOG_LEVEL`            | `INFO`                    | Log level (DEBUG, INFO, WARN, ERROR) |
| `NGINX_HOSTNAME`          | `localhost`               | Nginx hostname                       |
| `NGINX_HTTP_PORT`         | `80`                      | Nginx HTTP port                      |
| `NGINX_HTTPS_PORT`        | `443`                     | Nginx HTTPS port                     |

### Realm Configuration

The setup includes a pre-configured realm called "simple" with:

- **Email as username**: Users register and login with email only
- **No additional attributes**: Only email and password required
- **Registration enabled**: Users can self-register
- **Password reset enabled**: Users can reset their passwords
- **Brute force protection**: Enabled for security
- **Sample client**: `my-app` client pre-configured for localhost:3000

### Client Configuration

A sample client `my-app` is pre-configured with:

- **Client ID**: `my-app`
- **Public client**: No client secret required
- **Redirect URIs**: `http://localhost:3000/*`, `https://localhost:3000/*`, `http://localhost:8090/*`
- **Web Origins**: `http://localhost:3000`, `https://localhost:3000`, `http://localhost:8090`

## Production Deployment

### Security Checklist

1. **Change default passwords** in `.env` file
2. **Set proper hostname** (`KC_HOSTNAME`) to your domain
3. **Use HTTPS** in production (configure reverse proxy)
4. **Secure database** with strong password and network isolation
5. **Regular backups** of PostgreSQL data
6. **Update images** regularly for security patches

### Sample Production Environment

```bash
# Database Configuration
POSTGRES_DB=keycloak_prod
POSTGRES_USER=keycloak_user
POSTGRES_PASSWORD=your_very_secure_password_here

# Keycloak Admin Configuration
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=your_admin_password_here

# Keycloak Hostname Configuration
KC_HOSTNAME=auth.yourdomain.com
KC_HOSTNAME_PORT=443

# Port Configuration
KEYCLOAK_PORT=8082

# Logging Configuration
KC_LOG_LEVEL=WARN
```

### Reverse Proxy Setup

For production, use a reverse proxy (nginx, Traefik, etc.) to handle HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name auth.yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Managing the Setup

### Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f keycloak
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Update images
docker-compose pull
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U keycloak keycloak > backup.sql

# Restore database
docker-compose exec -i postgres psql -U keycloak keycloak < backup.sql
```

### Health Checks

Both services include health checks:

- **PostgreSQL**: `pg_isready` command
- **Keycloak**: HTTP health endpoint at `/health/ready`

Check service health:

```bash
docker-compose ps
```

## Troubleshooting

### Common Issues

1. **Services not starting**: Check logs with `docker-compose logs`
2. **Database connection errors**: Ensure PostgreSQL is healthy first
3. **Cannot access admin console**: Verify `KC_HOSTNAME` and port configuration
4. **Login issues**: Check realm configuration and user creation

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f keycloak
docker-compose logs -f postgres

# Enable debug logging
# Set KC_LOG_LEVEL=DEBUG in .env and restart
```

## Integration Example

### Basic OIDC Integration

```javascript
// Example configuration for your application
const oidcConfig = {
  issuer: "http://localhost:8082/realms/simple",
  clientId: "my-app",
  redirectUri: "http://localhost:3000/callback",
  scope: "openid email profile",
};
```

### User Registration Flow

1. User visits your application
2. Redirected to Keycloak login page
3. User clicks "Register"
4. Enters email and password only
5. Account created and user logged in
6. Redirected back to your application

## Documentation

### Official Keycloak Documentation

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [Keycloak Securing Apps and Services Guide](https://www.keycloak.org/docs/latest/securing_apps/)
- [Keycloak REST API](https://www.keycloak.org/docs-api/latest/rest-api/)
- [Keycloak Docker Images](https://quay.io/repository/keycloak/keycloak)

### Keycloak Version

This setup uses Keycloak version 26.2.5. For specific version documentation:

- [Keycloak 26.2.5 Documentation](https://www.keycloak.org/docs/26.2.5/)

## Support

For Keycloak-specific issues, refer to the [official Keycloak documentation](https://www.keycloak.org/documentation).

For this setup specifically, check:

1. Docker and Docker Compose logs
2. Environment variable configuration
3. Network connectivity between services
4. PostgreSQL data persistence

### Accessing Keycloak

With Nginx configured, you can access Keycloak through:

- **Development**:

  - HTTP: http://localhost:8092/admin
  - HTTP: http://localhost:8092/realms/simple

- **Production**:
  - HTTPS: https://your-domain/admin
  - HTTPS: https://your-domain/realms/simple

Note: For production, ensure your domain is properly configured in the environment variables and SSL is handled at your infrastructure level.
