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

# Create database if not exists
echo "Ensuring database [$DB_NAME] exists..."
/opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${DB_NAME}') CREATE DATABASE [${DB_NAME}];" \
  -b -C

# Always run SQL.sql to ensure schema is up to date
# SQL.sql contains DROP TABLE statements, making it safe to run multiple times
echo "Executing SQL.sql to create/update database schema..."
/opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -d "${DB_NAME}" \
  -i /docker-entrypoint-initdb.d/SQL.sql \
  -b -C

# Check if data already exists before inserting
echo "Checking if initial data needs to be inserted..."
if /opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -d "${DB_NAME}" \
  -Q "SELECT 1 FROM users WHERE user_id = 1" \
  -h -1 -b -C 2>/dev/null | grep -q "1"; then
  echo "Initial data already exists, skipping INSERT_DATA.sql"
else
  echo "Executing INSERT_DATA.sql to insert sample data..."
  /opt/mssql-tools18/bin/sqlcmd \
    -S localhost,1433 \
    -U "${DB_USER}" \
    -P "${DB_PASS}" \
    -d "${DB_NAME}" \
    -i /docker-entrypoint-initdb.d/INSERT_DATA.sql \
    -b -C
  echo "Initial data inserted successfully!"
fi

echo "Database initialization completed successfully!"

# Keep SQL Server running in foreground
echo "SQL Server is ready and accepting connections"
wait "$SQL_PID"
