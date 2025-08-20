
"use client";

import { useState, useRef, useTransition, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import {
  Copy,
  Share2,
  Upload,
  Sparkles,
  ImageIcon,
  LoaderCircle,
  AlertCircle,
  WandSparkles,
  User,
  Languages,
  ListRestart,
  Hash,
  BookUser,
  FileText,
  Settings,
  X,
  Mic,
  PenSquare,
  History,
  Trash2,
  Plus,
  ClipboardPaste,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { generateSocialPost } from "@/app/actions";
import type { GenerateCaptionOutput } from "@/ai/flows/generate-caption";
import { useIsMobile } from "@/hooks/use-mobile";

const OUTPUT_LANGUAGES = ["English", "Bangla", "Banglish"];
const POST_TYPES = ["Artist Showcase", "Personal Story", "Sale Post", "Poem", "Artist Introduction", "Product Showcase",];
const TONES = ["Excited", "Witty", "Formal", "Casual", "Mysterious", "Professional", "Funny"];
const MAX_IMAGES = 3;
const MAX_HISTORY_SIZE_MB = 4.5;
const MAX_HISTORY_SIZE_BYTES = MAX_HISTORY_SIZE_MB * 1024 * 1024;

const LOCAL_STORAGE_KEY = "happycaptions-data";

type FormData = {
    postType: string;
    channelName: string;
    numVariations: number;
    outputLanguage: string;
    tone: string;
    aboutPage: string;
    aboutPost: string;
};

type HistoryItem = {
    id: string;
    name: string;
    date: string;
    imageDataUrls: string[];
    result: GenerateCaptionOutput;
    formData: FormData;
};

type LocalSaves = {
    formData: FormData;
    history: HistoryItem[];
};

const getDefaultFormData = (): FormData => ({
    postType: POST_TYPES[0],
    channelName: "",
    numVariations: 1,
    outputLanguage: OUTPUT_LANGUAGES[0],
    tone: TONES[0],
    aboutPage: "",
    aboutPost: "",
});

export default function HappyCaptionsUI() {
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>(getDefaultFormData());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadedFromHistory, setIsLoadedFromHistory] = useState(false);
  
  const [result, setResult] = useState<GenerateCaptionOutput | null>(null);
  const [hashtagsByCaption, setHashtagsByCaption] = useState<Record<number, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [canShare, setCanShare] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setCanShare(!!navigator.share);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData: LocalSaves = JSON.parse(savedData);
        const loadedFormData = { ...getDefaultFormData(), ...(parsedData.formData || {}) };
        setFormData(loadedFormData);

        if (parsedData.history) {
            setHistory(parsedData.history);
        }
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const dataToSave: LocalSaves = { formData, history };
    try {
        let dataStr = JSON.stringify(dataToSave);

        if (new Blob([dataStr]).size > MAX_HISTORY_SIZE_BYTES) {
            console.warn("Total data size exceeds quota. Pruning history...");
            const prunedHistory = [...history];
            while (new Blob([JSON.stringify({ formData, history: prunedHistory })]).size > MAX_HISTORY_SIZE_BYTES && prunedHistory.length > 0) {
                prunedHistory.pop();
            }
            setHistory(prunedHistory); 
            return;
        }
        
        localStorage.setItem(LOCAL_STORAGE_KEY, dataStr);
    } catch (e) {
        console.error("Could not save data to localStorage", e);
    }
  }, [formData, history, isDataLoaded]);

  const handleFormChange = (
    key: keyof FormData,
    value: FormData[keyof FormData]
  ) => {
    setIsLoadedFromHistory(false);
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const saveToHistory = (newResult: GenerateCaptionOutput, sourceImageDataUrls: string[]) => {
      const newHistoryItem: HistoryItem = {
          id: new Date().toISOString(),
          name: newResult.captions[0]?.split(' ').slice(0, 5).join(' ') + '...' || 'Untitled',
          date: new Date().toLocaleString(),
          imageDataUrls: sourceImageDataUrls,
          result: newResult,
          formData: { ...formData }
      };

      setHistory(prevHistory => {
          const updatedHistory = [newHistoryItem, ...prevHistory];
          return updatedHistory;
      });
      toast({ description: "Post saved to history!" });
  };

  const processAndSetResults = (data: GenerateCaptionOutput, sourceImageDataUrls: string[]) => {
    setResult(data);
    const initialHashtags = data.hashtags.split(/\s+/).filter(Boolean).map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    const initialHashtagsByCaption: Record<number, string[]> = {};
    data.captions.forEach((_, index) => {
      initialHashtagsByCaption[index] = [...initialHashtags];
    });
    setHashtagsByCaption(initialHashtagsByCaption);
    setImageDataUrls(sourceImageDataUrls);
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const currentImageCount = imageDataUrls.length;
      const filesToProcess = Array.from(files).slice(0, MAX_IMAGES - currentImageCount);

      if (filesToProcess.length === 0 && files.length > 0) {
        toast({
          variant: "destructive",
          title: "Image limit reached",
          description: `You can only upload up to ${MAX_IMAGES} images.`
        });
        return;
      }
      
      filesToProcess.forEach(file => {
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: `Skipping non-image file: ${file.name}`,
          });
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setImageDataUrls(prev => [...prev, dataUrl]);
          setResult(null);
          setError(null);
          setHashtagsByCaption({});
          setIsLoadedFromHistory(false);
        };
        reader.readAsDataURL(file);
      })
    }
  };

  const handleGenerateClick = () => {
    if (imageDataUrls.length > 0) {
      const resultsCard = document.getElementById('tour-step-11');
      if (resultsCard) {
          const scrollableParent = resultsCard.closest('.custom-scrollbar');
          if (scrollableParent) {
            scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
          }
      }

      setResult(null);
      setError(null);
      setHashtagsByCaption({});
      setIsLoadedFromHistory(false);

      startTransition(async () => {
        const response = await generateSocialPost({ 
          photoDataUris: imageDataUrls.filter(Boolean), 
          ...formData
        });
        if (response.success) {
          processAndSetResults(response.data, imageDataUrls);
          saveToHistory(response.data, imageDataUrls);
        } else {
          setError(response.error);
        }
      });
    } else {
      toast({
        variant: "destructive",
        title: "No Image",
        description: "Please upload an image first.",
      });
    }
  }

  const handleCopy = (caption: string, hashtags: string[], type: "Post" | "Caption" | "Hashtags") => {
    let textToCopy = "";
    switch(type) {
      case "Post":
        textToCopy = `${caption}\n\n${hashtags.join(' ')}`;
        break;
      case "Caption":
        textToCopy = caption;
        break;
      case "Hashtags":
        textToCopy = hashtags.join(' ');
        break;
    }
    navigator.clipboard.writeText(textToCopy);
    toast({
      description: `${type} copied to clipboard!`,
    });
  };

  const handleShare = async (caption: string, hashtags: string[]) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Social Post from HappyCaptions",
          text: `${caption}\n\n${hashtags.join(' ')}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        toast({
          variant: "destructive",
          title: "Sharing failed",
          description: "There was an error trying to share your post.",
        });
      }
    }
  };
  
  const handleRemoveHashtag = (captionIndex: number, tagToRemove: string) => {
    setHashtagsByCaption(prev => ({
      ...prev,
      [captionIndex]: prev[captionIndex].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    setError(null);
    setFormData(item.formData);
    processAndSetResults(item.result, item.imageDataUrls);
    setIsHistoryOpen(false);
    setIsLoadedFromHistory(true);
  }
  
  const handleDeleteFromHistory = (idToDelete: string) => {
    setHistory(prev => prev.filter(item => item.id !== idToDelete));
    toast({ description: "History item deleted." });
  }

  const handleRemoveImage = (index: number) => {
    setImageDataUrls(prev => prev.filter((_, i) => i !== index));
    setIsLoadedFromHistory(false);
  }

  const handlePaste = async () => {
    if (imageDataUrls.length >= MAX_IMAGES) {
      toast({
        variant: "destructive",
        title: "Image limit reached",
        description: `You can only upload up to ${MAX_IMAGES} images.`
      });
      return;
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              setImageDataUrls(prev => [...prev, dataUrl].slice(0, MAX_IMAGES));
              setIsLoadedFromHistory(false);
            };
            reader.readAsDataURL(blob);
            toast({ description: "Image pasted successfully!" });
            return;
          }
        }
      }
      toast({
        variant: "destructive",
        title: "No Image Found",
        description: "No image was found on your clipboard.",
      });
    } catch (error) {
      console.error("Failed to read from clipboard:", error);
      toast({
        variant: "destructive",
        title: "Paste Failed",
        description: "Could not read image from clipboard. Your browser might not support this feature or permission was denied.",
      });
    }
  };


  const handleClearForm = () => {
    setImageDataUrls([]);
    setFormData(getDefaultFormData());
    setResult(null);
    setError(null);
    setHashtagsByCaption({});
    setIsLoadedFromHistory(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    toast({ description: "Form cleared." });
  };

  const handleClearResults = () => {
    setResult(null);
    setError(null);
    setHashtagsByCaption({});
    setIsLoadedFromHistory(false);
  };

  const isFormEmpty = 
    imageDataUrls.length === 0 &&
    JSON.stringify(formData) === JSON.stringify(getDefaultFormData());

  return (
    <div className="w-full flex justify-center lg:h-[85vh] lg:items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
        <Card id="tour-step-11" className="flex flex-col bg-card/30 backdrop-blur-[4px] shadow-[0_2px_6px_0_hsl(var(--primary)/0.15)] lg:h-full lg:overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Generated Results
              </CardTitle>
              <CardDescription>
                Here are your magical captions and hashtags.
              </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                {result && (
                  <Button onClick={handleClearResults} variant="ghost" size="icon" className="text-muted-foreground rounded-full bg-accent/50 hover:bg-accent">
                    <Trash2 className="w-5 h-5" />
                    <span className="sr-only">Clear Results</span>
                  </Button>
                )}
                <div id="tour-step-12">
                  <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full bg-accent/50 hover:bg-accent">
                        <History className="w-5 h-5" />
                        <span className="sr-only">Open History</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Post History</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar pr-4">
                        {history.length > 0 ? (
                          history.map((item) => (
                            <Card key={item.id} className="flex items-center gap-4 p-4">
                              <Image
                                src={item.imageDataUrls[0]}
                                alt="History item preview"
                                width={64}
                                height={64}
                                className="rounded-md object-cover w-16 h-16"
                                data-ai-hint="history thumbnail"
                              />
                              <div className="flex-1">
                                <p className="font-semibold truncate">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.date}</p>
                              </div>
                              <div className="flex gap-2">
                                  <Button onClick={() => handleLoadFromHistory(item)}>Load</Button>
                                  <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                          <Button variant="destructive" size="icon">
                                              <Trash2 className="w-4 h-4" />
                                              <span className="sr-only">Delete history item</span>
                                          </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete this post from your history.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteFromHistory(item.id)}>
                                              Delete
                                          </AlertDialogAction>
                                      </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No history yet.</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
            </div>
          </CardHeader>
          <CardContent data-tour-scroll-container className="flex-1 space-y-4 lg:overflow-y-auto lg:custom-scrollbar">
            {isPending ? (
              <div className="space-y-6">
                <Skeleton className="h-32 w-full mt-2" />
                <Skeleton className="h-32 w-full mt-2" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                <AlertTitle>Oh no! Something went wrong.</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="space-y-4">
                 {result.captions.map((caption, i) => (
                  <Card key={i} className="bg-background/50">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <Textarea
                          readOnly
                          value={caption}
                          className="w-full bg-transparent p-4"
                          resizable
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(hashtagsByCaption[i] || []).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="relative pr-6 py-0.5">
                            {tag}
                            <button
                              onClick={() => handleRemoveHashtag(i, tag)}
                              className="absolute top-1/2 -translate-y-1/2 right-[2px] p-0.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                              aria-label={`Remove ${tag}`}
                            >
                              <X className="w-3.5 h-3.5"/>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 pb-4 pt-0 justify-end gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(caption, hashtagsByCaption[i], "Post")}
                          aria-label="Copy post"
                          className="rounded-md"
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy Post
                        </Button>
                        {canShare && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(caption, hashtagsByCaption[i])}
                            aria-label="Share post"
                            className="rounded-md"
                          >
                            <Share2 className="h-4 w-4 mr-2" /> Share
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <WandSparkles className="w-16 h-16 mb-4 text-primary/50" />
                <h3 className="text-lg font-semibold">Ready for some magic?</h3>
                <p>Upload an image to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="flex flex-col bg-card/20 backdrop-blur-[4px] shadow-[0_2px_6px_0_hsl(var(--primary)/0.15)] lg:h-full lg:overflow-hidden lg:order-first">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Create Post
              </CardTitle>
              <CardDescription>
                Enter your details and upload an image to generate a post.
              </CardDescription>
            </div>
              <div id="tour-step-3">
                {!isFormEmpty && (
                  <Button onClick={handleClearForm} variant="ghost" size="icon" className="text-muted-foreground rounded-full bg-accent/50 hover:bg-accent">
                      <Trash2 className="w-5 h-5" />
                      <span className="sr-only">Clear Form</span>
                  </Button>
                )}
              </div>
          </CardHeader>
          <CardContent data-tour-scroll-container className="flex-1 space-y-4 lg:overflow-y-auto lg:custom-scrollbar">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="tour-step-1">
                  <Label htmlFor="postType" className="flex items-center gap-2 mb-2">
                    <PenSquare className="w-4 h-4" />
                    Post Type
                  </Label>
                  <Select value={formData.postType} onValueChange={value => handleFormChange('postType', value)}>
                    <SelectTrigger id="postType" className="w-full">
                      <SelectValue placeholder="Select a post type" />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div id="tour-step-2">
                  <Label htmlFor="channelName" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Page, Profile, or Channel Name
                  </Label>
                  <Input 
                    id="channelName"
                    placeholder="e.g., The Quirky Quilter"
                    value={formData.channelName}
                    onChange={(e) => handleFormChange('channelName', e.target.value)}
                    className="w-full"
                  />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="tour-step-4">
                  <Label htmlFor="numVariations" className="flex items-center gap-2 mb-2">
                    <ListRestart className="w-4 h-4" />
                    Number of Captions
                  </Label>
                  <Input
                    id="numVariations"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numVariations}
                    onChange={(e) => {
                      const value = e.target.value;
                      // @ts-ignore
                      handleFormChange('numVariations', value === '' ? '' : parseInt(value, 10));
                    }}
                    onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) {
                            handleFormChange('numVariations', 1);
                        } else if (val > 20) {
                           handleFormChange('numVariations', 20);
                        }
                    }}
                    className="w-full"
                  />
                </div>
                <div id="tour-step-5">
                  <Label htmlFor="language" className="flex items-center gap-2 mb-2">
                    <Languages className="w-4 h-4" />
                    Output Language
                  </Label>
                  <Select value={formData.outputLanguage} onValueChange={value => handleFormChange('outputLanguage', value)}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTPUT_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
              <div id="tour-step-6">
                <div className="flex justify-between items-center mb-2">
                  <Label>Images (up to {MAX_IMAGES})</Label>
                  <Button variant="ghost" size="icon" onClick={handlePaste} disabled={imageDataUrls.length >= MAX_IMAGES} className="hidden sm:inline-flex text-muted-foreground rounded-full bg-accent/50 hover:bg-accent">
                    <ClipboardPaste className="w-5 h-5" />
                    <span className="sr-only">Paste Image</span>
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                  {imageDataUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`Uploaded preview ${index + 1}`}
                        fill
                        className="object-cover w-full h-full border rounded-md"
                        data-ai-hint="user image"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {imageDataUrls.length < MAX_IMAGES && (
                    <div
                      className="border-2 border-dashed border-muted-foreground/30 rounded-lg aspect-square w-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      aria-label={`Upload an image`}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    >
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            <Accordion type="single" collapsible className="w-full" defaultValue="additional-options">
              <AccordionItem value="additional-options">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Additional Options
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div id="tour-step-7">
                        <Label htmlFor="tone" className="flex items-center gap-2 mb-2">
                          <Mic className="w-4 h-4" />
                          Tone of Voice
                        </Label>
                        <Select value={formData.tone} onValueChange={value => handleFormChange('tone', value)}>
                          <SelectTrigger id="tone" className="w-full">
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TONES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                  </div>
                    <div id="tour-step-8">
                      <Label htmlFor="aboutPage" className="flex items-center gap-2">
                        <BookUser className="w-4 h-4" />
                        About Your Page/Profile
                      </Label>
                      <Textarea
                        id="aboutPage"
                        placeholder="e.g., I post daily about my journey quilting traditional and modern patterns."
                        value={formData.aboutPage}
                        onChange={(e) => handleFormChange('aboutPage', e.target.value)}
                        rows={3}
                        resizable
                      />
                    </div>
                    <div id="tour-step-9">
                      <Label htmlFor="aboutPost" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        About This Post
                      </Label>
                      <Textarea
                        id="aboutPost"
                        placeholder="e.g., This is my first attempt at a log cabin pattern. I'm so excited to share the progress!"
                        value={formData.aboutPost}
                        onChange={(e) => handleFormChange('aboutPost', e.target.value)}
                        rows={3}
                        resizable
                      />
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="pt-4">
                <div id="tour-step-10" className="w-full">
                  <Button onClick={handleGenerateClick} disabled={imageDataUrls.length === 0 || isPending} className="w-full">
                    {isPending ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Generating...
                      </>
                    ) : isLoadedFromHistory ? (
                      <>
                        <ListRestart />
                        Generate Again
                      </>
                    ) : (
                      <>
                        <Sparkles />
                        Generate Post
                      </>
                    )}
                  </Button>
                </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
