import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Upload, 
  Download, 
  Search, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pages
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentViewerPage from "./pages/DocumentViewerPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Documa</span>
            </Link>
            <p className="text-gray-500 max-w-xs mb-6">
              Enterprise-grade document intelligence platform. Extract knowledge, search semantically, and chat with your documents.
            </p>
            <div className="flex gap-4">
              <a href="mailto:pranavvp1507@gmail.com" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://github.com/VPPranav" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/pranav-v-p-3636b825a/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Dashboard</Link></li>
              <li><Link to="/chat" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Chat AI</Link></li>
              <li><Link to="/settings" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">API & Settings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:pranavvp1507@gmail.com" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm flex items-center gap-2">
                  pranavvp1507@gmail.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="text-gray-500 text-sm">Based in India</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Documa. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm font-medium">
            Developed By <span className="text-indigo-600">Pranav V P</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", path: "/chat", icon: MessageSquare },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FileText className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Documa</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600",
                  location.pathname === link.path ? "text-indigo-600" : "text-gray-500"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/dashboard" 
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg"
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/viewer/:id" element={<DocumentViewerPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
