import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Cloud, Shield, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import oceanHero from "@/assets/ocean-hero.jpg";

const Homepage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Cloud,
      title: "Real-Time Weather",
      description: "Live maritime weather data and forecasting for safer navigation",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Advanced algorithms analyze route safety and potential hazards",
      color: "text-emerald-500"
    },
    {
      icon: MapPin,
      title: "Interactive Marine Map",
      description: "Comprehensive ocean mapping with real-time vessel tracking",
      color: "text-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Recent Voyage Insights",
      description: "Historical data and analytics for route optimization",
      color: "text-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-waves py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${oceanHero})` }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="mb-4 bg-card/50 backdrop-blur-sm">
              Maritime Navigation Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Intelligent Ocean Navigation with{" "}
              <span className="bg-gradient-ocean bg-clip-text text-transparent">
                AquaIntel
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AquaIntel is an intelligent ocean navigation tool offering real-time weather-based 
              ship routing, risk predictions, and environmental overlays to ensure safer maritime travel.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                onClick={() => navigate('/planner')} 
                variant="ocean" 
                size="lg"
                className="group"
              >
                Start Planning Route
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => navigate('/weather')} 
                variant="outline" 
                size="lg"
              >
                View Weather Data
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Advanced Maritime Intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and data insights for modern maritime navigation and route planning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-wave hover:shadow-ocean transition-all duration-300 group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-waves flex items-center justify-center">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-waves">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Navigate Smarter?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join maritime professionals worldwide who trust AquaIntel for safer, 
            more efficient ocean navigation.
          </p>
          <Button onClick={() => navigate('/planner')} variant="ocean" size="lg">
            Get Started Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;