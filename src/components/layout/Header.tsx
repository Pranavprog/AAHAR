import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, Info, Home, ScanLine } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/70 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2.5 text-3xl font-headline font-bold text-primary hover:opacity-80 transition-opacity">
          <Leaf size={32} className="transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 group-hover:drop-shadow-md"/>
          <span>AAHAR</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" asChild className="text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-md">
            <Link href="/" className="flex items-center gap-1.5 px-3 py-2">
              <Home size={20} />
              <span className="hidden sm:inline text-sm font-medium">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-md">
            <Link href="/scan" className="flex items-center gap-1.5 px-3 py-2">
              <ScanLine size={20} />
               <span className="hidden sm:inline text-sm font-medium">Scan</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-md">
            <Link href="/tips" className="flex items-center gap-1.5 px-3 py-2">
              <Info size={20} />
              <span className="hidden sm:inline text-sm font-medium">Tips</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
