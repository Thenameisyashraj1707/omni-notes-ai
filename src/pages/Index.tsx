
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SummarizationForm, SummarizationOptions } from "@/components/summarization/SummarizationForm";
import { SummaryResult, SummaryData } from "@/components/summarization/SummaryResult";
import { summarizeDocument } from "@/services/summarizationService";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";
import { Brain, FileText, Sparkles, FileAudio, FileVideo, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryData | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async (file: File, options: SummarizationOptions) => {
    setIsProcessing(true);
    setUploadError(null);
    
    try {
      // Check file size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadError("File size exceeds the 10MB limit. Please upload a smaller file.");
        setIsProcessing(false);
        return;
      }
      
      const result = await summarizeDocument(file, options);
      setSummaryResult(result);
      
      // If summary contains an error message, display it as an alert
      if (result.summary.includes("[Unable to extract content") || 
          result.summary.includes("[This appears to be")) {
        setUploadError("Warning: The file format may not be fully supported. The summary may be incomplete.");
      }
      
      // Only show API key notice if user has enabled features requiring API
      const apiKey = localStorage.getItem("openai_api_key");
      if ((!apiKey || apiKey.trim() === "") && 
          (options.topicDetection || options.chapterSummarization)) {
        toast({
          title: "Some features limited",
          description: "For advanced features like topic detection and chapter summaries, add your OpenAI API key in settings.",
        });
      }
    } catch (error) {
      console.error("Error summarizing document:", error);
      setUploadError("Failed to summarize the document. Please try again or try a different file format.");
      toast({
        title: "Summarization Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSummaryResult(null);
    setUploadError(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <AnimatedBackground />
      <div className="backdrop-blur-sm bg-white/5 min-h-screen flex flex-col z-0">
        <Header />
        
        <main className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-12">
            {!summaryResult ? (
              <>
                <div className="text-center mb-12">
                  <div className="flex justify-center items-center mb-4">
                    <h1 className="text-5xl font-bold inline-flex items-center text-white drop-shadow-lg">
                      <Sparkles className="h-10 w-10 mr-2 text-omni-primary animate-pulse" />
                      <span className="bg-gradient-omni text-transparent bg-clip-text animate-gradient-shift">
                        OmniSummarize
                      </span>
                    </h1>
                    <div className="ml-4">
                      <ApiKeySettings />
                    </div>
                  </div>
                  <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                    Transform PDFs, audio, and videos into concise, 
                    intelligent summaries with AI-powered analysis.
                  </p>
                  <p className="text-sm text-gray-300 mt-2 max-w-3xl mx-auto">
                    Basic summarization works without an API key. For advanced features, add your OpenAI API key in settings.
                  </p>
                </div>

                {uploadError && (
                  <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto bg-red-900/80 border-red-800">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      {uploadError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  <div className="glass-neo bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform hover:scale-105 duration-300">
                    <div className="h-16 w-16 rounded-full bg-omni-primary/30 flex items-center justify-center mb-4 ring-2 ring-omni-primary/50 animate-pulse-slow">
                      <FileText className="h-8 w-8 text-omni-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Document Analysis</h3>
                    <p className="text-gray-300">
                      Upload PDFs and extract key information without reading the entire document
                    </p>
                  </div>
                  
                  <div className="glass-neo bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform hover:scale-105 duration-300">
                    <div className="h-16 w-16 rounded-full bg-omni-secondary/30 flex items-center justify-center mb-4 ring-2 ring-omni-secondary/50 animate-pulse-slow">
                      <FileAudio className="h-8 w-8 text-omni-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Audio Transcription</h3>
                    <p className="text-gray-300">
                      Convert audio recordings into text and generate concise summaries
                    </p>
                  </div>
                  
                  <div className="glass-neo bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform hover:scale-105 duration-300">
                    <div className="h-16 w-16 rounded-full bg-omni-accent/30 flex items-center justify-center mb-4 ring-2 ring-omni-accent/50 animate-pulse-slow">
                      <FileVideo className="h-8 w-8 text-omni-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Video Content Analysis</h3>
                    <p className="text-gray-300">
                      Extract information from videos including audio and visual content
                    </p>
                  </div>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  <div className="bg-amber-900/40 backdrop-blur-md border border-amber-800/50 rounded-lg p-4 mb-6 text-amber-200 text-sm">
                    <p className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Supported formats:</strong> Plain text (.txt), PDF, MP3, WAV, MP4, and more.
                        <br />
                        Office documents (.docx, .xlsx, .pptx) have limited support. For best results, please convert Office documents to PDF or plain text before uploading.
                      </span>
                    </p>
                  </div>
                  
                  <div className="glass-neo bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-xl">
                    <SummarizationForm onSummarize={handleSummarize} isProcessing={isProcessing} />
                  </div>
                </div>
              </>
            ) : (
              <div className="max-w-4xl mx-auto glass-neo bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-lg">
                <SummaryResult data={summaryResult} onReset={handleReset} />
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;
