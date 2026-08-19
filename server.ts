import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import {
  getDbPool as getRawPgPool,
  getEffectiveDbConfig,
  resetDbPool,
  executeQuery,
  logActivity,
  initPostgresDatabase
} from "./src/server/db";

dotenv.config();

const potentialEnvFiles = [".env", ".env.local", ".env.production", ".env.development", ".env.example"];
const envFilesFound = potentialEnvFiles.filter(f => fs.existsSync(f));

console.log('[ENV SOURCE AUDIT]', {
  DATABASE_URL_SET: !!process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || process.env.POSTGRES_HOST || process.env.PGHOST,
  DB_DATABASE: process.env.DB_DATABASE || process.env.DB_NAME || process.env.POSTGRES_DB || process.env.PGDATABASE,
  DB_USERNAME: process.env.DB_USERNAME || process.env.DB_USER || process.env.POSTGRES_USER || process.env.PGUSER,
  DB_PASSWORD_LENGTH: (process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD)?.length || 0,
  ENV_FILES_FOUND: envFilesFound
});

const PORT = 3000;

// Helper to safely parse JSON strings or return fallback
function safeJsonParse<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// In-Memory Active Session Store for high security authentication
interface AdminSession {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

const activeAdminSessions = new Map<string, AdminSession>();

function createAdminSession(user: { id: number; name: string; email: string; role: string }): string {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours validity
  activeAdminSessions.set(token, {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: now,
    expiresAt
  });
  return token;
}

function getAdminSession(req: express.Request): AdminSession | null {
  const authHeader = req.headers.authorization || (req.headers["x-admin-token"] as string | undefined);
  if (!authHeader) return null;

  let token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  } else {
    token = token.trim();
  }

  if (!token) return null;

  const session = activeAdminSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(token);
    return null;
  }

  return session;
}

// Unified Database Access Interface (100% PostgreSQL & Coolify Ready)
function getDbPool() {
  return {
    query: (sql: string, params: any[] = []) => executeQuery(sql, params),
    raw: getRawPgPool
  };
}

async function initDatabaseAndVerifyCounts() {
  await initPostgresDatabase();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // Initialize and verify database tables
  await initDatabaseAndVerifyCounts();

  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  // --- API ROUTES (100% POSTGRESQL & COOLIFY READY) ---

  // Database Connection Status
  app.get("/api/db-status", async (req, res) => {
    const config = getEffectiveDbConfig();
    const envVars = {
      DATABASE_URL: !!config.connectionString,
      DB_HOST: !!config.host,
      DB_USER: !!config.user,
      DB_NAME: !!config.database,
      DB_PASSWORD: !!config.password,
      DB_PORT: !!config.port
    };

    try {
      const pool = getDbPool();
      await pool.query("SELECT 1 AS connected;");
      return res.json({
        connected: true,
        type: config.type,
        fallback: false,
        env: envVars,
        configSource: config.source,
        message: `Successfully connected to PostgreSQL Database (Coolify / Cloud Persistence)!`
      });
    } catch (err: any) {
      return res.json({
        connected: false,
        type: config.type,
        fallback: false,
        env: envVars,
        configSource: config.source,
        error: `Could not connect to PostgreSQL: ${err.message}`
      });
    }
  });

  // Admin DB Configuration & Direct Live Connection Tester
  app.get("/api/admin/db-config", (req, res) => {
    const config = getEffectiveDbConfig();
    return res.json({
      type: config.type,
      databaseUrl: config.connectionString ? config.connectionString.replace(/:[^:@]+@/, ":****@") : "",
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port,
      hasPassword: !!config.password,
      passwordLength: config.password ? config.password.length : 0,
      source: config.source
    });
  });

  app.post("/api/admin/db-config", async (req, res) => {
    try {
      const { host, user, password, database, port, databaseUrl } = req.body;
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const configPath = path.join(dataDir, "db-config.json");
      let existingConfig: any = {};
      if (fs.existsSync(configPath)) {
        try {
          existingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        } catch (e) {}
      }

      const newConfig = {
        databaseUrl: databaseUrl !== undefined ? databaseUrl : (existingConfig.databaseUrl || ""),
        host: host || existingConfig.host || "localhost",
        user: user || existingConfig.user || "postgres",
        password: password !== undefined ? password : (existingConfig.password || ""),
        database: database || existingConfig.database || "creattivee_db",
        port: parseInt(port || existingConfig.port || "5432")
      };

      fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), "utf-8");

      // Reset pool so next query uses new credentials immediately
      await resetDbPool();

      // Test new connection immediately
      let testSuccess = false;
      let testError = null;
      try {
        const pool = getDbPool();
        await pool.query("SELECT 1");
        testSuccess = true;
      } catch (err: any) {
        testError = err.message;
      }

      return res.json({
        success: true,
        connected: testSuccess,
        error: testError,
        message: testSuccess
          ? "PostgreSQL Database configuration saved & connection verified successfully!"
          : `Configuration saved, but connection failed: ${testError}`,
        config: {
          host: newConfig.host,
          user: newConfig.user,
          database: newConfig.database,
          port: newConfig.port,
          passwordLength: newConfig.password ? newConfig.password.length : 0
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/admin/test-db-connection", async (req, res) => {
    const { host, user, password, database, port, databaseUrl } = req.body;
    let tempPgPool: pg.Pool | null = null;
    try {
      if (databaseUrl && databaseUrl.trim()) {
        tempPgPool = new pg.Pool({
          connectionString: databaseUrl.trim(),
          ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
          connectionTimeoutMillis: 8000
        });
      } else {
        tempPgPool = new pg.Pool({
          host: host || "localhost",
          user: user || "postgres",
          password: password || "",
          database: database || "creattivee_db",
          port: parseInt(port || "5432"),
          connectionTimeoutMillis: 8000
        });
      }

      const rows = await tempPgPool.query("SELECT 1 AS connected;");
      await tempPgPool.end();
      return res.json({
        success: true,
        message: "Successfully connected to PostgreSQL Database!",
        result: rows.rows
      });
    } catch (err: any) {
      if (tempPgPool) {
        try { await tempPgPool.end(); } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        error: err.message,
        code: err.code || "CONNECTION_FAILED"
      });
    }
  });

  // Temporary Diagnostic Endpoint for Environment Variable Audit
  app.get("/api/db-env", (req, res) => {
    return res.json({
      DB_HOST: process.env.DB_HOST || null,
      DB_PORT: process.env.DB_PORT || null,
      DB_DATABASE: process.env.DB_DATABASE || null,
      DB_NAME: process.env.DB_NAME || null,
      DB_USERNAME: process.env.DB_USERNAME || null,
      DB_USER: process.env.DB_USER || null,
      DB_PASSWORD_LENGTH: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0
    });
  });

  // Temporary Forensic Audit Endpoint for Environment Source
  app.get("/api/env-source-audit", (req, res) => {
    return res.json({
      DB_HOST: process.env.DB_HOST || null,
      DB_DATABASE: process.env.DB_DATABASE || null,
      DB_NAME: process.env.DB_NAME || null,
      DB_USERNAME: process.env.DB_USERNAME || null,
      DB_USER: process.env.DB_USER || null,
      DB_PASSWORD_LENGTH: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0,
      NODE_ENV: process.env.NODE_ENV || null,
      ALL_DB_KEYS: Object.keys(process.env)
        .filter(k => k.includes('DB'))
        .sort()
    });
  });

  // Temporary Runtime Fingerprint Endpoint
  const SERVER_START_TIME = new Date().toISOString();
  app.get("/api/runtime-fingerprint", (req, res) => {
    return res.json({
      deploymentId: process.env.K_SERVICE || process.env.APPLET_ID || "unknown",
      revisionId: process.env.K_REVISION || os.hostname(),
      buildTimestamp: SERVER_START_TIME,
      nodeEnv: process.env.NODE_ENV || "unknown",
      dbPasswordLength: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0,
      appUrl: process.env.APP_URL || null,
      hostname: os.hostname(),
      allDbKeys: Object.keys(process.env).filter(k => k.includes('DB')).sort()
    });
  });

  // PostgreSQL Sync and Table Verification Endpoint
  app.post("/api/db-sync", async (req, res) => {
    try {
      const pool = getDbPool();
      const tables = [
        "users", "services", "packages", "portfolio", "blogs",
        "leads", "clients", "proposals", "testimonials", "faqs",
        "settings", "partners", "activity_logs", "benefits"
      ];
      
      const counts: Record<string, number> = {};
      let total = 0;
      for (const t of tables) {
        try {
          const [rows]: any = await pool.query(`SELECT COUNT(*) as count FROM "${t}"`);
          const c = parseInt(rows[0]?.count || "0", 10);
          counts[t] = c;
          total += c;
        } catch {
          counts[t] = 0;
        }
      }

      return res.json({
        success: true,
        message: `PostgreSQL database verified! ${tables.length} tables active with ${total} total records.`,
        counts,
        totalRecords: total
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Non-destructive DB Sync/Backup Endpoint
  app.post("/api/db-sync", async (req, res) => {
    const { action } = req.body;
    try {
      const pool = getDbPool();
      if (action === "verify" || action === "pull") {
        await initDatabaseAndVerifyCounts();
        await logActivity("Manually verified MySQL database table status", "Admin");
        return res.json({ success: true, message: "Hostinger MySQL database verified and synchronized." });
      }
      return res.json({ success: true, message: "MySQL is active and acts as the sole source of truth." });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: `Verification failed: ${err.message}` });
    }
  });

  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email/Username and Password are required." });
    }

    const cleanInput = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const isUserValid = (cleanInput === "foujia@creattivee.com" || cleanInput === "foujia");
    const isPasswordValid = (cleanPassword === "Login@2025");

    if (!isUserValid || !isPasswordValid) {
      await logActivity(`Blocked unauthorized login attempt for '${cleanInput}'`, "Security Firewall");
      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password. Access denied."
      });
    }

    try {
      const pool = getDbPool();
      let user = null;
      try {
        const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", ["foujia@creattivee.com"]);
        user = rows[0];

        if (!user) {
          // Create user if not exists
          await pool.query(
            "INSERT INTO users (name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)",
            ["Foujia (Admin)", "foujia@creattivee.com", "$2y$12$R.3C7hSj07Xg696BfDIn3e1gYy3h52gU8oP1.h98aO6N9nZt/K7B.", "admin", JSON.stringify(["all"])]
          );
          const [newRows]: any = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", ["foujia@creattivee.com"]);
          user = newRows[0];
        }
      } catch (dbErr: any) {
        console.warn("[Auth Login] Database query failed, using master admin session:", dbErr.message);
        user = {
          id: 1,
          name: "Foujia (Admin)",
          email: "foujia@creattivee.com",
          role: "admin"
        };
      }

      const sessionUser = {
        id: Number(user?.id || 1),
        name: user?.name || "Foujia (Admin)",
        email: user?.email || "foujia@creattivee.com",
        role: user?.role || "admin"
      };

      const token = createAdminSession(sessionUser);
      logActivity("Admin successfully authenticated and generated security session", sessionUser.name).catch(() => {});

      return res.json({
        success: true,
        token,
        user: sessionUser
      });
    } catch (err: any) {
      console.error("Login fallback execution error:", err);
      // Even in catch block, provide master session for valid credentials
      const masterUser = {
        id: 1,
        name: "Foujia (Admin)",
        email: "foujia@creattivee.com",
        role: "admin"
      };
      const token = createAdminSession(masterUser);
      return res.json({
        success: true,
        token,
        user: masterUser
      });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const session = getAdminSession(req);
    if (!session) {
      return res.status(401).json({
        success: false,
        user: null,
        message: "Session expired or unauthorized. Please login."
      });
    }

    res.json({
      success: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role
      }
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    const authHeader = req.headers.authorization || (req.headers["x-admin-token"] as string | undefined);
    if (authHeader) {
      let token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
      } else {
        token = token.trim();
      }
      if (token) {
        activeAdminSessions.delete(token);
      }
    }
    await logActivity("Admin session terminated via logout", "Admin");
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Activity Logs
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 150");
      res.json(rows.map((r: any) => ({
        id: Number(r.id),
        event: r.event,
        date: r.date,
        user: r.user
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Services CRUD (Direct MySQL)
  app.get("/api/services", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM services ORDER BY id ASC");
      const services = rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        slug: r.slug,
        category: r.category,
        description: r.description,
        features: safeJsonParse(r.features, []),
        packages: safeJsonParse(r.packages, []),
        faq: safeJsonParse(r.faq, []),
        seo_title: r.seo_title || "",
        seo_description: r.seo_description || "",
        seo_keywords: r.seo_keywords || ""
      }));
      res.json(services);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const pool = getDbPool();
      const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const [result]: any = await pool.query(
        `INSERT INTO services (title, slug, category, description, features, packages, faq, seo_title, seo_description, seo_keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.title,
          slug,
          req.body.category || "Design",
          req.body.description || "",
          JSON.stringify(req.body.features || []),
          JSON.stringify(req.body.packages || []),
          JSON.stringify(req.body.faq || []),
          req.body.seo_title || "",
          req.body.seo_description || "",
          req.body.seo_keywords || ""
        ]
      );
      const newService = {
        id: Number(result.insertId),
        ...req.body,
        slug
      };
      await logActivity(`Created service: ${newService.title}`);
      res.json({ success: true, service: newService });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await pool.query(
        `UPDATE services SET title = ?, slug = ?, category = ?, description = ?, features = ?, packages = ?, faq = ?, seo_title = ?, seo_description = ?, seo_keywords = ?
         WHERE id = ?`,
        [
          req.body.title,
          slug,
          req.body.category || "Design",
          req.body.description || "",
          JSON.stringify(req.body.features || []),
          JSON.stringify(req.body.packages || []),
          JSON.stringify(req.body.faq || []),
          req.body.seo_title || "",
          req.body.seo_description || "",
          req.body.seo_keywords || "",
          id
        ]
      );
      await logActivity(`Updated service #${id}: ${req.body.title}`);
      res.json({ success: true, service: { id, ...req.body, slug } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM services WHERE id = ?", [id]);
      await logActivity(`Deleted service #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Packages CRUD (Direct MySQL)
  app.get("/api/packages", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM packages ORDER BY id ASC");
      const packages = rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        price: r.price,
        timeline: r.timeline,
        features: safeJsonParse(r.features, []),
        highlight: Boolean(r.highlight),
        button_text: r.button_text || "Buy Now"
      }));
      res.json(packages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/packages", async (req, res) => {
    try {
      const pool = getDbPool();
      const [result]: any = await pool.query(
        `INSERT INTO packages (title, price, timeline, features, highlight, button_text)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.body.title,
          req.body.price,
          req.body.timeline || "14 Days",
          JSON.stringify(req.body.features || []),
          req.body.highlight ? 1 : 0,
          req.body.button_text || "Buy Now"
        ]
      );
      const newPkg = {
        id: Number(result.insertId),
        ...req.body
      };
      await logActivity(`Created package: ${newPkg.title}`);
      res.json({ success: true, package: newPkg });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query(
        `UPDATE packages SET title = ?, price = ?, timeline = ?, features = ?, highlight = ?, button_text = ?
         WHERE id = ?`,
        [
          req.body.title,
          req.body.price,
          req.body.timeline || "14 Days",
          JSON.stringify(req.body.features || []),
          req.body.highlight ? 1 : 0,
          req.body.button_text || "Buy Now",
          id
        ]
      );
      await logActivity(`Updated package #${id}: ${req.body.title}`);
      res.json({ success: true, package: { id, ...req.body } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM packages WHERE id = ?", [id]);
      await logActivity(`Deleted package #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Clients CRUD (Direct MySQL)
  app.get("/api/clients", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM clients ORDER BY id DESC");
      const clients = rows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        email: r.email,
        phone: r.phone || "",
        company_name: r.company_name || "",
        address: r.address || "",
        projects: safeJsonParse(r.projects, []),
        invoices: safeJsonParse(r.invoices, []),
        documents: safeJsonParse(r.documents, []),
        payments: safeJsonParse(r.payments, []),
        notes: r.notes || "",
        created_at: r.created_at
      }));
      res.json(clients);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const pool = getDbPool();
      const [result]: any = await pool.query(
        `INSERT INTO clients (name, email, phone, company_name, address, projects, invoices, documents, payments, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.name,
          req.body.email,
          req.body.phone || "",
          req.body.company_name || "",
          req.body.address || "",
          JSON.stringify(req.body.projects || []),
          JSON.stringify(req.body.invoices || []),
          JSON.stringify(req.body.documents || []),
          JSON.stringify(req.body.payments || []),
          req.body.notes || ""
        ]
      );
      const newClient = {
        id: Number(result.insertId),
        ...req.body,
        created_at: new Date().toISOString()
      };
      await logActivity(`Registered new client: ${newClient.name}`);
      res.json({ success: true, client: newClient });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query(
        `UPDATE clients SET name = ?, email = ?, phone = ?, company_name = ?, address = ?, projects = ?, invoices = ?, documents = ?, payments = ?, notes = ?
         WHERE id = ?`,
        [
          req.body.name,
          req.body.email,
          req.body.phone || "",
          req.body.company_name || "",
          req.body.address || "",
          JSON.stringify(req.body.projects || []),
          JSON.stringify(req.body.invoices || []),
          JSON.stringify(req.body.documents || []),
          JSON.stringify(req.body.payments || []),
          req.body.notes || "",
          id
        ]
      );
      await logActivity(`Updated client specs: ${req.body.name}`);
      res.json({ success: true, client: { id, ...req.body } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM clients WHERE id = ?", [id]);
      await logActivity(`Deleted client #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Proposals CRUD (Direct MySQL)
  app.get("/api/proposals", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM proposals ORDER BY id DESC");
      const proposals = rows.map((r: any) => ({
        id: Number(r.id),
        lead_id: r.lead_id ? Number(r.lead_id) : null,
        title: r.title,
        client_name: r.client_name || "",
        client_email: r.client_email || "",
        client_phone: r.client_phone || "",
        status: r.status || "draft",
        services_selected: safeJsonParse(r.services_selected, []),
        packages_selected: safeJsonParse(r.packages_selected, []),
        price: Number(r.price),
        terms: r.terms || "",
        timeline: r.timeline || "",
        scope_html: r.scope_html || "",
        signature_data: r.signature_data || "",
        download_count: Number(r.download_count || 0),
        last_downloaded_at: r.last_downloaded_at || null,
        pdf_generated_at: r.pdf_generated_at || null,
        pdf_version: Number(r.pdf_version || 1),
        created_at: r.created_at
      }));
      res.json(proposals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/proposals", async (req, res) => {
    try {
      const pool = getDbPool();
      const [result]: any = await pool.query(
        `INSERT INTO proposals (lead_id, title, services_selected, packages_selected, price, terms, timeline, signature_data, status, scope_html, client_name, client_email, client_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.lead_id || null,
          req.body.title,
          JSON.stringify(req.body.services_selected || []),
          JSON.stringify(req.body.packages_selected || []),
          req.body.price || 0,
          req.body.terms || "",
          req.body.timeline || "",
          req.body.signature_data || "",
          req.body.status || "draft",
          req.body.scope_html || "",
          req.body.client_name || "",
          req.body.client_email || "",
          req.body.client_phone || ""
        ]
      );
      const newProposal = {
        id: Number(result.insertId),
        ...req.body,
        created_at: new Date().toISOString()
      };
      await logActivity(`Generated proposal #${newProposal.id}: ${newProposal.title} (₹${newProposal.price})`);
      res.json({ success: true, proposal: newProposal });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/proposals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query(
        `UPDATE proposals SET title = ?, services_selected = ?, packages_selected = ?, price = ?, terms = ?, timeline = ?, signature_data = ?, status = ?, scope_html = ?, client_name = ?, client_email = ?, client_phone = ?
         WHERE id = ?`,
        [
          req.body.title,
          JSON.stringify(req.body.services_selected || []),
          JSON.stringify(req.body.packages_selected || []),
          req.body.price || 0,
          req.body.terms || "",
          req.body.timeline || "",
          req.body.signature_data || "",
          req.body.status || "draft",
          req.body.scope_html || "",
          req.body.client_name || "",
          req.body.client_email || "",
          req.body.client_phone || "",
          id
        ]
      );
      await logActivity(`Updated proposal #${id}: ${req.body.title}`);
      res.json({ success: true, proposal: { id, ...req.body } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/proposals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM proposals WHERE id = ?", [id]);
      await logActivity(`Deleted proposal #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Enterprise Puppeteer PDF Export Endpoint (Direct MySQL Query & Incremental Counter)
  app.post("/api/proposals/export-pdf/:proposalId", async (req, res) => {
    const startTime = Date.now();
    const proposalId = parseInt(req.params.proposalId);
    console.log(`[PDF Engine] Initiating export for Proposal #${proposalId}...`);

    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM proposals WHERE id = ? LIMIT 1", [proposalId]);
      const proposal = rows[0];

      let htmlContent = req.body?.html;

      if (!htmlContent && proposal) {
        const clientName = proposal.client_name || "Valued Client";
        const clientEmail = proposal.client_email || "";
        const clientPhone = proposal.client_phone || "";
        const price = proposal.price ? Number(proposal.price).toLocaleString("en-IN") : "0";
        const dateStr = proposal.created_at ? new Date(proposal.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN");
        
        htmlContent = `
          <div id="proposal-printable-canvas" style="padding: 40px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
              <div>
                <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a;">creattivee<span style="color: #9333ea;">.</span></h2>
                <div style="font-size: 10px; color: #7e22ce; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Bespoke Full Stack Studio</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #64748b;">
                <p style="margin: 0; font-weight: 700; color: #1e293b;">Creattivee Digital Labs</p>
                <p style="margin: 2px 0 0 0;">D-561, Pocket 11, Jasola, New Delhi, India</p>
                <p style="margin: 2px 0 0 0; color: #7e22ce; font-weight: 600;">creattivee@gmail.com | +91-8796380455</p>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <span style="font-size: 10px; font-weight: 700; color: #7e22ce; background: #faf5ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #f3e8ff;">Ref: PROPOSAL #${proposal.id}</span>
              <span style="float: right; font-size: 12px; color: #94a3b8;">Date: ${dateStr}</span>
              <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 6px 0;">${proposal.title || "Interactive Digital Growth Proposal"}</h3>
            </div>
            <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">PROPOSAL PREPARED FOR</span>
                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">${clientName}</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Email: ${clientEmail}</p>
                ${clientPhone ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Phone: ${clientPhone}</p>` : ""}
              </div>
              <div>
                <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">CONTRACT METRICS</span>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #334155;">Timeline: <strong>${proposal.timeline || "2 Weeks"}</strong></p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #334155;">Currency: <strong>INR (₹ / Rs.)</strong></p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #7e22ce;">Status: <strong>${proposal.status || "DRAFT"}</strong></p>
              </div>
            </div>
            <div style="margin-top: 24px;">
              <h4 style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Detailed Scope of Deliverables</h4>
              <div style="font-size: 12px; line-height: 1.6; color: #334155; margin-top: 12px;">
                ${proposal.scope_html || "<p>Complete digital architecture, frontend UI, backend endpoints and database setup.</p>"}
              </div>
            </div>
            <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #f1f5f9;">
              <h4 style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Terms & Mobilization Agreements</h4>
              <p style="font-size: 12px; color: #475569; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0;">${proposal.terms || "50% advance mobilization fee, remaining 50% on successful handover."}</p>
            </div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; font-weight: 700; color: #334155; font-size: 12px;">Creattivee Verified Contract</p>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #059669;">✔ High-precision deliverables ledger</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">TOTAL CONTRACT QUOTE</span>
                <p style="margin: 2px 0 0 0; font-size: 28px; font-weight: 900; color: #0f172a;">₹${price}</p>
              </div>
            </div>
          </div>
        `;
      }

      if (!htmlContent) {
        return res.status(404).json({ success: false, message: "Proposal data or HTML payload not found" });
      }

      const fullDocumentHtml = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Proposal #${proposalId}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @page { size: A4 portrait; margin: 0; }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              body { margin: 0; padding: 0; background-color: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
              #proposal-printable-canvas { width: 100% !important; max-width: 850px !important; margin: 0 auto !important; padding: 36px 40px !important; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      // Multi-strategy Chromium locator
      const possibleCachePaths = [
        "/root/.cache/puppeteer/chrome/linux-152.0.7977.42/chrome-linux64/chrome",
        "/home/.cache/puppeteer/chrome/linux-152.0.7977.42/chrome-linux64/chrome",
        "/tmp/localChromium/chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser"
      ];

      let executablePath = "";
      try {
        const sparticuzPath = await chromium.executablePath();
        if (sparticuzPath && fs.existsSync(sparticuzPath)) {
          executablePath = sparticuzPath;
        }
      } catch {
        // Fallback check
      }

      if (!executablePath) {
        for (const testPath of possibleCachePaths) {
          if (fs.existsSync(testPath)) {
            executablePath = testPath;
            break;
          }
        }
      }

      const launchOptions: any = {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--no-first-run",
          "--no-zygote",
          "--disable-accelerated-2d-canvas"
        ],
        headless: true
      };

      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }

      const browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
      await page.setContent(fullDocumentHtml, { waitUntil: ["load", "domcontentloaded"], timeout: 30000 });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
      });

      await browser.close();

      // Incremental MySQL update
      if (proposal) {
        await pool.query(
          "UPDATE proposals SET download_count = download_count + 1, last_downloaded_at = NOW(), pdf_generated_at = NOW() WHERE id = ?",
          [proposalId]
        );
        await logActivity(`Downloaded PDF for proposal #${proposalId}`);
      }

      const clientNameSafe = proposal?.client_name ? proposal.client_name.replace(/[^a-zA-Z0-9_-]/g, "_") : "Client";
      const filename = `Proposal-${proposalId}-${clientNameSafe}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.end(Buffer.from(pdfBuffer));
    } catch (error: any) {
      console.error(`[PDF Engine Error] Failed generating proposal PDF:`, error);
      res.status(500).json({ success: false, message: "Failed to generate PDF via Puppeteer", error: error.message });
    }
  });

  // Leads CRUD (Direct MySQL)
  app.get("/api/leads", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM leads ORDER BY id DESC");
      const leads = rows.map((r: any) => ({
        id: Number(r.id),
        type: r.type || "website",
        client_name: r.client_name,
        client_email: r.client_email,
        client_phone: r.client_phone || "",
        service_interested: r.service_interested || "",
        message: r.message || "",
        status: r.status || "pending",
        staff_assigned: r.staff_assigned || "Unassigned",
        follow_up_date: r.follow_up_date || "",
        notes: safeJsonParse(r.notes, []),
        attachments: safeJsonParse(r.attachments, []),
        timeline: safeJsonParse(r.timeline, []),
        created_at: r.created_at
      }));
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const pool = getDbPool();
      const initialNotes = [
        { text: `Lead registered via ${req.body.type || "website"} form.`, date: new Date().toISOString().substring(0, 16).replace("T", " "), author: "System" }
      ];
      const initialTimeline = [
        { label: "Lead Logged", text: "Registered in CRM index", date: new Date().toISOString().substring(0, 16).replace("T", " ") }
      ];

      const [result]: any = await pool.query(
        `INSERT INTO leads (type, client_name, client_email, client_phone, service_interested, message, status, staff_assigned, follow_up_date, notes, attachments, timeline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.type || "website",
          req.body.client_name,
          req.body.client_email,
          req.body.client_phone || "",
          req.body.service_interested || "Website Designing",
          req.body.message || "",
          "pending",
          req.body.staff_assigned || "Unassigned",
          req.body.follow_up_date || null,
          JSON.stringify(initialNotes),
          JSON.stringify(req.body.attachments || []),
          JSON.stringify(initialTimeline)
        ]
      );
      const newLead = {
        id: Number(result.insertId),
        ...req.body,
        status: "pending",
        notes: initialNotes,
        timeline: initialTimeline,
        created_at: new Date().toISOString()
      };
      await logActivity(`New Lead registered: ${newLead.client_name} (${newLead.service_interested})`);
      res.json({ success: true, lead: newLead });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      
      const [existing]: any = await pool.query("SELECT * FROM leads WHERE id = ? LIMIT 1", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const current = existing[0];
      const oldStatus = current.status;
      let timeline = safeJsonParse(current.timeline, []);

      if (req.body.status && req.body.status !== oldStatus) {
        timeline.push({
          label: "Status Changed",
          text: `Status updated from ${oldStatus} to ${req.body.status}`,
          date: new Date().toISOString().substring(0, 16).replace("T", " ")
        });
      }

      await pool.query(
        `UPDATE leads SET type = ?, client_name = ?, client_email = ?, client_phone = ?, service_interested = ?, message = ?, status = ?, staff_assigned = ?, follow_up_date = ?, timeline = ?
         WHERE id = ?`,
        [
          req.body.type || current.type,
          req.body.client_name || current.client_name,
          req.body.client_email || current.client_email,
          req.body.client_phone ?? current.client_phone,
          req.body.service_interested || current.service_interested,
          req.body.message ?? current.message,
          req.body.status || current.status,
          req.body.staff_assigned || current.staff_assigned,
          req.body.follow_up_date || current.follow_up_date,
          JSON.stringify(timeline),
          id
        ]
      );
      await logActivity(`Updated lead: ${req.body.client_name || current.client_name}`);
      res.json({ success: true, lead: { ...current, ...req.body, timeline } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/leads/:id/notes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { text, author } = req.body;
      const pool = getDbPool();

      const [existing]: any = await pool.query("SELECT * FROM leads WHERE id = ? LIMIT 1", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const current = existing[0];
      const notes = safeJsonParse(current.notes, []);
      const timeline = safeJsonParse(current.timeline, []);

      const newNote = {
        text,
        date: new Date().toISOString().substring(0, 16).replace("T", " "),
        author: author || "Staff"
      };
      notes.unshift(newNote);
      timeline.push({
        label: "Note Added",
        text: `Staff note added: "${text.substring(0, 30)}..."`,
        date: new Date().toISOString().substring(0, 16).replace("T", " ")
      });

      await pool.query(
        "UPDATE leads SET notes = ?, timeline = ? WHERE id = ?",
        [JSON.stringify(notes), JSON.stringify(timeline), id]
      );

      res.json({ success: true, lead: { ...current, notes, timeline } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM leads WHERE id = ?", [id]);
      await logActivity(`Deleted lead #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/leads/import-csv", async (req, res) => {
    const { csvData } = req.body;
    if (!Array.isArray(csvData)) {
      return res.status(400).json({ success: false, message: "Invalid CSV payload structure" });
    }
    try {
      const pool = getDbPool();
      let importedCount = 0;

      for (const row of csvData) {
        if (row.client_name && row.client_email) {
          const notes = [
            { text: "Lead registered via bulk CSV import.", date: new Date().toISOString().substring(0, 16).replace("T", " "), author: "System" }
          ];
          const timeline = [
            { label: "CSV Import", text: "Uploaded in bulk", date: new Date().toISOString().substring(0, 16).replace("T", " ") }
          ];

          await pool.query(
            `INSERT INTO leads (type, client_name, client_email, client_phone, service_interested, message, status, staff_assigned, follow_up_date, notes, attachments, timeline)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              "imported",
              row.client_name,
              row.client_email,
              row.client_phone || "",
              row.service_interested || "Website Designing",
              row.message || "CSV Imported record",
              "pending",
              "Unassigned",
              null,
              JSON.stringify(notes),
              JSON.stringify([]),
              JSON.stringify(timeline)
            ]
          );
          importedCount++;
        }
      }

      await logActivity(`Imported ${importedCount} leads via CSV bulk upload`);
      const [leads]: any = await pool.query("SELECT * FROM leads ORDER BY id DESC");
      res.json({ success: true, count: importedCount, leads });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Portfolio CRUD (Direct MySQL)
  app.get("/api/portfolio", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM portfolio ORDER BY id ASC");
      const portfolio = rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        slug: r.slug,
        category: r.category,
        client: r.client || "",
        technology_used: safeJsonParse(r.technology_used, []),
        project_timeline: r.project_timeline || "",
        website_link: r.website_link || "",
        video_url: r.video_url || "",
        description: r.description || "",
        case_study: r.case_study || "",
        screenshots: safeJsonParse(r.screenshots, [])
      }));
      res.json(portfolio);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const pool = getDbPool();
      const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const [result]: any = await pool.query(
        `INSERT INTO portfolio (title, slug, category, client, technology_used, project_timeline, website_link, video_url, description, case_study, screenshots)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.title,
          slug,
          req.body.category || "Design",
          req.body.client || "",
          JSON.stringify(req.body.technology_used || []),
          req.body.project_timeline || "",
          req.body.website_link || "",
          req.body.video_url || "",
          req.body.description || "",
          req.body.case_study || "",
          JSON.stringify(req.body.screenshots || [])
        ]
      );
      const newProject = {
        id: Number(result.insertId),
        ...req.body,
        slug
      };
      await logActivity(`Created portfolio item: ${newProject.title}`);
      res.json({ success: true, project: newProject });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/portfolio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await pool.query(
        `UPDATE portfolio SET title = ?, slug = ?, category = ?, client = ?, technology_used = ?, project_timeline = ?, website_link = ?, video_url = ?, description = ?, case_study = ?, screenshots = ?
         WHERE id = ?`,
        [
          req.body.title,
          slug,
          req.body.category || "Design",
          req.body.client || "",
          JSON.stringify(req.body.technology_used || []),
          req.body.project_timeline || "",
          req.body.website_link || "",
          req.body.video_url || "",
          req.body.description || "",
          req.body.case_study || "",
          JSON.stringify(req.body.screenshots || []),
          id
        ]
      );
      await logActivity(`Updated portfolio item #${id}: ${req.body.title}`);
      res.json({ success: true, project: { id, ...req.body, slug } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/portfolio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM portfolio WHERE id = ?", [id]);
      await logActivity(`Deleted portfolio item #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Blogs CRUD (Direct MySQL)
  app.get("/api/blogs", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM blogs ORDER BY id DESC");
      const blogs = rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        slug: r.slug,
        category: r.category,
        tags: safeJsonParse(r.tags, []),
        content: r.content,
        featured_image: r.featured_image || "",
        author: r.author || "Admin",
        reading_time: Number(r.reading_time || 5),
        views: Number(r.views || 0),
        comments: safeJsonParse(r.comments, []),
        seo_title: r.seo_title || "",
        seo_description: r.seo_description || ""
      }));
      res.json(blogs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/blogs", async (req, res) => {
    try {
      const pool = getDbPool();
      const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const readingTime = Math.max(1, Math.round((req.body.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length / 200));

      const [result]: any = await pool.query(
        `INSERT INTO blogs (title, slug, category, tags, content, featured_image, author, reading_time, views, comments, seo_title, seo_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.title,
          slug,
          req.body.category || "Design",
          JSON.stringify(req.body.tags || []),
          req.body.content || "",
          req.body.featured_image || "",
          req.body.author || "Admin",
          readingTime,
          0,
          JSON.stringify([]),
          req.body.seo_title || "",
          req.body.seo_description || ""
        ]
      );
      const newBlog = {
        id: Number(result.insertId),
        ...req.body,
        slug,
        views: 0,
        comments: [],
        reading_time: readingTime
      };
      await logActivity(`Created blog article: ${newBlog.title}`);
      res.json({ success: true, blog: newBlog });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/blogs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await pool.query(
        `UPDATE blogs SET title = ?, slug = ?, category = ?, tags = ?, content = ?, featured_image = ?, author = ?, seo_title = ?, seo_description = ?
         WHERE id = ?`,
        [
          req.body.title,
          slug,
          req.body.category || "Design",
          JSON.stringify(req.body.tags || []),
          req.body.content || "",
          req.body.featured_image || "",
          req.body.author || "Admin",
          req.body.seo_title || "",
          req.body.seo_description || "",
          id
        ]
      );
      await logActivity(`Updated blog article #${id}: ${req.body.title}`);
      res.json({ success: true, blog: { id, ...req.body, slug } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/blogs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM blogs WHERE id = ?", [id]);
      await logActivity(`Deleted blog article #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/blogs/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, comment } = req.body;
      const pool = getDbPool();

      const [existing]: any = await pool.query("SELECT comments FROM blogs WHERE id = ? LIMIT 1", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Blog not found" });
      }

      const comments = safeJsonParse(existing[0].comments, []);
      const newComment = {
        name: name || "Anonymous",
        comment: comment || "",
        date: new Date().toISOString().substring(0, 10)
      };
      comments.push(newComment);

      await pool.query("UPDATE blogs SET comments = ? WHERE id = ?", [JSON.stringify(comments), id]);
      await logActivity(`New blog comment by ${newComment.name}`);
      res.json({ success: true, comment: newComment });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Partners CRUD (Direct MySQL)
  app.get("/api/partners", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM partners ORDER BY id ASC");
      res.json(rows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        style: r.style
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/partners", async (req, res) => {
    try {
      const pool = getDbPool();
      const [result]: any = await pool.query(
        "INSERT INTO partners (name, style) VALUES (?, ?)",
        [req.body.name, req.body.style || ""]
      );
      const newPartner = { id: Number(result.insertId), ...req.body };
      await logActivity(`Created partner: ${newPartner.name}`);
      res.json({ success: true, partner: newPartner });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("UPDATE partners SET name = ?, style = ? WHERE id = ?", [req.body.name, req.body.style || "", id]);
      await logActivity(`Updated partner #${id}: ${req.body.name}`);
      res.json({ success: true, partner: { id, ...req.body } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM partners WHERE id = ?", [id]);
      await logActivity(`Deleted partner #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Benefits CRUD (Direct MySQL)
  app.get("/api/benefits", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM benefits ORDER BY id ASC");
      res.json(rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        text: r.text,
        icon: r.icon,
        bgColor: r.bgColor,
        borderColor: r.borderColor,
        iconColor: r.iconColor,
        glow: r.glow
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/benefits", async (req, res) => {
    try {
      const pool = getDbPool();
      const [result]: any = await pool.query(
        "INSERT INTO benefits (title, text, icon, bgColor, borderColor, iconColor, glow) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [req.body.title, req.body.text, req.body.icon, req.body.bgColor, req.body.borderColor, req.body.iconColor, req.body.glow]
      );
      const newBenefit = { id: Number(result.insertId), ...req.body };
      await logActivity(`Created benefit: ${newBenefit.title}`);
      res.json({ success: true, benefit: newBenefit });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/benefits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query(
        "UPDATE benefits SET title = ?, text = ?, icon = ?, bgColor = ?, borderColor = ?, iconColor = ?, glow = ? WHERE id = ?",
        [req.body.title, req.body.text, req.body.icon, req.body.bgColor, req.body.borderColor, req.body.iconColor, req.body.glow, id]
      );
      await logActivity(`Updated benefit #${id}: ${req.body.title}`);
      res.json({ success: true, benefit: { id, ...req.body } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/benefits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM benefits WHERE id = ?", [id]);
      await logActivity(`Deleted benefit #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // FAQs CRUD (Direct MySQL)
  app.get("/api/faqs", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM faqs ORDER BY id ASC");
      res.json(rows.map((r: any) => ({
        id: Number(r.id),
        question: r.question,
        answer: r.answer,
        category: r.category
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/faqs", async (req, res) => {
    try {
      const pool = getDbPool();
      const [result]: any = await pool.query(
        "INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)",
        [req.body.question, req.body.answer, req.body.category || "General"]
      );
      const newFaq = { id: Number(result.insertId), ...req.body };
      await logActivity("Added FAQ item");
      res.json({ success: true, faq: newFaq });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/faqs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("UPDATE faqs SET question = ?, answer = ?, category = ? WHERE id = ?", [req.body.question, req.body.answer, req.body.category || "General", id]);
      await logActivity(`Updated FAQ item #${id}`);
      res.json({ success: true, faq: { id, ...req.body } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/faqs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM faqs WHERE id = ?", [id]);
      await logActivity(`Deleted FAQ item #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Testimonials CRUD (Direct MySQL)
  app.get("/api/testimonials", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT * FROM testimonials ORDER BY id ASC");
      res.json(rows.map((r: any) => ({
        id: Number(r.id),
        author_name: r.author_name,
        author_role: r.author_role,
        author_company: r.author_company || "",
        testimonial_text: r.testimonial_text,
        rating: Number(r.rating || 5),
        author_avatar: r.author_avatar || ""
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const pool = getDbPool();
      const [result]: any = await pool.query(
        "INSERT INTO testimonials (author_name, author_role, author_company, testimonial_text, rating, author_avatar) VALUES (?, ?, ?, ?, ?, ?)",
        [req.body.author_name, req.body.author_role, req.body.author_company || "", req.body.testimonial_text, req.body.rating || 5, req.body.author_avatar || ""]
      );
      const newTestimonial = { id: Number(result.insertId), ...req.body };
      await logActivity(`Created testimonial: ${newTestimonial.author_name}`);
      res.json({ success: true, testimonial: newTestimonial });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query(
        "UPDATE testimonials SET author_name = ?, author_role = ?, author_company = ?, testimonial_text = ?, rating = ?, author_avatar = ? WHERE id = ?",
        [req.body.author_name, req.body.author_role, req.body.author_company || "", req.body.testimonial_text, req.body.rating || 5, req.body.author_avatar || "", id]
      );
      await logActivity(`Updated testimonial #${id}`);
      res.json({ success: true, testimonial: { id, ...req.body } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDbPool();
      await pool.query("DELETE FROM testimonials WHERE id = ?", [id]);
      await logActivity(`Deleted testimonial #${id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings CRUD (Direct MySQL)
  app.get("/api/settings", async (req, res) => {
    try {
      const pool = getDbPool();
      const [rows]: any = await pool.query("SELECT meta_key, meta_value FROM settings");
      const settingsObj: Record<string, string> = {
        company_name: "Creattivee",
        company_address: "D-561, Pocket 11, DDA Janta Flats, Jasola, New Delhi, 110025",
        company_phone: "+91-8796380455",
        company_email: "creattivee@gmail.com",
        smtp_host: "smtp.gmail.com",
        smtp_port: "587",
        seo_default_title: "Creattivee | Custom Software & Creative Web Design Agency",
        seo_default_description: "High performance digital agency specializing in custom software, ERPs, SEO, and bespoke React development."
      };
      for (const row of rows) {
        settingsObj[row.meta_key] = row.meta_value;
      }
      res.json(settingsObj);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const pool = getDbPool();
      for (const [key, val] of Object.entries(req.body)) {
        await pool.query(
          'INSERT INTO settings (meta_key, meta_value) VALUES (?, ?) ON CONFLICT (meta_key) DO UPDATE SET meta_value = EXCLUDED.meta_value',
          [key, String(val)]
        );
      }
      await logActivity("Updated general agency settings");
      
      const [rows]: any = await pool.query("SELECT meta_key, meta_value FROM settings");
      const settingsObj: Record<string, string> = {};
      for (const row of rows) {
        settingsObj[row.meta_key] = row.meta_value;
      }
      res.json({ success: true, settings: settingsObj });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic Sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const pool = getDbPool();
      const [services]: any = await pool.query("SELECT slug FROM services");
      const [portfolio]: any = await pool.query("SELECT slug FROM portfolio");
      const [blogs]: any = await pool.query("SELECT slug FROM blogs");

      const baseUrl = "https://creattivee.com";
      res.header("Content-Type", "application/xml");
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <priority>1.0</priority>\n  </url>\n`;
      
      services.forEach((s: any) => {
        xml += `  <url>\n    <loc>${baseUrl}/services/${s.slug}</loc>\n    <priority>0.8</priority>\n  </url>\n`;
      });

      portfolio.forEach((p: any) => {
        xml += `  <url>\n    <loc>${baseUrl}/portfolio/${p.slug}</loc>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      blogs.forEach((b: any) => {
        xml += `  <url>\n    <loc>${baseUrl}/blog/${b.slug}</loc>\n    <priority>0.6</priority>\n  </url>\n`;
      });

      xml += `</urlset>`;
      res.send(xml);
    } catch {
      res.status(500).send("Error generating sitemap");
    }
  });

  // Dynamic Robots.txt
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: https://creattivee.com/sitemap.xml`);
  });

  // Full Database Backup Export (JSON dump from PostgreSQL)
  app.get("/api/backups/download", async (req, res) => {
    try {
      const pool = getDbPool();
      const backup: any = {};
      const tables = ["users", "services", "packages", "portfolio", "blogs", "leads", "clients", "proposals", "testimonials", "faqs", "settings", "partners", "activity_logs", "benefits"];
      for (const t of tables) {
        const [rows]: any = await pool.query(`SELECT * FROM "${t}"`);
        backup[t] = rows;
      }
      res.setHeader("Content-disposition", "attachment; filename=creattivee_postgres_backup.json");
      res.setHeader("Content-type", "application/json");
      res.send(JSON.stringify(backup, null, 2));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE INTERACTION ---

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
    console.log(`[Creattivee Full-Stack Engine] Running on port http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start Creattivee full-stack system", err);
});
