from fetch_weather import get_grid_weight
import numpy as np
import aiomysql
import asyncio
import aiohttp
import time

semaphore = asyncio.Semaphore(10)

async def create_pool():
    return await aiomysql.create_pool(
        db="AquaIntel",
        user="root",
        password="password",
        host="127.0.0.1",
        minsize=5,
        maxsize=20
    )

async def store_weather_data(pool, data):
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            query = """
                INSERT INTO weather_data (latitude, longitude, weight, last_updated)
                VALUES (%s, %s, %s, %s) AS new_data
                ON DUPLICATE KEY UPDATE 
                weight = new_data.weight, last_updated = new_data.last_updated;
            """
            await cursor.executemany(query, data)

            # print("Value Input/Updated In Database for ", lat, lon, " weight = ", weight)

        await conn.commit()

        await cursor.close()
        conn.close()


async def update_weather_data(pool, session, region):
    async with semaphore:
        lat_start = region[0]
        lat_end = region[1]

        tasks = []

        for lat in np.arange(lat_start, lat_end + 0.1, 0.1):
            for lon in np.arange(-180.0, 180.1, 0.1):
                tasks.append(get_grid_weight(session, round(lat,1), round(lon,1)))

        results = await asyncio.gather(*tasks)

        await store_weather_data(pool, results)

async def main():
        pool = await create_pool()
        regions = []

        lat_start = -86.0
        lat_end = -84.0
        lat_interval = 1.0

        start_time = time.time()

        for lat in np.arange(lat_start, lat_end + 0.1, lat_interval):
            regions.append((lat, lat + lat_interval))

        async with aiohttp.ClientSession() as session:
            tasks = [update_weather_data(pool, session, region) for region in regions]
            await asyncio.gather(*tasks)

        end_time = time.time()
        print(f"time to update in database time: {end_time - start_time:.6f} seconds")

asyncio.run(main())

# # Create scheduler to run the task every hour
# scheduler = BlockingScheduler()
# scheduler.add_job(update_weather_data, 'interval', hours=1)  # Update every 1 hour

# scheduler.start()
