import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertTriangle, Cloud, Waves, Wind, Thermometer } from "lucide-react";

const RouteMetadata = () => {
  // Mock data - would come from route calculation
  const routeData = {
    eta: "2024-02-15 14:30 UTC",
    distance: "8,247 NM",
    riskLevel: "Low",
    weather: {
      condition: "Partly Cloudy",
      windSpeed: "12 kts",
      waveHeight: "2.1 m",
      temperature: "18°C"
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low": return "default";
      case "moderate": return "secondary";
      case "high": return "destructive";
      default: return "default";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low": return "text-success";
      case "moderate": return "text-warning";
      case "high": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Route Summary */}
      <Card className="shadow-wave">
        <CardHeader className="bg-gradient-waves">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="w-5 h-5" />
            Route Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated Arrival
              </p>
              <p className="font-medium">{routeData.eta}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Total Distance
              </p>
              <p className="font-medium">{routeData.distance}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Assessment
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={getRiskBadgeVariant(routeData.riskLevel)}>
                {routeData.riskLevel} Risk
              </Badge>
              <span className={`text-sm font-medium ${getRiskColor(routeData.riskLevel)}`}>
                Optimal conditions expected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Snapshot */}
      <Card className="shadow-wave">
        <CardHeader className="bg-gradient-waves">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Cloud className="w-5 h-5" />
            Weather Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Condition
                </span>
                <span className="font-medium">{routeData.weather.condition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Wind Speed
                </span>
                <span className="font-medium">{routeData.weather.windSpeed}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  Wave Height
                </span>
                <span className="font-medium">{routeData.weather.waveHeight}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Temperature
                </span>
                <span className="font-medium">{routeData.weather.temperature}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteMetadata;