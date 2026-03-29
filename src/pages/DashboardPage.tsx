import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Database,
  BarChart3,
  X,
  FileSpreadsheet,
  TrendingUp,
  Layers,
  Pin,
  PinOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Document {
  id: string;
  name: string;
  status: "processing" | "processed" | "error";
  createdAt: string;
  mimeType: string;
  text?: string;
}

interface CsvDashboardData {
  headers: string[];
  rows: Record<string, string | number>[];
  fileName: string;
  numericCols: string[];
  categoryCols: string[];
}

// ─── CSV Parsing ───────────────────────────────────────────────────────────────
function parseCSV(text: string): { headers: string[]; rows: Record<string, string | number>[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(
      headers.map((h, i) => {
        const val = values[i] ?? "";
        const num = parseFloat(val);
        return [h, isNaN(num) ? val : num];
      })
    );
  });
  return { headers, rows };
}

const CHART_COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#14b8a6", "#f97316"];

// ─── CSV Dashboard Modal ───────────────────────────────────────────────────────
function CsvDashboardModal({
  data,
  onClose,
}: {
  data: CsvDashboardData;
  onClose: () => void;
}) {
  const { headers, rows, fileName, numericCols, categoryCols } = data;

  // Summary stats
  const stats = useMemo(() => {
    return numericCols.slice(0, 4).map((col) => {
      const vals = rows.map((r) => Number(r[col])).filter((v) => !isNaN(v));
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / vals.length : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const min = vals.length ? Math.min(...vals) : 0;
      return { col, sum, avg, max, min, count: vals.length };
    });
  }, [rows, numericCols]);

  // Bar chart data - first category col vs first numeric col
  const barData = useMemo(() => {
    if (!categoryCols[0] || !numericCols[0]) return [];
    const grouped: Record<string, number[]> = {};
    rows.forEach((r) => {
      const key = String(r[categoryCols[0]]).substring(0, 20);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(Number(r[numericCols[0]]) || 0);
    });
    return Object.entries(grouped)
      .slice(0, 10)
      .map(([name, vals]) => ({
        name,
        value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
      }));
  }, [rows, categoryCols, numericCols]);

  // Pie chart data
  const pieData = useMemo(() => {
    if (!categoryCols[0]) return [];
    const counts: Record<string, number> = {};
    rows.forEach((r) => {
      const key = String(r[categoryCols[0]]).substring(0, 20);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [rows, categoryCols]);

  // Line/Area chart for numeric trends (use index as X)
  const trendData = useMemo(() => {
    return rows.slice(0, 50).map((r, i) => ({
      index: i + 1,
      ...Object.fromEntries(numericCols.slice(0, 3).map((c) => [c, Number(r[c]) || 0])),
    }));
  }, [rows, numericCols]);

  // Scatter for first two numeric cols
  const scatterData = useMemo(() => {
    if (numericCols.length < 2) return [];
    return rows.slice(0, 100).map((r) => ({
      x: Number(r[numericCols[0]]) || 0,
      y: Number(r[numericCols[1]]) || 0,
    }));
  }, [rows, numericCols]);

  const handleDownloadPDF = () => {
    toast.info("PDF download: use browser Print → Save as PDF on this dashboard");
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent = [headers.join(","), ...rows.map((r) => headers.map((h) => r[h]).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}_processed.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          className="max-w-7xl mx-auto my-8 px-4"
        >
          <div className="bg-white dark:bg-gray-950 rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Analytics Dashboard — {fileName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {rows.length} rows · {headers.length} columns · {numericCols.length} numeric · {categoryCols.length} categorical
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> CSV
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Summary Cards */}
              {stats.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl"
                    >
                      <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 truncate">
                        {s.col}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {s.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        <span className="text-xs font-normal text-gray-400 ml-1">avg</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <div>
                          <span className="text-gray-400">min</span>
                          <div className="font-semibold text-gray-700 dark:text-gray-300">
                            {s.min.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">max</span>
                          <div className="font-semibold text-gray-700 dark:text-gray-300">
                            {s.max.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">n</span>
                          <div className="font-semibold text-gray-700 dark:text-gray-300">{s.count}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Charts row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar chart */}
                {barData.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                      {categoryCols[0]} vs {numericCols[0]} (Avg)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} angle={-20} textAnchor="end" />
                          <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {barData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Pie chart */}
                {pieData.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                      Distribution of {categoryCols[0]}
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) =>
                              percent > 0.06 ? `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%` : ""
                            }
                            labelLine={false}
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Charts row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line/Trend chart */}
                {trendData.length > 0 && numericCols.length >= 1 && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                      Numeric Trends (first 50 rows)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                          <XAxis dataKey="index" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                          />
                          <Legend />
                          {numericCols.slice(0, 3).map((col, i) => (
                            <Line
                              key={col}
                              type="monotone"
                              dataKey={col}
                              stroke={CHART_COLORS[i]}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Scatter plot */}
                {scatterData.length > 0 && numericCols.length >= 2 && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                      {numericCols[0]} vs {numericCols[1]} (Scatter)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name={numericCols[0]}
                            tick={{ fontSize: 11, fill: "#6B7280" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            name={numericCols[1]}
                            tick={{ fontSize: 11, fill: "#6B7280" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                          />
                          <Scatter data={scatterData} fill="#6366f1" opacity={0.6} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Area chart - full width */}
              {trendData.length > 0 && numericCols.length >= 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Area Distribution — {numericCols[0]}
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="csvGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                        <XAxis dataKey="index" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                        />
                        <Area
                          type="monotone"
                          dataKey={numericCols[0]}
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#csvGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Data preview table */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Data Preview (first 10 rows)</h3>
                  <span className="text-xs text-gray-400">{rows.length} total rows</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        {headers.slice(0, 8).map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition">
                          {headers.slice(0, 8).map((h) => (
                            <td key={h} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {String(row[h]).substring(0, 30)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "processed" | "processing">("all");
  const [csvDashboard, setCsvDashboard] = useState<CsvDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<"documents" | "csv">("documents");
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("documa_pinned") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const user = JSON.parse(localStorage.getItem("documa_user") || "{}");

  const fetchDocuments = async () => {
    if (!user.id) return;
    try {
      const response = await fetch("/api/documents", {
        headers: { "x-user-id": user.id }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        console.error("API returned non-array data:", data);
        setDocuments([]);
        if (data.error) toast.error(data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // Show demo data if API not available
      setDocuments([]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user.id) return toast.error("Please login first");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-user-id": user.id },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const newDoc = await response.json();
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success("File uploaded successfully, go to chat section to get information", { duration: 4000 });
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCsvUpload = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (rows.length === 0) {
        toast.error("CSV is empty or invalid");
        return;
      }
      const numericCols = headers.filter((h) => rows.slice(0, 20).some((r) => typeof r[h] === "number"));
      const categoryCols = headers.filter((h) => !numericCols.includes(h));
      setCsvDashboard({
        headers,
        rows,
        fileName: file.name.replace(".csv", ""),
        numericCols,
        categoryCols,
      });
      setActiveTab("csv");
      toast.success(`CSV loaded — ${rows.length} rows, ${headers.length} columns`);
    };
    reader.readAsText(file);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.name.endsWith(".csv")) {
      handleCsvUpload(file);
    } else {
      handleFileUpload(file);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    if (!user.id) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": user.id }
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        toast.success("Document deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleDownload = (doc: Document, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const blob = new Blob([doc.text || "No content"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const handlePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newPinned = pinnedIds.includes(id)
      ? pinnedIds.filter((p) => p !== id)
      : [...pinnedIds, id];
    setPinnedIds(newPinned);
    localStorage.setItem("documa_pinned", JSON.stringify(newPinned));
    toast.success(pinnedIds.includes(id) ? "Document unpinned" : "Document pinned");
  };

  const filteredDocs = Array.isArray(documents) ? documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const analyticsData = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString(undefined, { weekday: "short" });
      const count = documents.filter((doc) => new Date(doc.createdAt).toDateString() === d.toDateString()).length;
      return { name: dateStr, uploads: count };
    });
  }, [documents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Hi {user.name || user.email?.split("@")[0] || "there"}, Welcome to Documa Dashboard!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your library, track processing, and analyze CSV data.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setStatusFilter(statusFilter === "all" ? "processed" : "all")}
            className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </button>

          {/* CSV Upload Button */}
          <button
            onClick={() => csvInputRef.current?.click()}
            className="px-4 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none"
          >
            <BarChart3 className="w-4 h-4" />
            Upload CSV →  Dashboard
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleCsvUpload(e.target.files[0])}
          />

          <label className="px-4 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none">
            <Plus className="w-4 h-4" />
            Upload Doc
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <div className="mb-6 px-4 py-2 flex items-center gap-3 text-base text-gray-600 dark:text-gray-300">
        <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <p className="leading-relaxed">
          Please note: It may take a few moments for your complete document history to synchronize and load.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {[
          { label: "Total Documents", value: documents.length, icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Processed", value: documents.filter((d) => d.status === "processed").length, icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
          { label: "Processing", value: documents.filter((d) => d.status === "processing").length, icon: Clock, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Errors", value: documents.filter((d) => d.status === "error").length, icon: AlertCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pinned Documents */}
      {pinnedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Pin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Pinned Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents
              .filter((d) => pinnedIds.includes(d.id))
              .map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group p-4 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/viewer/${doc.id}`}
                          className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate block"
                        >
                          {doc.name}
                        </Link>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handlePin(doc.id, e)}
                      className="p-1.5 text-indigo-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition shrink-0"
                      title="Unpin"
                    >
                      <PinOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* CSV Dashboard CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[24px] flex flex-col md:flex-row items-center gap-4"
      >
        <div className="w-12 h-12 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            CSV Analytics Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload any CSV file to get instant interactive charts — bar, pie, line, scatter, area plots.
            Download as PDF or CSV.
          </p>
        </div>
        <button
          onClick={() => csvInputRef.current?.click()}
          className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-100 dark:shadow-none"
        >
          <BarChart3 className="w-4 h-4" />
          Analyze CSV
        </button>
      </motion.div>

      {/* Analytics Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm mb-10">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Upload Activity (Last 7 Days)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Tooltip
                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                itemStyle={{ color: "#6366f1", fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="uploads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drag & Drop Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-[28px] p-12 text-center transition-all mb-10 ${isDragging
          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
          : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mx-auto mb-6">
            <Upload className={`w-8 h-8 ${isUploading ? "animate-bounce text-indigo-600" : "text-gray-400 dark:text-gray-500"}`} />
          </div>
          <div className="min-h-[28px] mb-2 flex items-center justify-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isUploading ? "Processing Document..." : "Drop files here"}
            </h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            PDF, DOCX, PPTX, Images — or drop a <span className="font-semibold text-emerald-600 dark:text-emerald-400">CSV</span> for instant analytics
          </p>
          <label className="inline-flex px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer shadow-sm">
            Browse Files
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                f.name.endsWith(".csv") ? handleCsvUpload(f) : handleFileUpload(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition placeholder:text-gray-400"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              <AnimatePresence mode="popLayout">
                {filteredDocs.map((doc) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <Link
                            to={`/viewer/${doc.id}`}
                            className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1"
                          >
                            {doc.name}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          </Link>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{doc.mimeType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${doc.status === "processed"
                          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                          : doc.status === "processing"
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                      >
                        {doc.status === "processed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : doc.status === "processing" ? (
                          <Clock className="w-3 h-3 animate-spin" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => handlePin(doc.id, e)}
                          className={`p-2 rounded-lg transition ${pinnedIds.includes(doc.id) ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10" : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"}`}
                          title={pinnedIds.includes(doc.id) ? "Unpin" : "Pin document"}
                        >
                          {pinnedIds.includes(doc.id) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => handleDownload(doc, e)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(doc.id, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                        >
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
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                        <Layers className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 font-medium">No documents found</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Upload a file to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Dashboard Modal */}
      {csvDashboard && (
        <CsvDashboardModal data={csvDashboard} onClose={() => setCsvDashboard(null)} />
      )}
    </div>
  );
}
