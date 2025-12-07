#!/bin/sh
# wait-for-db.sh - Wait for SQL Server to be ready

echo "Waiting for SQL Server to be ready..."

until /opt/mssql-tools18/bin/sqlcmd -S ${DB_SERVER} -U ${DB_USER} -P ${DB_PASS} -Q "SELECT 1" -C > /dev/null 2>&1; do
  echo "SQL Server is unavailable - sleeping"
  sleep 2
done

echo "SQL Server is ready!"

# Run seed:slot command
echo "Running seed:slot command..."
npm run seed:slot

echo "Seed completed successfully!"
