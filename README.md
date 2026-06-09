# Astronomy Image Management System

![Architecture](https://img.shields.io/badge/Architecture-5_Container_Microservices-1B3A6B)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-009688?style=flat&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?style=flat&logo=google&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

A **production-ready, containerized pipeline** for automated ingestion, processing, and management of FITS (Flexible Image Transport System) astronomical image files — featuring comprehensive metadata extraction, role-based authentication, and advanced web-based querying capabilities.

---

## Overview

This system solves a real operational problem for astronomical observatories: FITS image files arrive continuously from telescopes, each containing 40+ metadata fields, and managing them manually at scale is infeasible. This pipeline automates the full workflow from file detection to searchable database storage to authenticated web access.

### Engineering Highlights

- **5-container Docker microservices architecture** — independently deployable, health-checked services
- **Real-time file monitoring** — hybrid watchdog + periodic scanning with automatic fallback
- **40+ metadata fields** extracted per image using Astropy header parsing
- **Role-based access control** — Google OAuth 2.0 + JWT with admin/user privilege separation
- **Production-grade reliability** — connection pooling, duplicate prevention, comprehensive logging

### Why This Architecture Matters Beyond Astronomy

The engineering problems solved here — real-time file ingestion at scale, metadata extraction pipelines, containerized microservices, role-based access control — are domain-agnostic. The same architecture applies to:

| Domain | Equivalent Problem |
|---|---|
| **Healthcare AI** | Medical imaging pipelines (DICOM files, radiology data ingestion) |
| **FinTech** | Real-time transaction data ingestion and processing pipelines |
| **Manufacturing / IoT** | Sensor data streams with automated quality assessment |
| **Enterprise AI** | Document ingestion pipelines for LLM knowledge bases |

---

## Features

- **Automatic FITS File Ingestion** — real-time detection and processing with parallel threading
- **Comprehensive Metadata Extraction** — 40+ astronomical parameters from FITS headers
- **Advanced Duplicate Prevention** — multi-level checks prevent duplicate database entries
- **Sophisticated Web Query Interface** — filtering by date, temperature, quality, camera, and time range
- **Google OAuth 2.0 + JWT Authentication** — secure user authentication with role-based access control
- **Admin/User Role System** — admin-only download privileges and user management
- **Multi-Method File Detection** — watchdog events + periodic scanning with automatic fallbacks
- **Quality Assessment System** — automatic quality scoring and flagging for astronomical images
- **Admin-Only Download System** — secure FITS file downloads with ZIP compression
- **Real-Time File Monitoring** — file stability checking and intelligent processing
- **OS-Agnostic Design** — works on Windows, Linux, macOS, and cloud platforms
- **Production-Ready** — health checks, connection pooling, and comprehensive logging

---

## System Architecture

### 5-Container Microservices

| Service | Purpose | Technology | Internal Port | External Port |
|---|---|---|---|---|
| **frontend** | Web interface & Nginx proxy | HTML/CSS/JS + Nginx | 80 | 80 |
| **web** | REST API & business logic | FastAPI + Python 3.12 | 8000 | — |
| **db** | Astronomical data storage | MySQL 8.0 | 3306 | 3307 |
| **file-watcher** | Real-time FITS monitoring | Python + Watchdog | — | — |
| **ingestion** | Bulk FITS processing | Astropy + Python | — | — |

### Container Dependency Graph

```
Database
    ↓
Web API
    ↓         ↓          ↓
Frontend   File Watcher  Ingestion
    ↓
User Access
```

All containers include comprehensive health checks and automatic restart policies.

### Advanced Database & Processing Architecture

**Database Design:**
- Custom-designed schema for astronomical data with 40+ indexed fields
- Connection pooling with 20+ worker connections for high throughput
- Query optimization, connection recycling, and intelligent caching
- Multi-level duplicate prevention and transaction management

**Processing Pipeline:**
- Thread-pool based parallel ingestion (20 workers, configurable)
- Hybrid file monitoring: filesystem events + periodic scanning fallback
- Automated quality scoring algorithms for astronomical image assessment
- Comprehensive logging, retry mechanisms, and graceful failure recovery

---

## ⚡ Quick Start

### Prerequisites

- **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **4GB RAM** minimum, 8GB recommended
- **Ports 80 and 3307** available
- **Google Cloud Console** account for OAuth setup

### 1. Clone and Setup

```bash
git clone https://github.com/Vysubs28/Astronomy-Image-Management-System
cd Astronomy-Image-Management-System
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# MySQL Database Configuration
DB_ROOT_PASSWORD=your_secure_root_password
DB_NAME=astrodb
DB_USER=astro
DB_PASSWORD=your_secure_password
HOST_DB_PORT=3307
DB_INTERNAL_PORT=3306

# Application Security
JWT_SECRET=your_32_character_secret_key_here_minimum_length_required
GOOGLE_CLIENT_ID=your_google_oauth_client_id_from_console

# Environment Configuration
ENVIRONMENT=development
SERVICE=ingestion

# FITS File Storage Path
LOCAL_IMAGE_PATH=/path/to/your/fits/files

# Production SSL Settings
DB_SSL_ENABLED=false
DB_SSL_CA=/path/to/your/ca-cert.pem
```

> **Critical**: Update `LOCAL_IMAGE_PATH` to point to your FITS files directory  
> **Security**: Generate a strong 32+ character `JWT_SECRET` for production

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google+ API**
4. Configure **OAuth consent screen**
5. Create **OAuth 2.0 Client ID** credentials
6. Add authorized origins: `http://localhost` (dev) / `https://yourdomain.com` (prod)
7. Copy **Client ID** to `GOOGLE_CLIENT_ID` in `.env`

### 4. Start the System

```bash
docker compose up --build
# Or in background:
docker compose up --build -d
```

### 5. Access the Application

- **Web Interface**: http://localhost
- **API Documentation**: http://localhost/api/docs
- **Health Check**: http://localhost/api/health
- **Database**: `mysql -h 127.0.0.1 -P 3307 -u astro -p`

---

## Project Structure

```
astronomy-image-system/
├── astro_images/app/
│   ├── main.py                   # FastAPI app & API endpoints
│   ├── models.py                 # SQLAlchemy database models
│   ├── schemas.py                # Pydantic validation schemas
│   ├── database.py               # DB connection & pooling config
│   ├── ingestion.py              # FITS processing & metadata extraction
│   ├── file_watcher.py           # Real-time file monitoring service
│   ├── auth.py                   # JWT token management
│   ├── google_auth.py            # Google OAuth 2.0 integration
│   ├── deps.py                   # Authentication dependencies
│   └── config.py                 # Application configuration
├── frontend/
│   ├── index.html                # Main SPA interface
│   ├── app.js                    # Frontend application logic
│   ├── styles.css                # Responsive UI styling
│   └── Dockerfile
├── nginx/
│   └── nginx.conf                # API proxy configuration
├── docker-compose.yml            # 5-container orchestration
├── Dockerfile                    # Backend container config
├── requirements.txt              # Python dependencies (40+ packages)
└── README.md
```

---

## Key Features

### FITS File Processing

**Supported Formats**: `.fits`, `.fts`

**Metadata Extraction (40+ fields):**
- Observation data: RA, DEC, DATE-OBS, EXPTIME, OBJECT
- Camera settings: GAIN, TEMP, FILTER, AIRMASS, BITPIX
- Telescope data: TELALT, TELAZ, OBSNAME, INSTRUME
- Quality metrics: automatic quality scoring and flagging
- Full header preservation as searchable JSON

**Processing Pipeline:**
1. File Detection → multi-method watchdog + periodic scanning
2. Stability Check → sophisticated file write completion verification
3. Duplicate Prevention → multi-layer database and API-level checks
4. Metadata Extraction → Astropy-based header parsing with coordinate conversion
5. Quality Assessment → automated scoring algorithms
6. Database Storage → parallel threaded processing with connection pooling

### Authentication & Authorization

**Google OAuth 2.0 Flow:**
1. User clicks "Sign in with Google"
2. Google Identity Services handles authentication
3. Backend verifies token and creates/updates user record
4. JWT token issued for subsequent API calls
5. Role-based access control enforced on all protected endpoints

**User Roles:**
- **Regular Users**: query and filter images
- **Administrators**: full access + download privileges + user management
- **First User**: automatically becomes admin

---

## 📡 API Reference

### Authentication

```bash
# Google OAuth Login
POST /api/auth/google
{ "token": "google_id_token" }

# Get Current User
GET /api/user/me
Authorization: Bearer <jwt_token>
```

### Image Queries

```bash
# List Images with Filters
GET /api/images
?date=YYYY-MM-DD
&min_temp=-10&max_temp=20
&min_quality=80
&camera=CameraName
&telescope=ObservatoryName
&start_time=HH:MM&end_time=HH:MM
&limit=1000&offset=0

# Get Specific Image
GET /api/images/{image_id}

# Download FITS (Admin Only)
GET /api/images/{image_id}/download
Authorization: Bearer <admin_jwt_token>
```

### Admin Endpoints

```bash
# List All Users (Admin Only)
GET /api/admin/users

# Update User Permissions (Admin Only)
PUT /api/admin/users/{user_id}
{ "is_admin": true, "is_active": true }
```

---

## Essential Commands

```bash
# System Management
docker compose up --build         # Start all services
docker compose down               # Stop all services
docker compose ps                 # Service status

# Monitoring
docker compose logs -f            # All logs
curl http://localhost/api/health  # Health check
docker stats                      # Resource usage

# Manual Ingestion
docker exec database1-ingestion-1 python -m astro_images.app.ingestion

# Recent Errors
docker compose logs --since=1h | grep -i error
```

---

## Troubleshooting

### File Detection Not Working

```bash
# Check file watcher
docker logs database1-file-watcher-1 -f

# Test manual ingestion
docker exec database1-web-1 python -c "
from astro_images.app.ingestion import upload_all; upload_all()"

# Check DB health
docker exec database1-web-1 python -c "
from astro_images.app.database import check_database_health
print('DB Health:', check_database_health())"
```

**Common fixes:** Verify `LOCAL_IMAGE_PATH` in `.env` · Check file extensions are `.fits` or `.fts` · Restart with `docker restart database1-file-watcher-1`

### Authentication Issues

1. Verify `GOOGLE_CLIENT_ID` in `.env`
2. Check Google Cloud Console OAuth authorized origins
3. Clear browser cache and cookies

### Database Connection Problems

```bash
docker logs database1-db-1 -f
mysql -h 127.0.0.1 -P 3307 -u astro -p${DB_PASSWORD}
curl -H "Content-Type: application/json" http://localhost/api/health
```

---

## Core Dependencies

```
fastapi==0.115.12      # Web framework
uvicorn==0.34.2        # ASGI server
sqlalchemy==2.0.40     # Database ORM
pymysql==1.1.1         # MySQL connector
astropy==7.0.1         # Astronomical data processing
watchdog==6.0.0        # File system monitoring
google-auth==2.35.0    # Google OAuth integration
pyjwt==2.10.1          # JWT token handling
pydantic==2.11.3       # Data validation
```

---

## Future Work

- Cloud deployment (AWS ECS / GCP Cloud Run) for multi-observatory access
- Extended support for additional astronomical file formats (HDF5, ASDF)
- Machine learning integration for automated image quality classification
- Real-time dashboard with WebSocket-based live ingestion monitoring
- REST API extension for telescope control system integration

---

## 📄 License

MIT License

---

## My Contribution

I was responsible for the **frontend UI and user authentication system** on this project — building the full single-page web application (HTML/CSS/JavaScript), implementing the Google OAuth 2.0 integration end-to-end, designing the role-based access control interface, and creating the admin user management dashboard.

**Team:** Dheer G. (Backend Architecture, Database Design, Docker), James N. (Docker Infrastructure, Database Models), Andree V. (API Development), Vyaas S. (Frontend UI & Authentication), Zach S. (Data Extraction & Documentation) — Spring 2025, Knox College Software Engineering

**Author's Profile:** [github.com/Vysubs28](https://github.com/Vysubs28) · [LinkedIn](https://linkedin.com/in/vyaas-subramanian-427468237) · [Portfolio](https://vyaasportfolio.netlify.app)
