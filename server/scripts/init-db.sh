#!/bin/bash
set -e

# Start SQL Server in background
echo "Starting SQL Server..."
/opt/mssql/bin/sqlservr &
SQL_PID=$!

# Function to cleanup on exit
cleanup() {
  echo "Shutting down SQL Server..."
  kill -TERM "$SQL_PID" 2>/dev/null || true
  wait "$SQL_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
max_attempts=60
attempt=0
until /opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -Q "SELECT 1" \
  -b -C >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "Error: SQL Server did not start within expected time"
    exit 1
  fi
  echo "  ... not ready yet, retrying in 2s (attempt $attempt/$max_attempts)"
  sleep 2
done

echo "SQL Server is ready!"

# Check if database already exists and is initialized
if /opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -d "${DB_NAME}" \
  -Q "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users'" \
  -b -C >/dev/null 2>&1; then
  echo "Database [$DB_NAME] already initialized, skipping setup"
else
  echo "Initializing database [$DB_NAME]..."

  # Create database if not exists
  echo "Ensuring database [$DB_NAME] exists..."
  /opt/mssql-tools18/bin/sqlcmd \
    -S localhost,1433 \
    -U "${DB_USER}" \
    -P "${DB_PASS}" \
    -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${DB_NAME}') CREATE DATABASE [${DB_NAME}];" \
    -b -C

  # Execute schema
  echo "Executing SQL.sql to create database schema..."
  /opt/mssql-tools18/bin/sqlcmd \
    -S localhost,1433 \
    -U "${DB_USER}" \
    -P "${DB_PASS}" \
    -d "${DB_NAME}" \
    -i /docker-entrypoint-initdb.d/SQL.sql \
    -b -C

  # Insert initial data
  echo "Executing INSERT_DATA.sql to insert sample data..."
  /opt/mssql-tools18/bin/sqlcmd \
    -S localhost,1433 \
    -U "${DB_USER}" \
    -P "${DB_PASS}" \
    -d "${DB_NAME}" \
    -i /docker-entrypoint-initdb.d/INSERT_DATA.sql \
    -b -C

  echo "Database initialization completed successfully!"
fi

# Keep SQL Server running in foreground
echo "SQL Server is ready and accepting connections"
wait "$SQL_PID"
