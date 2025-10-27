from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
from astar_weather import get_path

app = FastAPI(
    title="AquaIntel API",
    description="Maritime route optimization with A* pathfinding and weather data",
    version="1.0.0"
)

# CORS - Already good, but let's be more specific for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",      # Vite dev server
        "http://localhost:5173",      # Alternative Vite port
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
        "*"  # Remove this in production, keep only your domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic Models
class Coordinate(BaseModel):
    lat: float
    lon: float

class RouteRequest(BaseModel):
    start_latitude: float
    start_longitude: float
    end_latitude: float
    end_longitude: float

class RouteResponse(BaseModel):
    path: List[List[float]]  # List of [lat, lon] pairs
    distance: Optional[float] = None
    estimatedTime: Optional[float] = None
    message: Optional[str] = None

# Serve old static HTML (keep for reference)
@app.get("/", response_class=HTMLResponse)
def serve_map_ui():
    with open("static/index.html", "r") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "AquaIntel API is running",
        "version": "1.0.0"
    }

# Main route calculation endpoint (keep old one for backwards compatibility)
@app.post("/calculate-route")
async def calculate_route_old(route_request: RouteRequest):
    """Legacy endpoint - kept for backwards compatibility"""
    start_lat = route_request.start_latitude
    start_lng = route_request.start_longitude
    end_lat = route_request.end_latitude
    end_lng = route_request.end_longitude

    path = await get_path(start_lat, start_lng, end_lat, end_lng)
    return {"path": path}

# NEW API endpoint with better structure
@app.post("/api/route/calculate", response_model=RouteResponse)
async def calculate_route(route_request: RouteRequest):
    """
    Calculate optimal maritime route using A* algorithm with weather weights
    
    Returns path as list of [lat, lon] coordinate pairs
    """
    try:
        start_lat = route_request.start_latitude
        start_lng = route_request.start_longitude
        end_lat = route_request.end_latitude
        end_lng = route_request.end_longitude

        # Validate coordinates
        if not (-90 <= start_lat <= 90) or not (-180 <= start_lng <= 180):
            raise HTTPException(status_code=400, detail="Invalid start coordinates")
        if not (-90 <= end_lat <= 90) or not (-180 <= end_lng <= 180):
            raise HTTPException(status_code=400, detail="Invalid end coordinates")

        # Call A* pathfinding
        result = await get_path(start_lat, start_lng, end_lat, end_lng)

        # Check for errors
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # Format path
        path = result.get("path", [])
        
        if not path:
            raise HTTPException(status_code=404, detail="No path found")

        # Calculate distance (rough estimate using Haversine)
        distance = calculate_total_distance(path)
        estimated_time = estimate_travel_time(distance)

        return RouteResponse(
            path=path,
            distance=distance,
            estimatedTime=estimated_time,
            message="Route calculated successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Helper functions
def calculate_total_distance(path: List[List[float]]) -> float:
    """Calculate total distance in kilometers using Haversine formula"""
    import math
    
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat/2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlon/2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
    total = 0
    for i in range(len(path) - 1):
        total += haversine(path[i][0], path[i][1], path[i+1][0], path[i+1][1])
    return round(total, 2)

def estimate_travel_time(distance_km: float, speed_knots: float = 15) -> float:
    """Estimate travel time in hours"""
    speed_kmh = speed_knots * 1.852  # Convert knots to km/h
    return round(distance_km / speed_kmh, 2)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)