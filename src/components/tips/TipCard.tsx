
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import type { ReactNode } from 'react';

interface TipCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  image: string;
  imageHint: string;
}

export default function TipCard({ title, description, icon, image, imageHint }: TipCardProps) {
  return (
    <Card className="shadow-lg group hover:shadow-2xl hover:scale-[1.04] transition-all duration-300 ease-in-out flex flex-col h-full overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        {icon && <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 ease-in-out">{icon}</div>}
        <div className="flex-1">
          <CardTitle className="font-headline text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="overflow-hidden rounded-md mb-4">
          <Image
            src={image}
            alt={title}
            data-ai-hint={imageHint}
            width={600}
            height={400}
            className="object-cover aspect-video group-hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        </div>
        <p className="text-sm text-muted-foreground flex-grow">{description}</p>
      </CardContent>
    </Card>
  );
}
