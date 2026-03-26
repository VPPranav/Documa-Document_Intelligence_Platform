import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  status: "processing" | "processed" | "error";
  createdAt: string;
  mimeType: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load documents");
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const newDoc = await response.json();
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success("Document uploaded and processed successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Dashboard</h1>
          <p className="text-gray-500">Manage your document library and track processing status.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <label className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4" />
            Upload New
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Documents", value: documents.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Processed", value: documents.filter(d => d.status === "processed").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Storage Used", value: "1.2 GB", icon: Database, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-[32px] p-12 text-center transition-all mb-12
          ${isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-gray-200 bg-gray-50/30"}
          ${isUploading ? "opacity-50 pointer-events-none" : "opacity-100"}
        `}
      >
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <Upload className={`w-8 h-8 ${isUploading ? "animate-bounce text-indigo-600" : "text-gray-400"}`} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isUploading ? "Processing Document..." : "Upload your documents"}
          </h3>
          <p className="text-gray-500 mb-6">
            Drag and drop your PDF, DOCX, or scanned images here. We'll handle the rest.
          </p>
          <label className="inline-flex px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
            Browse Files
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Search and List */}
      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Showing {filteredDocs.length} documents
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredDocs.map((doc) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <Link to={`/viewer/${doc.id}`} className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors flex items-center gap-1">
                            {doc.name}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <div className="text-xs text-gray-400">{doc.mimeType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        doc.status === "processed" ? "bg-green-50 text-green-600" : 
                        doc.status === "processing" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                      }`}>
                        {doc.status === "processed" ? <CheckCircle2 className="w-3 h-3" /> : 
                         doc.status === "processing" ? <Clock className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3" />}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="text-gray-400 mb-2">No documents found</div>
                    <p className="text-sm text-gray-500">Try uploading a new file to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
