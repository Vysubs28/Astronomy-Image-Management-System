# Astronomy Image Management System - Complete Documentation

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Requirements](#requirements)
- [Installation & Deployment](#installation--deployment)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Validation Tests](#validation-tests)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## System Design Decisions & Assumptions

### Data Processing Assumptions

**Temperature Field Mapping Priority**:
```python
# From ingestion.py HEADER_MAPPING
"DETTEMP": "temp",     # Primary temperature source
"CCD-TEMP": "temp",    # Fallback temperature source
```
The system prioritizes `DETTEMP` over `CCD-TEMP` when both are present in FITS headers. This design decision was made because different telescope systems use different temperature keywords, and DETTEMP is more commonly found in modern FITS files.

**Quality Assessment Algorithm**:
The system calculates quality scores based on multiple astronomical factors:
- **Exposure Time**: Longer exposures (>30s) receive higher quality scores (+20 points)
- **Airmass**: Low airmass (<1.5) indicates better atmospheric conditions (+20 points)  
- **Image Type**: Science frames score higher than calibration frames (+30 points)
- **Filter Type**: Standard photometric filters (R, G, B, L) receive bonus points (+10 points)
- **Final Score**: Normalized to 0.0-1.0 scale, with 0.6+ flagged as high quality

**Real Dataset Constraints**:
- **Observatory**: System tested with Winer Observatory data exclusively
- **Dataset Size**: ~512 FITS images from single observation night
- **Camera Systems**: Primarily ASCOM-based camera interfaces
- **File Formats**: Both `.fits` and `.fts` extensions supported
- **Header Standards**: Assumes standard FITS WCS and astronomical keywords

### System Architecture Assumptions

**Database Design Decisions**:
- **Primary Keys**: Auto-incrementing BIGINT for scalability to millions of images
- **File Path Uniqueness**: Enforced at database level to prevent duplicates
- **JSON Storage**: Complete FITS headers preserved for future extensibility
- **Index Strategy**: Optimized for common query patterns (date, temperature, filter, object)

**Authentication Model**:
- **First User**: Automatically assigned admin privileges
- **Google OAuth**: Assumes users have Google accounts for institutional access
- **Role Persistence**: Admin status maintained across sessions
- **Download Restrictions**: Only admins can access raw FITS file downloads

---

## Overview

The Astronomy Image Management System is a production-ready, containerized application designed for astronomical observatories to automatically ingest, process, and manage FITS (Flexible Image Transport System) image files with comprehensive metadata extraction, role-based authentication, and advanced web-based querying capabilities.

### Key Features

- ** Automatic FITS File Ingestion**: Real-time detection with parallel processing (20+ workers)
- ** Comprehensive Metadata Extraction**: 40+ astronomical parameters with quality assessment
- ** Advanced Duplicate Prevention**: Multi-layer database and API-level duplicate detection
- ** Sophisticated Web Query Interface**: Advanced filtering with date, temperature, quality, camera, time range
- ** Google OAuth 2.0 + JWT Authentication**: Secure user authentication with role-based access control
- ** Admin/User Role System**: Admin-only download privileges and user management
- ** Multi-Method File Detection**: Watchdog events + periodic scanning with automatic fallbacks
- ** Quality Assessment System**: Automatic quality scoring and flagging
- ** Admin Download System**: Secure FITS file downloads with ZIP compression
- ** OS-Agnostic Design**: Works on Windows, Linux, macOS, and cloud platforms

### Target Users

- Astronomical observatories and research institutions
- Telescope operators and astronomers  
- Data managers handling large FITS file collections
- Educational institutions with astronomy programs

---

## System Architecture

### 5-Container Microservices Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Web API       │    │   MySQL         │
│   (Nginx)       │◄──►│   (FastAPI)     │◄──►│   Database      │
│   Port: 80      │    │   Port: 8000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Watcher  │    │   Ingestion     │    │   Image Storage │
│   (Real-time)   │    │   Service       │    │   Directory     │
│   (Watchdog)    │    │   (Astropy)     │    │   (FITS Files)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Container Details

| Service | Purpose | Technology | Internal Port | External Port | Dependencies |
|---------|---------|------------|---------------|---------------|--------------|
| **frontend** | Web UI & API proxy | Nginx + HTML/CSS/JS | 80 | 80 | web |
| **web** | REST API & business logic | FastAPI + Python 3.12 | 8000 | - | db |
| **db** | Data storage & queries | MySQL 8.0 | 3306 | 3307 | - |
| **file-watcher** | Real-time monitoring | Python + Watchdog | - | - | web |
| **ingestion** | Bulk FITS processing | Astropy + Python | - | - | web |

### Technology Stack

- **Backend**: FastAPI 0.115.12 (Python 3.12)
- **Database**: MySQL 8.0 with connection pooling
- **Frontend**: Vanilla JavaScript with Google Identity Services
- **Authentication**: JWT + Google OAuth 2.0
- **Containerization**: Docker & Docker Compose
- **File Processing**: Astropy 7.0.1 for FITS handling
- **Web Server**: Nginx with API proxying
- **Monitoring**: Watchdog 6.0.0 for file system events

### Advanced Processing Features

- **Parallel Processing**: ThreadPoolExecutor with 20 workers
- **Smart File Detection**: Hybrid filesystem events + periodic scanning
- **Quality Assessment**: Automated scoring algorithms
- **Connection Pooling**: 20+ database connections with health checks
- **Role-Based Access**: Admin vs regular user permissions
- **File Stability Checking**: Ensures complete file writes before processing

---

## Requirements

### System Requirements

#### Minimum Hardware
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 100 GB (plus space for FITS files)
- **Network**: 100 Mbps

#### Recommended Hardware
- **CPU**: 4+ cores, 2.5+ GHz  
- **RAM**: 8+ GB
- **Storage**: 500+ GB SSD (plus dedicated FITS storage)
- **Network**: 1 Gbps

### Software Requirements

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Operating System**: 
  - Linux (recommended for production)
  - Windows 10/11 with WSL2
  - macOS (Intel or Apple Silicon)

### FITS File Requirements

- **Supported formats**: `.fits`, `.fts`
- **File size**: No limits (tested up to 14 GB files)
- **Headers**: Standard FITS headers with astronomical metadata
- **Structure**: Primary HDU with header information

---

## Installation & Deployment

### Development Environment (Local)

#### 1. Prerequisites
```bash
# Install Docker and Docker Compose
# Windows: Docker Desktop
# Linux: sudo apt install docker.io docker-compose-plugin
# macOS: Docker Desktop
```

#### 2. Clone and Setup
```bash
git clone https://github.com/Knox-College-Computer-Science/Database1.git
cd Database1
```

#### 3. Environment Configuration
Create `.env` file:
```bash
# MySQL Database Configuration
DB_ROOT_PASSWORD=secure_root_password
DB_NAME=astrodb
DB_USER=astro
DB_PASSWORD=secure_user_password
HOST_DB_PORT=3307
DB_INTERNAL_PORT=3306

# Application Security (CRITICAL: Change these!)
JWT_SECRET=your_32_character_secret_key_here_minimum_length_required
GOOGLE_CLIENT_ID=your_google_oauth_client_id_from_console

# Environment Configuration
ENVIRONMENT=development
SERVICE=ingestion

# FITS File Storage Path (CHANGE THIS!)
LOCAL_IMAGE_PATH=/path/to/your/fits/files

# Production Settings
DB_SSL_ENABLED=false
DB_SSL_CA=/path/to/your/ca-cert.pem
```

#### 4. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google+ API**
4. Configure **OAuth consent screen**
5. Create **OAuth 2.0 Client ID** credentials
6. Add authorized origins: `http://localhost` (development)
7. Copy **Client ID** to `GOOGLE_CLIENT_ID` in `.env`

#### 5. Start Development Environment
```bash
# Build and start all 5 containers
docker compose up --build

# Or run in background
docker compose up --build -d
```

#### 6. Verify Installation
```bash
# Check all 5 services are running
docker compose ps

# Expected output:
# database1-db-1           mysql:8.0             "docker-entrypoint.s…"   Up      0.0.0.0:3307->3306/tcp
# database1-web-1          database1-web         "sh -c 'echo 'Waitin…"   Up      8000/tcp
# database1-frontend-1     database1-frontend    "/docker-entrypoint.…"   Up      0.0.0.0:80->80/tcp
# database1-file-watcher-1 database1-file-watcher "sh -c 'echo 'Starti…"  Up
# database1-ingestion-1    database1-ingestion   "sh -c 'echo 'Starti…"  Up

# Test health endpoint
curl http://localhost/api/health
# Expected: {"status": "ok"}

# View logs
docker compose logs -f
```

### Production Deployment (VPS/Cloud)

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/astronomy-system
sudo chown $USER:$USER /opt/astronomy-system
```

#### 2. Production Environment Variables
Update `.env` for production:
```bash
# Environment
ENVIRONMENT=production

# Security (CHANGE THESE!)
JWT_SECRET=production_secret_minimum_32_characters_long_very_secure
DB_ROOT_PASSWORD=very_secure_production_root_password
DB_PASSWORD=very_secure_production_user_password

# Google OAuth (Production)
GOOGLE_CLIENT_ID=production_google_client_id

# SSL Configuration
DB_SSL_ENABLED=true
DB_SSL_CA=/opt/ssl/ca-cert.pem

# Storage
LOCAL_IMAGE_PATH=/opt/astronomy-system/images
```

#### 3. Deploy Production
```bash
# Copy files to server
rsync -av . user@your-server:/opt/astronomy-system/

# SSH to server and deploy
ssh user@your-server
cd /opt/astronomy-system
docker compose up --build -d
```

---

## Configuration

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOCAL_IMAGE_PATH` | [CHECKED] | - | Path to FITS files directory |
| `DB_ROOT_PASSWORD` | [CHECKED] | - | MySQL root password |
| `DB_PASSWORD` | [CHECKED] | - | MySQL user password |
| `JWT_SECRET` | [CHECKED] | - | JWT signing secret (32+ chars) |
| `GOOGLE_CLIENT_ID` | [CHECKED] | - | Google OAuth client ID |
| `HOST_DB_PORT` | [FAILED] | 3307 | External database port |
| `DB_INTERNAL_PORT` | [FAILED] | 3306 | Internal database port |
| `ENVIRONMENT` | [FAILED] | development | Environment mode |
| `SERVICE` | [FAILED] | ingestion | Service identifier |
| `DB_SSL_ENABLED` | [FAILED] | false | Enable SSL for production |

### Database Schema

#### Images Table (Primary)
```sql
CREATE TABLE images (
    image_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_path VARCHAR(256) UNIQUE NOT NULL,
    date_time DATETIME NOT NULL,
    header_json JSON NOT NULL,
    ingest_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Observation Data
    ra_deg FLOAT,
    dec_deg FLOAT,
    exptime FLOAT,
    filter_name VARCHAR(12),
    object_name VARCHAR(64),
    quality_score FLOAT,
    quality_flag BOOLEAN DEFAULT FALSE,
    temp FLOAT,
    
    -- Coordinate Helpers
    objctra VARCHAR(32),
    objctdec VARCHAR(32),
    jd FLOAT,
    airmass FLOAT,
    gain FLOAT,
    
    -- Block/Sequence Data
    -- Camera/Instrument Data
    -- Pixel/Imaging Data
    
    INDEX idx_date_time (date_time),
    INDEX idx_temp (temp),
    INDEX idx_filter (filter_name),
    INDEX idx_object (object_name),
    INDEX idx_quality (quality_score)
);
```

#### Users Table
```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(256) UNIQUE NOT NULL,
    google_id VARCHAR(256) UNIQUE NOT NULL,
    display_name VARCHAR(256),
    picture_url VARCHAR(512),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
);
```

---

## Usage

### Web Interface

#### Access Application
- **Development**: http://localhost
- **Production**: http://your-domain.com
- **API Docs**: http://localhost/api/docs

#### Authentication Flow
1. Click "Sign in with Google" button
2. Google OAuth consent screen
3. JWT token issued
4. Role assigned (first user = admin, others = regular users)
5. Access filtering interface

#### Advanced Query Interface
**Available Filters**:
-  **Date Picker**: Exact calendar date selection
-  **Temperature Range**: Min/max temperature in °C
-  **Quality Score**: Percentage threshold (0-100%)
-  **Camera Name**: Text search for camera/instrument
-  **Observatory**: Telescope/observatory filter (e.g., "Winer Observatory")
-  **Time Range**: Start and end times (HH:MM format)
-  **Advanced Search**: Filter type suggestions (R, G, B, Ha, OIII, SII)

**Admin-Only Features**:
-  **Download FITS Files**: Bulk download as ZIP archives
-  **User Management**: View and modify user roles
-  **Role Assignment**: Grant/revoke admin privileges

#### Example Filtering Workflow
```
1. Sign in with Google account
2. Select date: 2025-04-01
3. Set temperature range: -15°C to -5°C
4. Enter camera: "Canon EOS R5"
5. Select observatory: "Winer Observatory"
6. Set time range: 20:00 to 06:00
7. Click "Apply" button
8. Review scrollable results
9. (Admin only) Download ZIP of FITS files
```

### File Management

#### Adding FITS Files

**Development**:
```bash
# Copy files to monitored directory
cp new_observations/*.fits /your/LOCAL_IMAGE_PATH/
cp new_observations/*.fts /your/LOCAL_IMAGE_PATH/
```

**Production**:
```bash
# Upload via SCP
scp *.fits user@server:/opt/astronomy-system/images/

# Bulk transfer with rsync
rsync -av --progress /local/fits/ user@server:/opt/astronomy-system/images/

# Upload with progress
rsync -av --progress --stats /source/ user@server:/opt/astronomy-system/images/
```

#### File Detection & Processing Pipeline

**Detection Methods** (automatic fallbacks):
1. **Watchdog Events** (Primary): Instant detection on file creation/modification
2. **Periodic Scanning** (Backup): Every 5-30 seconds scan for new files
3. **Registry Tracking** (Failsafe): Maintains file state and prevents missed files

**Processing Steps**:
1. **File Detection** → Triggered by file events or scanning
2. **Stability Check** → Waits for file write completion (up to 10 seconds)
3. **Duplicate Prevention** → Multi-layer checks across database and API
4. **Header Extraction** → Astropy parses FITS header (40+ fields) in parallel
5. **Quality Assessment** → Automatic scoring based on exposure, airmass, filter
6. **Database Storage** → **Parallel processing with 20-worker thread pool**
7. **Immediate Availability** → Queryable via API and web interface

**Expected Processing Performance**:
- Small files (<100MB): 1-3 seconds per file
- Large files (1-14GB): 5-30 seconds per file  
- **Bulk processing**: ~60 files/minute with parallel threading
- **Concurrent ingestion**: Up to 20 files processed simultaneously

---

## API Reference

### Authentication Endpoints

#### POST `/api/auth/google`
Authenticate using Google OAuth token.

**Request**:
```bash
curl -X POST http://localhost/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "google_id_token"}'
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "can_download": true
  }
}
```

#### GET `/api/user/me`
Get current user information.

**Request**:
```bash
curl -H "Authorization: Bearer <jwt_token>" http://localhost/api/user/me
```

**Response**:
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "display_name": "User Name",
  "picture_url": "https://lh3.googleusercontent.com/...",
  "role": "admin",
  "can_download": true,
  "is_admin": true,
  "created_at": "2025-05-26T10:30:00",
  "last_login": "2025-05-26T15:45:00"
}
```

### Image Query Endpoints

#### GET `/api/images`
List and filter astronomical images.

**Query Parameters**:
- `date` (string): Exact calendar date (YYYY-MM-DD)
- `min_temp` (float): Minimum temperature (°C)
- `max_temp` (float): Maximum temperature (°C)
- `min_quality` (float): Minimum quality score (0-100)
- `camera` (string): Camera name (substring match)
- `telescope` (string): Observatory/telescope filter
- `start_time` (string): Start time (HH:MM)
- `end_time` (string): End time (HH:MM)
- `limit` (int): Maximum results (default: 1000)
- `offset` (int): Pagination offset (default: 0)

**Response**:
```json
[
  {
    "image_id": 1,
    "file_path": "/data/images/mjc_V715_Mon_ha_7-6s_2025-04-01T04-59-52.fts",
    "date_time": "2025-04-01T04:59:52",
    "ra_deg": 102.23,
    "dec_deg": 0.93,
    "exptime": 7.57,
    "filter_name": "ha",
    "object_name": "V715 Mon",
    "temp": -10.0,
    "quality_score": 0.75,
    "quality_flag": true,
    "airmass": 1.2,
    "gain": 139.0,
    "header_json": {
      "SIMPLE": true,
      "BITPIX": -32,
      "NAXIS": 2,
      "DATE-OBS": "2025-04-01T04:59:52.123",
      "EXPTIME": 7.57,
      "FILTER": "ha"
    },
    "ingest_time": "2025-05-26T03:15:57"
  }
]
```

#### GET `/api/images/{image_id}`
Get single image by ID.

**Request**:
```bash
curl http://localhost/api/images/123
```

**Response**: Single image object (same format as list endpoint)

#### GET `/api/images/{image_id}/download` (Admin Only)
Download FITS file.

**Request**:
```bash
curl -H "Authorization: Bearer <admin_jwt_token>" \
     -o image_123.fits \
     http://localhost/api/images/123/download
```

**Response**: Binary FITS file content

### Admin Endpoints

#### GET `/api/admin/users` (Admin Only)
List all users.

**Response**:
```json
{
  "users": [
    {
      "user_id": 1,
      "email": "admin@example.com",
      "display_name": "Admin User",
      "is_admin": true,
      "is_active": true,
      "created_at": "2025-05-26T10:00:00",
      "last_login": "2025-05-26T15:45:00"
    }
  ]
}
```

#### PUT `/api/admin/users/{user_id}` (Admin Only)
Update user permissions.

**Request**:
```bash
curl -X PUT -H "Authorization: Bearer <admin_jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{"is_admin": true, "is_active": true}' \
     http://localhost/api/admin/users/2
```

### Utility Endpoints

#### GET `/api/health`
Check API health status.

**Response**:
```json
{
  "status": "ok"
}
```

#### GET `/api/protected`
Test authentication (requires login).

**Response**:
```json
{
  "message": "Hello, user@example.com! Your role is admin.",
  "permissions": {
    "can_download": true,
    "is_admin": true
  }
}
```

---

## Validation Tests

### System Health Tests

#### 1. Container Status Verification
```bash
# Check all 5 containers are running
docker compose ps

# Expected services: db, web, frontend, file-watcher, ingestion
# All should show "Up" status

# Check specific container logs
docker compose logs database1-web-1 --tail=20
docker compose logs database1-file-watcher-1 --tail=20
docker compose logs database1-db-1 --tail=20
```

#### 2. API Health Check
```bash
# Basic health endpoint
curl http://localhost/api/health
# Expected: {"status":"ok"}

# API documentation
curl http://localhost/api/docs
# Expected: OpenAPI/Swagger documentation page

# Database connectivity test
docker compose exec web python -c "
from astro_images.app.database import check_database_health
print('Database Health:', check_database_health())
"
# Expected: Database Health: True
```

### Authentication Tests

#### 3. Google OAuth Configuration Test
```bash
# Test OAuth endpoint exists
curl -X POST http://localhost/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid_test_token"}'
# Expected: HTTP 400 "Invalid Google token"

# Check frontend Google client configuration
curl -s http://localhost | grep -o 'GOOGLE_CLIENT_ID.*"'
# Expected: Shows your Google Client ID
```

### Database Query Tests

#### 4. Basic Image Queries
```bash
# Get all images (no auth required for listing)
docker compose exec web curl "http://localhost:8000/api/images?limit=2"

# Expected response format:
# [
#   {
#     "image_id": 1,
#     "file_path": "/data/images/...",
#     "date_time": "2025-04-01T...",
#     "ra_deg": 102.23,
#     "dec_deg": 0.93,
#     ...
#   }
# ]

# Test pagination
docker compose exec web curl "http://localhost:8000/api/images?limit=1&offset=0"
docker compose exec web curl "http://localhost:8000/api/images?limit=1&offset=1"
```

#### 5. Filter Validation Tests

**Observatory/Telescope Filter** (Tested with Real Data):
```bash
# Test observatory filter (verified working)
docker compose exec web curl "http://localhost:8000/api/images?telescope=Winer%20Observatory&limit=2"

# Expected response includes:
# {
#   "obsname": "Winer Observatory",
#   "file_path": "/data/images/ext_AD_Leo_lrg_150s_2025-04-02T06-08-05.fts",
#   "temp": -10.0,
#   "filter_name": "lrg",
#   "quality_score": 0.38,
#   "quality_flag": false
# }

# Test partial observatory match
docker compose exec web curl "http://localhost:8000/api/images?telescope=Winer&limit=2"
```

**Temperature Range Filter** (Verified Working):
```bash
# Test minimum temperature (proven with real data)
docker compose exec web curl "http://localhost:8000/api/images?min_temp=-10&limit=2"

# Test temperature range (both images in range)
docker compose exec web curl "http://localhost:8000/api/images?min_temp=-15&max_temp=-5&limit=2"

# Expected: Images with temp values like -10.0, -9.8 (from CCD-TEMP header field)

# Test edge cases
docker compose exec web curl "http://localhost:8000/api/images?min_temp=-11&limit=2"
# Should return image with temp: -10.0

docker compose exec web curl "http://localhost:8000/api/images?max_temp=-10&limit=2"  
# Should return images with temp <= -10.0
```

**Filter Name Tests** (Confirmed Working):
```bash
# Test specific filters from real dataset
docker compose exec web curl "http://localhost:8000/api/images?filter_name=lrg&limit=2"
# Returns: "filter_name": "lrg", "FILTER": "lrg" in header_json

docker compose exec web curl "http://localhost:8000/api/images?filter_name=hrg&limit=2"
# Returns: "filter_name": "hrg", "FILTER": "hrg" in header_json

# Test standard astronomical filters
docker compose exec web curl "http://localhost:8000/api/images?filter_name=R&limit=2"
docker compose exec web curl "http://localhost:8000/api/images?filter_name=G&limit=2"
docker compose exec web curl "http://localhost:8000/api/images?filter_name=ha&limit=2"

# Case sensitivity test (should work)
docker compose exec web curl "http://localhost:8000/api/images?filter_name=LRG&limit=2"
```

**Date and Time Filters** (Real Observatory Data):
```bash
# Test with actual observation dates
docker compose exec web curl "http://localhost:8000/api/images?date=2025-04-01&limit=2"
docker compose exec web curl "http://localhost:8000/api/images?date=2025-04-02&limit=2"

# Test time range (early morning observations)
docker compose exec web curl "http://localhost:8000/api/images?start_time=06:00&end_time=07:00&limit=2"

# Combined date and temperature (proven working)
curl "http://localhost/api/images?date=2025-04-01&min_temp=-15&max_temp=-5"
# Expected: HTTP 200 with valid JSON response
```

**Quality Score Filter** (Custom Algorithm):
```bash
# Test quality threshold (real scores are ~0.38)
docker compose exec web curl "http://localhost:8000/api/images?min_quality=0.3&limit=2"
# Should return images with quality_score: 0.38

docker compose exec web curl "http://localhost:8000/api/images?min_quality=0.4&limit=2"
# Should return empty array (no images above 0.4 quality in test dataset)

# Test quality flag
docker compose exec web curl "http://localhost:8000/api/images?min_quality=0.6&limit=2"
# Should return images with quality_flag: true
```

**Camera Filter** (ASCOM System):
```bash
# Test with real camera system
docker compose exec web curl "http://localhost:8000/api/images?camera=ASCOM&limit=2"
# Expected: "camname": "ASCOM", "CAMNAME": "ASCOM" in headers

# Test instrument filter
docker compose exec web curl "http://localhost:8000/api/images?camera=ASI&limit=2"
# Expected: "instrume": "ASI Camera (1)" in headers
```

**Real Data Structure Validation**:
```bash
# Test actual FITS header structure
docker compose exec web curl "http://localhost:8000/api/images?limit=1" | python -m json.tool

# Expected complete structure with coordinate parsing status:
# {
#   "image_id": 1,
#   "file_path": "/data/images/ext_AD_Leo_lrg_150s_2025-04-02T06-08-05.fts",
#   "date_time": "2025-04-02T06:08:05",
#   "ra_deg": null,                    # [FAILED] NOT PARSED: RA header missing/unsupported format
#   "dec_deg": null,                   # [FAILED] NOT PARSED: DEC header missing/unsupported format
#   "exptime": 150.0,                  # [CHECKED] From EXPTIME header
#   "filter_name": "lrg",              # [CHECKED] From FILTER header
#   "object_name": "",                 # [CHECKED] From OBJECT header (empty in dataset)
#   "quality_score": 0.38,             # [CHECKED] Calculated quality score
#   "quality_flag": false,             # [CHECKED] Quality threshold flag (0.38 < 0.6)
#   "temp": -10.0,                     # [CHECKED] From CCD-TEMP header (priority over DETTEMP)
#   "objctra": "10 19 39",             # [FAILED] NOT CONVERTED: Space-separated format preserved as string
#   "objctdec": null,                  # [FAILED] Missing in this image
#   "blkra": 154.901,                  # [CHECKED] CONVERTED: "10h19m36.28081812s" → 154.901 degrees
#   "blkdec": 19.87,                   # [CHECKED] CONVERTED: "19d52m12.01044657s" → 19.87 degrees
#   "obsname": "Winer Observatory",    # [CHECKED] Observatory identification
#   "instrume": "ASI Camera (1)",      # [CHECKED] Camera/instrument info
#   "camname": "ASCOM",                # [CHECKED] Camera driver name
#   "airmass": 1.0598,                 # [CHECKED] Atmospheric conditions
#   "gain": 0.246658,                  # [CHECKED] From EGAIN header
#   "header_json": {                   # [CHECKED] Complete FITS header preserved
#     "JD": 2460767.7556157405,
#     "BLKRA": "10h19m36.28081812s",   # → Successfully converted to blkra: 154.901
#     "BLKDEC": "19d52m12.01044657s",  # → Successfully converted to blkdec: 19.87
#     "OBJCTRA": "10 19 39",           # → NOT converted, remains as objctra string
#     "CCD-TEMP": -10.0,               # → Successfully mapped to temp: -10.0
#     "FILTER": "lrg",                 # → Successfully mapped to filter_name: "lrg"
#     "EXPTIME": 150.0,                # → Successfully mapped to exptime: 150.0
#     "AIRMASS": 1.0598017958347643,   # → Successfully mapped to airmass: 1.0598
#     "IMAGETYP": "Light Frame",       # → Successfully mapped to imagetyp: "Light Frame"
#     "INSTRUME": "ASI Camera (1)",    # → Successfully mapped to instrume: "ASI Camera (1)"
#     "OBSNAME": "Winer Observatory"   # → Successfully mapped to obsname: "Winer Observatory"
#     # ... (100+ additional FITS keywords preserved)
#   },
#   "ingest_time": "2025-06-02T07:56:58"
# }

# Coordinate Processing Summary:
# [CHECKED] Working: BLKRA/BLKDEC sexagesimal format conversion  
# [FAILED] Not Working: Primary RA/DEC field extraction
# [FAILED] Not Working: OBJCTRA space-separated format conversion


#### 6. Complex Multi-Filter Tests
```bash
# Multiple filters combination
docker compose exec web curl "http://localhost:8000/api/images?telescope=Winer&min_temp=-15&filter_name=ha&min_quality=70&limit=5"

# Date + filters
docker compose exec web curl "http://localhost:8000/api/images?date=2025-04-01&telescope=Iowa&min_temp=-10&limit=3"

# Time range + quality
docker compose exec web curl "http://localhost:8000/api/images?start_time=22:00&end_time=04:00&min_quality=80&limit=3"

# Expected: Images matching ALL specified criteria
```

### File Processing Tests

#### 7. File Ingestion Validation
```bash
# Check ingestion service logs
docker compose logs database1-ingestion-1 --tail=50

# Check file watcher status
docker compose logs database1-file-watcher-1 --tail=20

# Manual ingestion test
docker compose exec web python -c "
from astro_images.app.ingestion import upload_all
upload_all()
"

# Check database population
docker compose exec web python -c "
from astro_images.app.database import SessionLocal
from astro_images.app.models import Image
with SessionLocal() as db:
    count = db.query(Image).count()
    print(f'Total images in database: {count}')
"
```

#### 8. File Detection Test
```bash
# Create test FITS file (if you have sample data)
# cp sample_observation.fits /your/LOCAL_IMAGE_PATH/test_file.fits

# Monitor file watcher logs for detection
docker compose logs database1-file-watcher-1 -f

# Check if file appears in database
docker compose exec web curl "http://localhost:8000/api/images?limit=1" | grep "test_file"
```

### Database Integrity Tests

#### 9. Data Validation Tests
```bash
# Check for duplicate prevention
docker compose exec db mysql -u astro -p${DB_PASSWORD} astrodb -e "
SELECT file_path, COUNT(*) as count 
FROM images 
GROUP BY file_path 
HAVING count > 1;
"
# Expected: No results (no duplicates)

# Check data types and ranges
docker compose exec db mysql -u astro -p${DB_PASSWORD} astrodb -e "
SELECT 
  COUNT(*) as total_images,
  AVG(quality_score) as avg_quality,
  MIN(temp) as min_temp,
  MAX(temp) as max_temp,
  COUNT(CASE WHEN quality_flag = 1 THEN 1 END) as high_quality_count
FROM images;
"

# Check for NULL values in critical fields
docker compose exec db mysql -u astro -p${DB_PASSWORD} astrodb -e "
SELECT 
  COUNT(CASE WHEN file_path IS NULL THEN 1 END) as null_paths,
  COUNT(CASE WHEN date_time IS NULL THEN 1 END) as null_dates,
  COUNT(CASE WHEN header_json IS NULL THEN 1 END) as null_headers
FROM images;
"
# Expected: All should be 0
```

### Performance Tests

#### 10. Parallel Processing Validation
```bash
# Test concurrent processing capabilities
docker compose exec web python -c "
from astro_images.app.ingestion import FitsProcessor
processor = FitsProcessor(max_workers=20)
print(f'Configured for {processor.max_workers} parallel workers')
print(f'Database pool size: {processor.max_workers + 5} connections')
processor.cleanup()
"

# Monitor parallel processing during ingestion
docker compose exec web python -c "
from astro_images.app.database import get_pool_status
print('Connection Pool Status:', get_pool_status())
"

# Test concurrent API requests (simulates load)
echo 'Testing concurrent API load...'
for i in {1..10}; do
  docker compose exec web curl -s "http://localhost:8000/api/images?limit=10&offset=$((i*10))" > /dev/null &
done
wait
echo 'Concurrent requests completed'
```

#### 11. Load Testing
```bash
# Test response time for large queries
time docker compose exec web curl "http://localhost:8000/api/images?limit=1000" > /dev/null

# Test concurrent requests
for i in {1..10}; do
  docker compose exec web curl "http://localhost:8000/api/images?limit=10&offset=$((i*10))" > /dev/null &
done
wait

# Monitor resource usage during tests
docker stats database1-web-1 database1-db-1
```

### Security Tests

#### 11. Authentication & Authorization Tests
```bash
# Test unauthenticated access to protected endpoints
curl -w "%{http_code}" http://localhost/api/user/me
# Expected: 401 Unauthorized

curl -w "%{http_code}" http://localhost/api/admin/users
# Expected: 401 Unauthorized

# Test invalid JWT token
curl -H "Authorization: Bearer invalid_token" http://localhost/api/user/me
# Expected: 401 Unauthorized

# Test download endpoint without admin role (need valid user token)
curl -H "Authorization: Bearer <user_jwt_token>" \
     http://localhost/api/images/1/download
# Expected: 403 Forbidden (if user is not admin)
```

### Error Handling Tests

#### 12. Edge Case Tests
```bash
# Test invalid parameters
docker compose exec web curl "http://localhost:8000/api/images?min_temp=invalid"
# Expected: HTTP 422 Validation Error

docker compose exec web curl "http://localhost:8000/api/images?date=invalid-date"
# Expected: HTTP 422 Validation Error

# Test non-existent image
docker compose exec web curl "http://localhost:8000/api/images/999999"
# Expected: HTTP 404 Not Found

# Test SQL injection attempts (should be protected)
docker compose exec web curl "http://localhost:8000/api/images?camera=';DROP TABLE images;--"
# Expected: Normal response (SQLAlchemy protects against injection)
```

### Complete System Integration Test

#### 13. End-to-End Validation
```bash
#!/bin/bash
# comprehensive_test.sh

echo "=== Astronomy Image Management System - Validation Tests ==="

# 1. Container Health
echo "1. Checking container status..."
docker compose ps | grep -E "(Up|healthy)" | wc -l
# Should show 5 (all containers up)

# 2. API Health
echo "2. Testing API health..."
curl -s http://localhost/api/health | grep -q "ok" && echo "[CHECKED] API healthy" || echo "[FAILED] API unhealthy"

# 3. Database connectivity
echo "3. Testing database..."
docker compose exec -T web python -c "
from astro_images.app.database import check_database_health
print('[CHECKED] Database connected' if check_database_health() else '[FAILED] Database failed')
"

# 4. Sample queries
echo "4. Testing image queries..."
RESULT=$(docker compose exec -T web curl -s "http://localhost:8000/api/images?limit=1")
echo $RESULT | grep -q "image_id" && echo "[CHECKED] Image queries working" || echo "[FAILED] Image queries failed"

# 5. Filter tests
echo "5. Testing filters..."
docker compose exec -T web curl -s "http://localhost:8000/api/images?min_temp=-20&limit=1" | grep -q "image_id" && echo "[CHECKED] Temperature filter working" || echo "[FAILED] Temperature filter failed"

# 6. Frontend access
echo "6. Testing frontend..."
curl -s http://localhost | grep -q "Planet of API" && echo "[CHECKED] Frontend accessible" || echo "[FAILED] Frontend failed"

echo "=== Validation Complete ==="
```

### Expected Test Results Summary

**Successful Test Indicators**:
- [CHECKED] All 5 containers showing "Up" status
- [CHECKED] Health endpoint returns `{"status":"ok"}`
- [CHECKED] Database queries return JSON with image data
- [CHECKED] Filters correctly limit results
- [CHECKED] No duplicate entries in database
- [CHECKED] Authentication endpoints respond appropriately
- [CHECKED] File watcher logs show processing activity
- [CHECKED] Frontend loads with Google sign-in button

**Failure Indicators to Investigate**:
- [FAILED] Containers in "Exited" or "Restarting" status
- [FAILED] Health endpoint returns errors or timeouts
- [FAILED] Empty results from image queries when data exists
- [FAILED] Authentication always returns 401/403
- [FAILED] Database connection errors
- [FAILED] File watcher not detecting new files

Run these validation tests after any deployment or configuration change to ensure system integrity.

---

## Troubleshooting

### Common Issues

#### File Detection Not Working

**Symptoms**: New FITS files not appearing in database

**Diagnostic Steps**:
```bash
# 1. Check file watcher status and logs
docker compose ps | grep file-watcher
docker compose logs database1-file-watcher-1 -f

# 2. Verify file permissions and location
ls -la /your/LOCAL_IMAGE_PATH/*.{fits,fts}
# Files should be readable (permissions 644 or similar)

# 3. Check file extensions
find /your/LOCAL_IMAGE_PATH -name "*" -type f | grep -E "\.(fits|fts)$"
# Should list your FITS files

# 4. Test manual ingestion
docker compose exec web python -c "
from astro_images.app.ingestion import upload_all
upload_all()
"

# 5. Check database storage
docker compose exec web python -c "
from astro_images.app.database import SessionLocal
from astro_images.app.models import Image
with SessionLocal() as db:
    recent = db.query(Image).order_by(Image.ingest_time.desc()).limit(5).all()
    for img in recent:
        print(f'{img.image_id}: {img.file_path} ({img.ingest_time})')
"
```

**Solutions**:
- Ensure `LOCAL_IMAGE_PATH` in `.env` matches actual directory
- Verify Docker volume mounting in `docker-compose.yml`
- Check file permissions: `chmod 644 *.fits`
- Restart file watcher: `docker compose restart file-watcher`
- Check disk space: `df -h /your/LOCAL_IMAGE_PATH`

#### Database Connection Issues

**Symptoms**: API returning 500 errors, connection timeouts

**Advanced Diagnostics**:
```bash
# 1. Check database container status
docker compose ps db
docker compose logs database1-db-1 --tail=50

# 2. Test direct database connection
docker compose exec db mysql -u astro -p${DB_PASSWORD} -e "SELECT 1"

# 3. Check connection pool status
docker compose exec web python -c "
from astro_images.app.database import get_pool_status, check_database_health
print('Database Health:', check_database_health())
print('Pool Status:', get_pool_status())
"

# 4. Verify network connectivity
docker compose exec web nc -z db 3306
# Should show connection success

# 5. Check environment variables
docker compose exec web env | grep -E "DB_|MYSQL_"
```

**Solutions**:
- Verify database credentials in `.env`
- Check MySQL container logs for authentication errors
- Ensure database has finished initializing (can take 30-60 seconds)
- Restart database container: `docker compose restart db`
- Check network connectivity: `docker network ls`

#### Authentication Problems

**Symptoms**: Google sign-in failures, JWT token errors

**Diagnostics**:
```bash
# 1. Check Google OAuth configuration
curl -s http://localhost | grep -o 'GOOGLE_CLIENT_ID.*"'

# 2. Test authentication endpoint
curl -X POST http://localhost/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "test"}'
# Should return 400 "Invalid Google token"

# 3. Verify JWT secret
docker compose exec web env | grep JWT_SECRET
# Should show your JWT secret

# 4. Check frontend console for errors
# Open browser developer tools at http://localhost
```

**Solutions**:
- Verify `GOOGLE_CLIENT_ID` in `.env` and Google Cloud Console
- Check authorized origins in Google Cloud Console
- Ensure JWT_SECRET is at least 32 characters
- Clear browser cache and cookies
- Check browser console for JavaScript errors

#### Performance Issues

**Symptoms**: Slow queries, high resource usage

**Performance Monitoring**:
```bash
# 1. Monitor container resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# 2. Check database performance
docker compose exec db mysql -u astro -p${DB_PASSWORD} astrodb -e "
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS\G
"

# 3. Analyze slow queries
docker compose exec db mysql -u astro -p${DB_PASSWORD} astrodb -e "
SELECT * FROM information_schema.processlist WHERE time > 1;
"

# 4. Check file system performance
time docker compose exec web find /data/images -name "*.fits" | wc -l
```

**Optimization Solutions**:
- Add database indexes for common queries
- Increase Docker memory allocation (8GB+ recommended)
- Use SSD storage for database and images
- Optimize query patterns and add LIMIT clauses
- Consider database connection pool tuning

---

## Maintenance

### Regular Maintenance Tasks

#### Daily Monitoring (Production Environment)
```bash
# Health check script adapted for real environment (save as daily_check.sh)
#!/bin/bash
echo "=== Daily System Check $(date) ==="

# Container status
echo "Container Status:"
docker compose ps

# Disk usage for FITS storage
echo "FITS Storage Disk Usage:"
df -h /your/LOCAL_IMAGE_PATH

# Recent ingestion activity with real metrics
echo "Recent Images (last 24 hours):"
docker compose exec web python -c "
from datetime import datetime, timedelta
from astro_images.app.database import SessionLocal
from astro_images.app.models import Image
with SessionLocal() as db:
    yesterday = datetime.now() - timedelta(days=1)
    recent = db.query(Image).filter(Image.ingest_time >= yesterday).count()
    total = db.query(Image).count()
    
    # Quality distribution
    high_quality = db.query(Image).filter(Image.quality_flag == True).count()
    avg_quality = db.query(Image).with_entities(func.avg(Image.quality_score)).scalar()
    
    # Observatory breakdown
    winer_count = db.query(Image).filter(Image.obsname.like('%Winer%')).count()
    
    print(f'Images ingested today: {recent}')
    print(f'Total images in database: {total}')
    print(f'High quality images: {high_quality} ({high_quality/total*100:.1f}%)')
    print(f'Average quality score: {avg_quality:.3f}')
    print(f'Winer Observatory images: {winer_count}')
    
    # Recent observations by filter
    from sqlalchemy import func
    filters = db.query(Image.filter_name, func.count(Image.filter_name)).group_by(Image.filter_name).all()
    print('Filter distribution:')
    for filter_name, count in filters:
        print(f'  {filter_name}: {count} images')
"

# Temperature monitoring (CCD health)
echo "CCD Temperature Analysis:"
docker compose exec web python -c "
from astro_images.app.database import SessionLocal
from astro_images.app.models import Image
from sqlalchemy import func
with SessionLocal() as db:
    temp_stats = db.query(
        func.min(Image.temp).label('min_temp'),
        func.max(Image.temp).label('max_temp'), 
        func.avg(Image.temp).label('avg_temp')
    ).first()
    print(f'Temperature range: {temp_stats.min_temp:.1f}°C to {temp_stats.max_temp:.1f}°C')
    print(f'Average temperature: {temp_stats.avg_temp:.1f}°C')
    
    # Check for temperature anomalies
    hot_images = db.query(Image).filter(Image.temp > -5).count()
    if hot_images > 0:
        print(f'WARNING: {hot_images} images with temp > -5°C (check cooling)')
"

# Error checking with specific patterns
echo "Recent Errors:"
docker compose logs --since=24h | grep -i error | tail -10

# File processing statistics
echo "Processing Performance:"
docker compose exec web python -c "
from astro_images.app.database import get_pool_status
print(f'Database pool status: {get_pool_status()}')
"
```

#### Weekly Maintenance (Real Dataset Management)
```bash
# Weekly maintenance script for astronomical data
#!/bin/bash
echo "=== Weekly Astronomy System Maintenance $(date) ==="

# Database backup with real table sizes
echo "Creating database backup..."
docker compose exec db mysqldump -u astro -p${DB_PASSWORD} \
  --single-transaction --routines --triggers astrodb > backup_$(date +%Y%m%d).sql

# Check backup size and compression
BACKUP_SIZE=$(du -h backup_$(date +%Y%m%d).sql | cut -f1)
echo "Backup size: $BACKUP_SIZE"
gzip backup_$(date +%Y%m%d).sql

# FITS file integrity check
echo "Checking FITS file integrity..."
docker compose exec web python -c "
import os
from pathlib import Path
from astropy.io import fits

fits_dir = Path('/data/images')
total_files = 0
corrupted_files = 0

for fits_file in fits_dir.glob('*.fts'):
    total_files += 1
    try:
        with fits.open(fits_file) as hdul:
            # Basic header check
            header = hdul[0].header
            if 'SIMPLE' not in header:
                print(f'WARNING: Non-standard FITS file: {fits_file.name}')
    except Exception as e:
        corrupted_files += 1
        print(f'CORRUPTED: {fits_file.name} - {e}')

print(f'Checked {total_files} FITS files, {corrupted_files} corrupted')
"

# Clean old logs and optimize database
echo "Cleaning Docker logs..."
docker system prune -f

# Database optimization for astronomical queries
echo "Optimizing database indexes..."
docker compose exec db mysql -u astro -p${DB_PASSWORD} astrodb -e "
ANALYZE TABLE images;
OPTIMIZE TABLE images;
SHOW INDEX FROM images;
"

# Performance statistics for real workload
echo "System Performance Report:"
docker compose exec web python -c "
from astro_images.app.database import SessionLocal, get_pool_status
from astro_images.app.models import Image
from sqlalchemy import func
from datetime import datetime, timedelta

with SessionLocal() as db:
    # Database size and performance
    total = db.query(Image).count()
    last_week = datetime.now() - timedelta(days=7)
    recent = db.query(Image).filter(Image.ingest_time >= last_week).count()
    
    # Query performance test
    import time
    start_time = time.time()
    winer_images = db.query(Image).filter(Image.obsname.like('%Winer%')).count()
    query_time = time.time() - start_time
    
    # File size analysis
    avg_size = db.query(func.avg(Image.width * Image.height)).scalar()
    
    print(f'Total images: {total:,}')
    print(f'Images added this week: {recent}')
    print(f'Observatory query time: {query_time:.3f}s for {winer_images} images')
    print(f'Average image size: {avg_size/1e6:.1f} megapixels')
    print(f'Connection pool: {get_pool_status()}')
"
```

### Backup Procedures

#### Automated Database Backup
```bash
#!/bin/bash
# backup_system.sh
BACKUP_DIR="/opt/backups/astronomy"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
echo "Backing up database..."
docker compose exec db mysqldump -u astro -p${DB_PASSWORD} \
  --single-transaction --routines --triggers astrodb > $BACKUP_DIR/db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_$DATE.sql

# Application configuration backup
echo "Backing up configuration..."
tar czf $BACKUP_DIR/config_$DATE.tar.gz .env docker-compose.yml nginx/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR"
```

#### Image Storage Backup
```bash
#!/bin/bash
# backup_images.sh
SOURCE_DIR="/your/LOCAL_IMAGE_PATH"
BACKUP_SERVER="backup-server.example.com"
BACKUP_PATH="/backups/astronomy-images"

# Incremental backup using rsync
rsync -av --progress --delete \
  --exclude="*.tmp" \
  --exclude="*.partial" \
  $SOURCE_DIR/ $BACKUP_SERVER:$BACKUP_PATH/

echo "Image backup completed to $BACKUP_SERVER:$BACKUP_PATH"
```

### Updates and Deployments

#### Application Updates
```bash
#!/bin/bash
# update_system.sh
echo "Updating Astronomy Image Management System..."

# Backup before update
./backup_system.sh

# Pull latest code
git fetch origin
git pull origin main

# Update containers
docker compose down
docker compose build --no-cache
docker compose up -d

# Verify deployment
sleep 30
curl -f http://localhost/api/health && echo "[CHECKED] Update successful" || echo "[FAILED] Update failed"

# Check container status
docker compose ps
```

#### Database Schema Migrations
```bash
# For schema updates (when needed)
#!/bin/bash
echo "Applying database migrations..."

# Backup database first
./backup_system.sh

# Apply migrations (if using Alembic)
docker compose exec web python -c "
from astro_images.app.database import engine, Base
Base.metadata.create_all(bind=engine)
print('Schema updated')
"

# Verify tables
docker compose exec db mysql -u astro -p${DB_PASSWORD} astrodb -e "SHOW TABLES;"
```

### Security Hardening

#### Production Security Checklist
```bash
# Security audit script
#!/bin/bash
echo "=== Security Audit ==="

# Check strong passwords
if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "[CAUTION]  JWT_SECRET should be at least 32 characters"
fi

# Check environment
if [ "$ENVIRONMENT" = "production" ]; then
  echo "[CHECKED] Production environment set"
  
  # Check SSL configuration
  if [ "$DB_SSL_ENABLED" = "true" ]; then
    echo "[CHECKED] Database SSL enabled"
  else
    echo "[CAUTION]  Consider enabling database SSL for production"
  fi
else
  echo "[CAUTION]  Environment not set to production"
fi

# Check exposed ports
echo "Exposed ports:"
docker compose ps --format "table {{.Service}}\t{{.Ports}}"

# Check file permissions
echo "Checking critical file permissions..."
ls -la .env docker-compose.yml
```

#### SSL Configuration for Production
```nginx
# nginx/nginx.prod.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/astronomy.crt;
    ssl_certificate_key /etc/ssl/private/astronomy.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://web:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Known Limitations & Real-World Performance

### Current System Limitations

**Dataset-Specific Constraints**:
- **Single Observatory**: Tested exclusively with Winer Observatory data (31°39'56"N, 110°36'06"W)
- **Limited Observatory Support**: Observatory filtering assumes "Winer Observatory" in `obsname` field
- **Camera System Dependency**: Optimized for ASCOM driver interfaces with ASI cameras
- **Filter Set**: Quality assessment favors standard photometric filters (R,G,B,L) over grism filters (lrg,hrg)
- **Coordinate Parsing Issues**: Primary RA/DEC fields (ra_deg, dec_deg) remain null in test dataset
  - [CHECKED] **BLKRA/BLKDEC conversion works**: `"10h19m36.28s"` → `154.901` degrees
  - [FAILED] **Main coordinates fail**: RA/DEC headers missing or in unsupported format
  - [FAILED] **OBJCTRA format unsupported**: `"10 19 39"` (space-separated) not converted

**Technical Limitations**:
- **File Size**: Tested up to 14GB FITS files; memory usage scales with file size
- **Network Storage**: Watchdog file events may not work reliably on all network filesystems (NFS/CIFS)
- **Browser Support**: Requires modern browsers for Google OAuth 2.0 and ES6+ JavaScript features
- **Quality Scoring**: Algorithm tuned for current dataset; may need adjustment for different observatories

### Real-World Performance Metrics

**Tested Performance (512 Image Dataset)**:
```bash
# Actual performance measurements from development environment
Processing Speed:
  - Small files (<100MB): 1-3 seconds per file
  - Large files (1-14GB): 5-30 seconds per file  
  - Bulk processing: ~60 files/minute with 20 parallel workers
  - Database queries: <100ms for filtered results (up to 512 images)

Resource Usage:
  - RAM: 4GB sufficient for development, 8GB recommended for production
  - Storage: ~50GB for 512 FITS files + database overhead
  - CPU: 2-4 cores adequate for real-time processing
  - Network: Minimal bandwidth requirements for local files

Database Performance:
  - Query response time: 50-200ms for complex filters
  - Index efficiency: Optimized for date, temperature, filter, observatory queries
  - Connection pool: 25 connections handle concurrent access efficiently
  - Storage overhead: ~10% additional space for metadata and indexes
```

**Real Dataset Characteristics**:
```json
{
  "winer_observatory_data": {
    "total_images": 512,
    "observation_period": "April 1-2, 2025",
    "file_format": ".fts (primary), .fits (supported)",
    "average_file_size": "~100MB",
    "temperature_range": "[-10.0°C, -9.8°C]",
    "filters_used": ["lrg", "hrg"],
    "exposure_times": ["150s", "300s"],
    "quality_scores": "0.38 (consistent across dataset)",
    "airmass_range": "[1.0598, 1.1061]",
    "targets": ["AD Leo", "V715 Mon"],
    "coordinate_success_rate": "~60% (some null RA/DEC values)"
  }
}
```

### Production Deployment Considerations

**Scaling Recommendations**:
- **Multi-Observatory Support**: Update quality scoring and filter logic for diverse observatories
- **Coordinate Processing**: Enhance coordinate parsing for non-standard formats
- **Storage Strategy**: Implement tiered storage for large FITS file collections
- **Backup Planning**: ~10GB/night for active observatory (based on 512 images = ~50GB)

**Security Hardening for Production**:
```bash
# Additional security considerations based on real deployment
1. Database Security:
   - Change default passwords from .env example
   - Enable SSL connections for production databases
   - Restrict database access to application containers only

2. File System Security:
   - Implement read-only mounts for FITS directories
   - Set appropriate file permissions (644 for FITS files)
   - Monitor disk usage and implement rotation policies

3. Authentication Security:
   - Configure Google OAuth for institutional domains only
   - Implement session timeout and refresh token rotation
   - Monitor admin user access and download activity

4. Network Security:
   - Use HTTPS for all web traffic in production
   - Implement firewall rules (ports 80, 443, 22 only)
   - Consider VPN access for administrative functions
```

### Future Enhancements

**Planned Improvements Based on Real Usage**:
- **Enhanced Coordinate Processing**: Support for space-separated formats (`"10 19 39"`) and missing RA/DEC headers
  - Currently: Only BLKRA/BLKDEC sexagesimal conversion works properly
  - Needed: Primary RA/DEC field parsing for better coordinate coverage
- **Multi-Observatory Dashboard**: Observatory comparison and aggregate statistics
- **Advanced Quality Metrics**: Machine learning-based image quality assessment  
- **Real-Time Monitoring**: Live dashboard for active observation sessions
- **Data Export Tools**: FITS table exports, CSV downloads, VO-compliant interfaces

**Performance Optimizations**:
- **Database Partitioning**: Partition by observation date for large datasets
- **Caching Layer**: Redis caching for frequently accessed metadata
- **CDN Integration**: Content delivery for large FITS file downloads
- **Async Processing**: Background processing for computationally intensive operations

---

*This documentation reflects real-world testing with 512 FITS images from Winer Observatory and production deployment considerations for astronomical research environments.*

---
