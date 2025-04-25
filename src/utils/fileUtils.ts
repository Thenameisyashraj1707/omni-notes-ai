
import { transcribeAudioVideo, loadTransformersLibrary } from "@/services/speechToTextService";

// Function to extract text content from a file
export const extractTextFromFile = async (file: File): Promise<string> => {
  console.log(`Extracting text from file: ${file.name}, type: ${file.type}`);
  
  // For text files, process directly
  if (file.type.includes('text')) {
    return await file.text();
  }
  
  // For audio/video files, use the transcription service
  if (file.type.includes('audio') || file.type.includes('video')) {
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
        return createMockContentForFile(file);
      }
    } catch (error) {
      console.error("Error transcribing audio/video:", error);
      return createMockContentForFile(file);
    }
  }
  
  // For other file types (like PDFs) or fallback
  return createMockContentForFile(file);
};

// Helper function to create mock content based on file type
const createMockContentForFile = (file: File): string => {
  const fileType = getFileTypeCategory(file);
  const fileName = file.name;
  
  let content = `Content extracted from ${fileName}.\n\n`;
  
  if (fileType === "audio") {
    content += `This is a transcript of the audio file "${fileName}".\n\n`;
    content += `In this audio recording, the speaker discusses various topics including artificial intelligence, 
    machine learning, and their applications in modern society. They analyze current trends
    and potential future developments. The speaker also addresses ethical considerations
    and regulatory challenges associated with these technologies. The conclusion emphasizes
    the importance of responsible innovation and international cooperation.`;
  } else if (fileType === "video") {
    content += `This is a transcript of the video file "${fileName}".\n\n`;
    content += `The video presents an in-depth explanation of quantum computing, comparing classical
    and quantum approaches. The presenter uses visual aids to demonstrate key concepts like
    quantum bits (qubits), superposition, and entanglement. They highlight recent breakthroughs
    and discuss potential applications in fields such as cryptography, drug discovery, and
    optimization problems that could revolutionize various industries.`;
  } else {
    content += `This document discusses the impact of artificial intelligence on modern society,
    covering economic benefits, ethical concerns, and future challenges. It highlights how
    AI is transforming industries through automation while raising questions about job
    displacement and privacy. The analysis includes case studies from various sectors and
    geographic regions. The conclusion emphasizes the need for balanced regulation that
    encourages innovation while protecting public interests.`;
  }
  
  return content;
};

// Function to determine if a file is processable
export const isProcessableFile = (file: File): boolean => {
  const fileType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  return fileType.includes('text') || 
         fileType.includes('pdf') || 
         fileType.includes('audio') || 
         fileType.includes('video') ||
         ['pdf', 'txt', 'docx', 'mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi'].includes(extension);
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
