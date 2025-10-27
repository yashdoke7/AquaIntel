import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Card className="shadow-wave">
          <CardHeader className="bg-gradient-waves">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="w-6 h-6" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground mb-4">
              Last updated: October 27, 2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using AquaIntel ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials (information or software) on AquaIntel for personal, non-commercial transitory viewing only.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>This is the grant of a license, not a transfer of title</li>
              <li>This license shall automatically terminate if you violate any of these restrictions</li>
              <li>Upon terminating your viewing or upon the termination of this license, you must destroy any downloaded materials</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Maritime Route Calculations</h2>
            <p>
              AquaIntel provides route calculations for informational purposes only. The Service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Does not replace professional maritime navigation systems</li>
              <li>Should not be used as the sole source for navigation decisions</li>
              <li>Provides estimates based on available weather data which may not be 100% accurate</li>
              <li>Is not liable for any navigation decisions made using this information</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Weather Data Disclaimer</h2>
            <p>
              Weather data is provided by third-party services and is subject to their accuracy and availability. AquaIntel is not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inaccurate weather predictions</li>
              <li>Service outages from weather data providers</li>
              <li>Any decisions made based on weather information provided</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. User Responsibilities</h2>
            <p>Users agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service in compliance with all applicable laws and regulations</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not interfere with or disrupt the Service or servers</li>
              <li>Maintain the confidentiality of any account credentials</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Limitation of Liability</h2>
            <p>
              In no event shall AquaIntel or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AquaIntel.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Modifications</h2>
            <p>
              AquaIntel may revise these terms of service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="ml-4">
              Email: yashdoke215@gmail.com<br />
              GitHub: github.com/yashdoke7/AquaIntel
            </p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
