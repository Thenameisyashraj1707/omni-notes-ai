
import { useState } from "react";
import { Brain, LayoutList, FileCog, ArrowRight } from "lucide-react";
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

export interface SummarizationOptions {
  lengthType: "short" | "medium" | "long";
  lengthValue: number;
  bulletPoints: boolean;
  extractKeywords: boolean;
  includeSentiment: boolean;
  language: string;
}

interface SummarizationFormProps {
  onSummarize: (file: File, options: SummarizationOptions) => void;
  isProcessing: boolean;
}

export const SummarizationForm = ({ onSummarize, isProcessing }: SummarizationFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<SummarizationOptions>({
    lengthType: "medium",
    lengthValue: 60,
    bulletPoints: true,
    extractKeywords: true,
    includeSentiment: false,
    language: "english",
  });

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
          Upload Your Document
        </h3>
        <FileUploader onFileSelected={(file) => setFile(file)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LayoutList className="mr-2 h-5 w-5 text-omni-primary" />
          Summarization Options
        </h3>
        
        <div className="space-y-6">
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
        </div>
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
