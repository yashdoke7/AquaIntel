import aiohttp
import asyncio
import numpy as np
import heapq
from global_land_mask import globe
import time
import mysql.connector

api_key = "7bca9eec76f3a30530ab2c217ea25926"
base_url = "https://api.openweathermap.org/data/2.5/weather"

global result, step_size
step_size = 0.1

# lat1, lon1 = 18.882290, 72.861017
# lat2, lon2 = 25.407605, 55.313228

lat1, lon1 = 18.93705, 72.92861
lat2, lon2 = 22.48208, 69.80712


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

def generate_grid_with_buffer(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer):
    lat1, lat2 = sorted([lat1, lat2])
    lon1, lon2 = sorted([lon1, lon2])

    grid_points = []

    for row in np.arange(lat1 - lat_buffer, lat2 + lat_buffer, step_size):
        for col in np.arange(lon1 - lon_buffer, lon2 + lon_buffer, step_size):
            grid_points.append((round(row, 1), round(col, 1)))

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
    lat_buffer = 1
    lon_buffer = 1
    while(True):
        start_time = time.time()
        grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer)
        end_time = time.time()
        print(f"grid generation time: {end_time - start_time:.6f} seconds")
        print(len(grid_points))
        grid_weights = {}

        async with aiohttp.ClientSession() as session:
            tasks = []
            start_time = time.time()
            
            for (row, col) in grid_points:
                tasks.append(fetch_weather_data(session, row, col))
            results = await asyncio.gather(*tasks)

            end_time = time.time()
            print(f"time to fetch weather data: {end_time - start_time:.6f} seconds")

            start_time = time.time()
            for i, data in enumerate(results):
                if data:
                    grid_weather_data = is_favorable(data)
                    grid_weight = calculate_grid_weight(grid_weather_data)
                    grid_weights[grid_points[i]] = grid_weight
                    # print(f"Grid point: {grid_points[i]}, Weight: {grid_weight}")
            end_time = time.time()
            print(f"time to calculate weather data: {end_time - start_time:.6f} seconds")

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
                    lat_diff = abs(lat1 - lat2)
                    lon_diff = abs(lon1 - lon2)
                    if((lat_diff > lon_diff) & (lon_buffer < 8)):
                        print("Incrementing lon_buffer")
                        lon_buffer = lon_buffer + 1
                    elif((lon_diff > lat_diff) & (lat_buffer < 8)):
                        print("Implementing lat_buffer")
                        lat_buffer = lat_buffer + 1
                    else:
                        break
    return {"error": "No path found"}

asyncio.run(main())