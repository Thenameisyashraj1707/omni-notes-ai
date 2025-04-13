
import { FileType, FileAudio, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FileTypeOption = 'document' | 'audio' | 'video';

interface FileTypeSelectorProps {
  selectedType: FileTypeOption;
  onTypeChange: (type: FileTypeOption) => void;
}

export const FileTypeSelector = ({ selectedType, onTypeChange }: FileTypeSelectorProps) => {
  return (
    <Tabs defaultValue={selectedType} onValueChange={(value) => onTypeChange(value as FileTypeOption)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="document" className="flex items-center space-x-2">
          <FileType className="h-4 w-4" />
          <span>Document</span>
        </TabsTrigger>
        <TabsTrigger value="audio" className="flex items-center space-x-2">
          <FileAudio className="h-4 w-4" />
          <span>Audio</span>
        </TabsTrigger>
        <TabsTrigger value="video" className="flex items-center space-x-2">
          <FileVideo className="h-4 w-4" />
          <span>Video</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
