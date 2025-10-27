"""
A* Pathfinding Test Script with API Calls
Standalone script for testing and benchmarking route calculations
Includes timing metrics and detailed logging
"""

import aiohttp
import asyncio
import numpy as np
import heapq
from global_land_mask import globe
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
STEP_SIZE = 0.1

# Test coordinates
TEST_ROUTES = {
    "Mumbai to Jamnagar": {
        "start": (18.93705, 72.92861),
        "end": (22.48208, 69.80712)
    },
    "Mumbai to Dubai": {
        "start": (18.882290, 72.861017),
        "end": (25.407605, 55.313228)
    },
    "Short Route": {
        "start": (21.6, 68.14),
        "end": (15.53, 72.03)
    }
}

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


def generate_grid_with_buffer(lat1, lon1, lat2, lon2, lat_buffer=1, lon_buffer=1):
    """Generate grid with configurable buffer"""
    lat1, lat2 = sorted([lat1, lat2])
    lon1, lon2 = sorted([lon1, lon2])

    grid_points = []
    for row in np.arange(lat1 - lat_buffer, lat2 + lon_buffer + 0.1, STEP_SIZE):
        for col in np.arange(lon1 - lon_buffer, lon2 + lon_buffer + 0.1, STEP_SIZE):
            grid_points.append((round(row, 1), round(col, 1)))

    return grid_points


def parse_weather_data(condition):
    """Extract weather parameters"""
    return {
        'wind_speed': condition.get('wind', {}).get('speed', 0),
        'wind_gust': condition.get('wind', {}).get('gust', 0),
        'temperature': condition.get('main', {}).get('temp', 0),
        'visibility': condition.get('visibility', 10000),
        'pressure': condition.get('main', {}).get('pressure', 1013),
        'humidity': condition.get('main', {}).get('humidity', 50)
    }


def check_land(lat, lon):
    """Check if point is on land"""
    return globe.is_land(lat, lon)


def normalize(value, min_value, max_value):
    """Normalize to 0-1 range"""
    if max_value == min_value:
        return 0
    return (value - min_value) / (max_value - min_value)


def calculate_grid_weight(weather_data):
    """Calculate weight from weather conditions"""
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

    return max(total_weight, 0.1)


def heuristic(a, b):
    """Manhattan distance"""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def a_star(start, goal, grid_weights):
    """A* pathfinding"""
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
    """Fetch weather from API"""
    params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}
    try:
        async with session.get(BASE_URL, params=params) as response:
            if response.status == 200:
                return await response.json()
            return None
    except:
        return None


async def calculate_route(lat1, lon1, lat2, lon2):
    """Calculate route with detailed timing"""
    print(f"\n{'='*70}")
    print(f"🌊 ROUTE CALCULATION: ({lat1}, {lon1}) → ({lat2}, {lon2})")
    print(f"{'='*70}\n")
    
    total_start = time.time()

    # Generate grid
    start_time = time.time()
    grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2)
    grid_time = time.time() - start_time
    print(f"📍 Grid Generation: {grid_time:.4f}s | Points: {len(grid_points)}")

    # Fetch weather
    grid_weights = {}
    start_time = time.time()
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_weather_data(session, row, col) for (row, col) in grid_points]
        results = await asyncio.gather(*tasks)
    
    fetch_time = time.time() - start_time
    print(f"🌤️  Weather Fetch: {fetch_time:.4f}s")

    # Calculate weights
    start_time = time.time()
    for i, data in enumerate(results):
        if data:
            weather_data = parse_weather_data(data)
            grid_weight = calculate_grid_weight(weather_data)
            grid_weights[grid_points[i]] = grid_weight
    calc_time = time.time() - start_time
    print(f"⚖️  Weight Calculation: {calc_time:.4f}s | Valid points: {len(grid_weights)}")

    # Run A*
    start_point = (round(lat1, 1), round(lon1, 1))
    end_point = (round(lat2, 1), round(lon2, 1))

    if start_point not in grid_weights or end_point not in grid_weights:
        print("❌ ERROR: Start or end point missing from grid weights")
        return None

    start_time = time.time()
    path = a_star(start_point, end_point, grid_weights)
    astar_time = time.time() - start_time
    
    total_time = time.time() - total_start

    print(f"🔍 A* Pathfinding: {astar_time:.4f}s")
    print(f"\n{'='*70}")
    print(f"⏱️  TOTAL TIME: {total_time:.4f}s ({total_time/60:.2f} minutes)")
    print(f"{'='*70}\n")

    if path:
        print(f"✅ Path found with {len(path)} waypoints!\n")
        print("First 5 waypoints:")
        for step in path[:5]:
            print(f"  [{step[0]}, {step[1]}]")
        if len(path) > 5:
            print(f"  ... and {len(path) - 5} more waypoints")
        return path
    else:
        print("❌ No path found\n")
        return None


async def main():
    """Run test routes"""
    print("\n🚢 AquaIntel A* Pathfinding Test Suite")
    print("="*70)
    
    # Select test route
    print("\nAvailable test routes:")
    for i, (name, coords) in enumerate(TEST_ROUTES.items(), 1):
        print(f"{i}. {name}")
    
    # Run first test route by default
    route_name, coords = list(TEST_ROUTES.items())[0]
    lat1, lon1 = coords["start"]
    lat2, lon2 = coords["end"]
    
    print(f"\nRunning test: {route_name}")
    await calculate_route(lat1, lon1, lat2, lon2)


if __name__ == "__main__":
    asyncio.run(main())
