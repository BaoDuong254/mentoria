#!/bin/sh
# wait-for-db.sh - Wait for SQL Server to be ready

echo "Waiting for SQL Server to be ready..."

until /opt/mssql-tools18/bin/sqlcmd -S ${DB_SERVER} -U ${DB_USER} -P ${DB_PASS} -Q "SELECT 1" -C > /dev/null 2>&1; do
  echo "SQL Server is unavailable - sleeping"
  sleep 2
done

echo "SQL Server is ready!"

# Wait for database schema to be initialized by db container
echo "Waiting for database schema to be ready..."
max_attempts=30
attempt=0

until /opt/mssql-tools18/bin/sqlcmd -S ${DB_SERVER} -U ${DB_USER} -P ${DB_PASS} -d ${DB_NAME} -Q "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users'" -C > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "Error: Database schema was not initialized after $max_attempts attempts"
    exit 1
  fi
  echo "Database schema is not ready yet (attempt $attempt/$max_attempts) - sleeping"
  sleep 2
done

echo "Database schema is ready!"

# Run seed:slot command
echo "Running seed:slot command..."
node dist/scripts/seed-slot.js

echo "Server initialization completed successfully!"
