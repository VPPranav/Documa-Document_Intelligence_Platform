import { useState } from "react";
import { 
  Settings, 
  Key, 
  Shield, 
  Database, 
  Bell, 
  User, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
        <p className="text-gray-500">Manage your API keys, security preferences, and account details.</p>
      </div>

      <div className="space-y-8">
        {/* API Keys Section */}
        <section className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">API Configuration</h2>
              <p className="text-sm text-gray-400">Manage your access keys for external integrations.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Gemini API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value="sk-documa-••••••••••••••••••••••••"
                  readOnly
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-xl text-sm font-mono text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-all"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">This key is used for document extraction and Q&A generation.</p>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <div className="text-sm font-medium text-gray-600">Usage Limit</div>
              <div className="flex items-center gap-4">
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-indigo-600" />
                </div>
                <span className="text-xs font-bold text-gray-400">3.2k / 10k tokens</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Security & Privacy</h2>
              <p className="text-sm text-gray-400">Control how your data is processed and stored.</p>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { label: "Data Isolation", desc: "Ensure your documents are never used for training models.", enabled: true },
              { label: "Two-Factor Authentication", desc: "Add an extra layer of security to your account.", enabled: false },
              { label: "Automatic Session Timeout", desc: "Log out automatically after 30 minutes of inactivity.", enabled: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-1">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-all ${item.enabled ? "bg-indigo-600" : "bg-gray-200"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.enabled ? "left-7" : "left-1"}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Support Section */}
        <section className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Contact & Support</h2>
              <p className="text-sm text-gray-400">Get in touch with the developer for custom solutions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="mailto:pranavvp1507@gmail.com"
              className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1">Email Support</div>
              <div className="text-xs text-gray-500">pranavvp1507@gmail.com</div>
            </a>

            <a 
              href="https://github.com/VPPranav"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Github className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1">GitHub Profile</div>
              <div className="text-xs text-gray-500">View source code & projects</div>
            </a>

            <a 
              href="https://www.linkedin.com/in/pranav-v-p-3636b825a/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Linkedin className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1">LinkedIn Profile</div>
              <div className="text-xs text-gray-500">Professional network</div>
            </a>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm font-medium">
          Developed By <span className="text-indigo-600">Pranav V P</span>
        </p>
      </div>
    </div>
  );
}
