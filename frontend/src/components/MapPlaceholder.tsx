import { Card, CardContent } from "@/components/ui/card";
import LeafletMap from "./LeafletMap";
import { useState } from "react";

interface MapPlaceholderProps {
  onStartPointSet?: (lat: number, lon: number) => void;
  onEndPointSet?: (lat: number, lon: number) => void;
  routePath?: [number, number][];
  clearTrigger?: number;
}

const MapPlaceholder = ({ 
  onStartPointSet, 
  onEndPointSet, 
  routePath,
  clearTrigger 
}: MapPlaceholderProps) => {
  return (
    <Card className="h-full shadow-ocean">
      <CardContent className="p-0 h-full">
        <LeafletMap 
          onStartPointSet={onStartPointSet}
          onEndPointSet={onEndPointSet}
          routePath={routePath}
          clearTrigger={clearTrigger}
        />
      </CardContent>
    </Card>
  );
};

export default MapPlaceholder;