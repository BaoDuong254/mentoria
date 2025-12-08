#!/bin/bash
set -e

echo "Starting SQL Server..."
/opt/mssql/bin/sqlservr &

echo "Waiting for SQL Server to be ready..."
until /opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -Q "SELECT 1" \
  -b -C >/dev/null 2>&1; do
  echo "  ... not ready yet, retrying in 2s"
  sleep 2
done

echo "Ensuring database [$DB_NAME] exists..."
/opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'$DB_NAME') CREATE DATABASE [$DB_NAME];" \
  -b -C

echo "Executing SQL.sql to create database schema..."
/opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -d "${DB_NAME}" \
  -i /docker-entrypoint-initdb.d/SQL.sql \
  -b -C

echo "Executing INSERT_DATA.sql to insert sample data..."
/opt/mssql-tools18/bin/sqlcmd \
  -S localhost,1433 \
  -U "${DB_USER}" \
  -P "${DB_PASS}" \
  -d "${DB_NAME}" \
  -i /docker-entrypoint-initdb.d/INSERT_DATA.sql \
  -b -C

echo "Database initialization completed successfully!"

wait
