
// This service handles transcription of audio/video files to text
// It uses a fallback mechanism if the main transcription library isn't available

import { extractTextFromFile } from "@/utils/fileUtils";

// Check if we can use the transformers library
let useTransformers = false;
let transformers: any = null;

// Try to import the transformers library
try {
  // This will be dynamically imported when needed
  useTransformers = true;
} catch (error) {
  console.warn("Hugging Face Transformers not available, using fallback method", error);
  useTransformers = false;
}

// Function to extract text from audio/video files
export const transcribeAudioVideo = async (file: File): Promise<string> => {
  try {
    // If we have the transformers library, use it
    if (useTransformers && transformers) {
      try {
        // Try to load the transcriber dynamically when needed
        const pipeline = await transformers.pipeline(
          "automatic-speech-recognition",
          "openai/whisper-tiny.en"
        );
        
        // Convert the file to an ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        // Convert ArrayBuffer to required format
        const audioData = new Float32Array(arrayBuffer);
        
        // Transcribe the audio
        const result = await pipeline(audioData);
        return result.text || "Transcription failed";
      } catch (error) {
        console.error("Error using Hugging Face Transformers:", error);
        // Fall back to the mock implementation
        return await fallbackTranscription(file);
      }
    } else {
      // Use the fallback method
      return await fallbackTranscription(file);
    }
  } catch (error) {
    console.error("Error in transcription:", error);
    return "Error during transcription. Please try again or use a different file.";
  }
};

// Fallback implementation that returns mock transcription
const fallbackTranscription = async (file: File): Promise<string> => {
  // For now, we'll use the existing text extraction as a fallback
  // In a real implementation, this would connect to a server-side API
  const mockText = await extractTextFromFile(file);
  
  return `Transcription of ${file.name} (using fallback method):
  
  ${mockText}
  
  Note: This is using a fallback transcription method. For full AI-powered transcription, 
  please ensure the Hugging Face Transformers library is properly installed.`;
};

// Dynamic import function to load the transformers library when needed
export const loadTransformersLibrary = async (): Promise<boolean> => {
  if (useTransformers && !transformers) {
    try {
      // Try to dynamically import the library
      transformers = await import("@huggingface/transformers");
      console.log("Successfully loaded Hugging Face Transformers");
      return true;
    } catch (error) {
      console.error("Failed to load Hugging Face Transformers:", error);
      useTransformers = false;
      return false;
    }
  }
  return useTransformers;
};

// Function to check if transformers is available
export const isTransformersAvailable = (): boolean => {
  return useTransformers && transformers !== null;
};
