
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12">
          {!summaryResult ? (
            <>
              <div className="text-center mb-12">
                <div className="flex justify-center items-center mb-4">
                  <h1 className="text-4xl font-bold inline-flex items-center">
                    <Sparkles className="h-8 w-8 mr-2 text-omni-primary" />
                    <span className="bg-gradient-omni text-transparent bg-clip-text">
                      OmniSummarize
                    </span>
                  </h1>
                  <div className="ml-4">
                    <ApiKeySettings />
                  </div>
                </div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Transform PDFs, audio, and videos into concise, 
                  intelligent summaries with AI-powered analysis.
                </p>
                <p className="text-sm text-gray-500 mt-2 max-w-3xl mx-auto">
                  Basic summarization works without an API key. For advanced features, add your OpenAI API key in settings.
                </p>
              </div>

              {uploadError && (
                <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    {uploadError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white rounded-xl shadow-sm p-6 border flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-omni-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-7 w-7 text-omni-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Document Analysis</h3>
                  <p className="text-gray-600">
                    Upload PDFs and extract key information without reading the entire document
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-omni-secondary/10 flex items-center justify-center mb-4">
                    <FileAudio className="h-7 w-7 text-omni-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Audio Transcription</h3>
                  <p className="text-gray-600">
                    Convert audio recordings into text and generate concise summaries
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-omni-accent/10 flex items-center justify-center mb-4">
                    <FileVideo className="h-7 w-7 text-omni-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Video Content Analysis</h3>
                  <p className="text-gray-600">
                    Extract information from videos including audio and visual content
                  </p>
                </div>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-amber-800 text-sm">
                  <p className="flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Supported formats:</strong> Plain text (.txt), PDF, MP3, WAV, MP4, and more.
                      <br />
                      Office documents (.docx, .xlsx, .pptx) have limited support. For best results, please convert Office documents to PDF or plain text before uploading.
                    </span>
                  </p>
                </div>
                
                <SummarizationForm onSummarize={handleSummarize} isProcessing={isProcessing} />
              </div>
            </>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 border">
              <SummaryResult data={summaryResult} onReset={handleReset} />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
