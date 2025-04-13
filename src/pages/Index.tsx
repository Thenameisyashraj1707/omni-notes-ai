
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SummarizationForm, SummarizationOptions } from "@/components/summarization/SummarizationForm";
import { SummaryResult, SummaryData } from "@/components/summarization/SummaryResult";
import { summarizeDocument } from "@/services/summarizationService";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";
import { Brain, FileText, Sparkles, FileAudio, FileVideo } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryData | null>(null);
  const { toast } = useToast();

  const handleSummarize = async (file: File, options: SummarizationOptions) => {
    // Check if API key is set
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in settings first",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await summarizeDocument(file, options);
      setSummaryResult(result);
    } catch (error) {
      console.error("Error summarizing document:", error);
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
              </div>

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
              
              <SummarizationForm onSummarize={handleSummarize} isProcessing={isProcessing} />
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
