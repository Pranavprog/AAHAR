import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TipCard from '@/components/tips/TipCard';
import Link from 'next/link';
import { ArrowRight, Leaf, Lightbulb, ScanLine } from 'lucide-react';
import Image from 'next/image';

const featuredTips = [
  {
    title: "Wash Fruits Thoroughly",
    description: "Learn the best techniques to remove pesticide residues from your favorite fruits.",
    icon: <Leaf className="w-6 h-6 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "fruit washing"
  },
  {
    title: "Identify Freshness",
    description: "Quick tips to check if your vegetables are fresh and safe to eat.",
    icon: <Lightbulb className="w-6 h-6 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "fresh vegetables"
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 md:py-20 bg-gradient-to-br from-primary/20 via-background to-background rounded-lg shadow-md">
        <div className="container mx-auto px-4">
          <Leaf className="mx-auto text-primary h-16 w-16 mb-6" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-6 text-foreground">
            Welcome to <span className="text-primary">ScanBite</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Your intelligent companion for understanding what's in your food. Scan fruits, vegetables, and more to get instant insights.
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/scan">
              <ScanLine className="mr-2 h-5 w-5" />
              Start Scanning Now
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10 text-foreground">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/20 rounded-full w-fit mb-3">
                <ScanLine className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline">1. Scan Your Item</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Use your device to take a picture of any fruit, vegetable, or food item.</p>
              <Image src="https://placehold.co/300x200.png" alt="Scanning food" data-ai-hint="food scan" width={300} height={200} className="mt-4 rounded-md" />
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/20 rounded-full w-fit mb-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <CardTitle className="font-headline">2. AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Our AI analyzes the image to identify the item and its properties.</p>
               <Image src="https://placehold.co/300x200.png" alt="AI Analysis" data-ai-hint="AI analysis" width={300} height={200} className="mt-4 rounded-md" />
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
               <div className="p-3 bg-primary/20 rounded-full w-fit mb-3">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline">3. Get Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receive a detailed breakdown of components, chemicals, and edibility status.</p>
               <Image src="https://placehold.co/300x200.png" alt="Food Insights" data-ai-hint="food insights" width={300} height={200} className="mt-4 rounded-md" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-headline font-semibold text-foreground">Quick Tips</h2>
          <Button variant="outline" asChild>
            <Link href="/tips">
              View All Tips
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredTips.map((tip, index) => (
            <TipCard key={index} title={tip.title} description={tip.description} icon={tip.icon} image={tip.image} imageHint={tip.imageHint} />
          ))}
        </div>
      </section>
    </div>
  );
}
