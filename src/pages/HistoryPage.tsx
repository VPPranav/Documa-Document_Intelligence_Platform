import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  Trash2,
  Download,
  ExternalLink,
  Activity,
  Search,
  Pin,
  GitCompare,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  mimeType: string;
  text?: string;
}

// ─── Document Diff / Compare Modal ────────────────────────────────────────────
function CompareModal({ docA, docB, onClose }: { docA: Document; docB: Document; onClose: () => void }) {
  const wordsA = new Set((docA.text || "").toLowerCase().match(/\b\w{4,}\b/g) || []);
  const wordsB = new Set((docB.text || "").toLowerCase().match(/\b\w{4,}\b/g) || []);
  const onlyInA = [...wordsA].filter((w) => !wordsB.has(w)).slice(0, 30);
  const onlyInB = [...wordsB].filter((w) => !wordsA.has(w)).slice(0, 30);
  const common = [...wordsA].filter((w) => wordsB.has(w)).slice(0, 30);

  const similarity = wordsA.size + wordsB.size > 0
    ? Math.round((2 * common.length / (wordsA.size + wordsB.size)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Document Comparison</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Similarity score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{similarity}%</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {/* Doc headers */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[docA, docB].map((doc, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${i === 0 ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/30" : "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/30"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${i === 0 ? "text-indigo-600 dark:text-indigo-400" : "text-cyan-600 dark:text-cyan-400"}`}>Document {i + 1}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{doc.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{(doc.text || "").trim().split(/\s+/).length.toLocaleString()} words</div>
              </div>
            ))}
          </div>

          {/* Similarity bar */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
              <span>Vocabulary Similarity</span>
              <span>{similarity}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: similarity > 60 ? "#10b981" : similarity > 30 ? "#f59e0b" : "#6366f1" }}
                initial={{ width: 0 }}
                animate={{ width: `${similarity}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Unique to A */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                Unique to Doc 1
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {onlyInA.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs rounded-lg font-medium">{w}</span>
                ))}
                {onlyInA.length === 0 && <span className="text-xs text-gray-400">None</span>}
              </div>
            </div>

            {/* Common */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Common Terms
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {common.slice(0, 20).map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 text-xs rounded-lg font-medium">{w}</span>
                ))}
                {common.length === 0 && <span className="text-xs text-gray-400">None</span>}
              </div>
            </div>

            {/* Unique to B */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-3 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                Unique to Doc 2
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {onlyInB.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs rounded-lg font-medium">{w}</span>
                ))}
                {onlyInB.length === 0 && <span className="text-xs text-gray-400">None</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const user = JSON.parse(localStorage.getItem("documa_user") || "{}");

  useEffect(() => {
    fetchDocuments();
    const pinned = JSON.parse(localStorage.getItem("documa_pinned") || "[]");
    setPinnedIds(pinned);
  }, []);

  const fetchDocuments = async () => {
    if (!user.id) return;
    try {
      const response = await fetch("/api/documents", { headers: { "x-user-id": user.id } });
      const data = await response.json();
      if (Array.isArray(data)) {
        setDocuments(data.sort((a: Document, b: Document) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load upload history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    if (!user.id) return;
    e.preventDefault();
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE", headers: { "x-user-id": user.id } });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        toast.success("Document deleted from history");
      }
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleBulkDelete = async () => {
    if (!user.id || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    let succeeded = 0;
    for (const id of ids) {
      try {
        const res = await fetch(`/api/documents/${id}`, { method: "DELETE", headers: { "x-user-id": user.id } });
        if (res.ok) succeeded++;
      } catch { }
    }
    setDocuments((prev) => prev.filter((d) => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
    toast.success(`Deleted ${succeeded} document${succeeded !== 1 ? "s" : ""}`);
  };

  const handleDownload = (doc: Document, e: React.MouseEvent) => {
    e.preventDefault();
    const blob = new Blob([doc.text || "No content"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) {
        toast.info("Select only 2 documents to compare");
        return prev;
      }
      return [...prev, id];
    });
  };

  const mimeTypes = useMemo(() => ["all", ...new Set(documents.map((d) => d.mimeType).filter(Boolean))], [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        !globalSearch ||
        doc.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        (doc.text || "").toLowerCase().includes(globalSearch.toLowerCase());
      const matchType = filterType === "all" || doc.mimeType === filterType;
      return matchSearch && matchType;
    });
  }, [documents, globalSearch, filterType]);

  // Sort: pinned first
  const sortedDocs = useMemo(() => {
    return [...filteredDocs].sort((a, b) => {
      const aPin = pinnedIds.includes(a.id) ? 1 : 0;
      const bPin = pinnedIds.includes(b.id) ? 1 : 0;
      return bPin - aPin;
    });
  }, [filteredDocs, pinnedIds]);

  const compareDocA = documents.find((d) => d.id === compareIds[0]);
  const compareDocB = documents.find((d) => d.id === compareIds[1]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Upload History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">A chronological timeline of all your document uploads.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* Global Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents or their contents…"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition placeholder:text-gray-400"
          />
          {globalSearch && (
            <button onClick={() => setGlobalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
        >
          {mimeTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All Types" : type.split("/").pop()?.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Compare mode toggle */}
        <button
          onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${compareMode ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
        >
          <GitCompare className="w-4 h-4" />
          Compare
        </button>

        {/* Bulk delete */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-red-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Compare mode banner */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
              Select 2 documents to compare. Selected: <strong>{compareIds.length}/2</strong>
            </div>
            {compareIds.length === 2 && (
              <button
                onClick={() => setShowCompare(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                Compare Now
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            Loading history...
          </div>
        ) : sortedDocs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {globalSearch ? "No results found" : "No Uploads Yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {globalSearch ? `No documents match "${globalSearch}"` : "You haven't uploaded any documents mapped to your account."}
            </p>
            {!globalSearch && (
              <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
                Go to Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            <AnimatePresence mode="popLayout">
              {sortedDocs.map((doc, i) => {
                const isPinned = pinnedIds.includes(doc.id);
                const isSelected = selectedIds.has(doc.id);
                const isCompareSelected = compareIds.includes(doc.id);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition group ${isCompareSelected
                        ? "bg-indigo-50 dark:bg-indigo-500/5"
                        : isSelected
                          ? "bg-gray-50 dark:bg-gray-800/50"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Select checkbox */}
                      {!compareMode && (
                        <button onClick={() => toggleSelect(doc.id)} className="text-gray-300 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0">
                          {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Square className="w-5 h-5" />}
                        </button>
                      )}

                      {/* Compare checkbox */}
                      {compareMode && (
                        <button
                          onClick={() => toggleCompare(doc.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${isCompareSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"}`}
                        >
                          {isCompareSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </button>
                      )}

                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0 relative">
                        <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        {isPinned && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Pin className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition truncate">
                          {doc.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(doc.createdAt).toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] uppercase font-bold tracking-wider">
                            {doc.mimeType?.split("/").pop() || "Unknown"}
                          </span>
                          {globalSearch && doc.text?.toLowerCase().includes(globalSearch.toLowerCase()) && (
                            <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded text-[10px] font-bold">
                              Content match
                            </span>
                          )}
                          {isPinned && (
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        to={`/viewer/${doc.id}`}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Open
                      </Link>
                      <button
                        onClick={(e) => handleDownload(doc, e)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
                        title="Download as Text"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                        title="Delete from History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer count */}
      {sortedDocs.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
          Showing {sortedDocs.length} of {documents.length} document{documents.length !== 1 ? "s" : ""}
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
        </div>
      )}

      {/* Compare modal */}
      <AnimatePresence>
        {showCompare && compareDocA && compareDocB && (
          <CompareModal docA={compareDocA} docB={compareDocB} onClose={() => setShowCompare(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}