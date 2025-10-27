from fetch_weather import get_grid_weight
import numpy as np
import aiomysql
import asyncio
import aiohttp
import time

# Reduce concurrent operations
semaphore = asyncio.Semaphore(50)  # Increased from 10 for better throughput
BATCH_SIZE = 5000  # Process in batches of 1000

async def create_pool():
    return await aiomysql.create_pool(
        db="AquaIntel",
        user="root",
        password="password",
        host="127.0.0.1",
        minsize=5,
        maxsize=20
    )

async def store_weather_data_batch(pool, data_batch):
    """Store a batch of weather data"""
    if not data_batch:
        return
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            query = """
                INSERT INTO weather_data (latitude, longitude, weight, last_updated)
                VALUES (%s, %s, %s, %s) AS new_data
                ON DUPLICATE KEY UPDATE 
                weight = new_data.weight, last_updated = new_data.last_updated;
            """
            
            # Prepare data for executemany
            formatted_data = []
            for result in data_batch:
                if result:
                    try:
                        # Try object attributes first
                        if hasattr(result, 'lat'):
                            formatted_data.append((
                                result.lat,
                                result.lon, 
                                result.weight,
                                result.last_updated
                            ))
                        # Try tuple/list format
                        elif isinstance(result, (tuple, list)) and len(result) >= 4:
                            formatted_data.append((
                                result[0],  # lat
                                result[1],  # lon
                                result[2],  # weight
                                result[3]   # last_updated
                            ))
                        # Try dictionary format
                        elif isinstance(result, dict):
                            formatted_data.append((
                                result.get('lat') or result.get('latitude'),
                                result.get('lon') or result.get('longitude'),
                                result.get('weight'),
                                result.get('last_updated')
                            ))
                        else:
                            print(f"Unknown result format: {type(result)}, {result}")
                    except Exception as e:
                        print(f"Error processing result {result}: {e}")
            
            if formatted_data:
                await cursor.executemany(query, formatted_data)
                await conn.commit()
                print(f"Stored batch of {len(formatted_data)} records")

async def process_coordinate_batch(session, pool, coordinates):
    """Process a batch of coordinates"""
    async with semaphore:
        # Get weather data for this batch
        tasks = []
        for lat, lon in coordinates:
            tasks.append(get_grid_weight(session, lat, lon))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and None results
        valid_results = [r for r in results if r is not None and not isinstance(r, Exception)]
        
        # Store in database
        await store_weather_data_batch(pool, valid_results)

async def update_weather_data_chunked(pool, session):
    """Update weather data in chunks to avoid memory issues"""
    
    # Generate coordinate pairs in batches
    coordinate_batches = []
    current_batch = []
    
    for lat in np.arange(-90.0, 90.0 + 0.1, 0.1):
        for lon in np.arange(-180.0, 180.1, 0.1):
            current_batch.append((round(lat, 1), round(lon, 1)))
            
            if len(current_batch) >= BATCH_SIZE:
                coordinate_batches.append(current_batch)
                current_batch = []
    
    # Don't forget the last batch
    if current_batch:
        coordinate_batches.append(current_batch)
    
    print(f"Processing {len(coordinate_batches)} batches of {BATCH_SIZE} coordinates each")
    
    # Process batches sequentially to control memory usage
    for i, batch in enumerate(coordinate_batches):
        print(f"Processing batch {i+1}/{len(coordinate_batches)}")
        await process_coordinate_batch(session, pool, batch)

async def main():
    pool = await create_pool()
    start_time = time.time()

    async with aiohttp.ClientSession(
        connector=aiohttp.TCPConnector(limit=100),  # Limit connections
        timeout=aiohttp.ClientTimeout(total=30)      # Add timeout
    ) as session:
        await update_weather_data_chunked(pool, session)

    pool.close()
    await pool.wait_closed()
    
    end_time = time.time()
    print(f"Total processing time: {end_time - start_time:.2f} seconds")

# Alternative: Process by geographic regions
async def update_weather_data_by_region(pool, session):
    """Process data by geographic regions to further reduce memory usage"""
    
    # Define regions (lat_min, lat_max, lon_min, lon_max)
    regions = [
        (-90, -45, -180, 180),   # Antarctic
        (-45, 0, -180, 180),     # Southern hemisphere
        (0, 45, -180, 180),      # Northern hemisphere
        (45, 90, -180, 180),     # Arctic
    ]
    
    for region_idx, (lat_min, lat_max, lon_min, lon_max) in enumerate(regions):
        print(f"Processing region {region_idx + 1}/{len(regions)}")
        
        current_batch = []
        for lat in np.arange(lat_min, lat_max + 0.1, 0.1):
            for lon in np.arange(lon_min, lon_max + 0.1, 0.1):
                current_batch.append((round(lat, 1), round(lon, 1)))
                
                if len(current_batch) >= BATCH_SIZE:
                    await process_coordinate_batch(session, pool, current_batch)
                    current_batch = []
        
        # Process remaining coordinates in this region
        if current_batch:
            await process_coordinate_batch(session, pool, current_batch)

if __name__ == "__main__":
    asyncio.run(main())


# # Create scheduler to run the task every hour
# scheduler = BlockingScheduler()
# scheduler.add_job(update_weather_data, 'interval', hours=0.5)  # Update every 30 mins

# scheduler.start()