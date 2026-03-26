import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import * as pdf from "pdf-parse";
import mammoth from "mammoth";
import cors from "cors";
import { Request } from "express";

interface MulterRequest extends Request {
  file?: any;
}

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory storage for documents (for demo purposes)
  const documents: any[] = [];

  // API Routes
  app.post("/api/upload", upload.single("file"), async (req: MulterRequest, res) => {
    console.log("Upload request received:", req.file?.originalname, req.file?.mimetype);
    try {
      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      let text = "";
      const mimeType = req.file.mimetype;

      try {
        if (mimeType === "application/pdf") {
          console.log("Parsing PDF...");
          // Handle both default and direct exports for pdf-parse
          let pdfParser = (pdf as any).default || pdf;
          if (typeof pdfParser !== "function" && (pdf as any).pdf) {
            pdfParser = (pdf as any).pdf;
          }
          
          if (typeof pdfParser !== "function") {
            console.error("pdf-parse is not a function. Available keys:", Object.keys(pdf as any));
            throw new Error("PDF parsing library not correctly loaded.");
          }
          
          const data = await pdfParser(req.file.buffer);
          text = data.text;
        } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          console.log("Parsing DOCX...");
          const data = await mammoth.extractRawText({ buffer: req.file.buffer });
          text = data.value;
        } else {
          console.log("Parsing as text...");
          text = req.file.buffer.toString("utf-8");
        }
      } catch (parseError) {
        console.error("Parsing error:", parseError);
        // Fallback to empty text if parsing fails but still create the document entry
        text = "Error parsing document content.";
      }

      const doc = {
        id: Math.random().toString(36).substring(7),
        name: req.file.originalname,
        text,
        mimeType,
        status: "processed",
        createdAt: new Date().toISOString(),
      };

      documents.push(doc);
      console.log("Document processed successfully:", doc.id);
      res.json(doc);
    } catch (error) {
      console.error("Upload route error:", error);
      res.status(500).json({ error: "Failed to process document" });
    }
  });

  app.get("/api/documents", (req, res) => {
    console.log("Fetching documents, count:", documents.length);
    res.json(documents);
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
