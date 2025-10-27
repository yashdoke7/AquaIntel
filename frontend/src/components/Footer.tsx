import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, FileText, Shield, Github, Linkedin, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContactModal from "@/components/ContactModal";

const Footer = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <footer className="bg-gradient-deep text-primary-foreground mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">AquaIntel</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                Advanced maritime routing intelligence for safe and efficient ocean navigation. 
                Powered by real-time weather data and AI-driven route optimization.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground"
                  onClick={() => window.open('https://github.com/yashdoke7/AquaIntel', '_blank')}
                >
                  <Github className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground"
                  onClick={() => window.open('https://www.linkedin.com/in/yash-doke/', '_blank')}
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground"
                  onClick={() => window.open('https://twitter.com', '_blank')}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="font-medium">Quick Links</h4>
              <div className="space-y-2 flex flex-col">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-foreground/80 hover:text-primary-foreground text-sm justify-start"
                  onClick={() => navigate('/')}
                >
                  Home
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-foreground/80 hover:text-primary-foreground text-sm justify-start"
                  onClick={() => navigate('/planner')}
                >
                  Route Planner
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-foreground/80 hover:text-primary-foreground text-sm justify-start"
                  onClick={() => navigate('/weather')}
                >
                  Weather Overview
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-foreground/80 hover:text-primary-foreground text-sm justify-start"
                  onClick={() => navigate('/routes')}
                >
                  Recent Routes
                </Button>
              </div>
            </div>
            
            {/* Legal & Support */}
            <div className="space-y-3">
              <h4 className="font-medium">Legal & Support</h4>
              <div className="space-y-2 flex flex-col">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-foreground/80 hover:text-primary-foreground text-sm justify-start"
                  onClick={() => navigate('/terms')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-foreground/80 hover:text-primary-foreground text-sm justify-start"
                  onClick={() => navigate('/privacy')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-foreground/80 hover:text-primary-foreground text-sm justify-start"
                  onClick={() => navigate('/faq')}
                >
                  FAQ & Help
                </Button>
              </div>
            </div>
            
            {/* Contact */}
            <div className="space-y-3">
              <h4 className="font-medium">Contact & Feedback</h4>
              <div className="space-y-2 flex flex-col">
                <a 
                  href="mailto:yashdoke215@gmail.com"
                  className="text-primary-foreground/80 hover:text-primary-foreground text-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  yashdoke215@gmail.com
                </a>
                <a 
                  href="tel:+91 9860801464"
                  className="text-primary-foreground/80 hover:text-primary-foreground text-sm flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  +91 98608 01464
                </a>
              </div>
              <Button 
                variant="wave" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowContactModal(true)}
              >
                Send Feedback
              </Button>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center">
            <p className="text-primary-foreground/60 text-sm">
              © 2025 AquaIntel Maritime Solutions. All rights reserved. | Built by Yash Doke
            </p>
          </div>
        </div>
      </footer>

      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </>
  );
};

export default Footer;
