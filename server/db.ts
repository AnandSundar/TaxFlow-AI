import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tax_assistant.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'New'
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    filename TEXT,
    mime_type TEXT,
    data TEXT, -- Base64 encoded data
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    status TEXT DEFAULT 'Pending',
    summary TEXT,
    deductions TEXT,
    risks TEXT,
    notes TEXT,
    estimated_income TEXT,
    estimated_deductions TEXT,
    next_steps TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );
`);

// Insert some mock clients if empty
const count = db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
if (count.count === 0) {
  const insertClient = db.prepare('INSERT INTO clients (name, email, status) VALUES (?, ?, ?)');
  const c1 = insertClient.run('Acme Corp', 'contact@acme.com', 'In Progress');
  const c2 = insertClient.run('Jane Doe', 'jane.doe@example.com', 'New');
  
  const insertWorkflow = db.prepare('INSERT INTO workflows (client_id, status) VALUES (?, ?)');
  insertWorkflow.run(c1.lastInsertRowid, 'Pending');
  insertWorkflow.run(c2.lastInsertRowid, 'Pending');
}

export default db;
