
import { SummaryData } from "@/components/summarization/SummaryResult";
import { SummarizationOptions } from "@/components/summarization/SummarizationForm";

// This is a mock service that simulates the summarization process
// In a real application, this would call actual APIs
export const summarizeDocument = async (
  file: File,
  options: SummarizationOptions
): Promise<SummaryData> => {
  // Simulate API call with delay
  return new Promise((resolve) => {
    console.log("Summarizing file:", file.name);
    console.log("With options:", options);
    
    setTimeout(() => {
      // Extract title from file name
      const title = file.name.replace(".pdf", "").replace(/_/g, " ");
      
      // Generate mock summary based on options
      const summaryLength = options.lengthType === "short" ? 1 : 
                            options.lengthType === "medium" ? 2 : 3;
      
      // Mock summary paragraphs
      const summaryParagraphs = [
        "Artificial intelligence (AI) is revolutionizing how we interact with technology and process information. Modern AI systems, especially Large Language Models (LLMs), can now understand, summarize, and generate human-like text across domains. This capability opens new possibilities for knowledge management and information synthesis that were previously unattainable.",
        
        "Recent advances in multimodal AI have expanded these capabilities beyond text to include processing of images, audio, and video content. Systems can now extract information from diverse media types and create coherent summaries that integrate insights across modalities. These developments are particularly valuable for educational contexts, research, and professional settings where information overload is common.",
        
        "Despite these advances, challenges remain in ensuring AI summarizations are accurate, unbiased, and properly contextualized. Current research focuses on improving factual consistency, reducing hallucinations, and developing better evaluation metrics for generated summaries. Future directions include more sophisticated cross-modal understanding and personalized summarization that adapts to individual user needs and preferences."
      ];
      
      // Generate summary based on selected length
      const summary = summaryParagraphs.slice(0, summaryLength).join("\n\n");
      
      // Generate bullet points if requested
      const bulletPoints = options.bulletPoints ? [
        "AI systems can now process and summarize information from text, audio, and visual sources",
        "Large Language Models (LLMs) demonstrate advanced capabilities in understanding complex documents",
        "Multimodal AI integrates information across different media types for comprehensive analysis",
        "Challenges remain in ensuring accuracy and reducing bias in AI-generated summaries",
        "Future developments focus on personalization and improved cross-modal understanding"
      ] : [];
      
      // Generate keywords if requested
      const keywords = options.extractKeywords ? [
        "Artificial Intelligence",
        "Machine Learning",
        "Document Summarization",
        "Natural Language Processing",
        "Multimodal AI",
        "Information Synthesis",
        "Knowledge Management"
      ] : [];
      
      // Generate reading time
      const readingTime = `${Math.floor(Math.random() * 5) + 2} min read`;
      
      // Generate sentiment if requested
      const sentiment = options.includeSentiment ? 
        ["Positive", "Neutral", "Negative"][Math.floor(Math.random() * 3)] : 
        undefined;
      
      resolve({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        summary,
        bulletPoints,
        keywords,
        readingTime,
        sentiment,
        createdAt: new Date()
      });
    }, 3000); // Simulate 3 second processing time
  });
};
