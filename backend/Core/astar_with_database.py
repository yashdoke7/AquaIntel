"""
A* Pathfinding Test Script with Database
Standalone script for testing database-based route calculations
Faster than API version - uses pre-stored weather data
"""

import asyncio
import numpy as np
import heapq
from global_land_mask import globe
import time
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
STEP_SIZE = 0.1

# Test routes
TEST_ROUTES = {
    "Mumbai to Jamnagar": {
        "start": (18.93705, 72.92861),
        "end": (22.48208, 69.80712)
    },
    "Mumbai to Dubai": {
        "start": (18.882290, 72.861017),
        "end": (25.407605, 55.313228)
    },
    "Short Test Route": {
        "start": (21.6, 68.14),
        "end": (15.53, 72.03)
    }
}


def generate_grid_with_buffer(lat1, lon1, lat2, lon2):
    """Generate grid points with buffer"""
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


def check_land(lat, lon):
    """Check if point is on land"""
    return globe.is_land(lat, lon)


def heuristic(a, b):
    """Manhattan distance heuristic"""
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


def connect_db():
    """Connect to MySQL database"""
    return mysql.connector.connect(
        database=os.getenv("MYSQL_DATABASE", "AquaIntel"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "password"),
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", "3306"))
    )


async def calculate_route(lat1, lon1, lat2, lon2):
    """Calculate route using database weather data"""
    print(f"\n{'='*70}")
    print(f"🌊 ROUTE CALCULATION (DATABASE): ({lat1}, {lon1}) → ({lat2}, {lon2})")
    print(f"{'='*70}\n")
    
    total_start = time.time()

    # Connect to database
    conn = connect_db()
    cursor = conn.cursor()

    # Generate grid
    start_time = time.time()
    grid_points = generate_grid_with_buffer(lat1, lon1, lat2, lon2)
    grid_time = time.time() - start_time

    length = len(grid_points)
    grid_latitude1, grid_longitude1 = grid_points[0]
    grid_latitude2, grid_longitude2 = grid_points[length - 1]

    print(f"📍 Grid Generation: {grid_time:.4f}s | Points: {length}")

    # Fetch from database
    start_time = time.time()
    cursor.execute("""
        SELECT weight FROM weather_data 
        WHERE ROUND(latitude,1) BETWEEN %s AND %s
        AND ROUND(longitude,1) BETWEEN %s AND %s;
    """, (grid_latitude1, grid_latitude2, grid_longitude1, grid_longitude2))
    results = cursor.fetchall()
    fetch_time = time.time() - start_time

    results = [x[0] for x in results]
    print(f"💾 Database Fetch: {fetch_time:.4f}s | Records: {len(results)}")

    # Build grid weights
    start_time = time.time()
    grid_weights = {}
    for i, data in enumerate(results):
        if data and i < len(grid_points):
            grid_weights[grid_points[i]] = data
    integrate_time = time.time() - start_time
    print(f"⚖️  Weight Integration: {integrate_time:.4f}s | Valid: {len(grid_weights)}")

    # Run A*
    start_point = (round(lat1, 1), round(lon1, 1))
    end_point = (round(lat2, 1), round(lon2, 1))

    if start_point not in grid_weights or end_point not in grid_weights:
        print("❌ ERROR: Start or end point missing from grid weights")
        cursor.close()
        conn.close()
        return None

    start_time = time.time()
    path = a_star(start_point, end_point, grid_weights)
    astar_time = time.time() - start_time

    cursor.close()
    conn.close()

    total_time = time.time() - total_start

    print(f"🔍 A* Pathfinding: {astar_time:.4f}s")
    print(f"\n{'='*70}")
    print(f"⏱️  TOTAL TIME: {total_time:.4f}s")
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
    print("\n🚢 AquaIntel A* Database Pathfinding Test Suite")
    print("="*70)
    
    # Run first test route
    route_name, coords = list(TEST_ROUTES.items())[0]
    lat1, lon1 = coords["start"]
    lat2, lon2 = coords["end"]
    
    print(f"\nRunning test: {route_name}")
    await calculate_route(lat1, lon1, lat2, lon2)


if __name__ == "__main__":
    asyncio.run(main())
