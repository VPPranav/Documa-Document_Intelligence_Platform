import { motion } from "motion/react";
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
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none -z-10">
        <div className="absolute top-[-100px] left-[-200px] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[100px] right-[-100px] w-[500px] h-[500px] bg-cyan-50 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Next-Gen Document Intelligence</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8"
          >
            Documa — <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Intelligence, Extracted.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Transform unstructured documents into structured data, searchable vector knowledge bases, and conversational AI interfaces with full citations.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              View Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Documents Processed", value: "1M+" },
              { label: "Extraction Accuracy", value: "99.9%" },
              { label: "Search Latency", value: "<50ms" },
              { label: "Enterprise Users", value: "500+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Teams</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to turn your document library into a queryable knowledge system.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Multi-Format Ingestion",
                desc: "Support for PDF, DOCX, PPTX, and scanned images with automatic OCR preprocessing.",
                icon: FileText,
                color: "bg-blue-50 text-blue-600"
              },
              {
                title: "Layout-Aware Parsing",
                desc: "Extract headings, tables, and lists while preserving original document hierarchy.",
                icon: Layers,
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                title: "Named Entity Recognition",
                desc: "Automatically identify domain-specific entities like legal terms, medical codes, or financial data.",
                icon: Cpu,
                color: "bg-purple-50 text-purple-600"
              },
              {
                title: "Hybrid Semantic Search",
                desc: "Combine dense vector embeddings with keyword BM25 search for sub-second retrieval.",
                icon: Search,
                color: "bg-cyan-50 text-cyan-600"
              },
              {
                title: "Conversational AI",
                desc: "Chat with your documents using Claude-powered Q&A with mandatory citations.",
                icon: MessageSquare,
                color: "bg-teal-50 text-teal-600"
              },
              {
                title: "Enterprise Security",
                desc: "TLS encryption, data isolation per user, and strict privacy controls.",
                icon: Shield,
                color: "bg-rose-50 text-rose-600"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-8 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:shadow-gray-100 transition-all group"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 relative z-10">Ready to unlock your document intelligence?</h2>
          <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto relative z-10">Join 500+ enterprises transforming unstructured data into actionable insights.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link
              to="/dashboard"
              className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
            >
              Start Free Trial
            </Link>
            <button className="px-10 py-4 bg-indigo-500 text-white border border-indigo-400 rounded-2xl font-bold text-lg hover:bg-indigo-400 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
