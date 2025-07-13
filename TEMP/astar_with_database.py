import asyncio
import numpy as np
import heapq
from global_land_mask import globe
import time
import mysql.connector

api_key = "c61b0711dbf0b47d2f609a668f701e3e"
base_url = "https://api.openweathermap.org/data/2.5/weather"

global result, step_size
step_size = 0.1

# lat1, lon1 = 18.882290, 72.861017
# lat2, lon2 = 25.407605, 55.313228

lat1, lon1 = 18.93705, 72.92861
lat2, lon2 = 22.48208, 69.80712

# lat1, lon1 = 21.6, 68.14
# lat2, lon2 = 15.53, 72.03

# lat1, lon1 = -90.0, -179.6
# lat2, lon2 = -90.0, -163.0

weight_coefficients = {
    'wind_speed': 0.25,
    'wind_gust': 0.2,
    'temperature': 0.1,
    'visibility': 0.1,
    'pressure': 0.1,
    'humidity': 0.1
}

max_values = {
    'wind_speed': 15,
    'wind_gust': 20,
    'visibility': 10000
}

def generate_grid_with_buffer(lat1, lon1, lat2, lon2):
    lat1, lat2 = sorted([lat1, lat2])
    lon1, lon2 = sorted([lon1, lon2])

    grid_points = []

    for row in np.arange(lat1 - 1, lat2 + 1.1, step_size):
        for col in np.arange(lon1 - 1, lon2 + 1.1, step_size):
            row = round(row,1)
            col = round(col,1)
            if((row >= -90 and row <= 90) and (col >= -180 and col <= 180)):
                grid_points.append((row, col))

    return grid_points


def is_favorable(condition):
    wind_speed = condition.get('wind', {}).get('speed', 0)
    visibility = condition.get('visibility', 10000)
    wind_gust = condition.get('wind', {}).get('gust', 0)
    temp = condition.get('main', {}).get('temp', 0)
    pressure = condition.get('main', {}).get('pressure', 0)
    humidity = condition.get('main', {}).get('humidity', 50)

    grid_weather_data = {
        'wind_speed': wind_speed,
        'wind_gust': wind_gust,
        'temperature': temp,
        'visibility': visibility,
        'pressure': pressure,
        'humidity': humidity
    }
    return grid_weather_data


def check_land(lat, lon):
    return globe.is_land(lat, lon)


def normalize(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value)


def calculate_grid_weight(weather_data):
    norm_wind_speed = normalize(weather_data['wind_speed'], 0, max_values['wind_speed'])
    norm_wind_gust = normalize(weather_data['wind_gust'], 0, max_values['wind_gust'])
    norm_temperature = normalize(weather_data['temperature'], -30, 50)
    norm_visibility = normalize(weather_data['visibility'], 0, max_values['visibility'])
    norm_pressure = normalize(weather_data['pressure'], 950, 1050)
    norm_humidity = normalize(weather_data['humidity'], 0, 100)

    total_weight = (
            weight_coefficients['wind_speed'] * norm_wind_speed +
            weight_coefficients['wind_gust'] * norm_wind_gust +
            weight_coefficients['temperature'] * norm_temperature +
            weight_coefficients['visibility'] * (1 - norm_visibility) +
            weight_coefficients['pressure'] * norm_pressure +
            weight_coefficients['humidity'] * norm_humidity
    ) 

    return total_weight


def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def a_star(start, goal, grid_weights):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {point: float('inf') for point in grid_weights}
    g_score[start] = 0
    f_score = {point: float('inf') for point in grid_weights}
    f_score[start] = heuristic(start, goal)
    step_size = 0.1

    while open_set:
        current = heapq.heappop(open_set)[1]

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        neighbors = [
            (round(current[0] + step_size, 1), round(current[1], 1)),
            (round(current[0] - step_size, 1), round(current[1], 1)),
            (round(current[0], 1), round(current[1] + step_size, 1)),
            (round(current[0], 1), round(current[1] - step_size, 1)),
            (round(current[0] + step_size, 1), round(current[1] + step_size, 1)),
            (round(current[0] - step_size, 1), round(current[1] + step_size, 1)),
            (round(current[0] + step_size, 1), round(current[1] - step_size, 1)),
            (round(current[0] - step_size, 1), round(current[1] - step_size, 1))
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
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
    async with session.get(base_url, params = params) as response:
        if response.status == 200:
            return await response.json()
        else:
            print(f"Error retrieving data for point ({lat}, {lon})")
            print(response.status)
            return None

def connect_db():
    return mysql.connector.connect(
        database="AquaIntel",
        user="root",
        password="password",
        host="127.0.0.1",
        port=3306
    )

async def main():
    conn = connect_db()
    cursor = conn.cursor()

    start_time = time.time()
    grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2)
    end_time = time.time()

    length = len(grid_points)

    grid_latitude1, grid_longitude1 = grid_points[0]
    grid_latitude2, grid_longitude2 = grid_points[length - 1]

    print(f"grid generation time: {end_time - start_time:.6f} seconds")
    print(len(grid_points))
    grid_weights = {}

    start_time = time.time()
    cursor.execute("""
        SELECT weight FROM weather_data 
        WHERE ROUND(latitude,1) BETWEEN %s AND %s
        AND ROUND(longitude,1) BETWEEN %s AND %s;
        """, (grid_latitude1, grid_latitude2, grid_longitude1, grid_longitude2))
    results = cursor.fetchall()
    end_time = time.time()

    results = [x[0] for x in results]

    print(f"time to fetch weather data: {end_time - start_time:.6f} seconds")

    start_time = time.time()
    for i, data in enumerate(results):
        if data:
            grid_weights[grid_points[i]] = data
            # print(f"Grid point: {grid_points[i]}, Weight: {data}")
    end_time = time.time()

    print(f"time to integrate weather data grids: {end_time - start_time:.6f} seconds")

    # Ensure start and end points are in the grid weights
    start_point = (round(lat1, 1), round(lon1, 1))
    end_point = (round(lat2, 1), round(lon2, 1))

    if start_point not in grid_weights or end_point not in grid_weights:
        print("Start or end point is missing from grid weights.")
        print(start_point, end_point)
        return
    else:
        start_time = time.time()
        path = a_star(start_point, end_point, grid_weights)
        end_time = time.time()

        print(f"time for a star: {end_time - start_time:.6f} seconds")

        if path:
            print("Path found:")
            for step in path:
                formatted_string = ", ".join(str(value) for value in step)
                print(f"[{formatted_string}],")
            return
        else:
            print("No Path Found")

asyncio.run(main())