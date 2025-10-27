import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves, Wind, Thermometer, Eye, Compass, Cloud, Droplets, Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudCover: number;
  description: string;
  location: string;
}

interface WeatherInfoProps {
  lat?: number;
  lon?: number;
}

const WeatherInfo = ({ lat = 18.5204, lon = 73.8567 }: WeatherInfoProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, [lat, lon]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use OpenWeatherMap API (you need to add your API key to .env)
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();

      setWeather({
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed * 1.94384, // Convert m/s to knots
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000, // Convert to km
        cloudCover: data.clouds.all,
        description: data.weather[0].description,
        location: data.name
      });
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Unable to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  if (loading) {
    return (
      <Card className="shadow-wave">
        <CardHeader className="bg-gradient-waves">
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5" />
            Loading Weather Data...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="shadow-wave">
        <CardContent className="p-12 text-center">
          <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{error || 'No weather data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const weatherItems = [
    {
      title: "Wind Speed",
      icon: Wind,
      value: `${weather.windSpeed.toFixed(1)} kts`,
      direction: getWindDirection(weather.windDirection),
      description: weather.windSpeed < 10 ? "Light winds" : weather.windSpeed < 20 ? "Moderate winds" : "Strong winds",
      color: weather.windSpeed < 10 ? "text-success" : weather.windSpeed < 20 ? "text-primary" : "text-destructive"
    },
    {
      title: "Temperature",
      icon: Thermometer,
      value: `${weather.temperature.toFixed(1)}°C`,
      direction: "",
      description: `Feels like ${weather.feelsLike.toFixed(1)}°C`,
      color: "text-primary"
    },
    {
      title: "Visibility",
      icon: Eye,
      value: `${weather.visibility.toFixed(1)} km`,
      direction: "",
      description: weather.visibility > 10 ? "Excellent visibility" : weather.visibility > 5 ? "Good visibility" : "Poor visibility",
      color: weather.visibility > 10 ? "text-success" : weather.visibility > 5 ? "text-primary" : "text-warning"
    },
    {
      title: "Humidity",
      icon: Droplets,
      value: `${weather.humidity}%`,
      direction: "",
      description: weather.humidity > 70 ? "High humidity" : "Moderate humidity",
      color: "text-primary"
    },
    {
      title: "Pressure",
      icon: Gauge,
      value: `${weather.pressure} hPa`,
      direction: "",
      description: weather.pressure > 1013 ? "High pressure" : "Low pressure",
      color: "text-primary"
    },
    {
      title: "Cloud Cover",
      icon: Cloud,
      value: `${weather.cloudCover}%`,
      direction: "",
      description: weather.description,
      color: "text-muted-foreground"
    }
  ];

  return (
    <Card className="shadow-wave">
      <CardHeader className="bg-gradient-waves">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Waves className="w-5 h-5" />
          Current Maritime Conditions - {weather.location}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherItems.map((item, index) => (
            <div key={index} className="bg-gradient-waves/50 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                {item.direction && (
                  <div className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.direction}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherInfo;
