#!/bin/sh
set -e

# Run migrations
echo "========================================================"
echo "Starting Application Entrypoint..."
echo "========================================================"

# Check database connectivity and run migrations
echo "Running database migrations..."
if php artisan migrate --force; then
    echo "Database migrations executed successfully."
else
    echo "========================================================"
    echo "WARNING: Database migrations failed!"
    echo "This usually means the database is not ready or the"
    echo "DB_* environment variables are incorrect/missing."
    echo "Continuing to start Apache so the container doesn't crash,"
    echo "allowing you to inspect runtime logs and configuration."
    echo "========================================================"
fi

# Start the main container process (Apache)
echo "Starting Apache web server..."
exec "$@"
