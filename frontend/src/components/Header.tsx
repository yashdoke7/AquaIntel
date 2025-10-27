import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Navigation, Waves, MapPin, Settings, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import aquaIntelLogo from "@/assets/aquaintel-logo.jpg";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "/", label: "Home", icon: Navigation },
    { id: "/planner", label: "Route Planner", icon: MapPin },
    { id: "/weather", label: "Weather Overview", icon: Waves },
    { id: "/routes", label: "Recent Routes", icon: History },
    { id: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-card border-b border-border shadow-wave sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <img 
              src={aquaIntelLogo} 
              alt="AquaIntel Logo" 
              className="w-10 h-10 rounded-lg shadow-wave"
            />
            <h1 className="text-2xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
              AquaIntel
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={location.pathname === item.id ? "ocean" : "ghost"}
                size="sm"
                onClick={() => navigate(item.id)}
                className="flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="rounded-full"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={location.pathname === item.id ? "ocean" : "ghost"}
              size="sm"
              onClick={() => navigate(item.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;