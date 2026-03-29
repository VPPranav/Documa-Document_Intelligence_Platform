import { motion, useAnimationFrame } from "motion/react";
import { useRef, useState } from "react";
import {
  Shield,
  Zap,
  Database,
  Search,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Globe,
  BarChart3,
  Star,
  TrendingUp,
  GitBranch,
  Pin,
  GitCompare,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Animated 3D Document Stack (pure CSS + motion) ───────────────────────────
function AnimatedHero() {
  const orbitRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);

  useAnimationFrame((_, delta) => {
    angleRef.current += delta * 0.00008;
    if (orbitRef.current) {
      orbitRef.current.style.transform = `rotateY(${angleRef.current}rad) rotateX(0.3rad)`;
    }
  });

  const floatCards = [
    { icon: FileText, label: "Contract.pdf", color: "#6366f1", x: 60, y: 20, delay: 0 },
    { icon: BarChart3, label: "Report.docx", color: "#06b6d4", x: -70, y: -30, delay: 0.3 },
    { icon: Database, label: "Dataset.csv", color: "#8b5cf6", x: 40, y: -70, delay: 0.6 },
    { icon: Cpu, label: "Invoice.pdf", color: "#10b981", x: -50, y: 60, delay: 0.9 },
  ];

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center select-none">
      {/* Glow behind */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-indigo-400/20 dark:bg-indigo-500/15 blur-3xl" />
        <div className="absolute w-48 h-48 rounded-full bg-cyan-400/15 dark:bg-cyan-500/10 blur-2xl translate-x-16 -translate-y-8" />
      </div>

      {/* Central rotating orbit */}
      <div
        style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}
        className="w-72 h-72 relative"
      >
        <div
          ref={orbitRef}
          style={{ transformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative" }}
        >
          {/* Orbit ring */}
          <div
            style={{
              position: "absolute",
              inset: "-40px",
              borderRadius: "50%",
              border: "1.5px solid rgba(99,102,241,0.25)",
              transform: "rotateX(75deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "-80px",
              borderRadius: "50%",
              border: "1px solid rgba(6,182,212,0.15)",
              transform: "rotateX(75deg) rotateY(30deg)",
            }}
          />

          {/* Central document icon */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%) translateZ(0px)",
            }}
            className="w-24 h-24 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Cpu className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Orbiting mini-docs */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateX(110px) translateZ(${i % 2 === 0 ? "20px" : "-20px"})`,
                transformOrigin: "0 0",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md border border-white/50 dark:border-gray-700"
                style={{
                  background: i % 3 === 0 ? "rgba(99,102,241,0.9)" : i % 3 === 1 ? "rgba(6,182,212,0.9)" : "rgba(139,92,246,0.9)",
                  transform: `rotate(-${deg}deg)`,
                }}
              >
                {i % 2 === 0 ? <FileText className="w-4 h-4 text-white" /> : <Database className="w-4 h-4 text-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating cards around the orbit */}
      {floatCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { delay: card.delay + 0.5, duration: 0.6 },
            scale: { delay: card.delay + 0.5, duration: 0.6 },
            y: { delay: card.delay, duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            position: "absolute",
            left: `calc(50% + ${card.x}px)`,
            top: `calc(50% + ${card.y}px)`,
            transform: "translate(-50%, -50%)",
          }}
          className="px-4 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white dark:border-gray-700 flex items-center gap-3 whitespace-nowrap"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: card.color + "22" }}
          >
            <card.icon className="w-4 h-4" style={{ color: card.color }} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-800 dark:text-white">{card.label}</div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-gray-400">Processed</span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Confidence badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="absolute bottom-16 right-8 px-4 py-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/30 rounded-2xl shadow-lg flex items-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <div>
          <div className="text-xs font-bold text-green-700 dark:text-green-400">98.7% Confidence</div>
          <div className="text-[10px] text-green-500">Zero hallucinations</div>
        </div>
      </motion.div>

      {/* Search result badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.7 }}
        className="absolute top-16 left-4 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl shadow-lg flex items-center gap-2"
      >
        <Search className="w-4 h-4 text-indigo-500" />
        <div>
          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Semantic Search</div>
          <div className="text-[10px] text-indigo-400">&lt;50ms latency</div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const features = [
    {
      title: "Multi-Format Ingestion",
      desc: "Support for PDF, DOCX, PPTX, CSV and scanned images with automatic OCR preprocessing.",
      icon: FileText,
      color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Layout-Aware Parsing",
      desc: "Extract headings, tables, and lists while preserving original document hierarchy.",
      icon: Layers,
      color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Named Entity Recognition",
      desc: "Automatically identify domain-specific entities like legal terms, medical codes, or financial data.",
      icon: Cpu,
      color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Hybrid Semantic Search",
      desc: "Combine dense vector embeddings with keyword BM25 search for sub-second retrieval.",
      icon: Search,
      color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Conversational AI",
      desc: "Chat with your documents using AI-powered Q&A with mandatory citations and grounding.",
      icon: MessageSquare,
      color: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
    },
    {
      title: "CSV Analytics Dashboards",
      desc: "Upload CSV files and get interactive charts, plots, and download as PDF or PPTX.",
      icon: BarChart3,
      color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Enterprise Security",
      desc: "TLS encryption, data isolation per user, and strict privacy controls with zero training.",
      icon: Shield,
      color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      title: "Global Knowledge Base",
      desc: "Build a cross-document, searchable knowledge base from all your uploaded content.",
      icon: Globe,
      color: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      title: "Real-Time Processing",
      desc: "Track every pipeline stage — ingestion, OCR, parsing, NER, embedding — live.",
      icon: TrendingUp,
      color: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      title: "Knowledge Graph",
      desc: "Visualize entity relationships interactively — people, organizations, dates, and financial data — auto-detected from any document.",
      icon: GitBranch,
      color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
      badge: "New",
    },
    {
      title: "Document Comparison",
      desc: "Compare two documents side-by-side with vocabulary similarity scoring and unique term highlighting.",
      icon: GitCompare,
      color: "bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
      badge: "New",
    },
    {
      title: "Pinned Documents",
      desc: "Pin your most-used documents for instant access from the dashboard and viewer.",
      icon: Pin,
      color: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400",
      badge: "New",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-100px] left-[-200px] w-[700px] h-[700px] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 dark:opacity-30" />
        <div className="absolute top-[200px] right-[-100px] w-[500px] h-[500px] bg-cyan-100 dark:bg-cyan-900/15 rounded-full blur-3xl opacity-40 dark:opacity-20" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl opacity-30 dark:opacity-20" />
      </div>

      {/* ── Hero ── */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>Next-Gen Document Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-8"
            >
              Documa —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                Intelligence, Extracted.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Transform unstructured documents into structured data, searchable vector knowledge
              bases, and conversational AI interfaces with full citations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <Link
                to="/auth"
                className="px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                View Demo
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex items-center gap-6 justify-center lg:justify-start"
            >
              {/* <div className="flex -space-x-2">
                {["#6366f1", "#06b6d4", "#8b5cf6", "#10b981"].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold shadow"
                    style={{ background: c }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">500+</span> enterprise teams trust Documa
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div> */}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 w-full"
          >
            <AnimatedHero />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Average AI response initialization time", value: "<200ms" },
              { label: "Extraction Accuracy", value: "99.9%" },
              { label: "Search Latency", value: "<50ms" },
              { label: "Context-grounded responses", value: "100%" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Powerful Features for Modern Teams
            </motion.h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to turn your document library into a queryable knowledge system —
              including CSV analytics dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-indigo-500/5 transition-all group hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline Diagram ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-12"
          >
            End-to-End Document Intelligence Pipeline
          </motion.h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "Upload",
              "→",
              "OCR",
              "→",
              "Parse",
              "→",
              "NER",
              "→",
              "Embed",
              "→",
              "Index",
              "→",
              "Retrieve",
              "→",
              "AI Q&A",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
              >
                {step === "→" ? (
                  <span className="text-gray-300 dark:text-gray-600 text-2xl font-light">{step}</span>
                ) : (
                  <div className="px-4 py-2 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-500/30 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                    {step}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-indigo-600 dark:bg-indigo-600 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40">
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-8 relative z-10"
          >
            Ready to unlock your document intelligence?
          </motion.h2>
          <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Join 500+ enterprises transforming unstructured data into actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link
              to="/auth"
              className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
            >
              Start Free Trial
            </Link>
            <a
              href="mailto:pranavvp1507@gmail.com"
              className="px-10 py-4 bg-indigo-500 text-white border border-indigo-400 rounded-2xl font-bold text-lg hover:bg-indigo-400 transition-all"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}