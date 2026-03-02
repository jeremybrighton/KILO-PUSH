# FraudGuard ML - Deployment & Setup Guide

## ⚠️ Important: Current System Status

**The Next.js frontend currently uses DEMO/MOCK data** (hardcoded placeholder values). This is intentional for demonstration purposes. To get real fraud predictions:

1. **Upload your own transaction data** via the Upload page
2. **Connect to the ML service** (Python FastAPI)
3. **Run the ML pipeline** to process transactions

---

## Quick Start (Recommended)

### Option 1: Docker Compose (Easiest)

```bash
cd fraud-detection-app
cp .env.example .env
# Edit .env with your settings

docker-compose up -d

# Access the application:
# - Next.js Frontend: http://localhost:3000
# - Laravel Backend: http://localhost:8000
# - Python ML API: http://localhost:5000
# - MySQL: localhost:3306
# - Redis: localhost:6379
```

### Option 2: Manual Setup

#### Prerequisites
- PHP 8.2+ with Composer
- Node.js 18+ with npm/bun
- Python 3.10+
- MySQL 8.0+
- Redis

#### Step 1: Laravel Backend Setup

```bash
cd fraud-detection-app

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=fraudguard
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Create database
php artisan create:database

# Run migrations
php artisan migrate

# Seed demo data (creates admin user)
php artisan db:seed

# Start Laravel server
php artisan serve
```

#### Step 2: Python ML Service Setup

```bash
cd fraud-detection-app/python-ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start ML service
python main.py
```

#### Step 3: Next.js Frontend Setup

```bash
# Install dependencies
bun install

# Set environment variable for ML API
export NEXT_PUBLIC_ML_API_URL=http://localhost:5000

# Start development server
bun dev
```

---

## Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@fraudguard.com | admin123 |
| **Analyst** | analyst@fraudguard.com | analyst123 |
| **Vendor** | vendor@fraudguard.com | vendor123 |

---

## How to Use the System

### 1. Login
- Go to Laravel backend: http://localhost:8000/login
- Use credentials above

### 2. Upload Transaction Data
- Navigate to Datasets → Upload
- Upload a CSV with columns: transaction_id, amount, vendor, country, timestamp
- The system will queue the file for ML processing

### 3. Process with ML Service
- Laravel sends the CSV to Python FastAPI (/process-dataset)
- Python runs fraud detection model
- Results are stored in database

### 4. View Results
- **Laravel Dashboard**: http://localhost:8000/dashboard
- **Next.js Dashboard**: http://localhost:3000/dashboard
- **Upload Page**: http://localhost:3000/upload
- **Explainability**: http://localhost:3000/explain

---

## CSV Format for Upload

```csv
transaction_id,amount,vendor,country,timestamp
TXN001,125.50,Amazon,US,2024-01-15 10:30:00
TXN002,89.99,Target,GB,2024-01-15 10:31:00
TXN003,2500.00,Unknown,XX,2024-01-15 10:32:00
```

Required columns:
- `transaction_id` - Unique identifier
- `amount` - Transaction amount (numeric)
- `vendor` - Vendor name
- `country` - Country code (2-letter)
- `timestamp` - Date/time of transaction

---

## Environment Variables

### Laravel (.env)
```env
APP_NAME=FraudGuard
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fraudguard
DB_USERNAME=root
DB_PASSWORD=password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# ML Service Configuration
ML_SERVICE_URL=http://localhost:5000
ML_SERVICE_SECRET=your-secret-key
```

### Next.js (.env.local)
```env
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
```

---

## Troubleshooting

### "No users can login"
Run the seeder to create admin user:
```bash
php artisan db:seed
```

### "ML service not responding"
1. Check Python service is running: http://localhost:5000/health
2. Verify ML_SERVICE_URL in Laravel .env

### "Dashboard shows no data"
- The Next.js dashboard currently uses MOCK data for demo
- Real data requires: 1) Upload CSV → 2) Process with ML → 3) View results

### "Port already in use"
- Laravel: Change port with `php artisan serve --port=8001`
- Python: Change port in main.py
- Next.js: Change port with `bun dev --port=3001`

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│   Laravel API    │────▶│  Python/FastAPI │
│  (React 19)     │     │   (Backend)      │     │   (ML Service)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                      │                        │
        │              ┌──────────────┐                 │
        │              │ MySQL + Redis│                 │
        │              │ (Data Store) │                 │
        │              └──────────────┘                 │
        │                                               │
        └─────────────── Callback ◀─────────────────────┘
```

- **Next.js**: User-facing dashboard and visualizations
- **Laravel**: Authentication, data management, job queues
- **Python/FastAPI**: ML inference and SHAP explanations

---

## API Endpoints

### Laravel → Python
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /process-dataset | Send CSV for processing |
| POST | /predict | Single transaction prediction |
| GET | /explain/{id} | Get SHAP explanation |

### Python ML Service
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /health | Service health check |
| POST | /predict | Fraud prediction |
| GET | /explain/{id} | SHAP explanation |
| POST | /process-dataset | Batch processing |

---

## Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check Python logs in terminal
3. Verify all services are running
4. Ensure database migrations have run
