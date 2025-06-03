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
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        {icon && <div className="p-2 bg-primary/10 rounded-full">{icon}</div>}
        <div className="flex-1">
          <CardTitle className="font-headline text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <Image 
          src={image} 
          alt={title} 
          data-ai-hint={imageHint}
          width={600} 
          height={400} 
          className="rounded-md mb-4 object-cover aspect-video" 
        />
        <p className="text-sm text-muted-foreground flex-grow">{description}</p>
      </CardContent>
    </Card>
  );
}
