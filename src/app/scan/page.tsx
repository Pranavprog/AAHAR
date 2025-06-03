
import ScanPageClient from "@/components/scan/ScanPageClient";
import { Camera } from "lucide-react"; // Changed icon to Camera

export const metadata = {
  title: "Scan Food Item with Camera | AAHAR", // Updated title
  description: "Use AAHAR to scan a food item using your camera for a detailed analysis of harmful additives and more.", // Updated description
};

export default function ScanPage() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Camera className="mx-auto text-primary h-12 w-12 mb-4" /> {/* Changed icon to Camera */}
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Scan Food Item with Your Camera</h1> {/* Updated title */}
        <p className="text-muted-foreground mt-2">
          Position your food item in front of the camera, capture an image, and let AAHAR analyze it. {/* Updated description */}
        </p>
      </div>
      <ScanPageClient />
    </div>
  );
}
