#!/bin/sh
set -e

# Check database connectivity, run migrations, and run seeders
echo "Running database migrations..."
if php artisan migrate --force; then
    echo "Database migrations executed successfully."
    echo "Running database seeding..."
    if php artisan db:seed --force; then
        echo "Database seeding executed successfully."
    else
        echo "WARNING: Database seeding failed!"
    fi
else
    echo "========================================================"
    echo "WARNING: Database migrations failed!"
    echo "This usually means the database is not ready or the"
    echo "DB_* environment variables are incorrect/missing."
    echo "Continuing to start Apache so the container doesn't crash,"
    echo "allowing you to inspect runtime logs and configuration."
    echo "========================================================"
fi

# Clear caches and optimize
echo "Clearing caches and optimizing..."
php artisan optimize:clear || true
php artisan lighthouse:clear-cache || true

# Start the main container process (Apache)
echo "Starting Apache web server..."
exec "$@"
