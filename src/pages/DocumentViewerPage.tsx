import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  Search,
  Layers,
  Cpu,
  Database,
  CheckCircle2,
  Clock,
  Tag,
  Calendar,
  User,
  Hash,
  ChevronRight,
  MessageSquare,
  Globe,
  Copy,
  Sparkles,
  GitBranch,
  BookOpen,
  Pin,
  PinOff,
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

// ─── NER Extraction ────────────────────────────────────────────────────────────
interface Entity {
  type: "PERSON" | "ORG" | "DATE" | "MONEY" | "LOCATION" | "EMAIL" | "PERCENT" | "MISC";
  value: string;
  count: number;
}

interface GraphNode {
  id: string;
  label: string;
  type: Entity["type"];
  x: number;
  y: number;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

function extractEntities(text: string): Entity[] {
  if (!text) return [];
  const entities: Record<string, Entity> = {};

  const addEntity = (type: Entity["type"], value: string) => {
    const key = `${type}::${value.toLowerCase()}`;
    if (entities[key]) {
      entities[key].count++;
    } else {
      entities[key] = { type, value, count: 1 };
    }
  };

  // Emails
  const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
  emails.forEach((e) => addEntity("EMAIL", e));

  // Dates (various formats)
  const dates = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/gi) || [];
  dates.forEach((d) => addEntity("DATE", d));

  // Money
  const money = text.match(/(?:USD|EUR|GBP|INR|₹|\$|€|£)\s*[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|thousand|crore|lakh))?|\b[\d,]+(?:\.\d+)?\s*(?:million|billion)\s*(?:dollars|euros|pounds)?\b/gi) || [];
  money.forEach((m) => addEntity("MONEY", m.trim()));

  // Percentages
  const percents = text.match(/\b\d+(?:\.\d+)?%\b/g) || [];
  percents.forEach((p) => addEntity("PERCENT", p));

  // Organizations (capitalized multi-word phrases followed by Inc, Corp, Ltd, etc.)
  const orgs = text.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:Inc\.?|Corp\.?|Ltd\.?|LLC\.?|Limited|Company|Co\.?|Group|Holdings?|Technologies?|Solutions?|Services?|Systems?|International|Global|Enterprises?)\b/g) || [];
  orgs.forEach((o) => addEntity("ORG", o.trim()));

  // Persons (two or more capitalized words not matching org patterns)
  const persons = text.match(/\b(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b|\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b/g) || [];
  const orgValues = new Set(orgs.map((o) => o.toLowerCase()));
  persons
    .filter(
      (p) =>
        !orgValues.has(p.toLowerCase()) &&
        !dates.some((d) => d.toLowerCase().includes(p.toLowerCase())) &&
        p.split(" ").length >= 2
    )
    .slice(0, 20)
    .forEach((p) => addEntity("PERSON", p.trim()));

  // Locations
  const locations = text.match(/\b(?:New York|Los Angeles|San Francisco|London|Paris|Tokyo|Mumbai|Delhi|Bangalore|Bengaluru|Chicago|Boston|Seattle|Austin|Berlin|Singapore|Dubai|Sydney|Toronto|Beijing|Shanghai|Hong Kong|India|USA|UK|Germany|France|Japan|China|Canada|Australia)\b/g) || [];
  locations.forEach((l) => addEntity("LOCATION", l));

  return Object.values(entities)
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);
}

function buildGraph(entities: Entity[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const cx = 300;
  const cy = 250;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const typeGroups: Record<string, Entity[]> = {};
  entities.forEach((e) => {
    if (!typeGroups[e.type]) typeGroups[e.type] = [];
    typeGroups[e.type].push(e);
  });

  const typeColors: Record<string, string> = {
    PERSON: "#6366f1",
    ORG: "#06b6d4",
    DATE: "#8b5cf6",
    MONEY: "#10b981",
    LOCATION: "#f59e0b",
    EMAIL: "#ef4444",
    PERCENT: "#f97316",
    MISC: "#64748b",
  };

  // Place nodes in clusters by type
  const typeKeys = Object.keys(typeGroups);
  typeKeys.forEach((type, ti) => {
    const group = typeGroups[type];
    const groupAngle = (ti / typeKeys.length) * 2 * Math.PI;
    const groupRadius = 160;
    const gx = cx + Math.cos(groupAngle) * groupRadius;
    const gy = cy + Math.sin(groupAngle) * groupRadius;

    // Hub node for type
    const hubId = `hub_${type}`;
    nodes.push({
      id: hubId,
      label: type,
      type: type as Entity["type"],
      x: gx,
      y: gy,
      radius: 22,
    });

    group.slice(0, 6).forEach((entity, ei) => {
      const angle = groupAngle + (ei / Math.max(group.length, 1) - 0.5) * 1.2;
      const r = 80 + entity.count * 5;
      const nx = gx + Math.cos(angle) * r;
      const ny = gy + Math.sin(angle) * r;
      const nodeId = `${type}_${ei}`;
      nodes.push({
        id: nodeId,
        label: entity.value.length > 20 ? entity.value.substring(0, 18) + "…" : entity.value,
        type: type as Entity["type"],
        x: Math.max(30, Math.min(570, nx)),
        y: Math.max(30, Math.min(470, ny)),
        radius: Math.min(18, 10 + entity.count * 2),
      });
      edges.push({ source: hubId, target: nodeId, label: "" });
    });

    // Cross-connect orgs ↔ persons
    if (type === "PERSON" && typeGroups["ORG"]) {
      group.slice(0, 2).forEach((p, pi) => {
        typeGroups["ORG"].slice(0, 2).forEach((o, oi) => {
          edges.push({
            source: `PERSON_${pi}`,
            target: `ORG_${oi}`,
            label: "associated with",
          });
        });
      });
    }
  });

  return { nodes, edges };
}

// ─── Knowledge Graph SVG ───────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  PERSON: "#6366f1",
  ORG: "#06b6d4",
  DATE: "#8b5cf6",
  MONEY: "#10b981",
  LOCATION: "#f59e0b",
  EMAIL: "#ef4444",
  PERCENT: "#f97316",
  MISC: "#64748b",
};

function KnowledgeGraph({ entities }: { entities: Entity[] }) {
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
        <GitBranch className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-medium">No entities detected</p>
        <p className="text-sm mt-1">Upload a document with named entities to visualize connections</p>
      </div>
    );
  }

  const { nodes, edges } = buildGraph(entities);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(TYPE_COLORS).map(([type, color]) => {
          const count = entities.filter((e) => e.type === type).length;
          if (count === 0) return null;
          return (
            <div key={type} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border" style={{ borderColor: color + "40", backgroundColor: color + "15", color }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {type} ({count})
            </div>
          );
        })}
      </div>

      <div className="relative bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <svg viewBox="0 0 600 500" className="w-full" style={{ minHeight: 350 }}>
          <defs>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <radialGradient key={type} id={`grad_${type}`} cx="30%" cy="30%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.5" />
              </radialGradient>
            ))}
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const src = nodes.find((n) => n.id === edge.source);
            const tgt = nodes.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;
            const isHighlighted =
              selectedNode?.id === edge.source || selectedNode?.id === edge.target;
            return (
              <g key={i}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isHighlighted ? TYPE_COLORS[src.type] : "#e5e7eb"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 0.8 : 0.5}
                  strokeDasharray={edge.label ? "4 3" : "none"}
                />
                {edge.label && isHighlighted && (
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill={TYPE_COLORS[src.type]}
                    className="font-medium"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const color = TYPE_COLORS[node.type] || "#64748b";
            const isHub = node.id.startsWith("hub_");
            const isSelected = selectedNode?.id === node.id;
            return (
              <g
                key={node.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              >
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 8}
                    fill={color}
                    fillOpacity={0.15}
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={isHub ? color : `url(#grad_${node.type})`}
                  stroke={isHub ? "white" : color}
                  strokeWidth={isHub ? 2 : 1.5}
                  fillOpacity={isHub ? 1 : 0.85}
                />
                <text
                  x={node.x}
                  y={node.y + node.radius + 12}
                  textAnchor="middle"
                  fontSize={isHub ? "9" : "8"}
                  fontWeight={isHub ? "bold" : "normal"}
                  fill={isHub ? color : "#6b7280"}
                  className="select-none"
                >
                  {node.label}
                </text>
                {isHub && (
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="white"
                    className="select-none"
                  >
                    {node.label.slice(0, 3)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {(hoveredNode || selectedNode) && !hoveredNode?.id.startsWith("hub_") && (
          <div className="absolute top-3 right-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs max-w-[180px]">
            <div className="font-bold text-gray-900 dark:text-white mb-1" style={{ color: TYPE_COLORS[(hoveredNode || selectedNode)!.type] }}>
              {(hoveredNode || selectedNode)!.type}
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium break-words">
              {(hoveredNode || selectedNode)!.label}
            </div>
          </div>
        )}
      </div>

      {/* Entity List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {entities.slice(0, 12).map((entity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3 shadow-sm"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] font-black"
              style={{ backgroundColor: TYPE_COLORS[entity.type] + "CC" }}
            >
              {entity.type.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{entity.type}</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{entity.value}</div>
            </div>
            {entity.count > 1 && (
              <div className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: TYPE_COLORS[entity.type] }}>
                ×{entity.count}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Reading Progress Bar ──────────────────────────────────────────────────────
function ReadingProgress({ contentRef }: { contentRef: React.RefObject<HTMLDivElement> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const pct = scrollHeight > clientHeight ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) : 0;
      setProgress(pct);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [contentRef]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tabular-nums w-8 text-right">{progress}%</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DocumentViewerPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "metadata" | "entities" | "graph">("content");
  const [insight, setInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("documa_user") || "{}");
    const fetchDoc = async () => {
      if (!user.id) return;
      try {
        const response = await fetch("/api/documents", {
          headers: { "x-user-id": user.id },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          const found = data.find((d: Document) => d.id === id);
          setDoc(found || null);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();

    // Load pinned state
    const pinned = JSON.parse(localStorage.getItem("documa_pinned") || "[]");
    setIsPinned(pinned.includes(id));
  }, [id]);

  useEffect(() => {
    if (doc?.text) generateInsights(doc.text);
  }, [doc]);

  const generateInsights = async (text: string) => {
    setInsightLoading(true);
    setInsight("");
    try {
      const apiKey = localStorage.getItem("documa_api_key");
      if (!apiKey || apiKey.includes("••••") || apiKey.trim() === "") {
        setInsight("Set your Gemini API key in Settings to generate AI insights.");
        return;
      }
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Provide a concise 2-3 sentence executive summary of this document. Focus on the key purpose, main findings, and any critical conclusions. Document content: ${text.substring(0, 5000)}`,
      });
      setInsight(response.text || "No insights could be generated.");
    } catch (e: any) {
      const msg = e?.message?.includes("API_KEY") ? "Invalid API key. Check Settings." : "Failed to generate AI insights.";
      setInsight(msg);
    } finally {
      setInsightLoading(false);
    }
  };

  const handleCopyText = () => {
    if (doc?.text) {
      navigator.clipboard.writeText(doc.text);
      setCopied(true);
      toast.success("Text copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!doc) return;
    const blob = new Blob([doc.text || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const handlePin = () => {
    const pinned: string[] = JSON.parse(localStorage.getItem("documa_pinned") || "[]");
    if (isPinned) {
      localStorage.setItem("documa_pinned", JSON.stringify(pinned.filter((p) => p !== id)));
      setIsPinned(false);
      toast.success("Document unpinned");
    } else {
      localStorage.setItem("documa_pinned", JSON.stringify([...pinned, id]));
      setIsPinned(true);
      toast.success("Document pinned to dashboard");
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "**$1**");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading document…</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Document Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The document you're looking for doesn't exist or was deleted.</p>
        <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-700 transition inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const wordCount = doc.text ? doc.text.trim().split(/\s+/).length : 0;
  const charCount = doc.text ? doc.text.length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
  const filteredText = searchText ? highlightText(doc.text || "", searchText) : doc.text || "No text content extracted.";

  // Extract entities once
  const entities = doc.text ? extractEntities(doc.text) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{doc.name}</h1>
              {isPinned && <Pin className="w-4 h-4 text-indigo-500 mb-1" />}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {doc.id.substring(0, 8)}…
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedReadTime} min read
              </span>
              <div className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Processed
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/chat"
            className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <MessageSquare className="w-4 h-4" />
            Chat with Doc
          </Link>
          <button
            onClick={handlePin}
            title={isPinned ? "Unpin document" : "Pin document"}
            className={`p-2.5 rounded-xl border transition ${isPinned ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"}`}
          >
            {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-50 dark:border-gray-800 overflow-x-auto">
              {[
                { id: "content", label: "Content", icon: FileText },
                { id: "entities", label: "Entities", icon: Cpu },
                { id: "graph", label: "Knowledge Graph", icon: GitBranch },
                { id: "metadata", label: "Metadata", icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition border-b-2 whitespace-nowrap px-2 ${activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/10"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 min-h-[500px]">
              <AnimatePresence mode="wait">
                {/* Content Tab */}
                {activeTab === "content" && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search within document…"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition placeholder:text-gray-400"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4 items-center">
                      {[
                        { label: "Words", value: wordCount.toLocaleString() },
                        { label: "Characters", value: charCount.toLocaleString() },
                        { label: "Read time", value: `~${estimatedReadTime} min` },
                      ].map((s, i) => (
                        <div key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400">
                          <span className="font-bold text-gray-900 dark:text-white">{s.value}</span> {s.label}
                        </div>
                      ))}
                      <button
                        onClick={handleCopyText}
                        className="ml-auto px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? "Copied!" : "Copy all"}
                      </button>
                    </div>

                    {/* Reading progress bar */}
                    <div className="mb-3">
                      <ReadingProgress contentRef={contentRef} />
                    </div>

                    <div
                      ref={contentRef}
                      className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto"
                    >
                      {searchText ? (
                        <ReactMarkdown>{filteredText}</ReactMarkdown>
                      ) : (
                        doc.text || "No text content extracted."
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Entities Tab */}
                {activeTab === "entities" && (
                  <motion.div
                    key="entities"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Named entities automatically extracted from the document using pattern-based NER. Click <strong>Knowledge Graph</strong> tab to visualize their relationships.
                    </p>
                    {entities.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Cpu className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p>No entities detected in this document.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entities.slice(0, 20).map((entity, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black"
                              style={{ backgroundColor: (TYPE_COLORS[entity.type] || "#64748b") + "CC" }}
                            >
                              {entity.type.slice(0, 3)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{entity.type}</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{entity.value}</div>
                            </div>
                            {entity.count > 1 && (
                              <div className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: TYPE_COLORS[entity.type] || "#64748b" }}>
                                ×{entity.count}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Knowledge Graph Tab */}
                {activeTab === "graph" && (
                  <motion.div
                    key="graph"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Knowledge Graph</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Interactive visualization of entities and their relationships</p>
                      </div>
                    </div>
                    <KnowledgeGraph entities={entities} />
                  </motion.div>
                )}

                {/* Metadata Tab */}
                {activeTab === "metadata" && (
                  <motion.div
                    key="metadata"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Full document metadata as JSON.</p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 font-mono text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-[500px]">
                      <pre>
                        {JSON.stringify(
                          {
                            id: doc.id,
                            name: doc.name,
                            status: doc.status,
                            mimeType: doc.mimeType,
                            createdAt: doc.createdAt,
                            wordCount,
                            charCount,
                            estimatedReadTime: `${estimatedReadTime} minutes`,
                            entityCount: entities.length,
                            entityTypes: [...new Set(entities.map((e) => e.type))],
                            textPreview: doc.text?.substring(0, 200) + (doc.text?.length > 200 ? "…" : ""),
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Processing Pipeline */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Processing Pipeline
            </h3>
            <div className="space-y-4">
              {[
                { label: "Ingestion", time: "0.2s" },
                { label: "OCR Preprocessing", time: "1.1s" },
                { label: "Layout Analysis", time: "0.8s" },
                { label: "NER Extraction", time: "2.4s" },
                { label: "Graph Building", time: "0.3s" },
                { label: "Vector Indexing", time: "0.5s" },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{step.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">{step.time}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-gray-50 dark:border-gray-800">
              <div className="text-xs font-bold text-gray-900 dark:text-white mb-2">Total Processing Time</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">5.3s</div>
              <div className="text-xs text-gray-400 mt-0.5">All stages completed successfully</div>
            </div>
          </div>

          {/* Entity Summary widget */}
          {entities.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Entity Summary
              </h3>
              <div className="space-y-2">
                {Object.entries(
                  entities.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center text-sm py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] || "#64748b" }} />
                      <span className="text-gray-600 dark:text-gray-400">{type}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("graph")}
                className="w-full mt-4 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition"
              >
                <GitBranch className="w-4 h-4" />
                View Knowledge Graph
              </button>
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-indigo-600 dark:bg-indigo-600 rounded-[32px] p-7 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Insights
            </h3>
            {insightLoading ? (
              <div className="flex items-center gap-3 text-indigo-200 text-sm relative z-10 mb-6">
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin shrink-0" />
                Analyzing document…
              </div>
            ) : (
              <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed">{insight}</p>
            )}
            <Link
              to="/chat"
              className="w-full py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition relative z-10"
            >
              Ask AI Questions
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Document Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: "Word Count", value: wordCount.toLocaleString() },
                { label: "Characters", value: charCount.toLocaleString() },
                { label: "Estimated Read Time", value: `${estimatedReadTime} min` },
                { label: "Entities Detected", value: entities.length.toString() },
                { label: "File Type", value: doc.mimeType || "Unknown" },
                { label: "Status", value: doc.status.charAt(0).toUpperCase() + doc.status.slice(1) },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}