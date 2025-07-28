from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from astar_weather import get_path
# from apscheduler.schedulers.blocking import BlockingScheduler
# from store_update_weather import update_weather_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# # Create scheduler to run the task every hour
# scheduler = BlockingScheduler()
# scheduler.add_job(update_weather_data, 'interval', hours=1)  # Update every 1 hour

# scheduler.start()

class RouteRequest(BaseModel):
    start_latitude: float
    start_longitude: float
    end_latitude: float
    end_longitude: float

@app.get("/", response_class=HTMLResponse)
def serve_map_ui():
    with open("static/index.html", "r") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

@app.post("/calculate-route")
async def calculate_route(route_request: RouteRequest):
    start_lat = route_request.start_latitude
    start_lng = route_request.start_longitude
    end_lat = route_request.end_latitude
    end_lng = route_request.end_longitude

    # Call get_path to calculate the route based on input coordinates
    path = await get_path(start_lat, start_lng, end_lat, end_lng)

    # Ensure response includes 'path' as a JSON-serializable list
    return {"path": path}