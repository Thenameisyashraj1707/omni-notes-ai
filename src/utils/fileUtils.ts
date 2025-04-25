
import { transcribeAudioVideo, loadTransformersLibrary } from "@/services/speechToTextService";

// Function to extract text content from a file
export const extractTextFromFile = async (file: File): Promise<string> => {
  console.log(`Extracting text from file: ${file.name}, type: ${file.type}`);
  
  // For text files, process directly
  if (file.type.includes('text')) {
    return await file.text();
  }
  
  // For Office documents (docx, etc)
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (file.type.includes('officedocument') || ['docx', 'xlsx', 'pptx'].includes(extension)) {
    console.log("Processing Office document");
    try {
      // Office documents are binary and need special handling
      // For now, we'll use a fallback that explains the limitation
      return `[This appears to be a Microsoft Office document (${extension})]\n\n` +
        `Currently, our system can only extract text from plain text files, PDFs, and media files.\n\n` +
        `For Microsoft Office documents like Word (.docx), Excel (.xlsx), or PowerPoint (.pptx), ` +
        `please consider saving your document as a PDF or plain text file before uploading for best results.\n\n` +
        `If you'd like to proceed with a rough extraction attempt, you can try again. ` +
        `However, for accurate results with Office documents, converting to PDF is recommended.`;
    } catch (error) {
      console.error("Error processing Office document:", error);
      return await readFileContent(file);
    }
  }
  
  // For audio/video files, use the transcription service
  if (file.type.includes('audio') || file.type.includes('video') || 
      ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'm4a', 'webm'].includes(extension)) {
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
  
  // For PDF files, add a note that proper PDF parsing requires additional libraries
  if (file.type.includes('pdf') || extension === 'pdf') {
    try {
      // Try to read the PDF as text (may not work well)
      const text = await file.text();
      if (text && text.trim().length > 0 && !text.startsWith('%PDF')) {
        return text;
      } else {
        return `[This appears to be a PDF document]\n\n` +
          `Our system can extract basic text from PDFs, but complex formatting, tables, or images cannot be processed.\n\n` +
          `For best results with PDFs containing complex layouts, consider using a dedicated PDF-to-text converter ` +
          `before uploading, or upload a plain text version if available.`;
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      return await readFileContent(file);
    }
  }
  
  // For other file types or fallback
  return await readFileContent(file);
};

// Helper function to read file content or create mock content
const readFileContent = async (file: File): Promise<string> => {
  try {
    // Try to read the file as text
    const text = await file.text();
    if (text && text.trim().length > 0 && !isBinaryData(text)) {
      return text;
    }
  } catch (e) {
    console.warn("Could not read file as text:", e);
  }
  
  // If reading as text fails or is binary data, use a fallback message
  return `[Unable to extract content from ${file.name}]\n\n` +
    `The file you uploaded appears to be in a format that cannot be directly processed as text. ` +
    `This may be a binary file, a corrupted file, or a format that requires special processing.\n\n` +
    `For best results, please try:\n` +
    `- Converting your document to a plain text (.txt) format\n` +
    `- Converting Office documents to PDF first\n` +
    `- Using simpler formatting in your original document\n` +
    `- For audio/video files, ensure they're in common formats like MP3, WAV, or MP4\n\n` +
    `If you believe this is an error, please try a different file or format.`;
};

// Helper function to detect binary data in text
const isBinaryData = (text: string): boolean => {
  // Check for common binary file signatures or patterns
  const binaryPatterns = [
    '%PDF-', // PDF
    'PK', // ZIP/Office documents
    '\x00\x01\x00\x00', // Various binary formats
    '\xFF\xD8\xFF', // JPEG
    '\x89PNG', // PNG
    'GIF8', // GIF
    'ID3', // MP3
    '\x00\x00\x01\x00', // ICO
  ];
  
  // Check for high concentration of null bytes or control characters
  let controlChars = 0;
  const sampleSize = Math.min(text.length, 1000);
  
  for (let i = 0; i < sampleSize; i++) {
    const code = text.charCodeAt(i);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) { // Exclude tab, LF, CR
      controlChars++;
    }
  }
  
  // If more than 10% are control characters, likely binary
  if (controlChars / sampleSize > 0.1) {
    return true;
  }
  
  // Check for binary file signatures
  for (const pattern of binaryPatterns) {
    if (text.startsWith(pattern)) {
      return true;
    }
  }
  
  return false;
};

// Function to determine if a file is processable
export const isProcessableFile = (file: File): boolean => {
  const fileType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Check by file type
  if (fileType.includes('text') || 
      fileType.includes('pdf') || 
      fileType.includes('audio') || 
      fileType.includes('video') ||
      fileType.includes('officedocument')) {
    return true;
  }
  
  // Check by extension
  const supportedExtensions = [
    'pdf', 'txt', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt',
    'mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'm4a', 'webm',
    'rtf', 'csv'
  ];
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
