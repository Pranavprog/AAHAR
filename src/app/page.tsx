
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
    <div className="space-y-16">
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-background rounded-xl shadow-2xl overflow-hidden [perspective:1000px]">
        <div className="container mx-auto px-4">
          <Leaf className="mx-auto text-primary h-20 w-20 mb-8 transition-all duration-300 ease-in-out cursor-pointer animate-in fade-in zoom-in-50 delay-200 duration-500 hover:scale-125 hover:-rotate-12 hover:drop-shadow-lg" />
          <h1 className="text-5xl md:text-6xl font-headline font-bold mb-6 text-foreground animate-in fade-in slide-in-from-top-10 delay-300 duration-500">
            Welcome to <span className="text-primary">AAHAR</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-10 delay-400 duration-500">
            AI-Assisted Harmful Additive Recognition
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-10 delay-500 duration-500">
            Your intelligent companion for understanding what's in your food. Scan fruits, vegetables, and more to get instant insights.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 transition-all duration-200 ease-in-out shadow-lg hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl active:scale-100 active:translate-y-0 active:brightness-90"
          >
            <Link href="/scan">
              <ScanLine className="mr-2 h-6 w-6" />
              Start Scanning Now
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-500 delay-200">
        <h2 className="text-4xl font-headline font-semibold text-center mb-12 text-foreground animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_10px_2px_hsl(var(--primary)/0.4),0_0_20px_5px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_18px_3px_hsl(var(--primary)/0.6),0_0_30px_8px_hsl(var(--primary)/0.3)] group hover:scale-[1.05] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-400 cursor-pointer bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <ScanLine className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">1. Scan Your Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Use your device to take a picture of any fruit, vegetable, or food item.</p>
                  <div className="overflow-hidden rounded-md mt-4 shadow-lg">
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
            <DialogContent className="sm:max-w-[525px] bg-popover border-accent/50 shadow-xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-xl bg-accent text-accent-foreground px-4 py-3 rounded-t-md mb-0 flex items-center gap-3 shadow-md">
                  <ScanLine className="h-6 w-6" /> Scanning Your Item: A Quick Guide
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-4">
                <DialogDescription className="text-left mb-4">
                  Follow these steps to scan your food item effectively:
                </DialogDescription>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-sm text-muted-foreground">
                  <li>Open the AAHAR app and navigate to the 'Scan' page using the header menu.</li>
                  <li>If using the camera, grant camera access when prompted by your browser. Position your food item clearly in the camera's view.</li>
                  <li>Alternatively, click 'Upload Image File' to select an image from your device.</li>
                  <li>Click 'Capture Image' or confirm your upload. A preview will be shown.</li>
                  <li>If satisfied with the preview, click 'Analyze Image' to let AAHAR process it. If not, use 'Scan Another' to try again.</li>
                </ol>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_10px_2px_hsl(var(--primary)/0.4),0_0_20px_5px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_18px_3px_hsl(var(--primary)/0.6),0_0_30px_8px_hsl(var(--primary)/0.3)] group hover:scale-[1.05] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-500 cursor-pointer bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Layers className="h-10 w-10 text-primary"/>
                  </div>
                  <CardTitle className="font-headline text-2xl">2. AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Our AI analyzes the image to identify the item and its properties.</p>
                  <div className="overflow-hidden rounded-md mt-4 shadow-lg">
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
            <DialogContent className="sm:max-w-[525px] bg-popover border-accent/50 shadow-xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-xl bg-accent text-accent-foreground px-4 py-3 rounded-t-md mb-0 flex items-center gap-3 shadow-md">
                  <Layers className="h-6 w-6" /> Understanding AI Analysis
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-4">
                <DialogDescription className="text-left mb-4">
                  Here's what happens when AAHAR's AI analyzes your item:
                </DialogDescription>
                <ul className="list-disc list-inside space-y-2 pl-4 text-sm text-muted-foreground">
                  <li><strong>Identification:</strong> The AI first tries to identify the food item (e.g., apple, spinach, bread).</li>
                  <li><strong>Component Estimation:</strong> It estimates key nutritional components like water, sugar, and fiber content based on typical values for the identified item.</li>
                  <li><strong>Chemical Residue Flagging:</strong> The AI looks for visual cues or patterns that might suggest common treatments or residues. This is an estimation, not a lab-grade chemical test.</li>
                  <li><strong>Edibility Suggestion:</strong> Based on the overall analysis, a general edibility status (Safe to Eat, Wash & Eat, Unsafe) is provided as a helpful guideline.</li>
                  <li><strong>Important Note:</strong> AI analysis is a powerful tool for providing quick insights but is for informational purposes only. It should not replace professional nutritional, medical, or food safety advice.</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_10px_2px_hsl(var(--primary)/0.4),0_0_20px_5px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_18px_3px_hsl(var(--primary)/0.6),0_0_30px_8px_hsl(var(--primary)/0.3)] group hover:scale-[1.05] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-600 cursor-pointer bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Lightbulb className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">3. Get Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Receive a detailed breakdown of components, chemicals, and edibility status.</p>
                  <div className="overflow-hidden rounded-md mt-4 shadow-lg">
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
            <DialogContent className="sm:max-w-[525px] bg-popover border-accent/50 shadow-xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-xl bg-accent text-accent-foreground px-4 py-3 rounded-t-md mb-0 flex items-center gap-3 shadow-md">
                  <Lightbulb className="h-6 w-6" /> Interpreting Your Results
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-4">
                <DialogDescription className="text-left mb-4">
                  After analysis, AAHAR provides several key insights:
                </DialogDescription>
                <ul className="list-disc list-inside space-y-2 pl-4 text-sm text-muted-foreground">
                  <li><strong>Item Identification:</strong> Confirms the name and type of the food item analyzed.</li>
                  <li><strong>Key Components:</strong> Shows estimated percentages for water, sugar, and fiber.</li>
                  <li><strong>Vitamins & Minerals:</strong> Lists common vitamins and minerals typically found in the item.</li>
                  <li><strong>Potential Chemical Residues:</strong> Highlights any potential residues the AI detected. Always consider washing items thoroughly.</li>
                  <li><strong>Edibility Status:</strong> Offers a recommendation (Safe, Wash & Eat, Unsafe). Use this as a guide and always prioritize your judgment and official food safety information.</li>
                  <li><strong>Voice Readout:</strong> You can use the microphone icon on the results page to have the key findings read aloud.</li>
                  <li><strong>Disclaimer:</strong> Always remember the AI analysis is informational. For critical health or safety decisions, consult with a qualified expert.</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-500 delay-400">
        <div className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
          <h2 className="text-4xl font-headline font-semibold text-foreground">Quick Tips</h2>
          <Button
            variant="outline"
            asChild
            className="transition-all duration-200 ease-in-out border-primary/70 text-primary hover:bg-primary/10 hover:text-primary shadow-md hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg active:scale-100 active:translate-y-0 active:brightness-90"
          >
            <Link href="/tips">
              View All Tips
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
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
