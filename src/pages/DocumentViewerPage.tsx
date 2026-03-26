import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MoreVertical, 
  FileText, 
  Search, 
  Layers, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Tag,
  Calendar,
  User,
  Hash,
  ChevronRight,
  MessageSquare,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Document {
  id: string;
  name: string;
  text: string;
  status: string;
  createdAt: string;
  mimeType: string;
}

export default function DocumentViewerPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "metadata" | "entities">("content");

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await fetch("/api/documents");
        const data = await response.json();
        const found = data.find((d: Document) => d.id === id);
        setDoc(found || null);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h2>
        <Link to="/dashboard" className="text-indigo-600 font-semibold hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{doc.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(doc.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {doc.id}</span>
              <div className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Processed
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/chat" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100">
            <MessageSquare className="w-4 h-4" />
            Chat with Doc
          </Link>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="flex border-b border-gray-50">
              {[
                { id: "content", label: "Document Content", icon: FileText },
                { id: "entities", label: "Extracted Entities", icon: Cpu },
                { id: "metadata", label: "Full Metadata", icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
                    activeTab === tab.id ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTab === "content" && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose prose-indigo max-w-none"
                  >
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      {doc.text || "No text content extracted."}
                    </div>
                  </motion.div>
                )}

                {activeTab === "entities" && (
                  <motion.div
                    key="entities"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[
                      { label: "Organization", value: "Documa AI Corp", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Person", value: "Pranav V P", icon: User, color: "text-indigo-600", bg: "bg-indigo-50" },
                      { label: "Date", value: "March 26, 2026", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "Location", value: "India", icon: Tag, color: "text-cyan-600", bg: "bg-cyan-50" },
                    ].map((entity, i) => (
                      <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 ${entity.bg} ${entity.color} rounded-xl flex items-center justify-center`}>
                          <entity.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{entity.label}</div>
                          <div className="text-sm font-bold text-gray-900">{entity.value}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "metadata" && (
                  <motion.div
                    key="metadata"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 font-mono text-xs text-gray-600 overflow-auto">
                      <pre>{JSON.stringify(doc, null, 2)}</pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Processing Pipeline
            </h3>
            <div className="space-y-6">
              {[
                { label: "Ingestion", status: "completed", time: "0.2s" },
                { label: "OCR Preprocessing", status: "completed", time: "1.1s" },
                { label: "Layout Analysis", status: "completed", time: "0.8s" },
                { label: "NER Extraction", status: "completed", time: "2.4s" },
                { label: "Vector Indexing", status: "completed", time: "0.5s" },
              ].map((step, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{step.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-xl font-bold mb-4 relative z-10">AI Insights</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed">
              This document contains key information about document intelligence and extraction pipelines.
            </p>
            <Link to="/chat" className="w-full py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all relative z-10">
              Ask AI Questions
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
