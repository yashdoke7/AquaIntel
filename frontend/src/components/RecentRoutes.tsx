import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Clock, Trash2, MapPin, Download } from "lucide-react";
import { toast } from "sonner";

interface SavedRoute {
  id: string;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  distance: number;
  estimatedTime: number;
  timestamp: string;
  pathLength: number;
}

const RecentRoutes = () => {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = () => {
    const saved = localStorage.getItem('aquaintel_routes');
    if (saved) {
      setRoutes(JSON.parse(saved));
    }
  };

  const deleteRoute = (id: string) => {
    const updated = routes.filter(r => r.id !== id);
    setRoutes(updated);
    localStorage.setItem('aquaintel_routes', JSON.stringify(updated));
    toast.success("Route deleted");
  };

  const clearAllRoutes = () => {
    setRoutes([]);
    localStorage.removeItem('aquaintel_routes');
    toast.success("All routes cleared");
  };

  const exportRoutes = () => {
    const dataStr = JSON.stringify(routes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aquaintel-routes-${new Date().toISOString()}.json`;
    link.click();
    toast.success("Routes exported");
  };

  if (routes.length === 0) {
    return (
      <Card className="shadow-wave">
        <CardHeader className="bg-gradient-waves">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="w-5 h-5" />
            Recent Routes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No routes calculated yet</p>
          <p className="text-sm text-muted-foreground">
            Start planning routes to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-wave">
      <CardHeader className="bg-gradient-waves">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="w-5 h-5" />
            Recent Routes ({routes.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportRoutes}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={clearAllRoutes}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>From (Lat, Lon)</TableHead>
                <TableHead>To (Lat, Lon)</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Est. Time</TableHead>
                <TableHead>Calculated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    {route.startLat.toFixed(2)}, {route.startLon.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {route.endLat.toFixed(2)}, {route.endLon.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{route.distance.toFixed(2)} km</Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {route.estimatedTime.toFixed(2)} hrs
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(route.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRoute(route.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentRoutes;

// Helper function to save routes (export this to use in RoutePlanner)
export const saveRoute = (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  distance: number,
  estimatedTime: number,
  pathLength: number
) => {
  const saved = localStorage.getItem('aquaintel_routes');
  const routes: SavedRoute[] = saved ? JSON.parse(saved) : [];
  
  const newRoute: SavedRoute = {
    id: Date.now().toString(),
    startLat,
    startLon,
    endLat,
    endLon,
    distance,
    estimatedTime,
    pathLength,
    timestamp: new Date().toISOString()
  };
  
  routes.unshift(newRoute); // Add to beginning
  
  // Keep only last 50 routes
  const trimmed = routes.slice(0, 50);
  
  localStorage.setItem('aquaintel_routes', JSON.stringify(trimmed));
};
