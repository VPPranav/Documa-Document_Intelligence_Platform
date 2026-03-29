import { useState } from "react";
import {
  Key,
  Shield,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  Clock,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Database,
  Zap,
  Info,
  AlertTriangle,
  GitBranch,
  GitCompare,
  Pin,
  BookMarked,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useTheme } from "../components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("documa_api_key") || ""
  );

  const [securitySettings, setSecuritySettings] = useState(() => {
    try {
      const saved = localStorage.getItem("documa_security_settings");
      return saved
        ? JSON.parse(saved)
        : [
          {
            id: "isolation",
            label: "Data Isolation",
            desc: "Ensure your documents are never used to train models.",
            enabled: true,
          },
          {
            id: "2fa",
            label: "Two-Factor Authentication",
            desc: "Add an extra layer of security to your account.",
            enabled: false,
          },
          {
            id: "timeout",
            label: "Automatic Session Timeout",
            desc: "Log out automatically after 30 minutes of inactivity.",
            enabled: true,
          },
          {
            id: "logging",
            label: "Audit Logging",
            desc: "Keep a log of all document access and AI queries.",
            enabled: true,
          },
        ];
    } catch {
      return [];
    }
  });

  const handleToggleSecurity = (id: string) => {
    const updated = securitySettings.map((s: any) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSecuritySettings(updated);
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key first");
      return;
    }
    setIsValidating(true);
    setApiKeyValid(null);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say OK",
      });
      setApiKeyValid(true);
      toast.success("API key is valid!");
      localStorage.setItem("documa_api_key", apiKey.trim());
    } catch (e: any) {
      console.error("Validation error:", e);
      setApiKeyValid(false);
      const msg = e?.message || "Invalid API key. Please check and try again.";
      toast.error(`Validation failed: ${msg}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("documa_api_key", apiKey.trim());
    localStorage.setItem("documa_security_settings", JSON.stringify(securitySettings));
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 800);
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun, desc: "Clean and bright" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Easy on eyes" },
    { value: "system", label: "System", icon: Monitor, desc: "Follows OS" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Platform Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your API keys, theme, security preferences, and account details.
        </p>
      </div>

      <div className="space-y-8">
        {/* ── Appearance / Theme ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Choose your preferred color theme.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value as "light" | "dark" | "system");
                  toast.success(`Theme set to ${opt.label}`);
                }}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === opt.value
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm"
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === opt.value
                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                >
                  <opt.icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-bold ${theme === opt.value
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{opt.desc}</div>
                </div>
                {theme === opt.value && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── API Keys ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Configuration</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Configure your Gemini API key for AI-powered features.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Gemini API Key
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setApiKeyValid(null);
                    }}
                    placeholder="AIza..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-mono text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition shadow-inner placeholder:text-gray-400"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={validateApiKey}
                  disabled={isValidating || !apiKey.trim()}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                >
                  {isValidating ? (
                    <><Clock className="w-4 h-4 animate-spin" /> Validating…</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Test Key</>
                  )}
                </button>
              </div>

              {/* Validation indicator */}
              {apiKeyValid !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 flex items-center gap-2 text-xs font-medium ${apiKeyValid
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                    }`}
                >
                  {apiKeyValid ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> API key is valid and working</>
                  ) : (
                    <><AlertTriangle className="w-3.5 h-3.5" /> Invalid API key — check your credentials</>
                  )}
                </motion.div>
              )}

              <div className="mt-3 flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Used for document extraction and Q&A generation. Get your key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:underline"
                  >
                    Google AI Studio
                  </a>
                  . Your key is stored only in your browser's localStorage.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Usage</div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">3.2k / 10k tokens</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="w-[32%] h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── AI Model Settings ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Model Configuration</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Configure which models power document analysis.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Q&A Model", value: "Gemini 2.0 Flash", desc: "Powers document Q&A and chat" },
              { label: "Insights Model", value: "Gemini 2.0 Flash", desc: "Generates document summaries" },
              { label: "Embedding Model", value: "text-embedding-3-large", desc: "Vector indexing for search" },
              { label: "Search Strategy", value: "Hybrid (Dense + BM25)", desc: "Semantic + keyword retrieval" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
              >
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Security ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Privacy</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Control how your data is processed and stored.</p>
            </div>
          </div>

          <div className="space-y-3">
            {securitySettings.map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleToggleSecurity(item.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition cursor-pointer group text-left"
              >
                <div className="flex-1 pr-4">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative transition-all shadow-inner shrink-0 ${item.enabled ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${item.enabled ? "left-7" : "left-1"
                      }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── Data Management ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Management</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Manage your local settings and stored data.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                localStorage.removeItem("documa_api_key");
                setApiKey("");
                setApiKeyValid(null);
                toast.success("API key cleared");
              }}
              className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-left hover:border-red-100 dark:hover:border-red-500/30 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition group"
            >
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                Clear API Key
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Remove stored API key from browser</div>
            </button>

            <button
              onClick={() => {
                const data = {
                  apiKey: localStorage.getItem("documa_api_key") ? "[SET]" : "[NOT SET]",
                  securitySettings: JSON.parse(localStorage.getItem("documa_security_settings") || "[]"),
                  theme: localStorage.getItem("documa-ui-theme") || "system",
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "documa-settings.json";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Settings exported");
              }}
              className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-left hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition"
            >
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Export Settings</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Download your configuration as JSON</div>
            </button>
          </div>
        </motion.section>

        {/* ── Contact & Support ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact & Support</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Get in touch with the developer.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                href: "mailto:pranavvp1507@gmail.com",
                icon: Mail,
                label: "Email Support",
                sub: "pranavvp1507@gmail.com",
                external: false,
              },
              {
                href: "https://github.com/VPPranav",
                icon: Github,
                label: "GitHub Profile",
                sub: "View source code",
                external: true,
              },
              {
                href: "https://www.linkedin.com/in/pranav-v-p-3636b825a/",
                icon: Linkedin,
                label: "LinkedIn",
                sub: "Professional network",
                external: true,
              },
            ].map((link, i) => (
              <a
                key={i}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition" />
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{link.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{link.sub}</div>
              </a>
            ))}
          </div>
        </motion.section>


        {/* New Features Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[28px] p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Features</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Recently added capabilities in Documa.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: GitBranch,
                title: "Knowledge Graph",
                desc: "Auto-detect people, organizations, dates, money, and locations from any document and visualize them as an interactive relationship graph.",
                color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
                where: "Document Viewer → Knowledge Graph tab",
              },
              {
                icon: GitCompare,
                title: "Document Comparison",
                desc: "Select two documents in History and compare their vocabulary, unique terms, and similarity score side-by-side.",
                color: "bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
                where: "History → Compare Mode",
              },
              {
                icon: Pin,
                title: "Pinned Documents",
                desc: "Pin important documents to the top of your dashboard for quick access. Pinned docs appear in a dedicated section.",
                color: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400",
                where: "Dashboard & Document Viewer",
              },
              {
                icon: BookMarked,
                title: "Saved Chat Sessions",
                desc: "Save and restore entire AI chat conversations. Keep your most important document Q&A sessions for future reference.",
                color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                where: "Chat → Save Session",
              },
              {
                icon: Activity,
                title: "Global Content Search",
                desc: "Search across all document names AND their full extracted text from the History page. Highlighted content matches shown.",
                color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
                where: "History → Search bar",
              },
              {
                icon: Database,
                title: "Reading Progress Tracker",
                desc: "A live progress bar tracks how far you've scrolled through a document's content in the viewer.",
                color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
                where: "Document Viewer → Content tab",
              },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20 transition group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${feat.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{feat.title}</h3>
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">New</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{feat.desc}</p>
                    <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg inline-block">
                      📍 {feat.where}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-bold text-base hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 dark:shadow-none flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <><Clock className="w-5 h-5 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-5 h-5" /> Save All Changes</>
            )}
          </motion.button>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-gray-400 dark:text-gray-600 text-xs">
          Documa v1.0 · Built by Pranav V P · All data stored locally in your browser
        </p>
      </div>
    </div>
  );
}