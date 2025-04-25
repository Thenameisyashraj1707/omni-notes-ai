import { transcribeAudioVideo, loadTransformersLibrary } from "@/services/speechToTextService";

// Function to extract text content from a file
export const extractTextFromFile = async (file: File): Promise<string> => {
  console.log(`Extracting text from file: ${file.name}, type: ${file.type}`);
  
  // For text files, process directly
  if (file.type.includes('text')) {
    return await file.text();
  }
  
  // For audio/video files, use the transcription service
  if (file.type.includes('audio') || file.type.includes('video') || 
      ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'm4a', 'webm'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
    try {
      console.log("Attempting to transcribe audio/video file");
      // Try to load the transformers library if needed
      await loadTransformersLibrary();
      // Use the transcription service
      const transcription = await transcribeAudioVideo(file);
      
      if (transcription && transcription.length > 0) {
        console.log("Transcription successful");
        return transcription;
      } else {
        console.warn("Transcription returned empty result, using fallback");
        return await readFileContent(file);
      }
    } catch (error) {
      console.error("Error transcribing audio/video:", error);
      return await readFileContent(file);
    }
  }
  
  // For other file types (like PDFs) or fallback
  return await readFileContent(file);
};

// Helper function to read file content or create mock content
const readFileContent = async (file: File): Promise<string> => {
  try {
    // Try to read the file as text
    const text = await file.text();
    if (text && text.trim().length > 0) {
      return text;
    }
  } catch (e) {
    console.warn("Could not read file as text:", e);
  }
  
  // If reading as text fails, use a mock content (but make it clear it's a fallback)
  return `[Unable to extract content from ${file.name}. This is fallback content.]

This file appears to be in a format that couldn't be directly processed. 
If this is unexpected, please try a different file format or check that the file is not corrupted.

Some possible content based on the file name:
${file.name.replace(/[^a-zA-Z0-9\s]/g, ' ')} might contain information about 
${file.name.split(/[^a-zA-Z0-9]/).filter(w => w.length > 3).join(', ')}.

Please note that this text is generated as a fallback and does not represent the actual content of your file.`;
};

// Function to determine if a file is processable
export const isProcessableFile = (file: File): boolean => {
  const fileType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Check by file type
  if (fileType.includes('text') || 
      fileType.includes('pdf') || 
      fileType.includes('audio') || 
      fileType.includes('video')) {
    return true;
  }
  
  // Check by extension
  const supportedExtensions = ['pdf', 'txt', 'docx', 'mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'm4a', 'webm'];
  return supportedExtensions.includes(extension);
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
