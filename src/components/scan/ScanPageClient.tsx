
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeFoodItem, type AnalyzeFoodItemOutput } from "@/ai/flows/analyze-food-item";
import { analyzeBarcode, type AnalyzeBarcodeOutput } from "@/ai/flows/analyze-barcode-flow";
import { Camera, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, ShieldX, Mic, Percent, Droplets, Waves, Leaf, Package, Microscope, Info, Zap, Upload, Palette, Barcode as BarcodeIcon, Tag, Building, ListChecks, AlertCircle, ScanLine, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EdibilityBadge: React.FC<{ status: AnalyzeFoodItemOutput["edibility"] }> = ({ status }) => {
  if (!status) return null;
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
  const streamRef = useRef<MediaStream | null>(null);

  const [barcodeInputValue, setBarcodeInputValue] = useState<string>("");
  const [barcodeAnalysisResult, setBarcodeAnalysisResult] = useState<AnalyzeBarcodeOutput | null>(null);
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("image-scan");


  const { toast } = useToast();

 useEffect(() => {
    if (imagePreview || activeTab !== "image-scan") { 
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if(activeTab !== "image-scan" && hasCameraPermission) { 
         setHasCameraPermission(null); 
      }
      return;
    }

    if (activeTab === "image-scan" && !imagePreview && hasCameraPermission === null) {
      let isEffectMounted = true;

      const getCameraStream = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isEffectMounted) {
            toast({
              variant: 'destructive',
              title: 'Camera Not Supported',
              description: 'Your browser does not support camera access. Try uploading a file.',
            });
            setHasCameraPermission(false);
          }
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (!isEffectMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(playError => {
              console.error('Error playing camera stream:', playError);
              if(isEffectMounted) {
                setHasCameraPermission(false);
                 toast({
                  variant: 'destructive',
                  title: 'Camera Playback Failed',
                  description: 'Could not start camera playback. Please check permissions or if another app is using it.',
                });
              }
              stream.getTracks().forEach(track => track.stop()); 
              if(videoRef.current) videoRef.current.srcObject = null;
              streamRef.current = null;
            });
            if (isEffectMounted && videoRef.current.srcObject) setHasCameraPermission(true); 
          } else {
            stream.getTracks().forEach(track => track.stop()); 
            if (isEffectMounted) setHasCameraPermission(false);
          }
        } catch (err) {
          console.error('Error accessing camera stream:', err);
          if (isEffectMounted) {
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied or Failed',
              description: 'Please enable camera permissions or check if another app is using the camera. You can also upload a file.',
            });
          }
        }
      };
      getCameraStream();
      return () => {
        isEffectMounted = false;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }
  }, [imagePreview, hasCameraPermission, activeTab, toast]);


  const handleCaptureImage = () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !videoRef.current.srcObject ||
      videoRef.current.readyState < videoRef.current.HAVE_ENOUGH_DATA || 
      videoRef.current.paused ||
      videoRef.current.ended ||
      hasCameraPermission !== true
    ) {
      toast({
        variant: "destructive",
        title: "Capture Failed",
        description: "Camera is not ready, permission might be denied, or the video stream is not active/playable. Please ensure a live camera feed is visible and permissions are granted.",
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setHasCameraPermission(false); 

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImageDataUri(dataUri);
        setImagePreview(dataUri); 
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
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (videoRef.current) {
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
      if (result.identification.isFoodItem) {
        speakResults(result);
      }
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
    if (result && result.identification.isFoodItem && typeof window !== 'undefined' && window.speechSynthesis) {
      let textToSpeak = `Scanned item: ${result.identification.name || 'Unknown food'}. `;
      if (result.edibility) {
        textToSpeak += `Edibility: ${result.edibility}. `;
      }
      if (result.identification.dominantColors && result.identification.dominantColors.length > 0) {
        textToSpeak += `Dominant colors observed: ${result.identification.dominantColors.join(', ')}. `;
      }
      if (result.components) {
         if (result.components.waterPercentage !== undefined) textToSpeak += `Water content: ${result.components.waterPercentage} percent. `;
         if (result.components.sugarPercentage !== undefined) textToSpeak += `Sugar content: ${result.components.sugarPercentage} percent. `;
      }
      
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

  const handleAnalyzeBarcode = async () => {
    if (!barcodeInputValue.trim()) {
      toast({
        variant: "destructive",
        title: "No Barcode",
        description: "Please enter a barcode number.",
      });
      return;
    }
    setIsBarcodeLoading(true);
    setBarcodeError(null);
    setBarcodeAnalysisResult(null);

    try {
      const result = await analyzeBarcode({ barcodeNumber: barcodeInputValue.trim() });
      setBarcodeAnalysisResult(result);
    } catch (err) {
      console.error("Barcode analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during barcode analysis.";
      setBarcodeError(errorMessage);
      toast({
        variant: "destructive",
        title: "Barcode Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsBarcodeLoading(false);
    }
  };

  const handleBarcodeScanNew = () => {
    setBarcodeInputValue("");
    setBarcodeAnalysisResult(null);
    setBarcodeError(null);
    setIsBarcodeLoading(false);
  };


  return (
    <Card className="w-full border border-primary/60 shadow-[0_0_18px_4px_hsl(var(--primary)/0.3),0_0_30px_8px_hsl(var(--primary)/0.15)] bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <ScanLine className="text-primary h-7 w-7" /> Scan Item or Barcode
        </CardTitle>
        <CardDescription>
          Choose to scan a fresh food item using your camera/upload, or enter a barcode for packaged goods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image-scan"><Camera className="mr-2 h-5 w-5" />Image Scan</TabsTrigger>
            <TabsTrigger value="barcode-scan"><BarcodeIcon className="mr-2 h-5 w-5" />Barcode Scan</TabsTrigger>
          </TabsList>
          <TabsContent value="image-scan" className="mt-6">
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
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
                    {hasCameraPermission === null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <p className="text-muted-foreground p-4 text-center">Initializing camera... Please allow camera access if prompted.</p>
                      </div>
                    )}
                    {hasCameraPermission === false && !imagePreview && ( 
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <p className="text-muted-foreground p-4 text-center">Camera not available or permission denied. You can upload a file instead.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
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
                <AlertTitle>Image Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {analysisResult && (
              <>
                <Alert variant="default" className="mt-6 mb-4 bg-muted/30 border-muted/50">
                  <Info className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-foreground font-semibold">AI-Generated Analysis (Image)</AlertTitle>
                  <AlertDescription className="text-muted-foreground">
                    This analysis is AI-generated and for informational purposes. It may not be 100% accurate. Consult experts for critical decisions.
                  </AlertDescription>
                </Alert>
                
                {analysisResult.identification.isFoodItem === false ? (
                    <Card className="bg-card/70 backdrop-blur-sm shadow-xl border border-yellow-500/60 shadow-[0_0_15px_3px_hsl(var(--accent)/0.3),0_0_25px_7px_hsl(var(--accent)/0.15)]">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="font-headline text-2xl md:text-3xl text-yellow-300 flex items-center gap-3">
                                <AlertTriangle size={30} /> Item Not Identified as Food
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground text-lg">
                                {analysisResult.identification.name || "The scanned item does not appear to be a food product."}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">AAHAR is designed for food analysis. Please scan a food item.</p>
                        </CardContent>
                        <CardFooter className="border-t border-border/50 pt-6">
                            <Button variant="outline" onClick={handleRetake} className="text-base py-2.5 px-6 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90">Scan Another Item</Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="bg-card/70 backdrop-blur-sm shadow-xl border border-accent/60 shadow-[0_0_15px_3px_hsl(var(--accent)/0.3),0_0_25px_7px_hsl(var(--accent)/0.15)]">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <div className="flex justify-between items-center">
                        <CardTitle className="font-headline text-2xl md:text-3xl text-primary flex items-center gap-3">
                            <Package size={30} /> {analysisResult.identification.name || "Food Item"}
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
                        <p className="text-muted-foreground">Type: <span className="font-medium text-foreground/80">{analysisResult.identification.itemType || "N/A"}</span></p>
                        {analysisResult.identification.confidence !== undefined && (
                            <div className="flex items-center gap-2 mt-1">
                            <span className="text-muted-foreground">Confidence:</span>
                            <Progress value={analysisResult.identification.confidence * 100} className="w-1/2 h-2.5 bg-muted/50 [&>div]:bg-primary" /> 
                            <span className="font-medium text-foreground/80">{(analysisResult.identification.confidence * 100).toFixed(0)}%</span>
                            </div>
                        )}
                        {analysisResult.identification.dominantColors && analysisResult.identification.dominantColors.length > 0 && (
                            <div className="mt-2">
                            <h4 className="text-sm font-medium flex items-center gap-2 text-foreground/80"><Palette size={16} className="text-accent/80"/>Dominant Colors:</h4>
                            <p className="text-xs text-muted-foreground capitalize">{analysisResult.identification.dominantColors.join(', ')}</p>
                            </div>
                        )}
                        </div>
                        
                        {analysisResult.components && (
                        <div className="border-t border-border/50 pt-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2.5 mb-2 text-foreground/90"><Percent size={22} className="text-accent"/>Key Components</h3>
                        <ul className="space-y-1.5 text-muted-foreground">
                            {analysisResult.components.waterPercentage !== undefined && <li className="flex items-center gap-2"><Droplets size={18} className="text-blue-400" />Water: <span className="font-medium text-foreground/80">{analysisResult.components.waterPercentage}%</span></li>}
                            {analysisResult.components.sugarPercentage !== undefined && <li className="flex items-center gap-2"><Waves size={18} className="text-orange-400" />Sugar: <span className="font-medium text-foreground/80">{analysisResult.components.sugarPercentage}%</span></li>}
                            {analysisResult.components.fiberPercentage !== undefined && <li className="flex items-center gap-2"><Leaf size={18} className="text-green-400" />Fiber: <span className="font-medium text-foreground/80">{analysisResult.components.fiberPercentage}%</span></li>}
                        </ul>
                        </div>
                        )}

                        {analysisResult.components?.vitaminsAndMinerals && (
                        <div className="border-t border-border/50 pt-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2.5 mb-2 text-foreground/90"><Info size={22} className="text-accent"/>Vitamins & Minerals</h3>
                        <p className="text-sm text-muted-foreground">{analysisResult.components.vitaminsAndMinerals}</p>
                        </div>
                        )}

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
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="barcode-scan" className="mt-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">Enter the barcode number found on the product packaging.</p>
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  placeholder="e.g., 049000042566 (Coca-Cola Classic)" 
                  value={barcodeInputValue}
                  onChange={(e) => setBarcodeInputValue(e.target.value)}
                  className="flex-grow"
                  disabled={isBarcodeLoading}
                />
                <Button 
                  onClick={handleAnalyzeBarcode} 
                  disabled={isBarcodeLoading || !barcodeInputValue.trim()}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-base py-2.5 px-6 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90"
                >
                  <Zap className="mr-2 h-5 w-5" /> Analyze Barcode
                </Button>
              </div>
            </div>

            {isBarcodeLoading && (
              <div className="space-y-3 pt-6">
                <div className="flex justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-md text-primary text-center">AI is analyzing barcode data, please wait...</p>
              </div>
            )}

            {barcodeError && (
              <Alert variant="destructive" className="mt-4 bg-destructive/20 border-destructive/50 text-destructive-foreground">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Barcode Analysis Error</AlertTitle>
                <AlertDescription>{barcodeError}</AlertDescription>
              </Alert>
            )}
            
            {barcodeAnalysisResult && (
              <>
                <Alert variant="default" className="mt-6 mb-4 bg-muted/30 border-muted/50">
                  <Info className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-foreground font-semibold">Product Analysis (Barcode)</AlertTitle>
                  <AlertDescription className="text-muted-foreground">
                    Product information is fetched from Open Food Facts. Ingredient analysis is AI-generated and for informational purposes. It may not be 100% accurate. Consult experts for critical decisions.
                  </AlertDescription>
                </Alert>

                {!barcodeAnalysisResult.isFound ? (
                     <Card className="bg-card/70 backdrop-blur-sm shadow-xl border border-yellow-500/60 mt-6">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="font-headline text-2xl md:text-3xl text-yellow-300 flex items-center gap-3">
                                <AlertTriangle size={30} /> Product Not Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground text-lg">
                                {barcodeAnalysisResult.overallAssessment || `Could not retrieve information for barcode: ${barcodeInputValue}. Please check the number or try another.`}
                            </p>
                            {barcodeAnalysisResult.source && <p className="text-sm text-muted-foreground/70 mt-2">Data source: {barcodeAnalysisResult.source}</p>}
                        </CardContent>
                         <CardFooter className="border-t border-border/50 pt-6">
                            <Button variant="outline" onClick={handleBarcodeScanNew} className="text-base py-2.5 px-6">Scan New Barcode</Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="bg-card/70 backdrop-blur-sm shadow-xl border border-accent/60 shadow-[0_0_15px_3px_hsl(var(--accent)/0.3),0_0_25px_7px_hsl(var(--accent)/0.15)] mt-6">
                        <CardHeader className="border-b border-border/50 pb-4">
                             <div className="flex flex-col sm:flex-row gap-4 items-start">
                                {barcodeAnalysisResult.imageUrl ? (
                                    <Image
                                        src={barcodeAnalysisResult.imageUrl}
                                        alt={barcodeAnalysisResult.productName || "Product Image"}
                                        width={100}
                                        height={100}
                                        className="rounded-md object-contain border border-border shadow-md bg-white"
                                    />
                                ) : (
                                     <div className="w-[100px] h-[100px] flex items-center justify-center bg-muted/70 rounded-md border border-border shadow-md">
                                        <ImageIcon size={48} className="text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="font-headline text-2xl md:text-3xl text-primary flex items-center gap-2">
                                        <Tag size={30} /> {barcodeAnalysisResult.productName || "Product"}
                                    </CardTitle>
                                    {barcodeAnalysisResult.brand && <CardDescription className="pt-1 text-base text-muted-foreground flex items-center gap-2"><Building size={16}/>{barcodeAnalysisResult.brand}</CardDescription>}
                                     {barcodeAnalysisResult.source && <CardDescription className="pt-1 text-xs text-muted-foreground/70">Data from: {barcodeAnalysisResult.source}</CardDescription>}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                            {barcodeAnalysisResult.ingredients && barcodeAnalysisResult.ingredients.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1.5 text-foreground/90"><ListChecks size={20} className="text-accent"/>Ingredients</h3>
                                    <p className="text-sm text-muted-foreground bg-background/40 p-3 rounded-md border border-border/40">
                                        {barcodeAnalysisResult.ingredients.join(', ')}
                                    </p>
                                </div>
                            )}
                             {barcodeAnalysisResult.allergens && barcodeAnalysisResult.allergens.length > 0 && (
                                <div className="border-t border-border/50 pt-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1.5 text-yellow-400"><AlertCircle size={20} />Declared Allergens</h3>
                                    <ul className="list-disc list-inside ml-1 space-y-1 text-sm text-yellow-300/90 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/30">
                                        {barcodeAnalysisResult.allergens.map((allergen, index) => (
                                            <li key={index}>{allergen}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {barcodeAnalysisResult.potentialConcerns && barcodeAnalysisResult.potentialConcerns.length > 0 && (
                                <div className="border-t border-border/50 pt-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1.5 text-red-400"><AlertTriangle size={20} />Potential Concerns</h3>
                                    <div className="space-y-2">
                                    {barcodeAnalysisResult.potentialConcerns.map((item, index) => (
                                        <Alert key={index} variant="destructive" className="bg-destructive/10 border-destructive/30 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle className="font-medium text-red-300">{item.concern}</AlertTitle>
                                            {item.details && <AlertDescription className="text-red-400/80">{item.details}</AlertDescription>}
                                        </Alert>
                                    ))}
                                    </div>
                                </div>
                            )}
                             {barcodeAnalysisResult.overallAssessment && (
                                <div className="border-t border-border/50 pt-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1.5 text-foreground/90"><Info size={20} className="text-accent"/>Overall Assessment</h3>
                                    <p className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-md border border-muted/40">{barcodeAnalysisResult.overallAssessment}</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-border/50 pt-6">
                            <Button variant="outline" onClick={handleBarcodeScanNew} className="text-base py-2.5 px-6 transition-all duration-150 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:brightness-90">Scan New Barcode</Button>
                        </CardFooter>
                    </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
