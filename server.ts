import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import db from './server/db.js';
import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import fs from 'fs';
import os from 'os';
import 'dotenv/config';

// Set up pdfjs-dist worker (using legacy build for Node.js compatibility)
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.js');

// PDF to Image conversion utility using pdfjs-dist + canvas (pure Node.js, no external binaries)
async function convertPdfToImages(base64Data: string): Promise<string[]> {
  try {
    // Decode base64 to buffer
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Load PDF document using pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;

    const numPages = pdfDoc.numPages;
    console.log(`PDF has ${numPages} page(s)`);

    const images: string[] = [];

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);

        // Get page dimensions
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality

        // Create canvas with the page dimensions
        const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Render PDF page to canvas
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        // Convert canvas to base64 PNG
        const imageBuffer = canvas.toBuffer('image/png');
        const base64Image = imageBuffer.toString('base64');
        images.push(base64Image);

        console.log(`Converted page ${pageNum} to image`);
      } catch (pageError) {
        console.error(`Error converting page ${pageNum}:`, pageError);
        throw pageError;
      }
    }

    if (images.length === 0) {
      throw new Error('No pages could be converted from PDF');
    }

    console.log(`Successfully converted ${images.length} page(s) to images`);
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
}

function getAI() {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'TODO' || apiKey === 'your_openai_api_key_here') {
    throw new Error('OPENAI_API_KEY is missing or invalid. Please set a valid OpenAI API key in the Settings menu.');
  }
  return new OpenAI(); // Automatically uses process.env.OPENAI_API_KEY
}
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get('/api/clients', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients').all();
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Client name is required' });

    const result = db.prepare('INSERT INTO clients (name, email, status) VALUES (?, ?, ?)').run(name, email || null, 'New');

    // Also create a workflow for the new client
    db.prepare('INSERT INTO workflows (client_id, status) VALUES (?, ?)').run(result.lastInsertRowid, 'Pending');

    const newClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newClient);
  });

  app.get('/api/documents', (req, res) => {
    const docs = db.prepare(`
      SELECT d.*, c.name as client_name 
      FROM documents d 
      JOIN clients c ON d.client_id = c.id
      ORDER BY d.uploaded_at DESC
    `).all();
    res.json(docs);
  });

  app.get('/api/clients/:id', (req, res) => {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const documents = db.prepare('SELECT id, filename, mime_type, uploaded_at FROM documents WHERE client_id = ?').all(req.params.id);
    const workflow = db.prepare('SELECT * FROM workflows WHERE client_id = ?').get(req.params.id);
    const chat_messages = db.prepare('SELECT * FROM chat_messages WHERE client_id = ? ORDER BY timestamp ASC').all(req.params.id);

    res.json({ client, documents, workflow, chat_messages });
  });

  app.post('/api/clients/:id/documents', upload.array('files'), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    const clientId = req.params.id;
    const insertDoc = db.prepare('INSERT INTO documents (client_id, filename, mime_type, data) VALUES (?, ?, ?, ?)');

    try {
      const documentsToInsert: { filename: string; mime_type: string; data: string }[] = [];

      for (const file of files) {
        const base64Data = file.buffer.toString('base64');
        const mimeType = file.mimetype.toLowerCase();

        // Check if the file is a PDF
        if (mimeType === 'application/pdf') {
          console.log(`Converting PDF to images: ${file.originalname}`);

          try {
            // Convert PDF to images
            const images = await convertPdfToImages(base64Data);

            // Store each page as a separate document
            for (let i = 0; i < images.length; i++) {
              const pageFilename = images.length > 1
                ? `${file.originalname.replace(/\.pdf$/i, '')}_page${i + 1}.png`
                : `${file.originalname.replace(/\.pdf$/i, '')}.png`;

              documentsToInsert.push({
                filename: pageFilename,
                mime_type: 'image/png',
                data: images[i]
              });
            }

            console.log(`Converted PDF to ${images.length} image(s)`);
          } catch (convError) {
            console.error('Error converting PDF:', convError);
            // If conversion fails, store the original PDF anyway
            documentsToInsert.push({
              filename: file.originalname,
              mime_type: file.mimetype,
              data: base64Data
            });
          }
        } else {
          // Non-PDF files (images) are stored as-is
          documentsToInsert.push({
            filename: file.originalname,
            mime_type: file.mimetype,
            data: base64Data
          });
        }
      }

      // Insert all documents into the database
      const transaction = db.transaction((docs) => {
        for (const doc of docs) {
          insertDoc.run(clientId, doc.filename, doc.mime_type, doc.data);
        }
      });

      transaction(documentsToInsert);

      res.json({ success: true, message: `${documentsToInsert.length} documents uploaded successfully` });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/documents/:id', (req, res) => {
    const docId = req.params.id;
    console.log(`Deleting document: ${docId}`);
    db.prepare('DELETE FROM documents WHERE id = ?').run(docId);
    res.json({ success: true, message: 'Document deleted successfully' });
  });

  app.delete('/api/documents', (req, res) => {
    const clientId = req.query.clientId;
    if (clientId) {
      console.log(`Deleting all documents for client: ${clientId}`);
      db.prepare('DELETE FROM documents WHERE client_id = ?').run(clientId);
      res.json({ success: true, message: `All documents for client ${clientId} deleted successfully` });
    } else {
      console.log('Deleting all documents');
      db.prepare('DELETE FROM documents').run();
      res.json({ success: true, message: 'All documents deleted successfully' });
    }
  });

  app.post('/api/clients/:id/workflow/clear', (req, res) => {
    const clientId = req.params.id;
    db.prepare("UPDATE workflows SET status = 'Pending', summary = NULL, deductions = NULL, risks = NULL, notes = NULL, estimated_income = NULL, estimated_deductions = NULL, next_steps = NULL WHERE client_id = ?").run(clientId);
    db.prepare("UPDATE clients SET status = 'New' WHERE id = ?").run(clientId);
    res.json({ success: true });
  });

  app.post('/api/clients/:id/workflow/run', async (req, res) => {
    const clientId = req.params.id;

    // Get all documents for this client
    const docs = db.prepare('SELECT filename, mime_type, data FROM documents WHERE client_id = ?').all(clientId) as any[];

    if (docs.length === 0) {
      return res.status(400).json({ error: 'No documents found for this client. Please upload documents first.' });
    }

    try {
      // Update status
      db.prepare("UPDATE workflows SET status = 'Processing' WHERE client_id = ?").run(clientId);
      db.prepare("UPDATE clients SET status = 'In Progress' WHERE id = ?").run(clientId);

      const ai = getAI();
      const messages: any[] = docs.map(doc => ({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Document: ${doc.filename}`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${doc.mime_type};base64,${doc.data}`
            }
          }
        ]
      }));

      messages.push({
        role: 'user',
        content: `Analyze the provided tax and financial documents for a non-technical client. 
        
        Your goal is to provide a clear, friendly, and easy-to-understand summary of their tax situation. 
        Avoid overly technical jargon. Use bullet points and simple language.
        
        Extract key financial data, summarize income sources, identify potential tax deductions (explained simply), flag compliance risks (explained as "things to watch out for"), and generate preparer notes.
        
        Return the result in JSON format with the following keys. IMPORTANT: Each value MUST be a single string containing formatted Markdown (using bolding, lists, and headers) for maximum readability. Do NOT return nested objects or arrays for these fields.
        
        - summary: A friendly, conversational overview of their financial year.
        - deductions: A clear, bulleted list of potential savings, explained in plain English.
        - risks: A gentle, bulleted list of potential issues or missing documents.
        - notes: Professional notes for the tax preparer (can be more technical).
        - estimated_income: A simple string for total income (e.g., "$50,000").
        - estimated_deductions: A simple string for total deductions (e.g., "$5,000").
        - next_steps: A bulleted list of 3-4 clear, simple actions the client should take next.`
      });

      const response = await ai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        response_format: { type: 'json_object' }
      });

      const resultText = response.choices[0].message.content;
      if (!resultText) throw new Error('No response from AI');

      const result = JSON.parse(resultText);

      const formatToMarkdown = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) {
          return val.map(item => {
            if (typeof item === 'string') return `- ${item}`;
            return `- ${JSON.stringify(item)}`;
          }).join('\n');
        }
        if (typeof val === 'object') {
          return Object.entries(val).map(([key, value]) => {
            const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            if (typeof value === 'object' && value !== null) {
              return `### ${formattedKey}\n${formatToMarkdown(value)}`;
            }
            return `**${formattedKey}**: ${value}`;
          }).join('\n\n');
        }
        return String(val);
      };

      const summary = formatToMarkdown(result.summary);
      const deductions = formatToMarkdown(result.deductions);
      const risks = formatToMarkdown(result.risks);
      const notes = formatToMarkdown(result.notes);

      const estimated_income = String(result.estimated_income || 'TBD');
      const estimated_deductions = String(result.estimated_deductions || 'TBD');

      const next_steps = Array.isArray(result.next_steps)
        ? result.next_steps.map((s: any) => `- ${typeof s === 'string' ? s : JSON.stringify(s)}`).join('\n')
        : formatToMarkdown(result.next_steps);

      db.prepare(`
        UPDATE workflows 
        SET status = 'Completed', summary = ?, deductions = ?, risks = ?, notes = ?, 
            estimated_income = ?, estimated_deductions = ?, next_steps = ?
        WHERE client_id = ?
      `).run(summary, deductions, risks, notes, estimated_income, estimated_deductions, next_steps, clientId);

      db.prepare("UPDATE clients SET status = 'Review Ready' WHERE id = ?").run(clientId);

      res.json({ success: true, result });
    } catch (error: any) {
      console.error('Workflow error:', error);
      db.prepare("UPDATE workflows SET status = 'Failed' WHERE client_id = ?").run(clientId);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/clients/:id/chat', async (req, res) => {
    const clientId = req.params.id;
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Save user message
    db.prepare('INSERT INTO chat_messages (client_id, role, content) VALUES (?, ?, ?)').run(clientId, 'user', message);

    try {
      // Get context: documents and previous chat history
      const docs = db.prepare('SELECT filename, mime_type, data FROM documents WHERE client_id = ?').all(clientId) as any[];
      const history = db.prepare('SELECT role, content FROM chat_messages WHERE client_id = ? ORDER BY timestamp ASC').all(clientId) as any[];
      const workflow = db.prepare('SELECT summary, deductions, risks, notes FROM workflows WHERE client_id = ?').get(clientId) as any;

      const messages: any[] = docs.map(doc => ({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${doc.mime_type};base64,${doc.data}`
            }
          }
        ]
      }));

      let systemPrompt = `You are an expert AI tax assistant. You are helping a tax professional with a client's case.
Use the provided documents and the following extracted workflow data to answer the user's questions.
Workflow Data:
Summary: ${workflow?.summary || 'N/A'}
Deductions: ${workflow?.deductions || 'N/A'}
Risks: ${workflow?.risks || 'N/A'}
Notes: ${workflow?.notes || 'N/A'}
`;

      messages.unshift({ role: 'system', content: systemPrompt });

      // Add history
      history.forEach((h: any) => {
        messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      });

      messages.push({ role: 'user', content: message });

      const ai = getAI();
      const response = await ai.chat.completions.create({
        model: 'gpt-4o',
        messages
      });

      const reply = response.choices[0].message.content || 'I could not generate a response.';

      // Save AI message
      db.prepare('INSERT INTO chat_messages (client_id, role, content) VALUES (?, ?, ?)').run(clientId, 'assistant', reply);

      res.json({ success: true, reply });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html for root path in development
    app.get('/', async (req, res) => {
      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        let html = await vite.transformIndexHtml(req.url, indexPath);
        res.type('html').send(html);
      } catch (err) {
        res.status(500).send('Error loading page');
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
