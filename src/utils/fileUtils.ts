
import { transcribeAudioVideo, loadTransformersLibrary } from "@/services/speechToTextService";

// Function to extract text content from a file
export const extractTextFromFile = async (file: File): Promise<string> => {
  // For text files, process directly
  if (file.type.includes('text')) {
    return await file.text();
  }
  
  // For audio/video files, use the transcription service
  if (file.type.includes('audio') || file.type.includes('video')) {
    try {
      // Try to load the transformers library if needed
      await loadTransformersLibrary();
      // Use the transcription service
      return await transcribeAudioVideo(file);
    } catch (error) {
      console.error("Error transcribing audio/video:", error);
    }
  }
  
  // For other file types or fallback
  return `Sample content extracted from ${file.name}. 
  In a production environment, this would be actual content extracted from the file 
  using appropriate tools like OCR for PDFs, speech-to-text for audio, etc.
  
  For the purposes of this demo, we're using this placeholder text to demonstrate 
  the OpenAI integration for summarization.
  
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget
  ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
  Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget
  aliquam nisl nisl eget nisl.`;
};

// Function to determine if a file is processable
export const isProcessableFile = (file: File): boolean => {
  const fileType = file.type.toLowerCase();
  return fileType.includes('text') || 
         fileType.includes('pdf') || 
         fileType.includes('audio') || 
         fileType.includes('video');
};

// Helper function to get file type category
export const getFileTypeCategory = (file: File): "document" | "audio" | "video" => {
  const fileType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (fileType.includes('audio') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
    return "audio";
  } else if (fileType.includes('video') || ['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
    return "video";
  } else {
    return "document"; // Default to document for text, PDF, etc.
  }
};
