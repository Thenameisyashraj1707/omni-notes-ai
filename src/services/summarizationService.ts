
import { SummaryData } from "@/components/summarization/SummaryResult";
import { SummarizationOptions } from "@/components/summarization/SummarizationForm";
import { extractTextFromFile } from "@/utils/fileUtils";
import { 
  generateSummaryWithOpenAI, 
  extractKeywordsWithOpenAI, 
  detectSentimentWithOpenAI,
  detectTopicsWithOpenAI,
  createChapterSummariesWithOpenAI,
  generateBulletPointsWithOpenAI
} from "./openaiService";

// Helper function to identify file type from file extension
const getFileType = (file: File): "document" | "audio" | "video" => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf', 'txt', 'docx'].includes(extension)) {
    return "document";
  } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return "audio";
  } else if (['mp4', 'mov', 'avi'].includes(extension)) {
    return "video";
  }
  
  return "document"; // Default to document
};

// Calculate estimated reading time based on word count and source type
const calculateReadingTime = (text: string, sourceType: "document" | "audio" | "video"): string => {
  const words = text.split(/\s+/).length;
  let minutes = 0;
  
  if (sourceType === "document") {
    // Average reading speed: 200-250 words per minute
    minutes = Math.ceil(words / 225);
    return `${minutes} min read`;
  } else if (sourceType === "audio") {
    // Audio is generally at speaking pace (about 150 words per minute)
    minutes = Math.ceil(words / 150);
    return `${minutes} min audio`;
  } else if (sourceType === "video") {
    // Videos may contain visual information, so slightly longer
    minutes = Math.ceil(words / 120);
    return `${minutes} min video`;
  }
  
  return `${minutes} min`;
};

// This service uses the OpenAI API to generate summaries
export const summarizeDocument = async (
  file: File,
  options: SummarizationOptions
): Promise<SummaryData> => {
  try {
    console.log("Summarizing file:", file.name);
    console.log("With options:", options);
    
    // Step 1: Extract text from the file
    const text = await extractTextFromFile(file);
    
    // Step 2: Generate the main summary
    const summary = await generateSummaryWithOpenAI(text, options);
    
    // Determine file type
    const sourceType = getFileType(file);
    
    // Extract title from file name
    const title = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Calculate reading time
    const readingTime = calculateReadingTime(text, sourceType);
    
    // Step 3: Process additional features based on options
    let bulletPoints: string[] = [];
    let keywords: string[] = [];
    let sentiment: string | undefined;
    let topics: string[] | undefined;
    let chapters: { title: string; content: string }[] | undefined;
    
    const tasks: Promise<void>[] = [];
    
    if (options.bulletPoints) {
      tasks.push(
        generateBulletPointsWithOpenAI(text)
          .then(result => { bulletPoints = result; })
          .catch(error => {
            console.error("Error generating bullet points:", error);
            bulletPoints = ["Failed to generate bullet points"];
          })
      );
    }
    
    if (options.extractKeywords) {
      tasks.push(
        extractKeywordsWithOpenAI(text)
          .then(result => { keywords = result; })
          .catch(error => {
            console.error("Error extracting keywords:", error);
            keywords = ["AI", "Summarization"];
          })
      );
    }
    
    if (options.includeSentiment) {
      tasks.push(
        detectSentimentWithOpenAI(text)
          .then(result => { sentiment = result; })
          .catch(error => {
            console.error("Error detecting sentiment:", error);
            sentiment = "Neutral";
          })
      );
    }
    
    if (options.topicDetection) {
      tasks.push(
        detectTopicsWithOpenAI(text)
          .then(result => { topics = result; })
          .catch(error => {
            console.error("Error detecting topics:", error);
            topics = ["General"];
          })
      );
    }
    
    if (options.chapterSummarization) {
      tasks.push(
        createChapterSummariesWithOpenAI(text)
          .then(result => { chapters = result; })
          .catch(error => {
            console.error("Error creating chapter summaries:", error);
            chapters = [{ title: "Error", content: "Failed to generate chapter summaries" }];
          })
      );
    }
    
    // Wait for all tasks to complete
    await Promise.all(tasks);
    
    return {
      title: formattedTitle,
      summary,
      bulletPoints,
      keywords,
      readingTime,
      sentiment,
      topics,
      chapters,
      sourceType,
      createdAt: new Date()
    };
  } catch (error) {
    console.error("Error in summarization service:", error);
    throw error;
  }
};
