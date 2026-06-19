# 🏛️ Barangay Management System (BarangaySync)
A modern Barangay Management System built with an **Angular** frontend, a **Laravel (PHP)** backend, and a **MySQL** database. The entire ecosystem is orchestrated using **Docker Compose** for a seamless development experience.
---
## 🔍 Why the Project Didn't Run Initially
If you tried running the project right after cloning, it would fail for three main reasons:
1. **Missing Dependencies**: Neither the PHP dependencies (`api/vendor/`) nor the Node dependencies (`ui/node_modules/`) are committed to version control. They must be installed before the services can boot.
2. **Missing Environment Configuration**: Laravel requires an `api/.env` file with an application key (`APP_KEY`) to run. This file is missing by default.
3. **Database SSL Error**: The default Laravel database configuration was trying to force an SSL connection to MySQL because it detected certificates inside the Debian-based container, leading to a connection handshake failure (`Cannot connect to MySQL using SSL`).
*Note: These issues have now been fully resolved and configured for you.*
---
## 🚀 Quick Start Guide
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
## 🔑 Default Login Credentials
After database seeding, you can log in using these pre-configured accounts:
| Role | Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `password123` |
| **System Admin** | `admin` | `1qaz2wsx#edc` |
| **Test User** | `testuser` | `password` |
---
## 📱 Accessing from Other Devices (LAN/Wi-Fi)
To access this application from your phone, tablet, or another laptop on the same local network, follow the instructions below. 
> [!IMPORTANT]
> Both the host machine running the project and the other device **must be connected to the same Wi-Fi network / router**.
Since you are running this project inside **WSL 2 (Windows Subsystem for Linux)**, Windows isolates WSL behind a virtual NAT network by default. Follow one of the two methods below to bridge the connection:
### 🌟 Method A: Enable WSL 2 Mirrored Mode (Recommended)
This is the cleanest and easiest method. Mirrored mode shares your Windows network interface directly with WSL, allowing other devices on your Wi-Fi to reach the containers instantly.
1. On your **Windows host**, open your User Profile folder (press `Win + R`, type `%USERPROFILE%`, and hit Enter).
2. Create or edit a file named `.wslconfig` and add the following lines:
   ```ini
   [wsl2]
   networkingMode=mirrored
   ```
3. Restart WSL. Open a Windows Command Prompt/PowerShell and run:
   ```cmd
   wsl --shutdown
   ```
4. Restart your project containers in WSL:
   ```bash
   cd infra
   docker compose up -d
   ```
5. Get your Windows machine's local IP address (e.g., `192.168.1.15`):
   - In Windows PowerShell, run: `ipconfig` (look for your Wi-Fi or Ethernet adapter IP).
6. Open your browser on any other device and go to:
   - **Frontend UI**: `http://<your-windows-ip>:4200`
---
### 🛠️ Method B: Port Forwarding (Alternative)
If you cannot or do not want to use Mirrored Mode, you can manually route external Windows traffic into WSL.
1. Find your **WSL 2 IP address** inside the WSL terminal:
   ```bash
   hostname -I
   ```
   *(Let's assume it outputted `172.25.84.11`)*
2. Open **PowerShell as Administrator** in Windows and run the following commands to map incoming Windows ports to WSL:
   ```powershell
   # Forward Frontend port (4200)
   netsh interface portproxy add v4tov4 listenport=4200 listenaddress=0.0.0.0 connectport=4200 connectaddress=<your-wsl-ip>
   # Forward Backend port (8000)
   netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=<your-wsl-ip>
   ```
   *(Replace `<your-wsl-ip>` with the IP you got in Step 1, e.g., `172.25.84.11`)*
3. Get your Windows machine's local IP address using `ipconfig` in PowerShell.
4. On your other device, go to `http://<your-windows-ip>:4200`.
---
## 🛡️ Windows Firewall Configuration
If other devices still cannot connect, the Windows Firewall might be blocking incoming connections to ports `4200` and `8000`.
To open these ports:
1. Open PowerShell as Administrator on Windows.
2. Run these commands to create inbound rules:
   ```powershell
   New-NetFirewallRule -DisplayName "Allow Barangay UI (4200)" -Direction Inbound -LocalPort 4200 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Barangay API (8000)" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   ```
---
## 🛠️ Useful Management Commands
All commands should be run inside the `infra` directory:
| Command | Action |
| :--- | :--- |
| `docker compose up -d` | Starts all services in the background. |
| `docker compose down` | Stops and removes all project containers. |
| `docker compose logs -f` | Follows logs from all services in real-time. |
| `docker compose exec api php artisan migrate:fresh --seed` | Wipes the DB, runs migrations, and inserts seed data. |
| `docker compose exec api php artisan tinker` | Enters Laravel Interactive Shell. |
