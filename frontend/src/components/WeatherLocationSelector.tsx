import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Navigation } from "lucide-react";
import { toast } from "sonner";

interface WeatherLocationSelectorProps {
  onLocationChange?: (lat: number, lon: number, name: string) => void;
}

const WeatherLocationSelector = ({ onLocationChange }: WeatherLocationSelectorProps) => {
  const [latitude, setLatitude] = useState("18.5204");
  const [longitude, setLongitude] = useState("73.8567");
  const [locationName, setLocationName] = useState("Pune, India");

  // Popular maritime locations
  const popularLocations = [
    { name: "Mumbai Port, India", lat: 18.9387, lon: 72.8353 },
    { name: "Singapore Port", lat: 1.2644, lon: 103.8220 },
    { name: "Rotterdam Port, Netherlands", lat: 51.9225, lon: 4.4792 },
    { name: "Shanghai Port, China", lat: 31.2304, lon: 121.4737 },
    { name: "Hamburg Port, Germany", lat: 53.5408, lon: 9.9766 },
    { name: "Los Angeles Port, USA", lat: 33.7405, lon: -118.2720 },
    { name: "Dubai Port, UAE", lat: 25.2865, lon: 55.3324 },
    { name: "Suez Canal, Egypt", lat: 30.5086, lon: 32.3427 },
  ];

  const handleQuickSelect = (location: typeof popularLocations[0]) => {
    setLatitude(location.lat.toString());
    setLongitude(location.lon.toString());
    setLocationName(location.name);
    if (onLocationChange) {
      onLocationChange(location.lat, location.lon, location.name);
    }
    toast.success(`Location set to ${location.name}`);
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast.error("Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180");
      return;
    }

    if (onLocationChange) {
      onLocationChange(lat, lon, locationName || "Custom Location");
    }
    toast.success("Location updated");
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat.toFixed(4));
        setLongitude(lon.toFixed(4));
        setLocationName("Your Current Location");
        
        if (onLocationChange) {
          onLocationChange(lat, lon, "Your Current Location");
        }
        toast.success("Current location detected!");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to get your location. Please enable location services.");
      }
    );
  };

  return (
    <Card className="shadow-wave">
      <CardHeader className="bg-gradient-waves">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MapPin className="w-5 h-5" />
          Weather Location Selector
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Manual Input */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                placeholder="e.g., Mumbai Port"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                placeholder="18.5204"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                placeholder="73.8567"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleManualSubmit} className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Get Weather
            </Button>
            <Button 
              onClick={handleGetCurrentLocation} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Use My Location
            </Button>
          </div>
        </div>

        {/* Quick Select Popular Locations */}
        <div className="space-y-3">
          <Label>Popular Maritime Locations</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {popularLocations.map((location, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(location)}
                className="text-xs justify-start"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {location.name.split(',')[0]}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherLocationSelector;
