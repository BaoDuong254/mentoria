#!/bin/bash
# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
sleep 30s

# Run SQL scripts in order
echo "Executing SQL.sql to create database schema..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U $DB_USER -P $DB_PASS -d $DB_NAME -i /docker-entrypoint-initdb.d/SQL.sql -C -No

echo "Executing INSERT_DATA.sql to insert sample data..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U $DB_USER -P $DB_PASS -d $DB_NAME -i /docker-entrypoint-initdb.d/INSERT_DATA.sql -C -No

echo "Database initialization completed successfully!"
