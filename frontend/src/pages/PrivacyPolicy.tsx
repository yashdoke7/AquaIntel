import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Card className="shadow-wave">
          <CardHeader className="bg-gradient-waves">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="w-6 h-6" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground mb-4">
              Last updated: October 27, 2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
            <p>
              AquaIntel collects the following types of information:
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">1.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact information (name, email) when you send feedback</li>
              <li>Route planning data (start/end coordinates you input)</li>
              <li>Any other information you voluntarily provide</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">1.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address (anonymized)</li>
              <li>Usage patterns and preferences</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
            <p>We use collected information for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing and improving the Service</li>
              <li>Responding to your inquiries and feedback</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>Detecting and preventing technical issues</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Storage</h2>
            <p>
              Route data is stored locally in your browser using localStorage. We do not transmit or store your route planning data on our servers unless you explicitly share it with us.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Third-Party Services</h2>
            <p>AquaIntel uses the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>OpenWeatherMap:</strong> For weather data (see their privacy policy)</li>
              <li><strong>OpenStreetMap:</strong> For map tiles (see their privacy policy)</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Cookies and Local Storage</h2>
            <p>
              We use browser localStorage to save your preferences and recent routes. This data remains on your device and can be cleared at any time through your browser settings.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of data collection</li>
              <li>Export your route data</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact Us</h2>
            <p>
              For privacy-related questions, contact us at:
            </p>
            <p className="ml-4">
              Email: yashdoke62@gmail.com<br />
              GitHub: github.com/yashdoke7/AquaIntel
            </p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
