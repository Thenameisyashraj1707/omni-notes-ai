
import { useState } from "react";
import { Download, Copy, CheckCircle, FileText, Clock, MessageCircle, Tag, Bookmark, ChevronDown, ChevronUp, Layers, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface SummaryData {
  title: string;
  summary: string;
  bulletPoints: string[];
  keywords: string[];
  readingTime: string;
  sentiment?: string;
  topics?: string[];
  chapters?: {
    title: string;
    content: string;
  }[];
  sourceType: "document" | "audio" | "video";
  createdAt: Date;
}

interface SummaryResultProps {
  data: SummaryData;
  onReset: () => void;
}

export const SummaryResult = ({ data, onReset }: SummaryResultProps) => {
  const [copied, setCopied] = useState(false);
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The summary has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Create text content
    const content = `
# ${data.title}

## Summary
${data.summary}

## Key Points
${data.bulletPoints.map(point => `- ${point}`).join('\n')}

## Keywords
${data.keywords.join(', ')}

${data.topics ? `## Topics\n${data.topics.join(', ')}\n` : ''}

${data.chapters ? `## Chapter Summaries\n${data.chapters.map(chapter => `### ${chapter.title}\n${chapter.content}`).join('\n\n')}\n` : ''}

Reading time: ${data.readingTime}
${data.sentiment ? `Sentiment: ${data.sentiment}` : ''}
Generated on: ${data.createdAt.toLocaleString()}
Source type: ${data.sourceType}
    `.trim();

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Summary downloaded",
      description: "Your summary has been downloaded as a text file.",
    });
  };

  const getSourceIcon = () => {
    switch (data.sourceType) {
      case "audio":
        return <Badge variant="outline" className="bg-omni-secondary/10 text-omni-secondary border-omni-secondary/20">Audio</Badge>;
      case "video":
        return <Badge variant="outline" className="bg-omni-accent/10 text-omni-accent border-omni-accent/20">Video</Badge>;
      default:
        return <Badge variant="outline" className="bg-omni-primary/10 text-omni-primary border-omni-primary/20">Document</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold">{data.title}</h2>
            {getSourceIcon()}
          </div>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span className="mr-4">{data.readingTime}</span>
            {data.sentiment && (
              <Badge 
                variant="outline" 
                className={
                  data.sentiment === "Positive" 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : data.sentiment === "Negative" 
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }
              >
                {data.sentiment}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleCopy(data.summary)}
          >
            {copied ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            Copy
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button size="sm" onClick={onReset}>
            New Summary
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="bullet-points">
            <MessageCircle className="h-4 w-4 mr-2" />
            Key Points
          </TabsTrigger>
          <TabsTrigger value="keywords">
            <Tag className="h-4 w-4 mr-2" />
            Keywords
          </TabsTrigger>
          {data.chapters && data.chapters.length > 0 && (
            <TabsTrigger value="chapters">
              <Layers className="h-4 w-4 mr-2" />
              Chapters
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap leading-relaxed">
                {data.summary}
              </p>
              
              {data.topics && data.topics.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 mr-2 text-omni-primary" />
                    <h4 className="font-medium">Main Topics</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bullet-points" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {data.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <Bookmark className="h-5 w-5 mr-2 text-omni-primary flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="keywords" className="mt-4">
          <Card>
            <CardContent className="pt-6 flex flex-wrap gap-2">
              {data.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                  {keyword}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {data.chapters && data.chapters.length > 0 && (
          <TabsContent value="chapters" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {data.chapters.map((chapter, idx) => (
                    <Collapsible 
                      key={idx} 
                      open={openChapter === idx} 
                      onOpenChange={() => setOpenChapter(openChapter === idx ? null : idx)}
                      className="border rounded-md overflow-hidden"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50">
                        <div className="font-medium">{chapter.title}</div>
                        {openChapter === idx ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 border-t">
                        <p className="text-gray-700 whitespace-pre-wrap">{chapter.content}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
