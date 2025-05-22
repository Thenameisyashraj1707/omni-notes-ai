
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-omni-primary animate-pulse" />
          <h1 className="text-xl font-bold bg-gradient-omni text-transparent bg-clip-text animate-gradient-shift">
            OmniSummarize
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white transition-all">
            Sign In
          </Button>
          <Button size="sm" className="bg-gradient-omni hover:opacity-90 transition-opacity animate-glow">
            Try Pro
          </Button>
        </div>
      </div>
    </header>
  );
};
