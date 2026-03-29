import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import cors from "cors";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { Request } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

interface MulterRequest extends Request {
  file?: any;
}

const upload = multer({ storage: multer.memoryStorage() });
// Graceful fallback if env vars are missing so the server doesn't crash on start
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

if (!process.env.VITE_SUPABASE_URL) {
  console.warn("WARNING: VITE_SUPABASE_URL is not set in the environment variables!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Disable Vercel's default body parser so Multer can consume the raw stream
export const config = {
  api: {
    bodyParser: false,
  },
};

const app = express();

app.use(cors());
app.use(express.json());

// ── Upload ───────────────────────────────────────────────────────────────────

app.post("/api/upload", upload.single("file"), async (req: MulterRequest, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  console.log("Upload request received:", req.file?.originalname, req.file?.mimetype);

  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let text = "";
    const mimeType = req.file.mimetype;

    try {
      if (mimeType === "application/pdf") {
        const result = await pdfParse(req.file.buffer);
        text = result.text;
      } else if (
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const data = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = data.value;
      } else if (mimeType.startsWith("image/")) {
        text = req.file.buffer.toString("base64");
      } else {
        text = req.file.buffer.toString("utf-8");
      }
    } catch (parseError) {
      console.error("Parsing error:", parseError);
      text = "Error parsing document content.";
    }

    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        name: req.file.originalname,
        text,
        mime_type: mimeType,
        status: "processed",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save document" });
    }

    // Return camelCase shape the frontend expects
    res.json({
      id: doc.id,
      userId: doc.user_id,
      name: doc.name,
      text: doc.text,
      mimeType: doc.mime_type,
      status: doc.status,
      createdAt: doc.created_at,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: "Failed to process document" });
  }
});

// ── List documents ───────────────────────────────────────────────────────────

app.get("/api/documents", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }

  res.json(
    (data || []).map((doc: any) => ({
      id: doc.id,
      userId: doc.user_id,
      name: doc.name,
      text: doc.text,
      mimeType: doc.mime_type,
      status: doc.status,
      createdAt: doc.created_at,
    }))
  );
});

// ── Delete document ──────────────────────────────────────────────────────────

app.delete("/api/documents/:id", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase delete error:", error);
    return res.status(404).json({ error: "Document not found or delete failed" });
  }

  res.json({ success: true });
});

// ── Chat history ─────────────────────────────────────────────────────────────

app.get("/api/chat", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("chat_history")
    .select("messages")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase chat fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }

  res.json({ chats: data?.messages || [] });
});

app.post("/api/chat", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { messages } = req.body;

  const { error } = await supabase
    .from("chat_history")
    .upsert({ user_id: userId, messages }, { onConflict: "user_id" });

  if (error) {
    console.error("Supabase chat save error:", error);
    return res.status(500).json({ error: "Failed to save chat history" });
  }

  res.json({ success: true });
});

// ── Get entities for a document (computed client-side, but available via API) ──
app.get("/api/documents/:id/entities", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const { data, error } = await supabase
    .from("documents")
    .select("id, name, text, mime_type")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Return the raw text so the client can run NER
  res.json({ id: data.id, name: data.name, text: data.text, mimeType: data.mime_type });
});

// ── Document stats ───────────────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("documents")
    .select("id, status, mime_type, created_at")
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: "Failed to fetch stats" });

  const docs = data || [];
  const stats = {
    total: docs.length,
    processed: docs.filter((d: any) => d.status === "processed").length,
    processing: docs.filter((d: any) => d.status === "processing").length,
    error: docs.filter((d: any) => d.status === "error").length,
    byType: docs.reduce((acc: Record<string, number>, d: any) => {
      const type = d.mime_type?.split("/").pop() || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    recentCount: docs.filter((d: any) => {
      const created = new Date(d.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length,
  };

  res.json(stats);
});

// ── Global error handler ─────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", supabaseConfigured: !!process.env.VITE_SUPABASE_URL });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

export default app;
