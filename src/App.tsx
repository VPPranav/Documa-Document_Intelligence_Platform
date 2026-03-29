import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
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
  X,
  Sun,
  Moon,
  LogOut as LogOutIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "./components/ThemeProvider";
import { createClient } from "@supabase/supabase-js";

// Initialise Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string
);

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
import AuthPage from "./pages/AuthPage"; // Added AuthPage
import HistoryPage from "./pages/HistoryPage";

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem("documa_user");
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function DocumaLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
      <path d="M14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14C12 12.8954 12.8954 12 14 12Z" fill="white" fillOpacity="0.2" />
      <path d="M12 20L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 28L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="3" fill="white" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <DocumaLogo className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Documa</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6">
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
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Dashboard</Link></li>
              <li><Link to="/chat" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Chat AI</Link></li>
              <li><Link to="/history" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">History & Compare</Link></li>
              <li><Link to="/settings" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">API & Settings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Contact</h3>
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
            © {new Date().getFullYear()} Documa v2.0. All rights reserved.
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
    { name: "History", path: "/history", icon: FileText },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const user = localStorage.getItem("documa_user") ? JSON.parse(localStorage.getItem("documa_user")!) : null;

  const handleLogout = async () => {
    localStorage.removeItem("documa_user");
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const { theme, setTheme } = useTheme();

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-3 shadow-sm" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <DocumaLogo className="w-9 h-9 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Documa</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                  location.pathname === link.path ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                )}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all font-medium"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 dark:shadow-none flex items-center gap-2"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xl p-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 text-red-600 dark:text-red-400 font-medium p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left w-full"
              >
                <LogOutIcon className="w-5 h-5" />
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium p-3 rounded-lg hover:bg-indigo-700 transition-colors mt-2"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900 dark:text-gray-50 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/viewer/:id" element={
            <ProtectedRoute>
              <DocumentViewerPage />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}