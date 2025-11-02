# 🌊 AquaIntel - Maritime Route Intelligence

<div align="center">

![AquaIntel Logo](frontend/src/assets/aquaintel-logo.jpg)

**Advanced maritime routing intelligence for safe and efficient ocean navigation**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com/)

[Live Demo](#) · [Report Bug](https://github.com/yashdoke7/AquaIntel/issues) · [Request Feature](https://github.com/yashdoke7/AquaIntel/issues)

</div>

---

## 📖 Overview

AquaIntel is an intelligent ocean navigation tool that calculates optimal maritime routes using the **A* pathfinding algorithm** integrated with **real-time weather data**. The system dynamically adjusts routes to avoid hazardous weather conditions, ensuring safer and more efficient maritime travel.

### ✨ Key Features

- 🗺️ **Interactive Route Planning** - Visual map interface with click-to-plan functionality
- 🌦️ **Real-Time Weather Integration** - Live weather data from OpenWeatherMap API
- 🧮 **A* Algorithm** - Optimized pathfinding with weather-weighted cost calculation
- 💾 **Smart Caching** - MySQL database for fast weather data retrieval
- 📊 **Route Analytics** - Distance, time estimates, and waypoint tracking
- 🌓 **Dark Mode** - Full dark/light theme support
- 💾 **Route History** - Save and manage recently calculated routes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

---

## 🎬 Demo

### Route Planning Interface
<img width="2559" height="1476" alt="image" src="https://github.com/user-attachments/assets/a620fc92-25ef-41fa-91cf-567aac2f834a" />


### Weather Overview Dashboard
<img width="2537" height="1470" alt="image" src="https://github.com/user-attachments/assets/8bccb33c-4057-4e3c-94a7-ae357060ef81" />


---

## 🏗️ Architecture

```
┌─────────────────┐      HTTP/REST      ┌──────────────────┐
│                 │ ◄─────────────────► │                  │
│  React Frontend │                     │  FastAPI Backend │
│   (TypeScript)  │                     │     (Python)     │
│                 │                     │                  │
└─────────────────┘                     └──────────────────┘
        │                                        │
        │                                        │
        ▼                                        ▼
┌─────────────────┐                     ┌──────────────────┐
│  Leaflet Maps   │                     │  A* Pathfinding  │
│   OpenStreetMap │                     │   + Weather API  │
└─────────────────┘                     └──────────────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │  MySQL Database  │
                                        │  (Weather Cache) │
                                        └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** + **TypeScript** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Leaflet** - Interactive mapping library
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

### Backend
- **Python 3.9+** - Core programming language
- **FastAPI** - High-performance web framework
- **MySQL** - Relational database for weather data
- **aiohttp** - Async HTTP client
- **NumPy** - Numerical computations
- **global-land-mask** - Ocean/land detection

### APIs & Services
- **OpenWeatherMap API** - Real-time weather data
- **OpenStreetMap** - Map tiles

---

## 📁 Project Structure

```
AquaIntel/
├── frontend/                    # React TypeScript Frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── Header.tsx       # Navigation header
│   │   │   ├── Footer.tsx       # Footer with links
│   │   │   ├── LeafletMap.tsx   # Interactive map
│   │   │   ├── WeatherInfo.tsx  # Weather display
│   │   │   └── RecentRoutes.tsx # Route history
│   │   ├── pages/               # Page components
│   │   │   ├── Index.tsx        # Landing page
│   │   │   ├── RoutePlanner.tsx # Route planning
│   │   │   ├── WeatherOverview.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── TermsOfService.tsx
│   │   │   ├── PrivacyPolicy.tsx
│   │   │   └── FAQ.tsx
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   └── utils.ts         # Helpers
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # FastAPI Python Backend
│   ├── Core/                    # Alternative implementations
│   │   ├── astar_weather_with_api.py  # Direct API version
│   │   ├── astar_with_api_calls.py    # Testing script
│   │   ├── astar_with_database.py     # DB testing script
│   │   └── README.md            # Core documentation
│   ├── main.py                  # FastAPI server
│   ├── astar_weather.py         # Main A* algorithm
│   ├── fetch_weather.py         # Weather API client
│   ├── store_update_weather.py  # DB updater (auto-runs)
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- **MySQL 8.0+** (optional, for database mode)
- **OpenWeatherMap API Key** ([Get free key](https://openweathermap.org/api))

### Installation

#### 1️⃣ Clone the Repository

```
git clone https://github.com/yashdoke7/AquaIntel.git
cd AquaIntel
```

#### 2️⃣ Backend Setup

```
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# OPENWEATHER_API_KEY=your_api_key_here
# MYSQL_DATABASE=AquaIntel
# MYSQL_USER=root
# MYSQL_PASSWORD=your_password
# MYSQL_HOST=127.0.0.1
# MYSQL_PORT=3306
```

#### 3️⃣ Database Setup (Optional but Recommended)

```
-- Create database
CREATE DATABASE AquaIntel;
USE AquaIntel;

-- Create weather data table
CREATE TABLE IF NOT EXISTS weather_data (
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  weight FLOAT NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (latitude, longitude)
);
```

#### 4️⃣ Frontend Setup

```
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# VITE_API_URL=http://localhost:8000/api
# VITE_OPENWEATHER_API_KEY=your_api_key_here
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```
Backend runs on: `http://localhost:8000`

**Terminal 2 - Frontend:**
```
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:8080`

### Production Mode

**Backend:**
```
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend:**
```
cd frontend
npm run build
npm run preview
```

---

## 🎯 Usage Guide

### Planning a Route

1. Navigate to **Route Planner** page
2. Click on the map to set **start point** (green marker)
3. Click again to set **end point** (red marker)
4. Click **"Calculate Route"** button
5. View the optimized route (blue line) on the map
6. Check route metadata: distance, time, waypoints

### Viewing Weather Data

1. Go to **Weather Overview** page
2. Select a location from quick picks or enter coordinates
3. View real-time maritime weather conditions:
   - Wind speed and direction
   - Temperature
   - Visibility
   - Humidity
   - Pressure
   - Cloud cover

### Managing Route History

1. Visit **Recent Routes** page
2. View all previously calculated routes
3. Export routes as JSON
4. Delete individual routes or clear all

---

## ⚙️ Configuration

### Weather Update Frequency

Edit `backend/store_update_weather.py`:
```
# Default: Updates every 30 minutes
schedule.every(30).minutes.do(lambda: asyncio.run(update_weather_database()))
```

### A* Algorithm Parameters

Edit `backend/astar_weather.py`:
```
# Grid step size (default: 0.1 degrees)
step_size = 0.1

# Weight coefficients
WEIGHT_COEFFICIENTS = {
    'wind_speed': 0.25,
    'wind_gust': 0.2,
    'temperature': 0.1,
    'visibility': 0.1,
    'pressure': 0.1,
    'humidity': 0.1
}
```

---

## 🧪 Testing

### Backend Tests
```
cd backend

# Test A* with database
python Core/astar_with_database.py

# Test A* with API
python Core/astar_with_api_calls.py
```

### Frontend Tests
```
cd frontend

# Type checking
npm run lint

# Build test
npm run build
```

---

## 📊 Performance

| Route Type | Grid Points | API Mode | Database Mode |
|------------|-------------|----------|---------------|
| Short (<500km) | ~2,000 | 5-10 min | 1-2 sec |
| Medium (500-2000km) | ~5,000 | 15-30 min | 2-5 sec |
| Long (>2000km) | ~10,000 | 30-60 min | 5-10 sec |

**Recommendation:** Use database mode for production (2-5 seconds vs 15-30 minutes)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Known Issues

See the [Issues](https://github.com/yashdoke7/AquaIntel/issues) page for known bugs and feature requests.

---

## 📸 Screenshots

### Landing Page
<img width="2539" height="1476" alt="image" src="https://github.com/user-attachments/assets/1e04368d-96e5-49d8-9709-bbd7b99a9edf" />


### Route Planning
<img width="2537" height="1477" alt="image" src="https://github.com/user-attachments/assets/9417b1fe-823e-479d-bae2-4c74c996a7f6" />


### Weather Overview
<img width="2537" height="1475" alt="image" src="https://github.com/user-attachments/assets/423c2e9f-6ea5-4c31-a9ea-f2bcd8c30c41" />


### Recent Routes
<img width="2559" height="1477" alt="image" src="https://github.com/user-attachments/assets/1c103064-38c4-4af1-834c-980607279321" />


---

<div align="center">

**Built with ❤️ for safer maritime navigation**

⭐ Star this repository if you find it helpful!

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yash Doke**

- GitHub: [@yashdoke7](https://github.com/yashdoke7)
- LinkedIn: [Yash Doke](https://www.linkedin.com/in/yash-doke/)
- Email: yashdoke215@gmail.com

---

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Leaflet](https://leafletjs.com/) for interactive maps
- [FastAPI](https://fastapi.tiangolo.com/) for the amazing backend framework

***
