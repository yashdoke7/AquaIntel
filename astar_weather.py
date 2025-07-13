import numpy as np
import heapq
from global_land_mask import globe
import mysql.connector

global step_size
step_size = 0.1

# Generate grid with buffer to perform A* Algorithm
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

# Check if the given coordinates are on land
def check_land(lat, lon):
    return globe.is_land(lat, lon)

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

# Connect Database
def connect_db():
    return mysql.connector.connect(
        database="AquaIntel",
        user="root",
        password="password",
        host="127.0.0.1",
        port=3306
    )

# Calculate the path based on weather data and A* algorithm
async def get_path(lat1: float, lon1: float, lat2: float, lon2: float):
    grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2)
    grid_weights = {}

    conn = connect_db()
    cursor = conn.cursor()

    length = len(grid_points)

    grid_latitude1, grid_longitude1 = grid_points[0]
    grid_latitude2, grid_longitude2 = grid_points[length - 1]

    cursor.execute("""
        SELECT weight FROM weather_data 
        WHERE ROUND(latitude,1) BETWEEN %s AND %s
        AND ROUND(longitude,1) BETWEEN %s AND %s;
    """, (grid_latitude1, grid_latitude2, grid_longitude1, grid_longitude2))

    results = cursor.fetchall()
    results = [x[0] for x in results]

    for i, data in enumerate(results):
        if data:
            grid_weights[grid_points[i]] = data

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