from datetime import datetime

# Initialize global variables for the weather routing algorithm
def initialization():
    global api_key, base_url, weight_coefficients, max_values, step_size
    api_key = "7bca9eec76f3a30530ab2c217ea25926"
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    step_size = 0.1

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

# Fetch weather data for grid points
async def fetch_weather_data(session, lat, lon):
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
    async with session.get(base_url, params=params) as response:
        if response.status == 200:
            return await response.json()
        else:
            print(f"Error retrieving data for point ({lat}, {lon}), Status code: {response.status}")
            return None

# Return grid weight by performing all the functions
async def get_grid_weight(session, lat, lon):
    initialization()

    data = await fetch_weather_data(session, lat, lon)
    if data:
        weather_data = parse_weather_data(data)
        grid_weight = calculate_grid_weight(weather_data)
        return float(lat), float(lon), grid_weight, datetime.now()
    return lat, lon, None