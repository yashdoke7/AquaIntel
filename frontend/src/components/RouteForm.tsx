import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship } from "lucide-react";

// This component is now just informational
// The actual route calculation is handled by Index.tsx
const RouteForm = () => {
  return (
    <Card className="shadow-ocean">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5 text-ocean-blue" />
          Route Planning Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">How to plan your route:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click on the map to set your <strong>start point</strong></li>
            <li>Click again to set your <strong>end point</strong></li>
            <li>Click the <strong>"Calculate Route"</strong> button</li>
            <li>View your optimized maritime route on the map</li>
          </ol>
          <p className="mt-4 text-xs">
            The A* algorithm considers live weather data to find the safest and most efficient route.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteForm;
