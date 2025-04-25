
import { useState } from "react";
import { Brain, LayoutList, FileCog, ArrowRight, MessageCircle, Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "@/components/upload/FileUploader";
import { FileTypeSelector, FileTypeOption } from "@/components/upload/FileTypeSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SummarizationOptions {
  lengthType: "short" | "medium" | "long";
  lengthValue: number;
  bulletPoints: boolean;
  extractKeywords: boolean;
  includeSentiment: boolean;
  topicDetection: boolean;
  chapterSummarization: boolean;
  summaryType: "abstractive" | "extractive" | "hybrid";
  language: string;
  sourceType?: "document" | "audio" | "video";
}

interface SummarizationFormProps {
  onSummarize: (file: File, options: SummarizationOptions) => void;
  isProcessing: boolean;
}

export const SummarizationForm = ({ onSummarize, isProcessing }: SummarizationFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileTypeOption>("document");
  const [options, setOptions] = useState<SummarizationOptions>({
    lengthType: "medium",
    lengthValue: 60,
    bulletPoints: true,
    extractKeywords: true,
    includeSentiment: false,
    topicDetection: false,
    chapterSummarization: false,
    summaryType: "abstractive",
    language: "english",
  });

  const getAcceptedFileTypes = (type: FileTypeOption): string[] => {
    switch (type) {
      case "document":
        return [".pdf", ".txt", ".docx"];
      case "audio":
        return [".mp3", ".wav", ".ogg"];
      case "video":
        return [".mp4", ".mov", ".avi"];
      default:
        return [".pdf"];
    }
  };

  const handleLengthTypeChange = (value: string) => {
    let lengthValue = options.lengthValue;
    
    // Adjust slider based on type
    if (value === "short") lengthValue = 30;
    else if (value === "medium") lengthValue = 60;
    else if (value === "long") lengthValue = 80;
    
    setOptions({
      ...options,
      lengthType: value as "short" | "medium" | "long",
      lengthValue,
    });
  };

  const handleFileTypeChange = (type: FileTypeOption) => {
    setFileType(type);
    setFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSummarize(file, options);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileCog className="mr-2 h-5 w-5 text-omni-primary" />
          Upload Your Content
        </h3>
        
        <div className="space-y-6">
          <FileTypeSelector selectedType={fileType} onTypeChange={handleFileTypeChange} />
          <FileUploader 
            onFileSelected={(file) => setFile(file)} 
            acceptedFileTypes={getAcceptedFileTypes(fileType)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LayoutList className="mr-2 h-5 w-5 text-omni-primary" />
          Summarization Options
        </h3>
        
        <Tabs defaultValue="basic" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Options</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="length-type">Summary Length</Label>
                  <Select
                    value={options.lengthType}
                    onValueChange={handleLengthTypeChange}
                  >
                    <SelectTrigger id="length-type">
                      <SelectValue placeholder="Summary Length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (Concise)</SelectItem>
                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                      <SelectItem value="long">Long (Detailed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="length-slider">Compression Level</Label>
                    <span className="text-sm text-gray-500">{options.lengthValue}%</span>
                  </div>
                  <Slider
                    id="length-slider"
                    min={10}
                    max={90}
                    step={5}
                    value={[options.lengthValue]}
                    onValueChange={(value) => setOptions({...options, lengthValue: value[0]})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bullet-points" className="cursor-pointer">
                    Generate Bullet Points
                  </Label>
                  <Switch
                    id="bullet-points"
                    checked={options.bulletPoints}
                    onCheckedChange={(checked) => setOptions({...options, bulletPoints: checked})}
                  />
                </div>
                <p className="text-xs text-gray-500">Convert content into organized bullet points</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="extract-keywords" className="cursor-pointer">
                    Extract Keywords
                  </Label>
                  <Switch
                    id="extract-keywords"
                    checked={options.extractKeywords}
                    onCheckedChange={(checked) => setOptions({...options, extractKeywords: checked})}
                  />
                </div>
                <p className="text-xs text-gray-500">Identify and highlight important keywords</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sentiment-analysis" className="cursor-pointer">
                    Include Sentiment
                  </Label>
                  <Switch
                    id="sentiment-analysis"
                    checked={options.includeSentiment}
                    onCheckedChange={(checked) => setOptions({...options, includeSentiment: checked})}
                  />
                </div>
                <p className="text-xs text-gray-500">Analyze emotional tone and sentiment</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="language">Output Language</Label>
                <Select
                  value={options.language}
                  onValueChange={(value) => setOptions({...options, language: value})}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Output Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topic-detection" className="cursor-pointer">
                    Topic Detection
                  </Label>
                  <Switch
                    id="topic-detection"
                    checked={options.topicDetection}
                    onCheckedChange={(checked) => setOptions({...options, topicDetection: checked})}
                  />
                </div>
                <p className="text-xs text-gray-500">Identify main topics and themes</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chapter-summarization" className="cursor-pointer">
                    Chapter Summarization
                  </Label>
                  <Switch
                    id="chapter-summarization"
                    checked={options.chapterSummarization}
                    onCheckedChange={(checked) => setOptions({...options, chapterSummarization: checked})}
                  />
                </div>
                <p className="text-xs text-gray-500">Summarize by sections or chapters when possible</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="summary-type">Summarization Type</Label>
              <Select
                value={options.summaryType}
                onValueChange={(value) => setOptions({...options, summaryType: value as "abstractive" | "extractive" | "hybrid"})}
              >
                <SelectTrigger id="summary-type">
                  <SelectValue placeholder="Summarization Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abstractive">Abstractive (Reworded)</SelectItem>
                  <SelectItem value="extractive">Extractive (Direct Quotes)</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Mixed Approach)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Choose how content should be processed and summarized</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={!file || isProcessing}
          className="w-full max-w-md bg-gradient-omni hover:opacity-90 transition-opacity text-lg py-6"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2">
                <Brain className="h-5 w-5" />
              </div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              Summarize Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};
