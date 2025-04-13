
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} OmniSummarize. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/" className="text-sm text-gray-500 hover:text-omni-primary transition-colors">
              Privacy
            </Link>
            <Link to="/" className="text-sm text-gray-500 hover:text-omni-primary transition-colors">
              Terms
            </Link>
            <Link to="/" className="text-sm text-gray-500 hover:text-omni-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
