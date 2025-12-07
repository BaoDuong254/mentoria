#!/bin/sh
# wait-for-db.sh - Wait for SQL Server to be ready

echo "Waiting for SQL Server to be ready..."

until /opt/mssql-tools18/bin/sqlcmd -S ${DB_SERVER} -U ${DB_USER} -P ${DB_PASS} -Q "SELECT 1" -C > /dev/null 2>&1; do
  echo "SQL Server is unavailable - sleeping"
  sleep 2
done

echo "SQL Server is ready!"

# Initialize database schema
echo "Initializing database schema..."
if [ -f "database/SQL.sql" ]; then
  /opt/mssql-tools18/bin/sqlcmd -S ${DB_SERVER} -U ${DB_USER} -P ${DB_PASS} -d ${DB_NAME} -i database/SQL.sql -C
  echo "Schema created successfully!"
else
  echo "Warning: SQL.sql not found, skipping schema initialization"
fi

# Insert initial data if available
if [ -f "database/INSERT_DATA.sql" ]; then
  echo "Inserting initial data..."
  /opt/mssql-tools18/bin/sqlcmd -S ${DB_SERVER} -U ${DB_USER} -P ${DB_PASS} -d ${DB_NAME} -i database/INSERT_DATA.sql -C
  echo "Initial data inserted successfully!"
fi

# Run seed:slot command
echo "Running seed:slot command..."
node dist/scripts/seed-slot.js

echo "Database initialization completed successfully!"
