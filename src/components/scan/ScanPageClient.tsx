
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeFoodItem, type AnalyzeFoodItemOutput } from "@/ai/flows/analyze-food-item";
import { UploadCloud, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, ShieldX, Mic, Percent, Droplets, Waves, Package, Microscope, Info, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EdibilityBadge: React.FC<{ status: AnalyzeFoodItemOutput["edibility"] }> = ({ status }) => {
  switch (status) {
    case "Safe to Eat":
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100">
          <ShieldCheck size={18} /> Safe to Eat
        </span>
      );
    case "Wash & Eat":
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-50">
          <ShieldAlert size={18} /> Wash & Eat
        </span>
      );
    case "Unsafe":
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100">
          <ShieldX size={18} /> Unsafe
        </span>
      );
    default:
      return null;
  }
};


export default function ScanPageClient() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodItemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., PNG, JPG, WEBP).",
        });
        return;
      }
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
         toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
        setAnalysisResult(null); // Reset previous results
        setError(null); // Reset previous errors
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri) {
      toast({
        variant: "destructive",
        title: "No Image",
        description: "Please upload an image first.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeFoodItem({ photoDataUri: imageDataUri });
      setAnalysisResult(result);
      speakResults(result);
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakResults = (result: AnalyzeFoodItemOutput | null) => {
    if (result && typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `Scanned item: ${result.identification.name}. Edibility: ${result.edibility}. Water content: ${result.components.waterPercentage} percent. Sugar content: ${result.components.sugarPercentage} percent.`
      );
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };
  
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <UploadCloud className="text-primary" /> Upload Image for Analysis
        </CardTitle>
        <CardDescription>
          Choose an image file of a food item. The AI will analyze it for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="food-image" className="sr-only">Food Image</Label>
          <Input
            id="food-image"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {imagePreview && (
          <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground">Image Preview:</p>
            <Image
              src={imagePreview}
              alt="Food item preview"
              width={300}
              height={300}
              className="rounded-md object-contain max-h-[300px] shadow-md"
            />
            <Button onClick={handleAnalyze} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? "Analyzing..." : "Analyze Image"}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2 pt-4">
            <Progress value={undefined} className="w-full h-2 [&>div]:bg-primary" />
            <p className="text-sm text-primary text-center animate-pulse">AI is analyzing your item, please wait...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <Card className="mt-6 bg-background/50 shadow-inner">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                <Package size={28} /> Analysis Complete: {analysisResult.identification.name}
              </CardTitle>
              <div className="flex items-center justify-between">
                <EdibilityBadge status={analysisResult.edibility} />
                <Button variant="ghost" size="icon" onClick={() => speakResults(analysisResult)} title="Read results aloud">
                  <Mic className="text-foreground" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2"><Microscope size={20} />Identification</h3>
                <p>Type: {analysisResult.identification.itemType}</p>
                <div className="flex items-center gap-2">
                  Confidence: 
                  <Progress value={analysisResult.identification.confidence * 100} className="w-1/2 h-2" /> 
                  <span>{(analysisResult.identification.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2"><Percent size={20} />Key Components</h3>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li className="flex items-center gap-1"><Droplets size={16} className="text-blue-500" />Water: {analysisResult.components.waterPercentage}%</li>
                  <li className="flex items-center gap-1"><Waves size={16} className="text-orange-500" />Sugar: {analysisResult.components.sugarPercentage}%</li>
                  <li className="flex items-center gap-1"><Leaf size={16} className="text-green-500" />Fiber: {analysisResult.components.fiberPercentage}%</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2"><Info size={20} />Vitamins & Minerals</h3>
                <p className="text-sm">{analysisResult.components.vitaminsAndMinerals || "Not specified"}</p>
              </div>

              {analysisResult.chemicalResidues && analysisResult.chemicalResidues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-destructive flex items-center gap-2"><AlertTriangle size={20} />Potential Chemical Residues</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-destructive-foreground bg-destructive/10 p-2 rounded-md">
                    {analysisResult.chemicalResidues.map((residue, index) => (
                      <li key={index}>{residue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => {
                    setImagePreview(null);
                    setImageDataUri(null);
                    setAnalysisResult(null);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }}>Scan Another Item</Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
