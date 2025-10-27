import { useState } from "react";
import Header from "@/components/Header";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteForm from "@/components/RouteForm";
import RouteMetadata from "@/components/RouteMetadata";
import RecentRoutes from "@/components/RecentRoutes";
import WeatherInfo from "@/components/WeatherInfo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api, APIError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [startPoint, setStartPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [routeMetadata, setRouteMetadata] = useState<{
    distance?: number;
    estimatedTime?: number;
  }>({});

  const handleStartPointSet = (lat: number, lon: number) => {
    setStartPoint({ lat, lon });
    toast.success("Start point set");
  };

  const handleEndPointSet = (lat: number, lon: number) => {
    setEndPoint({ lat, lon });
    toast.success("End point set. Click Calculate Route to proceed.");
  };

  const handleCalculateRoute = async () => {
    if (!startPoint || !endPoint) {
      toast.error("Please set both start and end points on the map");
      return;
    }

    setIsCalculating(true);
    toast.info("Calculating optimal route...");

    try {
      const response = await api.calculateRoute(
        startPoint.lat,
        startPoint.lon,
        endPoint.lat,
        endPoint.lon
      );

      console.log("Route data received:", response);

      if (response.path && response.path.length > 0) {
        // Ensure start and end points are in the path
        const path = [...response.path];
        
        // Add start point if not present
        if (path[0][0] !== startPoint.lat || path[0][1] !== startPoint.lon) {
          path.unshift([startPoint.lat, startPoint.lon]);
        }
        
        // Add end point if not present
        const lastPoint = path[path.length - 1];
        if (lastPoint[0] !== endPoint.lat || lastPoint[1] !== endPoint.lon) {
          path.push([endPoint.lat, endPoint.lon]);
        }

        setRoutePath(path);
        setRouteMetadata({
          distance: response.distance,
          estimatedTime: response.estimatedTime,
        });
        
        toast.success(
          `Route calculated! Distance: ${response.distance?.toFixed(2)} km, Time: ${response.estimatedTime?.toFixed(2)} hours`
        );
      } else {
        toast.error("No valid route found");
      }
    } catch (error) {
      console.error("Route calculation error:", error);
      
      if (error instanceof APIError) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Failed to calculate route. Please try again.");
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoutePath([]);
    setRouteMetadata({});
    setClearTrigger(prev => prev + 1);
    toast.info("Route cleared");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Panel - Map */}
          <div className="lg:col-span-2 min-h-[600px]">
            <MapPlaceholder 
              onStartPointSet={handleStartPointSet}
              onEndPointSet={handleEndPointSet}
              routePath={routePath}
              clearTrigger={clearTrigger}
            />
          </div>
          
          {/* Right Panel - Forms and Data */}
          <div className="space-y-6">
            {/* Route Controls */}
            <div className="bg-card p-4 rounded-lg shadow space-y-4">
              <h3 className="font-semibold text-lg">Route Controls</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start:</span>
                  <span className="font-mono">
                    {startPoint 
                      ? `${startPoint.lat.toFixed(4)}, ${startPoint.lon.toFixed(4)}` 
                      : "Click on map"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End:</span>
                  <span className="font-mono">
                    {endPoint 
                      ? `${endPoint.lat.toFixed(4)}, ${endPoint.lon.toFixed(4)}` 
                      : "Click on map"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCalculateRoute}
                  disabled={!startPoint || !endPoint || isCalculating}
                  className="flex-1"
                >
                  {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Route
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearRoute}
                  disabled={isCalculating}
                >
                  Clear
                </Button>
              </div>

              {!startPoint && !endPoint && (
                <p className="text-sm text-muted-foreground">
                  Click on the map to set start and end points
                </p>
              )}
              {startPoint && !endPoint && (
                <p className="text-sm text-muted-foreground">
                  Click on the map to set end point
                </p>
              )}
            </div>

            {/* Route Metadata */}
            {routeMetadata.distance && (
              <div className="bg-card p-4 rounded-lg shadow space-y-2">
                <h3 className="font-semibold text-lg">Route Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-semibold">{routeMetadata.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="font-semibold">{routeMetadata.estimatedTime} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waypoints:</span>
                    <span className="font-semibold">{routePath.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Section - Recent Routes */}
        <div className="mt-8">
          <RecentRoutes />
        </div>
        
        {/* Weather Information */}
        <div className="mt-8">
          <WeatherInfo />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;