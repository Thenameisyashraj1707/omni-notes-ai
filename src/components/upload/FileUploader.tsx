
import { useState } from "react";
import { Upload, FileType, X, FileAudio, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type FileUploaderProps = {
  onFileSelected: (file: File) => void;
  acceptedFileTypes?: string[];
};

export const FileUploader = ({ 
  onFileSelected, 
  acceptedFileTypes = [".pdf", ".mp3", ".wav", ".mp4", ".mov"] 
}: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const getFileTypeExtension = (file: File): string => {
    return file.name.split('.').pop()?.toLowerCase() || '';
  };

  const isValidFileType = (file: File): boolean => {
    if (acceptedFileTypes.length === 0) return true;
    
    const fileExt = `.${getFileTypeExtension(file)}`;
    return acceptedFileTypes.includes(fileExt);
  };

  const getFileIcon = (file: File) => {
    const fileExt = getFileTypeExtension(file);
    if (['pdf', 'docx', 'doc', 'txt'].includes(fileExt)) {
      return <FileType className="h-6 w-6 text-omni-primary" />;
    } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExt)) {
      return <FileAudio className="h-6 w-6 text-omni-secondary" />;
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExt)) {
      return <FileVideo className="h-6 w-6 text-omni-accent" />;
    }
    return <FileType className="h-6 w-6 text-omni-primary" />;
  };

  const getFileTypeDescription = () => {
    if (acceptedFileTypes.length === 0) return "all files";
    return acceptedFileTypes.join(", ").replace(/\./g, "");
  };

  const handleFile = (file: File) => {
    // Check if the file type is valid
    if (!isValidFileType(file)) {
      toast({
        title: "Invalid file type",
        description: `Only ${getFileTypeDescription()} files are supported.`,
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if file is a Word document (.docx, .doc)
    const fileExt = getFileTypeExtension(file);
    if (['docx', 'doc'].includes(fileExt)) {
      toast({
        title: "Limited support for Office documents",
        description: "Microsoft Office documents have limited support. For best results, convert to PDF or plain text.",
        variant: "warning",
      });
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleButtonClick = () => {
    document.getElementById('file-upload')?.click();
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive 
              ? "border-omni-primary bg-omni-primary/5" 
              : "border-gray-300 hover:border-omni-primary hover:bg-gray-50"
          } transition-colors`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            accept={acceptedFileTypes.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium mb-1">Drag and drop file here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
            <Button 
              type="button" 
              className="bg-gradient-omni hover:opacity-90 transition-opacity"
              onClick={handleButtonClick}
            >
              Select File
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              Max file size: 10MB. Supporting: {getFileTypeDescription()}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-omni-primary/10 p-2 rounded-md">
                {getFileIcon(selectedFile)}
              </div>
              <div className="truncate">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={removeFile}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
