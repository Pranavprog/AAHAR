
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeFoodItem, type AnalyzeFoodItemOutput } from "@/ai/flows/analyze-food-item";
import { Camera, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, ShieldX, Mic, Percent, Droplets, Waves, Leaf, Package, Microscope, Info, Zap, Upload, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EdibilityBadge: React.FC<{ status: AnalyzeFoodItemOutput["edibility"] }> = ({ status }) => {
  let badgeClasses = "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-md ";
  let IconComponent = ShieldCheck;

  switch (status) {
    case "Safe to Eat":
      badgeClasses += "bg-green-500/20 text-green-300 border border-green-500/50";
      IconComponent = ShieldCheck;
      break;
    case "Wash & Eat":
      badgeClasses += "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50";
      IconComponent = ShieldAlert;
      break;
    case "Unsafe":
      badgeClasses += "bg-red-500/20 text-red-300 border border-red-500/50";
      IconComponent = ShieldX;
      break;
    default:
      return null;
  }

  return (
    <span className={badgeClasses}>
      <IconComponent size={18} /> {status}
    </span>
  );
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
      let textToSpeak = `Scanned item: ${result.identification.name}. Edibility: ${result.edibility}. `;
      if (result.identification.dominantColors && result.identification.dominantColors.length > 0) {
        textToSpeak += `Dominant colors observed: ${result.identification.dominantColors.join(', ')}. `;
      }
      textToSpeak += `Water content: ${result.components.waterPercentage} percent. Sugar content: ${result.components.sugarPercentage} percent.`;
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
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
    <Card className="w-full border border-primary/60 shadow-[0_0_18px_4px_hsl(var(--primary)/0.3),0_0_30px_8px_hsl(var(--primary)/0.15)] bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <Camera className="text-primary h-7 w-7" /> Scan Item
        </CardTitle>
        <CardDescription>
          Use your camera or upload an image file of the food item for AAHAR to analyze.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        <div className="border-2 border-dashed border-border/70 rounded-lg p-4 flex flex-col items-center space-y-4 min-h-[300px] justify-center bg-background/30">
          {imagePreview ? (
            <>
              <p className="text-sm text-muted-foreground">Image Preview:</p>
              <Image
                src={imagePreview}
                alt="Food item preview"
                width={300}
                height={300}
                className="rounded-md object-contain max-h-[300px] shadow-xl border border-border"
              />
            </>
          ) : (
            <>
              <div className="w-full max-w-md aspect-video bg-muted/70 rounded-md overflow-hidden relative shadow-inner">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                {hasCameraPermission === null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <p className="text-muted-foreground p-4 text-center">Initializing camera... Please allow camera access if prompted.</p>
                  </div>
                )}
                 {hasCameraPermission === false && ( 
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <p className="text-muted-foreground p-4 text-center">Camera not available or permission denied. You can upload a file instead.</p>
                  </div>
                )}
              </div>
            </>
          )}
           {hasCameraPermission === false && !imagePreview && ( 
            <Alert variant="destructive" className="w-full bg-destructive/20 border-destructive/50 text-destructive-foreground">
              <AlertTriangle className="h-5 w-5" />
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
              <Button onClick={handleCaptureImage} disabled={isLoading || hasCameraPermission !== true} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto text-base py-2.5 px-6 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90">
                <Camera className="mr-2 h-5 w-5" /> Capture Image
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isLoading} className="w-full sm:w-auto text-base py-2.5 px-6 border-primary/70 text-primary hover:bg-primary/10 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90">
                <Upload className="mr-2 h-5 w-5" /> Upload Image File
              </Button>
            </>
          )}
          {imagePreview && (
            <>
              <Button onClick={handleAnalyze} disabled={isLoading || !imageDataUri} className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-base py-2.5 px-6 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90">
                <Zap className="mr-2 h-5 w-5" /> Analyze Image
              </Button>
              <Button onClick={handleRetake} variant="outline" disabled={isLoading} className="w-full sm:w-auto text-base py-2.5 px-6 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90">
                Scan Another
              </Button>
            </>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3 pt-4">
             <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
            <p className="text-md text-primary text-center">AI is analyzing your item, please wait...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4 bg-destructive/20 border-destructive/50 text-destructive-foreground">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <>
            <Alert variant="default" className="mt-6 mb-4 bg-muted/30 border-muted/50">
              <Info className="h-5 w-5 text-primary" />
              <AlertTitle className="text-foreground font-semibold">AI-Generated Analysis</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                The information provided by AAHAR is generated by an AI model. While we aim for accuracy, this analysis is for informational purposes only and may not be 100% complete or precise. It should not be used as a substitute for professional medical, nutritional, or food safety advice. Always consult with a qualified expert for critical decisions regarding your health and food consumption.
              </AlertDescription>
            </Alert>
            <Card className="bg-card/70 backdrop-blur-sm shadow-xl border border-accent/60 shadow-[0_0_15px_3px_hsl(var(--accent)/0.3),0_0_25px_7px_hsl(var(--accent)/0.15)]">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-headline text-2xl md:text-3xl text-primary flex items-center gap-3">
                    <Package size={30} /> {analysisResult.identification.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => speakResults(analysisResult)} title="Read results aloud" className="text-foreground/70 hover:text-primary hover:bg-primary/10">
                    <Mic className="h-6 w-6" />
                  </Button>
                </div>
                <CardDescription className="pt-2">
                  <EdibilityBadge status={analysisResult.edibility} />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2.5 mb-2 text-foreground/90"><Microscope size={22} className="text-accent"/>Identification</h3>
                  <p className="text-muted-foreground">Type: <span className="font-medium text-foreground/80">{analysisResult.identification.itemType}</span></p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">Confidence:</span>
                    <Progress value={analysisResult.identification.confidence * 100} className="w-1/2 h-2.5 bg-muted/50 [&>div]:bg-primary" /> 
                    <span className="font-medium text-foreground/80">{(analysisResult.identification.confidence * 100).toFixed(0)}%</span>
                  </div>
                   {analysisResult.identification.dominantColors && analysisResult.identification.dominantColors.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium flex items-center gap-2 text-foreground/80"><Palette size={16} className="text-accent/80"/>Dominant Colors:</h4>
                      <p className="text-xs text-muted-foreground capitalize">{analysisResult.identification.dominantColors.join(', ')}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-border/50 pt-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2.5 mb-2 text-foreground/90"><Percent size={22} className="text-accent"/>Key Components</h3>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li className="flex items-center gap-2"><Droplets size={18} className="text-blue-400" />Water: <span className="font-medium text-foreground/80">{analysisResult.components.waterPercentage}%</span></li>
                    <li className="flex items-center gap-2"><Waves size={18} className="text-orange-400" />Sugar: <span className="font-medium text-foreground/80">{analysisResult.components.sugarPercentage}%</span></li>
                    <li className="flex items-center gap-2"><Leaf size={18} className="text-green-400" />Fiber: <span className="font-medium text-foreground/80">{analysisResult.components.fiberPercentage}%</span></li>
                  </ul>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2.5 mb-2 text-foreground/90"><Info size={22} className="text-accent"/>Vitamins & Minerals</h3>
                  <p className="text-sm text-muted-foreground">{analysisResult.components.vitaminsAndMinerals || "Not specified"}</p>
                </div>

                {analysisResult.chemicalResidues && analysisResult.chemicalResidues.length > 0 && (
                  <div className="border-t border-border/50 pt-4">
                    <h3 className="text-xl font-semibold text-red-400 flex items-center gap-2.5 mb-2"><AlertTriangle size={22} />Potential Chemical Residues</h3>
                    <ul className="list-disc list-inside ml-1 space-y-1 text-sm text-red-300/90 bg-red-500/10 p-3 rounded-md border border-red-500/30">
                      {analysisResult.chemicalResidues.map((residue, index) => (
                        <li key={index}>{residue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-border/50 pt-6">
                  <Button variant="outline" onClick={handleRetake} className="text-base py-2.5 px-6 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90">Scan Another Item</Button>
              </CardFooter>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}
