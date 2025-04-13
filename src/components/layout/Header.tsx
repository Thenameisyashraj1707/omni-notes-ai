
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-omni-primary" />
          <h1 className="text-xl font-bold bg-gradient-omni text-transparent bg-clip-text">
            OmniSummarize
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
          <Button size="sm" className="bg-gradient-omni hover:opacity-90 transition-opacity">
            Try Pro
          </Button>
        </div>
      </div>
    </header>
  );
};
