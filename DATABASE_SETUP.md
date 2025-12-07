# Database Setup for CI/CD

## Required GitHub Secrets

Make sure to add the following secret to your GitHub repository for the CI/CD workflow:

### Database Secrets

- `DB_PASS` - SQL Server SA password (should match the value in your server/.env file: `123456`)

### Existing Secrets (already configured)

- `HOST_VPS` - LXC host address
- `USERNAME_VPS` - LXC username
- `KEY_VPS` - SSH private key for LXC
- `PORT_VPS` - SSH port for LXC
- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_PASSWORD` - Docker Hub password
- `SERVER_ENV` - Server environment variables
- `CLIENT_ENV` - Client environment variables
- `TELEGRAM_TO` - Telegram chat ID for notifications
- `TELEGRAM_TOKEN` - Telegram bot token for notifications

## Database Initialization Flow

When you deploy to LXC, the following happens automatically:

1. **SQL Server Container Starts**

   - Waits for SQL Server to be ready (60 seconds startup period)
   - Creates the `mentoria` database
   - Executes `SQL.sql` to create the schema
   - Executes `INSERT_DATA.sql` to insert sample data

2. **Server Container Starts**
   - Waits for SQL Server to be healthy
   - Runs `wait-for-db.sh` to verify database connectivity
   - Executes `npm run seed:slot` to seed slot data
   - Starts the Express server

## Server Environment Variables

Your server `.env` file should contain:

```env
DB_USER=sa
DB_PASS=123456
DB_SERVER=db  # Changed from localhost to db for Docker networking
DB_NAME=mentoria
```

**Important:** When running in Docker Compose, `DB_SERVER` should be set to `db` (the service name), not `localhost`.

## Manual Database Reset

If you need to reset the database on your LXC:

```bash
cd ~/mentoria
docker compose down -v  # Remove containers and volumes
docker compose up -d    # Recreate everything
```

This will reinitialize the database from scratch.
