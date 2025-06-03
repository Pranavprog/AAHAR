
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import type { ReactNode } from 'react';

interface TipCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  image: string;
  imageHint?: string;
}

export default function TipCard({ title, description, icon, image, imageHint }: TipCardProps) {
  return (
    <Card className="border border-primary/50 shadow-[0_0_10px_2px_hsl(var(--primary)/0.4),0_0_20px_5px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_18px_3px_hsl(var(--primary)/0.6),0_0_30px_8px_hsl(var(--primary)/0.3)] group hover:scale-[1.05] transition-all duration-300 ease-in-out flex flex-col h-full overflow-hidden animate-in fade-in-5 slide-in-from-bottom-10 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        {icon && <div className="p-2.5 bg-primary/15 rounded-full group-hover:bg-primary/25 group-hover:scale-110 transition-all duration-300 ease-in-out">{icon}</div>}
        <div className="flex-1">
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="overflow-hidden rounded-md mb-4 shadow-md">
          <Image
            src={image}
            alt={title}
            data-ai-hint={imageHint}
            width={600}
            height={400}
            className="object-cover aspect-video group-hover:scale-110 transition-transform duration-300 ease-in-out"
          />
        </div>
        <p className="text-sm text-muted-foreground flex-grow">{description}</p>
      </CardContent>
    </Card>
  );
}
