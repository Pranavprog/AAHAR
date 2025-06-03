import ScanPageClient from "@/components/scan/ScanPageClient";
import { Leaf } from "lucide-react";

export const metadata = {
  title: "Scan Food Item | AAHAR",
  description: "Use AAHAR to scan a food item using your camera or upload an image to get a detailed analysis of harmful additives and more.",
};

export default function ScanPage() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Leaf className="mx-auto text-primary h-12 w-12 mb-4" />
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Scan Food Item</h1>
        <p className="text-muted-foreground mt-2">
          Upload an image of a fruit, vegetable, or food item to get an AI-powered analysis with AAHAR.
        </p>
      </div>
      <ScanPageClient />
    </div>
  );
}
