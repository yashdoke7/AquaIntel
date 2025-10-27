import { useState } from "react";
import Header from "@/components/Header";
import WeatherInfo from "@/components/WeatherInfo";
import WeatherLocationSelector from "@/components/WeatherLocationSelector";
import Footer from "@/components/Footer";

const WeatherOverview = () => {
  const [location, setLocation] = useState({
    lat: 18.5204,
    lon: 73.8567,
    name: "Pune, India"
  });

  const handleLocationChange = (lat: number, lon: number, name: string) => {
    setLocation({ lat, lon, name });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Weather Overview</h1>
          <p className="text-muted-foreground">
            Real-time maritime weather conditions and forecasts for {location.name}
          </p>
        </div>
        
        <div className="space-y-6">
          <WeatherLocationSelector onLocationChange={handleLocationChange} />
          <WeatherInfo lat={location.lat} lon={location.lon} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WeatherOverview;
