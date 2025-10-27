import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Moon, Sun, Globe, Mail, Phone, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import { toast } from "sonner";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('aquaintel_darkmode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('aquaintel_language') || 'en';
  });
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('aquaintel_weather_key') || '';
  });

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aquaintel_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('aquaintel_language', language);
  }, [language]);

  const handleSaveApiKey = () => {
    localStorage.setItem('aquaintel_weather_key', apiKey);
    toast.success("Weather API key saved");
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all saved routes and preferences?")) {
      localStorage.removeItem('aquaintel_routes');
      toast.success("All saved data cleared");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your AquaIntel experience</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="shadow-wave">
            <CardHeader className="bg-gradient-waves">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <SettingsIcon className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {darkMode ? "Switch to light theme" : "Switch to dark theme"}
                  </p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card className="shadow-wave">
            <CardHeader className="bg-gradient-waves">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <SettingsIcon className="w-5 h-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weather-api-key">
                  OpenWeatherMap API Key
                </Label>
                <Input
                  id="weather-api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get a free API key from{" "}
                  <a 
                    href="https://openweathermap.org/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    openweathermap.org
                  </a>
                </p>
              </div>
              <Button onClick={handleSaveApiKey} className="w-full">
                Save API Key
              </Button>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card className="shadow-wave">
            <CardHeader className="bg-gradient-waves">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Mail className="w-5 h-5" />
                Contact & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <a 
                  href="mailto:yashdoke62@gmail.com"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">yashdoke215@gmail.com</p>
                  </div>
                </a>
                
                <a 
                  href="tel:+919876543210"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+91 98608 01464</p>
                  </div>
                </a>
              </div>
              
              <Button 
                onClick={() => setShowContactModal(true)} 
                variant="ocean" 
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="shadow-wave">
            <CardHeader className="bg-gradient-waves">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Trash2 className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Clear all saved routes and preferences from your browser's local storage.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleClearData}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card className="shadow-wave lg:col-span-2">
            <CardHeader className="bg-gradient-waves">
              <CardTitle className="text-foreground">Legal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <a href="/terms" className="block">
                  <Button variant="ghost" className="h-auto flex-col py-4 w-full">
                    <span className="font-medium">Terms of Service</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Last updated: Oct 2025
                    </span>
                  </Button>
                </a>
                
                <a href="/privacy" className="block">
                  <Button variant="ghost" className="h-auto flex-col py-4 w-full">
                    <span className="font-medium">Privacy Policy</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Last updated: Oct 2025
                    </span>
                  </Button>
                </a>
                
                <a href="/faq" className="block">
                  <Button variant="ghost" className="h-auto flex-col py-4 w-full">
                    <span className="font-medium">FAQ & Help</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Documentation & Support
                    </span>
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
      
      <Footer />
    </div>
  );
};

export default Settings;
