
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeFoodItem, type AnalyzeFoodItemOutput } from "@/ai/flows/analyze-food-item";
import { Camera, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, ShieldX, Mic, Percent, Droplets, Waves, Leaf, Package, Microscope, Info, Zap, Upload } from "lucide-react";
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); 

  const { toast } = useToast();

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let streamKilled = false; 

    const setupCamera = async () => {
      if (imagePreview) { 
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (hasCameraPermission !== false) setHasCameraPermission(false); 
        return;
      }

      if (hasCameraPermission === false) {
          if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
          }
          return;
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access. Try uploading a file.',
        });
        setHasCameraPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (streamKilled) { 
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        currentStream = stream; 
        
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          videoRef.current.onloadedmetadata = () => {
             if (videoRef.current && videoRef.current.srcObject === currentStream) { 
                videoRef.current.play()
                  .then(() => {
                    if (!streamKilled) {
                      setHasCameraPermission(true); 
                    } else {
                       currentStream?.getTracks().forEach(track => track.stop());
                       if(videoRef.current) videoRef.current.srcObject = null;
                    }
                  })
                  .catch(err => {
                    console.error("Video play failed:", err);
                    if (!streamKilled) {
                      toast({
                        variant: 'destructive',
                        title: 'Camera Playback Error',
                        description: `Could not start camera preview. Ensure it's not in use by another app or try refreshing. Error: ${err.message}`,
                      });
                      setHasCameraPermission(false); 
                      currentStream?.getTracks().forEach(track => track.stop());
                      if(videoRef.current) videoRef.current.srcObject = null;
                    }
                  });
             }
          };
        } else { 
            stream.getTracks().forEach(track => track.stop()); 
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCameraPermission(false); 
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings. You can also upload a file.',
        });
      }
    };

    if (hasCameraPermission === null && !imagePreview) { 
      setupCamera();
    }

    return () => {
      streamKilled = true; 
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject === currentStream) { 
        videoRef.current.srcObject = null;
      }
    };
  }, [hasCameraPermission, imagePreview, toast]); 


  const handleCaptureImage = () => {
    if (!videoRef.current || !canvasRef.current || hasCameraPermission !== true || !videoRef.current.srcObject || !(videoRef.current.srcObject as MediaStream).active) {
      toast({
        variant: "destructive",
        title: "Capture Failed",
        description: "Camera not ready, permission denied, or stream inactive. Please ensure camera is working and try again.",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/webp');
      setImageDataUri(dataUri);
      setImagePreview(dataUri);
      setAnalysisResult(null);
      setError(null);

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null; 
      }
      setHasCameraPermission(false); 
    } else {
       toast({
        variant: "destructive",
        title: "Capture Failed",
        description: "Could not get canvas context.",
      });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImageDataUri(dataUri);
        setImagePreview(dataUri); 
        
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        setHasCameraPermission(false); 
        
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = ''; 
    }
  };

  const handleRetake = () => {
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    
    setImagePreview(null);
    setImageDataUri(null);
    setAnalysisResult(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setHasCameraPermission(null); 
  };


  const handleAnalyze = async () => {
    if (!imageDataUri) {
      toast({
        variant: "destructive",
        title: "No Image",
        description: "Please capture or upload an image first.",
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
    <Card className="w-full border border-primary/40 shadow-[0_0_15px_3px_hsl(var(--primary)/0.4)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Camera className="text-primary" /> Scan Item
        </CardTitle>
        <CardDescription>
          Use your camera or upload an image file of the food item for AAHAR to analyze.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center space-y-4 min-h-[300px] justify-center">
          {imagePreview ? (
            <>
              <p className="text-sm text-muted-foreground">Image Preview:</p>
              <Image
                src={imagePreview}
                alt="Food item preview"
                width={300}
                height={300}
                className="rounded-md object-contain max-h-[300px] shadow-md"
              />
            </>
          ) : (
            <>
              <div className="w-full max-w-md aspect-video bg-muted rounded-md overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                {hasCameraPermission === null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <p className="text-muted-foreground p-4 text-center">Initializing camera... Please allow camera access if prompted.</p>
                  </div>
                )}
                 {hasCameraPermission === false && ( 
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <p className="text-muted-foreground p-4 text-center">Camera not available or permission denied. You can upload a file instead.</p>
                  </div>
                )}
              </div>
            </>
          )}
           {hasCameraPermission === false && !imagePreview && ( 
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Access Denied or Unavailable</AlertTitle>
              <AlertDescription>
                AAHAR needs access to your camera to scan items. Please enable camera permissions in your browser settings or upload an image file.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {!imagePreview && (
            <>
              <Button onClick={handleCaptureImage} disabled={isLoading || hasCameraPermission !== true} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                <Camera className="mr-2 h-5 w-5" /> Capture Image
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
                <Upload className="mr-2 h-5 w-5" /> Upload Image File
              </Button>
            </>
          )}
          {imagePreview && (
            <>
              <Button onClick={handleAnalyze} disabled={isLoading || !imageDataUri} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Zap className="mr-2 h-5 w-5" /> Analyze Image
              </Button>
              <Button onClick={handleRetake} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
                Scan Another (Retake/New File)
              </Button>
            </>
          )}
        </div>

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
          <>
            <Alert variant="default" className="mt-6 mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>AI-Generated Analysis</AlertTitle>
              <AlertDescription>
                The information provided by AAHAR is generated by an AI model. While we aim for accuracy, this analysis is for informational purposes only and may not be 100% complete or precise. It should not be used as a substitute for professional medical, nutritional, or food safety advice. Always consult with a qualified expert for critical decisions regarding your health and food consumption.
              </AlertDescription>
            </Alert>
            <Card className="bg-background/50 shadow-inner border border-accent/40 shadow-[0_0_12px_2px_hsl(var(--accent)/0.3)]">
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
                  <Button variant="outline" onClick={handleRetake}>Scan Another Item</Button>
              </CardFooter>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}

