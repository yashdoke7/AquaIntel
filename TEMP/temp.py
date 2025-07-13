import aiohttp
import asyncio
import numpy as np
import heapq
from global_land_mask import globe

# Initialize global variables for the weather routing algorithm
def initialization():
    global api_key, base_url, weight_coefficients, max_values, step_size
    api_key = "c61b0711dbf0b47d2f609a668f701e3e"
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    step_size = 0.1  # Adjust step size as needed

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

# Generate grid points for A* pathfinding with buffer
def generate_grid_with_buffer(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer):
    lat1, lat2 = sorted([lat1, lat2])
    lon1, lon2 = sorted([lon1, lon2])

    grid_points = []
    for row in np.arange(lat1 - lat_buffer, lat2 + lat_buffer, step_size):
        for col in np.arange(lon1 - 1, lon_buffer + lon_buffer, step_size):
            grid_points.append((round(row, 1), round(col, 1)))

    return grid_points

# Determine if weather conditions are favorable
def parse_weather_data(condition):
    wind_speed = condition.get('wind', {}).get('speed', 0)
    visibility = condition.get('visibility', 10000)
    wind_gust = condition.get('wind', {}).get('gust', 0)
    temp = condition.get('main', {}).get('temp', 0)
    pressure = condition.get('main', {}).get('pressure', 0)
    humidity = condition.get('main', {}).get('humidity', 50)

    return {
        'wind_speed': wind_speed,
        'wind_gust': wind_gust,
        'temperature': temp,
        'visibility': visibility,
        'pressure': pressure,
        'humidity': humidity
    }

# Check if the given coordinates are on land
def check_land(lat, lon):
    return globe.is_land(lat, lon)

# Normalize values
def normalize(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value)

# Calculate grid weights based on weather conditions
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

# Heuristic function for A* algorithm
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

# A* pathfinding algorithm
def a_star(start, goal, grid_weights):
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

# Fetch weather data for grid points
async def fetch_weather_data(session, lat, lon):
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
    async with session.get(base_url, params=params) as response:
        if response.status == 200:
            return await response.json()
        else:
            print(f"Error retrieving data for point ({lat}, {lon}), Status code: {response.status}")
            return None

# Calculate the path based on weather data and A* algorithm
async def get_path(lat1: float, lon1: float, lat2: float, lon2: float, lat_buffer: int, lon_buffer: int):
    initialization()
    grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer)
    grid_weights = {}

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_weather_data(session, row, col) for (row, col) in grid_points]
        results = await asyncio.gather(*tasks)

        for i, data in enumerate(results):
            if data:
                weather_data = parse_weather_data(data)
                grid_weight = calculate_grid_weight(weather_data)
                grid_weights[grid_points[i]] = grid_weight

        start_point = (round(lat1, 1), round(lon1, 1))
        end_point = (round(lat2, 1), round(lon2, 1))

        # Ensure start and end points are present in the grid weights
        if start_point not in grid_weights or end_point not in grid_weights:
            return {"error": "Start or end point is missing from grid weights."}

        # Execute the A* algorithm to find the optimal path
        path = a_star(start_point, end_point, grid_weights)
        if path:
            # Format the path as JSON with (lat, lon) tuples
            formatted_path = [(lat, lon) for lat, lon in path]
            return {"path": formatted_path}
        else:
            lat_diff = lat1 - lat2
            lon_diff = lon1 - lon2
            if(lat_diff > lon_diff & lon_buffer < 8):
                lon_buffer += 1 
                get_path(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer)
            else:
                lat_buffer += 1
                get_path(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer)
            return {"error": "No path found"}

# Example usage
# asyncio.run(get_path(18.93705, 72.92861, 22.48208, 69.80712))
# lat1, lon1 = 18.93705, 72.92861
# lat2, lon2 = 22.48208, 69.80712




import aiohttp
import asyncio
import numpy as np
import heapq
from global_land_mask import globe

# Initialize global variables for the weather routing algorithm
def initialization():
    global api_key, base_url, weight_coefficients, max_values, step_size
    api_key = "c61b0711dbf0b47d2f609a668f701e3e"
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    step_size = 0.1  # Adjust step size as needed

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

# Generate grid points for A* pathfinding with buffer
def generate_grid_with_buffer(lat1, lon1, lat2, lon2):
    lat1, lat2 = sorted([lat1, lat2])
    lon1, lon2 = sorted([lon1, lon2])

    grid_points = []
    for row in np.arange(lat1 - 1, lat2 + 1.1, step_size):
        for col in np.arange(lon1 - 1, lon2 + 1.1, step_size):
            grid_points.append((round(row, 1), round(col, 1)))

    return grid_points

# Determine if weather conditions are favorable
def parse_weather_data(condition):
    wind_speed = condition.get('wind', {}).get('speed', 0)
    visibility = condition.get('visibility', 10000)
    wind_gust = condition.get('wind', {}).get('gust', 0)
    temp = condition.get('main', {}).get('temp', 0)
    pressure = condition.get('main', {}).get('pressure', 0)
    humidity = condition.get('main', {}).get('humidity', 50)

    return {
        'wind_speed': wind_speed,
        'wind_gust': wind_gust,
        'temperature': temp,
        'visibility': visibility,
        'pressure': pressure,
        'humidity': humidity
    }

# Check if the given coordinates are on land
def check_land(lat, lon):
    return globe.is_land(lat, lon)

# Normalize values
def normalize(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value)

# Calculate grid weights based on weather conditions
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

# Heuristic function for A* algorithm
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

# A* pathfinding algorithm
def a_star(start, goal, grid_weights):
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

# Fetch weather data for grid points
async def fetch_weather_data(session, lat, lon):
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
    async with session.get(base_url, params=params) as response:
        if response.status == 200:
            return await response.json()
        else:
            print(f"Error retrieving data for point ({lat}, {lon}), Status code: {response.status}")
            return None

# Calculate the path based on weather data and A* algorithm
async def get_path(lat1: float, lon1: float, lat2: float, lon2: float):
    initialization()
    grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2)
    grid_weights = {}

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_weather_data(session, row, col) for (row, col) in grid_points]
        results = await asyncio.gather(*tasks)

        for i, data in enumerate(results):
            if data:
                weather_data = parse_weather_data(data)
                grid_weight = calculate_grid_weight(weather_data)
                grid_weights[grid_points[i]] = grid_weight

        start_point = (round(lat1, 1), round(lon1, 1))
        end_point = (round(lat2, 1), round(lon2, 1))

        # Ensure start and end points are present in the grid weights
        if start_point not in grid_weights or end_point not in grid_weights:
            return {"error": "Start or end point is missing from grid weights."}

        # Execute the A* algorithm to find the optimal path
        path = a_star(start_point, end_point, grid_weights)
        if path:
            # Format the path as JSON with (lat, lon) tuples
            formatted_path = [(lat, lon) for lat, lon in path]
            return {"path": formatted_path}
        else:
            return {"error": "No path found"}

# Example usage
# asyncio.run(get_path(18.93705, 72.92861, 22.48208, 69.80712))
# lat1, lon1 = 18.93705, 72.92861
# lat2, lon2 = 22.48208, 69.80712



import aiohttp
import asyncio
import numpy as np
import heapq
from global_land_mask import globe

# Initialize global variables for the weather routing algorithm
def initialization():
    global api_key, base_url, weight_coefficients, max_values, step_size
    api_key = "c61b0711dbf0b47d2f609a668f701e3e"
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    step_size = 0.1  # Adjust step size as needed

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

# Generate grid points for A* pathfinding with buffer
def generate_grid_with_buffer(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer):
    lat1, lat2 = sorted([lat1, lat2])
    lon1, lon2 = sorted([lon1, lon2])

    grid_points = []
    for row in np.arange(lat1 - lat_buffer, lat2 + lat_buffer, step_size):
        for col in np.arange(lon1 - lon_buffer, lon2 + lon_buffer, step_size):
            grid_points.append((round(row, 1), round(col, 1)))

    return grid_points

# Determine if weather conditions are favorable
def parse_weather_data(condition):
    wind_speed = condition.get('wind', {}).get('speed', 0)
    visibility = condition.get('visibility', 10000)
    wind_gust = condition.get('wind', {}).get('gust', 0)
    temp = condition.get('main', {}).get('temp', 0)
    pressure = condition.get('main', {}).get('pressure', 0)
    humidity = condition.get('main', {}).get('humidity', 50)

    return {
        'wind_speed': wind_speed,
        'wind_gust': wind_gust,
        'temperature': temp,
        'visibility': visibility,
        'pressure': pressure,
        'humidity': humidity
    }

# Check if the given coordinates are on land
def check_land(lat, lon):
    return globe.is_land(lat, lon)

# Normalize values
def normalize(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value)

# Calculate grid weights based on weather conditions
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

# Heuristic function for A* algorithm
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

# A* pathfinding algorithm
def a_star(start, goal, grid_weights):
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

# Fetch weather data for grid points
async def fetch_weather_data(session, lat, lon):
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
    async with session.get(base_url, params=params) as response:
        if response.status == 200:
            return await response.json()
        else:
            print(f"Error retrieving data for point ({lat}, {lon}), Status code: {response.status}")
            return None

# Calculate the path based on weather data and A* algorithm
async def get_path(lat1: float, lon1: float, lat2: float, lon2: float):
    initialization()
    lat_buffer = 1
    lon_buffer = 1
    while(True):
        grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2, lat_buffer, lon_buffer)
        grid_weights = {}
        async with aiohttp.ClientSession() as session:
            tasks = [fetch_weather_data(session, row, col) for (row, col) in grid_points]
            results = await asyncio.gather(*tasks)

            for i, data in enumerate(results):
                if data:
                    weather_data = parse_weather_data(data)
                    grid_weight = calculate_grid_weight(weather_data)
                    grid_weights[grid_points[i]] = grid_weight

            start_point = (round(lat1, 1), round(lon1, 1))
            end_point = (round(lat2, 1), round(lon2, 1))

            # Ensure start and end points are present in the grid weights
            if start_point not in grid_weights or end_point not in grid_weights:
                return {"error": "Start or end point is missing from grid weights."}

            # Execute the A* algorithm to find the optimal path
            path = a_star(start_point, end_point, grid_weights)

            if path:
                # Format the path as JSON with (lat, lon) tuples
                formatted_path = [(lat, lon) for lat, lon in path]
                return {"path": formatted_path}
            else:
                lat_diff = abs(lat1 - lat2)
                lon_diff = abs(lon1 - lon2)
                if((lat_diff > lon_diff) & (lon_buffer < 8)):
                    lon_buffer = lon_buffer + 1
                elif((lon_diff > lat_diff) & (lat_buffer < 8)):
                    lat_buffer = lat_buffer + 1
                else:
                    return {"error": "No path found"}