# Barangay Management System (BarangaySync)
A modern Barangay Management System built with an **Angular** frontend, a **Laravel (PHP)** backend, and a **MySQL** database. The entire ecosystem is orchestrated using **Docker Compose** for a seamless development experience.
---
## Why the Project Didn't Run Initially
If you tried running the project right after cloning, it would fail for three main reasons:
1. **Missing Dependencies**: Neither the PHP dependencies (`api/vendor/`) nor the Node dependencies (`ui/node_modules/`) are committed to version control. They must be installed before the services can boot.
2. **Missing Environment Configuration**: Laravel requires an `api/.env` file with an application key (`APP_KEY`) to run. This file is missing by default.
3. **Database SSL Error**: The default Laravel database configuration was trying to force an SSL connection to MySQL because it detected certificates inside the Debian-based container, leading to a connection handshake failure (`Cannot connect to MySQL using SSL`).
*Note: These issues have now been fully resolved and configured for you.*
---
## Quick Start Guide
To run the project on your local machine, follow these steps:
### 1. Start the Docker Services
Navigate to the infrastructure directory and start the containers in the background:
```bash
cd infra
docker compose up -d
```
### 2. Verify Services are Running
Check the status of the containers:
```bash
docker compose ps
```
You should see all three services (`angular-ui`, `brgy-api`, and `mysql-db`) showing the status `Up`.
---

## Useful Management Commands
All commands should be run inside the `infra` directory:
| Command | Action |
| :--- | :--- |
| `docker compose up -d` | Starts all services in the background. |
| `docker compose down` | Stops and removes all project containers. |
| `docker compose logs -f` | Follows logs from all services in real-time. |
| `docker compose exec api php artisan migrate:fresh --seed` | Wipes the DB, runs migrations, and inserts seed data. |
| `docker compose exec api php artisan tinker` | Enters Laravel Interactive Shell. |
