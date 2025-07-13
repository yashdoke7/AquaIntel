# 🌊 AquaIntel – Ship Routing System

AquaIntel is a pathfinding-based application that calculates the shortest route between ports using the A* algorithm. It integrates live weather data via the OpenWeatherMap API to simulate real-world maritime navigation by dynamically blocking unsafe paths.

---

## 🚀 Features

- 📍 Calculates optimal ship routes using A* algorithm  
- 🌦️ Integrates live weather data from OpenWeatherMap  
- ⚠️ Dynamically blocks storm-affected routes  
- 🧭 Offers both UI-based and terminal-based execution  
- 🛠️ Supports MySQL and API-only routing modes  

---

## 🛠️ Tech Stack

- **Python** (core logic)  
- **FastAPI** (backend framework)  
- **aiohttp**, **asyncio** (asynchronous API requests)  
- **MySQL** (weather data storage — optional)  
- **HTML/CSS/JS** (frontend UI)  
- **global-land-mask** (to detect ocean vs land grid)  

---

## 🧾 Requirements

### Full Version (with MySQL support)
- Python 3.9+
- `requests`, `mysql-connector-python`, `matplotlib`, `folium`
- A MySQL database with the required port and weather schema

### For MySQL version

For SQL version use `astar_weather.py` file

### Lightweight Version (API-only

🌐 To Run in API-Only Mode (Without MySQL)

Replace the `astar_weather.py` with `astar_weather_with_api.py` present in the Core Directory.

This enables weather-based pathfinding without MySQL dependency.

⚙️ Running the API Server

```bash
uvicorn main:app --reload
```

This starts the FastAPI backend. Visit [http://localhost:8000/mapsui](http://127.0.0.1:8000/mapsui) or serve MapsUI.html for map interaction.

If you want to run individual runnable scripts, you can run `astar_with_api` or `astar_with_database`.

---

📁 Project Structure
AquaIntel/
├── Core/
│ ├── astar_weather_with_api.py → API-only alternative version
│ ├── astar_with_api_calls.py → Individual Runnable Script (API)
│ └── astar_with_database.py → Individual Runnable Script (SQL)
├── static/ → Frontend UI files
│ ├── MapsUI.html
│ ├── script.js
│ └── style.css
├── main.py → FastAPI entry point
├── astar_weather.py → Pathfinding with SQL
├── fetch_weather.py → API fetch + weight calculation
├── store_update_weather.py → Fetch and store data in MySQL
└── README.md



## 🏁 How to Run

1. Clone the repo  
   ```bash
   git clone https://github.com/yashdoke7/AquaIntel.git
   cd AquaIntel

2. Install dependencies
  ```bash
  pip install -r requirements.txt
  ```

3. Set up .env with your OpenWeatherMap API key:
  ```bash
  OPENWEATHER_API_KEY=your_key_here
  Configure MySQL database (optional)
  ```
4. Run:
  ```bash
  python main.py
  ```

---


📸 Screenshots


<img width="2559" height="1476" alt="image" src="https://github.com/user-attachments/assets/daa12b2f-7a6f-4514-abd4-897a455853a8" />


<img width="2559" height="1476" alt="image" src="https://github.com/user-attachments/assets/9d6c1155-83ee-40a3-bc26-527108084d1c" />


---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📞 Contact
For questions or suggestions, please open an issue on this repository or contact me via my [GitHub profile](https://github.com/yashdoke7).
