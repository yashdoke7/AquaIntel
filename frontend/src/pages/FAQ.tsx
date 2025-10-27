import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "What is AquaIntel?",
      answer: "AquaIntel is a maritime route planning application that calculates optimal ship routes using the A* pathfinding algorithm. It integrates real-time weather data to help you plan safe and efficient ocean navigation routes."
    },
    {
      question: "How do I plan a route?",
      answer: "Simply click on the map to set your start point, then click again to set your end point. Finally, click the 'Calculate Route' button to generate the optimal path. The system will consider weather conditions and water navigation constraints."
    },
    {
      question: "Is the weather data real-time?",
      answer: "Yes! We use the OpenWeatherMap API to fetch current weather conditions including wind speed, temperature, visibility, and more. The data is updated regularly to provide accurate maritime conditions."
    },
    {
      question: "Can I save my routes?",
      answer: "Yes, all calculated routes are automatically saved to your browser's local storage. You can view, export, or delete them from the 'Recent Routes' page. Your data stays private on your device."
    },
    {
      question: "How accurate are the route calculations?",
      answer: "Our routes use the A* algorithm with weather-weighted pathfinding. While the calculations are sophisticated, they should be used for planning purposes only and not as a replacement for professional maritime navigation systems."
    },
    {
      question: "What do the colored markers mean?",
      answer: "Green markers indicate your start point, red markers indicate your end point, and the blue line shows the calculated optimal route between them."
    },
    {
      question: "Can I use this offline?",
      answer: "The map and route calculation require an internet connection as they rely on OpenStreetMap tiles and weather data APIs. However, previously calculated routes stored locally can be viewed offline."
    },
    {
      question: "Is AquaIntel free to use?",
      answer: "Yes, AquaIntel is completely free to use. It's an open-source project aimed at demonstrating maritime route optimization techniques."
    },
    {
      question: "What technology powers AquaIntel?",
      answer: "The frontend is built with React, TypeScript, and Leaflet for mapping. The backend uses Python with FastAPI, implements the A* algorithm, and integrates with MySQL for weather data storage."
    },
    {
      question: "How can I contribute or report issues?",
      answer: "AquaIntel is open source! Visit our GitHub repository to report issues, suggest features, or contribute code. You can also send feedback through the Contact form in Settings."
    },
    {
      question: "Does AquaIntel work on mobile devices?",
      answer: "Yes! The interface is fully responsive and works on smartphones and tablets. The mobile navigation menu provides easy access to all features."
    },
    {
      question: "What are the system requirements?",
      answer: "Any modern web browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled. No special software or plugins are required."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Card className="shadow-wave">
          <CardHeader className="bg-gradient-waves">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HelpCircle className="w-6 h-6" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Still have questions?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Can't find the answer you're looking for? Feel free to reach out to us.
              </p>
              <p className="text-sm">
                Email: <a href="mailto:yashdoke62@gmail.com" className="text-primary hover:underline">yashdoke62@gmail.com</a><br />
                GitHub: <a href="https://github.com/yashdoke7/AquaIntel" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/yashdoke7/AquaIntel</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
