"""
A* Pathfinding with Direct Weather API Calls
Alternative to database version - fetches weather data directly from OpenWeatherMap
⚠️ WARNING: Slower than database version due to API rate limits
Use only for small routes or when database is unavailable
"""

import aiohttp
import asyncio
import numpy as np
import heapq
from global_land_mask import globe
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
STEP_SIZE = 0.1

# Weight coefficients for route calculation
WEIGHT_COEFFICIENTS = {
    'wind_speed': 0.25,
    'wind_gust': 0.2,
    'temperature': 0.1,
    'visibility': 0.1,
    'pressure': 0.1,
    'humidity': 0.1
}

MAX_VALUES = {
    'wind_speed': 15,
    'wind_gust': 20,
    'visibility': 10000
}


def generate_grid_with_buffer(lat1, lon1, lat2, lon2):
    """Generate grid points for pathfinding with buffer zone"""
    lat1, lat2 = sorted([lat1, lat2])
    lon1, lon2 = sorted([lon1, lon2])

    grid_points = []
    for row in np.arange(lat1 - 1, lat2 + 1.1, STEP_SIZE):
        for col in np.arange(lon1 - 1, lon2 + 1.1, STEP_SIZE):
            row = round(row, 1)
            col = round(col, 1)
            if (-90 <= row <= 90) and (-180 <= col <= 180):
                grid_points.append((row, col))

    return grid_points


def parse_weather_data(condition):
    """Extract relevant weather data from API response"""
    return {
        'wind_speed': condition.get('wind', {}).get('speed', 0),
        'wind_gust': condition.get('wind', {}).get('gust', 0),
        'temperature': condition.get('main', {}).get('temp', 0),
        'visibility': condition.get('visibility', 10000),
        'pressure': condition.get('main', {}).get('pressure', 1013),
        'humidity': condition.get('main', {}).get('humidity', 50)
    }


def check_land(lat, lon):
    """Check if coordinates are on land"""
    return globe.is_land(lat, lon)


def normalize(value, min_value, max_value):
    """Normalize value between 0 and 1"""
    if max_value == min_value:
        return 0
    return (value - min_value) / (max_value - min_value)


def calculate_grid_weight(weather_data):
    """Calculate weighted cost for grid cell based on weather conditions"""
    norm_wind_speed = normalize(weather_data['wind_speed'], 0, MAX_VALUES['wind_speed'])
    norm_wind_gust = normalize(weather_data['wind_gust'], 0, MAX_VALUES['wind_gust'])
    norm_temperature = normalize(weather_data['temperature'], -30, 50)
    norm_visibility = normalize(weather_data['visibility'], 0, MAX_VALUES['visibility'])
    norm_pressure = normalize(weather_data['pressure'], 950, 1050)
    norm_humidity = normalize(weather_data['humidity'], 0, 100)

    total_weight = (
        WEIGHT_COEFFICIENTS['wind_speed'] * norm_wind_speed +
        WEIGHT_COEFFICIENTS['wind_gust'] * norm_wind_gust +
        WEIGHT_COEFFICIENTS['temperature'] * norm_temperature +
        WEIGHT_COEFFICIENTS['visibility'] * (1 - norm_visibility) +
        WEIGHT_COEFFICIENTS['pressure'] * norm_pressure +
        WEIGHT_COEFFICIENTS['humidity'] * norm_humidity
    )

    return max(total_weight, 0.1)  # Ensure minimum weight


def heuristic(a, b):
    """Manhattan distance heuristic for A* algorithm"""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def a_star(start, goal, grid_weights):
    """A* pathfinding algorithm"""
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {point: float('inf') for point in grid_weights}
    g_score[start] = 0
    f_score = {point: float('inf') for point in grid_weights}
    f_score[start] = heuristic(start, goal)

    while open_set:
        current = heapq.heappop(open_set)[1]

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        # 8-directional neighbors
        neighbors = [
            (round(current[0] + STEP_SIZE, 1), round(current[1], 1)),
            (round(current[0] - STEP_SIZE, 1), round(current[1], 1)),
            (round(current[0], 1), round(current[1] + STEP_SIZE, 1)),
            (round(current[0], 1), round(current[1] - STEP_SIZE, 1)),
            (round(current[0] + STEP_SIZE, 1), round(current[1] + STEP_SIZE, 1)),
            (round(current[0] - STEP_SIZE, 1), round(current[1] + STEP_SIZE, 1)),
            (round(current[0] + STEP_SIZE, 1), round(current[1] - STEP_SIZE, 1)),
            (round(current[0] - STEP_SIZE, 1), round(current[1] - STEP_SIZE, 1))
        ]

        for neighbor in neighbors:
            if neighbor not in grid_weights:
                continue

            lat, lon = neighbor
            if check_land(lat, lon):
                continue

            tentative_g_score = g_score[current] + grid_weights[neighbor]

            if tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None


async def fetch_weather_data(session, lat, lon):
    """Fetch weather data from OpenWeatherMap API"""
    if not API_KEY:
        print("ERROR: OPENWEATHER_API_KEY not set in .env file")
        return None
    
    params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}
    
    try:
        async with session.get(BASE_URL, params=params) as response:
            if response.status == 200:
                return await response.json()
            else:
                print(f"API Error for ({lat}, {lon}): Status {response.status}")
                return None
    except Exception as e:
        print(f"Exception fetching weather for ({lat}, {lon}): {str(e)}")
        return None


async def get_path(lat1: float, lon1: float, lat2: float, lon2: float):
    """
    Calculate optimal maritime route using A* with live weather data
    
    Args:
        lat1, lon1: Start coordinates
        lat2, lon2: End coordinates
    
    Returns:
        dict: {"path": [[lat, lon], ...]} or {"error": "message"}
    """
    print(f"\n🌊 Calculating route from ({lat1}, {lon1}) to ({lat2}, {lon2})")
    print("⚠️  Using direct API calls - this may take several minutes...")
    
    grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2)
    print(f"📍 Generated {len(grid_points)} grid points")
    
    grid_weights = {}

    async with aiohttp.ClientSession() as session:
        print("🌤️  Fetching weather data...")
        tasks = [fetch_weather_data(session, row, col) for (row, col) in grid_points]
        results = await asyncio.gather(*tasks)

        for i, data in enumerate(results):
            if data:
                weather_data = parse_weather_data(data)
                grid_weight = calculate_grid_weight(weather_data)
                grid_weights[grid_points[i]] = grid_weight

        print(f"✅ Retrieved weather data for {len(grid_weights)} points")

        start_point = (round(lat1, 1), round(lon1, 1))
        end_point = (round(lat2, 1), round(lon2, 1))

        if start_point not in grid_weights or end_point not in grid_weights:
            return {"error": "Start or end point is missing from grid weights"}

        print("🔍 Running A* pathfinding algorithm...")
        path = a_star(start_point, end_point, grid_weights)
        
        if path:
            formatted_path = [[lat, lon] for lat, lon in path]
            print(f"✅ Route found with {len(formatted_path)} waypoints!")
            return {"path": formatted_path}
        else:
            return {"error": "No path found"}


# Example usage
if __name__ == "__main__":
    # Test route: Mumbai to Port of Jamnagar
    asyncio.run(get_path(18.93705, 72.92861, 22.48208, 69.80712))
