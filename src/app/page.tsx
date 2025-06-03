
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TipCard from '@/components/tips/TipCard';
import Link from 'next/link';
import { ArrowRight, Leaf, Lightbulb, ScanLine, Layers, Barcode } from 'lucide-react';
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
            Your intelligent companion for understanding what's in your food. Scan fresh produce, packaged items via barcode, and more for instant insights.
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
        <div className="grid md:grid-cols-4 gap-8">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_10px_2px_hsl(var(--primary)/0.4),0_0_20px_5px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_18px_3px_hsl(var(--primary)/0.6),0_0_30px_8px_hsl(var(--primary)/0.3)] group hover:scale-[1.05] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-400 cursor-pointer bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <ScanLine className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">1. Scan Produce</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Use your camera to take a picture of any fruit or vegetable.</p>
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
                  <ScanLine className="h-6 w-6" /> Scanning Fresh Produce: A Quick Guide
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-4">
                 <DialogDescription className="text-left mb-4 text-sm text-muted-foreground">
                  Follow these steps to scan your food item effectively:
                </DialogDescription>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-sm text-muted-foreground">
                  <li>Open the AAHAR app and navigate to the 'Scan' page. Select the 'Image Scan' tab.</li>
                  <li>If using the camera, grant camera access when prompted. Position your fruit or vegetable clearly in view.</li>
                  <li>Alternatively, click 'Upload Image File' to select an image from your device.</li>
                  <li>Click 'Capture Image' or confirm your upload. A preview will be shown.</li>
                  <li>If satisfied, click 'Analyze Image' to let AAHAR process it. Otherwise, use 'Scan Another' to try again.</li>
                </ol>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="border border-primary/50 shadow-[0_0_10px_2px_hsl(var(--primary)/0.4),0_0_20px_5px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_18px_3px_hsl(var(--primary)/0.6),0_0_30px_8px_hsl(var(--primary)/0.3)] group hover:scale-[1.05] transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-10 duration-500 delay-450 cursor-pointer bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 bg-primary/20 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <Barcode className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">2. Enter Barcode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">For packaged items, enter the barcode number manually.</p>
                   <div className="overflow-hidden rounded-md mt-4 shadow-lg">
                    <Image
                      src="https://i.postimg.cc/0j4c1Gmg/download.jpg"
                      alt="Barcode entry"
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
                  <Barcode className="h-6 w-6" /> Analyzing Packaged Items via Barcode
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-4">
                <DialogDescription className="text-left mb-4 text-sm text-muted-foreground">
                  To analyze a packaged food item using its barcode:
                </DialogDescription>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-sm text-muted-foreground">
                  <li>Navigate to the 'Scan' page and select the 'Barcode Scan' tab.</li>
                  <li>Locate the barcode number (typically UPC or EAN) on the product packaging.</li>
                  <li>Type this number accurately into the provided input field.</li>
                  <li>Click the 'Analyze Barcode' button.</li>
                  <li>AAHAR will retrieve product information (if available in its database) and analyze its ingredients for potential concerns.</li>
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
                  <CardTitle className="font-headline text-2xl">3. AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Our intelligent analysis algorithms process the image or barcode data.</p>
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
                  <Layers className="h-6 w-6" /> Understanding AAHAR's Intelligent Analysis
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-4">
                <DialogDescription className="text-left mb-4 text-sm text-muted-foreground">
                  Here's what happens when AAHAR's advanced AI analyzes your item:
                </DialogDescription>
                <ul className="list-disc list-inside space-y-2 pl-4 text-sm text-muted-foreground">
                  <li><strong>Identification:</strong> For images, the AI identifies the food item. For barcodes, it retrieves product details.</li>
                  <li><strong>Component Estimation (Images):</strong> Estimates key nutritional components like water, sugar, and fiber.</li>
                  <li><strong>Ingredient Analysis (Barcodes):</strong> Scrutinizes the ingredient list for known additives, allergens, or substances of interest.</li>
                  <li><strong>Chemical/Residue Flagging:</strong> Based on visual cues (images) or known processing methods (packaged goods), the AI might highlight potential concerns. This is an estimation, not a lab-grade test.</li>
                  <li><strong>Edibility/Safety Suggestion:</strong> A general guideline is provided.</li>
                  <li><strong>Important Note:</strong> AI analysis is a powerful tool for quick insights but is for informational purposes. It doesn't replace professional nutritional, medical, or food safety advice.</li>
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
                  <CardTitle className="font-headline text-2xl">4. Get Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Receive a detailed breakdown of components, potential chemicals, and edibility.</p>
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
                <DialogDescription className="text-left mb-4 text-sm text-muted-foreground">
                  After analysis, AAHAR provides several key insights:
                </DialogDescription>
                <ul className="list-disc list-inside space-y-2 pl-4 text-sm text-muted-foreground">
                  <li><strong>Item Identification:</strong> Confirms the name/type of food or product.</li>
                  <li><strong>Key Components/Ingredients:</strong> Shows estimated percentages (for produce) or lists key ingredients (for packaged items).</li>
                  <li><strong>Vitamins & Minerals (Produce):</strong> Lists common nutrients.</li>
                  <li><strong>Potential Concerns:</strong> Highlights potential chemical residues (produce) or questionable ingredients (packaged items). Always wash items thoroughly.</li>
                  <li><strong>Edibility/Safety Status:</strong> Offers a recommendation. Use this as a guide and prioritize your judgment.</li>
                  <li><strong>Voice Readout:</strong> You can use the microphone icon on the results page to have key findings read aloud (for image scans).</li>
                  <li><strong>Disclaimer:</strong> Remember AI analysis is informational. For critical health or safety decisions, consult a qualified expert.</li>
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

    
