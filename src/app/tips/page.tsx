import TipCard from '@/components/tips/TipCard';
import { Lightbulb, Leaf, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: "Food Tips | ScanBite",
  description: "Helpful tips for detoxing, cleaning, and safely consuming your food.",
};

const tips = [
  {
    title: "Properly Wash Apples",
    description: "Remove pesticide residue by soaking apples in a solution of baking soda and water for 12-15 minutes.",
    icon: <Leaf className="w-8 h-8 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "apples washing"
  },
  {
    title: "Clean Leafy Greens",
    description: "Swish leafy greens in a large bowl of cold water, then lift them out to leave grit behind. Repeat if necessary.",
    icon: <Leaf className="w-8 h-8 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "leafy greens"
  },
  {
    title: "Detoxify Berries",
    description: "Gently rinse berries in a diluted vinegar solution (1 part vinegar to 3 parts water) to remove mold and bacteria.",
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "berries cleaning"
  },
  {
    title: "Storing Vegetables for Freshness",
    description: "Learn optimal storage methods for different types of vegetables to maintain their freshness and nutritional value longer.",
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "vegetable storage"
  },
   {
    title: "Understanding Food Labels",
    description: "A quick guide to deciphering common terms on food labels like 'organic', 'natural', and 'non-GMO'.",
    icon: <Info className="w-8 h-8 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "food labels"
  },
  {
    title: "Reducing Food Waste",
    description: "Smart tips on meal planning, proper storage, and using leftovers to minimize food waste at home.",
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
    image: "https://placehold.co/600x400.png",
    imageHint: "food waste"
  }
];

export default function TipsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Lightbulb className="mx-auto text-primary h-12 w-12 mb-4" />
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Food Safety & Cleaning Tips</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Discover useful tips for detoxifying, cleaning, and safely consuming your food items.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip, index) => (
          <TipCard 
            key={index} 
            title={tip.title} 
            description={tip.description} 
            icon={tip.icon}
            image={tip.image}
            imageHint={tip.imageHint}
          />
        ))}
      </div>
    </div>
  );
}
