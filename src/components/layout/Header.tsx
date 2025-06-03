import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, Info, Home, ScanLine } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary hover:opacity-80 transition-opacity">
          <Leaf size={28} />
          <span>AAHAR</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/scan" className="flex items-center gap-1">
              <ScanLine size={18} />
               <span className="hidden sm:inline">Scan</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/tips" className="flex items-center gap-1">
              <Info size={18} />
              <span className="hidden sm:inline">Tips</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
