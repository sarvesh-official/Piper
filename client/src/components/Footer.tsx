import { Facebook, Twitter, Linkedin, Instagram, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <h1 className="text-gradient text-lg">Piper Ai</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Revolutionizing learning with AI that understands how you think and adapts to how you learn.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Integrations</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Updates</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Guides</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">API Reference</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Community</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Piper AI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-piper-blue dark:text-gray-400 dark:hover:text-piper-cyan transition-colors">Cookie Policy</a>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Created with ❤️ by <a href="https://www.sarvee.dev" target="_blank" rel="noopener noreferrer" className="font-medium text-piper-blue dark:text-piper-cyan hover:underline">Sarvesh</a>
        </div>
      </div>

      <div className="relative">
        <div className="absolute right-10 bottom-10 transform translate-y-1/2">
          <img src="/piper-mascot.svg" alt="" className="w-16 h-16 animate-float" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
