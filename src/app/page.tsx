
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TipCard from '@/components/tips/TipCard';
import Link from 'next/link';
import { ArrowRight, Leaf, Lightbulb, ScanLine, Layers } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const featuredTips = [
  {
    title: "Wash Fruits Thoroughly",
    description: "Learn the best techniques to remove pesticide residues from your favorite fruits.",
    icon: <Leaf className="w-6 h-6 text-primary" />,
    image: "https://i.postimg.cc/9Qkvydq4/download.jpg",
  },
  {
    title: "Identify Freshness",
    description: "Quick tips to check if your vegetables are fresh and safe to eat.",
    icon: <Lightbulb className="w-6 h-6 text-primary" />,
    image: "https://i.postimg.cc/MKp6DYXt/images.jpg",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 md:py-20 bg-gradient-to-br from-primary/25 via-accent/10 to-background rounded-lg shadow-xl overflow-hidden animate-in fade-in duration-700">
        <div className="container mx-auto px-4">
          <Leaf className="mx-auto text-primary h-16 w-16 mb-6 hover:scale-110 hover:rotate-[-10deg] transition-all duration-300 ease-in-out cursor-pointer animate-in fade-in zoom-in-50 delay-200 duration-500" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-6 text-foreground animate-in fade-in slide-in-from-top-10 delay-300 duration-500">
            Welcome to <span className="text-primary">AAHAR</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-10 delay-400 duration-500">
            AI-Assisted Harmful Additive Recognition
          </p>
          <p className="text-md md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-10 delay-500 duration-500">
            Your intelligent companion for understanding what's in your food. Scan fruits, vegetables, and more to get instant insights.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-accent hover:bg-accent/90 text-accent-foreground hover:scale-105 active:scale-100 transition-transform duration-200 ease-in-out animate-in fade-in zoom-in-75 delay-600 duration-500"
          >
            <Link href="/scan">
              <ScanLine className="mr-2 h-5 w-5" />
              Start Scanning Now
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-500 delay-200">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10 text-foreground animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_8px_1px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_16px_2px_hsl(var(--primary)/0.7)] group hover:scale-[1.08] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-400 cursor-pointer">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-3 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <ScanLine className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline">1. Scan Your Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Use your device to take a picture of any fruit, vegetable, or food item.</p>
                  <div className="overflow-hidden rounded-md mt-4">
                    <Image
                      src="https://i.postimg.cc/Y2Nt6s3J/download.jpg"
                      alt="Scanning food"
                      width={300}
                      height={200}
                      className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-primary flex items-center gap-2">
                  <ScanLine className="h-6 w-6" /> Scanning Your Item: A Quick Guide
                </DialogTitle>
                <DialogDescription className="text-left pt-2 space-y-2">
                  Follow these steps to scan your food item effectively:
                  <ol className="list-decimal list-inside space-y-1 pl-4 text-muted-foreground">
                    <li>Open the AAHAR app and navigate to the 'Scan' page using the header menu.</li>
                    <li>If using the camera, grant camera access when prompted by your browser. Position your food item clearly in the camera's view.</li>
                    <li>Alternatively, click 'Upload Image File' to select an image from your device.</li>
                    <li>Click 'Capture Image' or confirm your upload. A preview will be shown.</li>
                    <li>If satisfied with the preview, click 'Analyze Image' to let AAHAR process it. If not, use 'Scan Another' to try again.</li>
                  </ol>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_8px_1px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_16px_2px_hsl(var(--primary)/0.7)] group hover:scale-[1.08] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-500 cursor-pointer">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-3 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Layers className="h-8 w-8 text-primary"/>
                  </div>
                  <CardTitle className="font-headline">2. AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Our AI analyzes the image to identify the item and its properties.</p>
                  <div className="overflow-hidden rounded-md mt-4">
                  <Image
                    src="https://i.postimg.cc/nVKQXTQL/download.jpg"
                    alt="AI Analysis"
                    width={300}
                    height={200}
                    className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-primary flex items-center gap-2">
                  <Layers className="h-6 w-6" /> Understanding AI Analysis
                </DialogTitle>
                <DialogDescription className="text-left pt-2 space-y-2">
                  Here's what happens when AAHAR's AI analyzes your item:
                  <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
                    <li><strong>Identification:</strong> The AI first tries to identify the food item (e.g., apple, spinach, bread).</li>
                    <li><strong>Component Estimation:</strong> It estimates key nutritional components like water, sugar, and fiber content based on typical values for the identified item.</li>
                    <li><strong>Chemical Residue Flagging:</strong> The AI looks for visual cues or patterns that might suggest common treatments or residues. This is an estimation, not a lab-grade chemical test.</li>
                    <li><strong>Edibility Suggestion:</strong> Based on the overall analysis, a general edibility status (Safe to Eat, Wash & Eat, Unsafe) is provided as a helpful guideline.</li>
                    <li><strong>Important Note:</strong> AI analysis is a powerful tool for providing quick insights but is for informational purposes only. It should not replace professional nutritional, medical, or food safety advice.</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_8px_1px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_16px_2px_hsl(var(--primary)/0.7)] group hover:scale-[1.08] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-600 cursor-pointer">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-3 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline">3. Get Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Receive a detailed breakdown of components, chemicals, and edibility status.</p>
                  <div className="overflow-hidden rounded-md mt-4">
                  <Image
                    src="https://i.postimg.cc/xd09Fy16/download.jpg"
                    alt="Food Insights"
                    width={300}
                    height={200}
                    className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-primary flex items-center gap-2">
                  <Lightbulb className="h-6 w-6" /> Interpreting Your Results
                </DialogTitle>
                <DialogDescription className="text-left pt-2 space-y-2">
                  After analysis, AAHAR provides several key insights:
                  <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
                    <li><strong>Item Identification:</strong> Confirms the name and type of the food item analyzed.</li>
                    <li><strong>Key Components:</strong> Shows estimated percentages for water, sugar, and fiber.</li>
                    <li><strong>Vitamins & Minerals:</strong> Lists common vitamins and minerals typically found in the item.</li>
                    <li><strong>Potential Chemical Residues:</strong> Highlights any potential residues the AI detected. Always consider washing items thoroughly.</li>
                    <li><strong>Edibility Status:</strong> Offers a recommendation (Safe, Wash & Eat, Unsafe). Use this as a guide and always prioritize your judgment and official food safety information.</li>
                    <li><strong>Voice Readout:</strong> You can use the microphone icon on the results page to have the key findings read aloud.</li>
                    <li><strong>Disclaimer:</strong> Always remember the AI analysis is informational. For critical health or safety decisions, consult with a qualified expert.</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-500 delay-400">
        <div className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
          <h2 className="text-3xl font-headline font-semibold text-foreground">Quick Tips</h2>
          <Button
            variant="outline"
            asChild
            className="hover:scale-105 active:scale-100 transition-transform duration-200 ease-in-out"
          >
            <Link href="/tips">
              View All Tips
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredTips.map((tip, index) => (
            <div key={index} className="animate-in fade-in slide-in-from-bottom-10 duration-500" style={{ animationDelay: `${600 + index * 100}ms` }}>
              <TipCard title={tip.title} description={tip.description} icon={tip.icon} image={tip.image} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
