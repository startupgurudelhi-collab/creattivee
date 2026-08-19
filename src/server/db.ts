import pg from "pg";
import fs from "fs";
import path from "path";

export interface DbConfig {
  type: "postgres" | "mysql";
  connectionString?: string;
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  source: string;
}

let pgPool: pg.Pool | null = null;
let currentConfig: DbConfig | null = null;

/**
 * Resolve effective database configuration from Environment Variables & persistent local file
 */
export function getEffectiveDbConfig(): DbConfig {
  let fileConfig: any = {};
  const configPath = path.join(process.cwd(), "data", "db-config.json");
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {
      console.warn("[DB Config] Error reading data/db-config.json:", e);
    }
  }

  // 1. Coolify / Supabase / Neon / Docker standard DATABASE_URL
  const databaseUrl =
    fileConfig.databaseUrl ||
    fileConfig.connectionString ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PG_CONNECTION_STRING ||
    "";

  // 2. Individual environment variable overrides
  const host =
    fileConfig.host ||
    process.env.POSTGRES_HOST ||
    process.env.PGHOST ||
    process.env.DB_HOST ||
    "localhost";

  const port = parseInt(
    String(
      fileConfig.port ||
      process.env.POSTGRES_PORT ||
      process.env.PGPORT ||
      process.env.DB_PORT ||
      "5432"
    ),
    10
  );

  const user =
    fileConfig.user ||
    process.env.POSTGRES_USER ||
    process.env.PGUSER ||
    process.env.DB_USERNAME ||
    process.env.DB_USER ||
    "postgres";

  const password =
    fileConfig.password !== undefined
      ? fileConfig.password
      : process.env.POSTGRES_PASSWORD ||
        process.env.PGPASSWORD ||
        process.env.DB_PASSWORD ||
        "";

  const database =
    fileConfig.database ||
    process.env.POSTGRES_DB ||
    process.env.PGDATABASE ||
    process.env.DB_DATABASE ||
    process.env.DB_NAME ||
    "creattivee_db";

  const isPostgres =
    databaseUrl.startsWith("postgres") ||
    process.env.DB_TYPE === "postgres" ||
    port === 5432 ||
    !process.env.DB_TYPE;

  const sslNeeded =
    process.env.PGSSLMODE === "require" ||
    process.env.DATABASE_SSL === "true" ||
    (databaseUrl.includes("sslmode=require") || databaseUrl.includes("supabase.co") || databaseUrl.includes("neon.tech"));

  return {
    type: isPostgres ? "postgres" : "mysql",
    connectionString: databaseUrl || undefined,
    host,
    port,
    user,
    password,
    database,
    ssl: sslNeeded ? { rejectUnauthorized: false } : undefined,
    source: databaseUrl
      ? "database_url"
      : fileConfig.password !== undefined
      ? "saved_file_config"
      : "process_env"
  };
}

/**
 * Get or create the PostgreSQL Connection Pool
 */
export function getDbPool(): pg.Pool {
  if (!pgPool) {
    const config = getEffectiveDbConfig();
    currentConfig = config;

    console.log("[POSTGRESQL CONFIG AUDIT]", {
      hasDatabaseUrl: !!config.connectionString,
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      passwordLength: config.password ? config.password.length : 0,
      source: config.source,
      ssl: !!config.ssl
    });

    if (config.connectionString) {
      pgPool = new pg.Pool({
        connectionString: config.connectionString,
        ssl: config.ssl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });
    } else {
      pgPool = new pg.Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });
    }

    pgPool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]:", err.message);
    });
  }

  return pgPool;
}

/**
 * Reset Pool (used when user updates credentials in UI)
 */
export async function resetDbPool(): Promise<void> {
  if (pgPool) {
    try {
      await pgPool.end();
    } catch (e) {
      console.warn("Error closing old pool:", e);
    }
    pgPool = null;
  }
}

/**
 * Universal SQL Query Execution & Normalization
 * Automatically translates MySQL-style ? placeholders and backticks to standard PostgreSQL syntax
 * Returns [rows, resultHeader] matching existing endpoint conventions
 */
export async function executeQuery(sql: string, params: any[] = []): Promise<[any, any]> {
  const pool = getDbPool();

  // 1. Transform MySQL backticks to standard Postgres identifiers
  let pgSql = sql
    .replace(/`activity_logs`\.`user`/gi, '"activity_logs"."user"')
    .replace(/`user`/gi, '"user"')
    .replace(/`bgColor`/gi, '"bgColor"')
    .replace(/`borderColor`/gi, '"borderColor"')
    .replace(/`iconColor`/gi, '"iconColor"')
    .replace(/`(\w+)`/g, '$1');

  // 2. Convert ? parameter placeholders to $1, $2, $3...
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

  // 3. For INSERT statements without RETURNING, append RETURNING id
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  if (isInsert && !/RETURNING/i.test(pgSql)) {
    pgSql = `${pgSql} RETURNING id`;
  }

  // 4. Execute Query on PostgreSQL Pool
  const pgResult = await pool.query(pgSql, params);

  // 5. Build Result Header compatible with mysql2 syntax
  const firstRow = pgResult.rows && pgResult.rows.length > 0 ? pgResult.rows[0] : null;
  const insertId = firstRow && firstRow.id ? Number(firstRow.id) : 0;
  const affectedRows = pgResult.rowCount || 0;

  const resultHeader: any = {
    insertId,
    affectedRows,
    rowCount: affectedRows,
    command: pgResult.command
  };

  // For INSERT statements, make resultHeader and rows friendly
  const rows: any = pgResult.rows || [];
  rows.insertId = insertId;
  rows.affectedRows = affectedRows;

  return [isInsert && rows.length === 1 && !sql.toLowerCase().includes("select") ? resultHeader : rows, resultHeader];
}

/**
 * Granular Audit Log Writer
 */
export async function logActivity(event: string, user: string = "Admin") {
  try {
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    await executeQuery(
      'INSERT INTO activity_logs (event, date, "user") VALUES (?, ?, ?)',
      [event, dateStr, user]
    );
  } catch (err: any) {
    console.warn(`[ActivityLog] Non-critical error: ${err.message}`);
  }
}

/**
 * Initialize all PostgreSQL tables and seed default agency data if database is empty
 */
export async function initPostgresDatabase() {
  console.log("=================================================");
  console.log(" [PostgreSQL Engine] Initializing & Verifying Database...");
  console.log("=================================================");

  try {
    const pool = getDbPool();

    // 1. Create Core Tables with PostgreSQL Native Types
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'staff',
        permissions TEXT DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS services (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        features TEXT NOT NULL,
        packages TEXT DEFAULT NULL,
        faq TEXT DEFAULT NULL,
        seo_title VARCHAR(255) DEFAULT NULL,
        seo_description TEXT DEFAULT NULL,
        seo_keywords VARCHAR(555) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS packages (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price VARCHAR(100) NOT NULL,
        timeline VARCHAR(100) DEFAULT NULL,
        features TEXT NOT NULL,
        highlight BOOLEAN NOT NULL DEFAULT FALSE,
        button_text VARCHAR(100) DEFAULT 'Buy Now',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS portfolio (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        client VARCHAR(255) DEFAULT NULL,
        technology_used TEXT NOT NULL,
        project_timeline VARCHAR(100) DEFAULT NULL,
        website_link VARCHAR(255) DEFAULT NULL,
        video_url VARCHAR(255) DEFAULT NULL,
        description TEXT NOT NULL,
        case_study TEXT DEFAULT NULL,
        screenshots TEXT DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        tags VARCHAR(255) DEFAULT NULL,
        content TEXT NOT NULL,
        featured_image VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        reading_time INT DEFAULT 5,
        views INT DEFAULT 0,
        seo_title VARCHAR(255) DEFAULT NULL,
        seo_description TEXT DEFAULT NULL,
        comments TEXT DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leads (
        id BIGSERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL DEFAULT 'website',
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) DEFAULT NULL,
        service_interested VARCHAR(255) DEFAULT NULL,
        message TEXT DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        staff_assigned VARCHAR(255) DEFAULT NULL,
        follow_up_date DATE DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        attachments TEXT DEFAULT NULL,
        timeline TEXT DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS clients (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) DEFAULT NULL,
        company_name VARCHAR(255) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        projects TEXT DEFAULT NULL,
        invoices TEXT DEFAULT NULL,
        documents TEXT DEFAULT NULL,
        payments TEXT DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        services_selected TEXT NOT NULL,
        packages_selected TEXT DEFAULT NULL,
        price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        terms TEXT DEFAULT NULL,
        timeline VARCHAR(255) DEFAULT NULL,
        signature_data TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        scope_html TEXT DEFAULT NULL,
        client_name VARCHAR(255) DEFAULT NULL,
        client_email VARCHAR(255) DEFAULT NULL,
        client_phone VARCHAR(50) DEFAULT NULL,
        download_count INT DEFAULT 0,
        last_downloaded_at VARCHAR(100) DEFAULT NULL,
        pdf_generated_at VARCHAR(100) DEFAULT NULL,
        pdf_version INT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id BIGSERIAL PRIMARY KEY,
        author_name VARCHAR(255) NOT NULL,
        author_role VARCHAR(100) NOT NULL,
        author_company VARCHAR(255) DEFAULT NULL,
        testimonial_text TEXT NOT NULL,
        rating INT DEFAULT 5,
        author_avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id BIGSERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'General'
      );

      CREATE TABLE IF NOT EXISTS settings (
        id BIGSERIAL PRIMARY KEY,
        meta_key VARCHAR(255) NOT NULL UNIQUE,
        meta_value TEXT DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        style VARCHAR(255) DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        event TEXT NOT NULL,
        date VARCHAR(100) NOT NULL,
        "user" VARCHAR(255) DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS benefits (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        icon VARCHAR(100) DEFAULT NULL,
        "bgColor" VARCHAR(100) DEFAULT NULL,
        "borderColor" VARCHAR(100) DEFAULT NULL,
        "iconColor" VARCHAR(100) DEFAULT NULL,
        glow VARCHAR(100) DEFAULT NULL
      );
    `);

    // 2. Ensure Default Master Admin Exists
    await pool.query(`
      INSERT INTO users (name, email, password, role, permissions)
      VALUES ('Foujia (Admin)', 'foujia@creattivee.com', '$2y$12$R.3C7hSj07Xg696BfDIn3e1gYy3h52gU8oP1.h98aO6N9nZt/K7B.', 'admin', '["all"]')
      ON CONFLICT (email) DO NOTHING;
    `);

    // 3. Check and Seed Initial Services if Empty
    const servicesRes = await pool.query("SELECT COUNT(*) AS count FROM services");
    if (parseInt(servicesRes.rows[0].count, 10) === 0) {
      console.log(" [PostgreSQL Engine] Seeding initial services...");
      await pool.query(`
        INSERT INTO services (title, slug, category, description, features, packages, faq, seo_title, seo_description)
        VALUES
        ('Website Designing', 'website-designing', 'Design', 'Our bespoke static and dynamic corporate website design services stand out for standard web-presence, combining seamless Framer-like micro-interactions with high PageSpeed optimization.', 
        '["Static Website", "Dynamic Website", "Corporate Website", "Landing Page", "Portfolio Website", "School Website", "Hospital Website"]',
        '[{"title":"Starter Brand","price":"₹14,999","features":["Custom Layout","Responsive Screen","3 Inner Pages","Contact Lead Form","Sitemap Generation"],"timeline":"1 Week"},{"title":"Premium Business","price":"₹39,999","highlight":true,"features":["Custom Landing Page","Unlimited Pages","Full Dynamic CMS Panel","Framer-like Animations","SMTP Notification Mailer"],"timeline":"2 Weeks"}]',
        '[{"q":"Can I update static elements?","a":"Yes, with our Admin Panel custom sections, all page layouts, texts, and colors are fully manageable without coding."}]',
        'Premium Website Designing | Creattivee', 'Bespoke high-end web styling services including corporate, landing, and dynamic app design.'),
        ('Software Development', 'software-development', 'Development', 'Custom enterprise software packages engineered to empower workflow efficiency across your teams.', 
        '["ERP Development", "CRM Development", "Inventory Software", "Billing Software", "HRMS", "Web Application", "SaaS Development", "AI Software", "Custom Software"]',
        '[{"title":"MVP Blueprint","price":"₹79,999","features":["Core ERP Module","User Authentication","Client Dashboard","CSV Exporting"],"timeline":"3 Weeks"},{"title":"Enterprise Core","price":"₹1,49,999","highlight":true,"features":["Full CRM + ERP Integration","Payment Gateways","Automated SMTP Alerts","AI-powered Assistant Integration"],"timeline":"5 Weeks"}]',
        '[{"q":"Do you provide maintenance?","a":"Yes, we have standard Annual Maintenance Contracts (AMC) with weekly cloud backups."}]',
        'Enterprise Software Development Services | Creattivee', 'Top tier custom web apps, HRMS, billing systems, inventory portals and SaaS architectures.')
        ON CONFLICT (slug) DO NOTHING;
      `);
    }

    // 4. Check and Seed Initial Packages if Empty
    const packagesRes = await pool.query("SELECT COUNT(*) AS count FROM packages");
    if (parseInt(packagesRes.rows[0].count, 10) === 0) {
      console.log(" [PostgreSQL Engine] Seeding initial packages...");
      await pool.query(`
        INSERT INTO packages (title, price, timeline, features, highlight, button_text)
        VALUES
        ('Premium Growth Designing', '₹29,999', '14 Days', '["Responsive Design", "Vite/Next Speed Optimization", "Custom Proposal PDF Creator", "Admin CMS Panels", "Google PageSpeed 95+"]', TRUE, 'Buy Now'),
        ('SaaS Core App Starter', '₹89,999', '21 Days', '["Custom PostgreSQL Structure", "Node/Express APIs", "Robust Lead Tracker", "Admin Controls", "Postman Documentation Included"]', FALSE, 'Buy Now');
      `);
    }

    // 5. Check and Seed Initial Portfolio if Empty
    const portfolioRes = await pool.query("SELECT COUNT(*) AS count FROM portfolio");
    if (parseInt(portfolioRes.rows[0].count, 10) === 0) {
      console.log(" [PostgreSQL Engine] Seeding initial portfolio...");
      await pool.query(`
        INSERT INTO portfolio (title, slug, category, client, technology_used, project_timeline, website_link, video_url, description, case_study, screenshots)
        VALUES
        ('Futura Bank FinTech UI', 'futura-bank-fintech-ui', 'Fintech', 'Futura Inc', 'React, Express, TailwindCSS, PostgreSQL, Chart.js', '3 Weeks', 'https://futurabank-example.com', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
        'A high-end glassmorphism-based fintech interface tailored for multi-currency dynamic client statements.',
        'Our challenge was implementing dense fintech graphs while keeping speeds high on mobile. We utilized canvas-based charting and modular components.',
        '["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"]')
        ON CONFLICT (slug) DO NOTHING;
      `);
    }

    // 6. Check and Seed Initial Settings if Empty
    const settingsRes = await pool.query("SELECT COUNT(*) AS count FROM settings");
    if (parseInt(settingsRes.rows[0].count, 10) === 0) {
      console.log(" [PostgreSQL Engine] Seeding initial settings...");
      await pool.query(`
        INSERT INTO settings (meta_key, meta_value)
        VALUES
        ('company_name', 'Creattivee'),
        ('company_address', 'D-561, Pocket 11, DDA Janta Flats, Jasola, New Delhi, 110025'),
        ('company_phone', '+91-8796380455'),
        ('company_email', 'creattivee@gmail.com'),
        ('smtp_host', 'smtp.gmail.com'),
        ('smtp_port', '587'),
        ('seo_default_title', 'Creattivee | Custom Software & Creative Web Design Agency'),
        ('seo_default_description', 'High performance digital agency specializing in custom software, ERPs, SEO, and bespoke React development.')
        ON CONFLICT (meta_key) DO NOTHING;
      `);
    }

    // 7. Verify Row Counts in All Tables
    const tables = [
      "users",
      "services",
      "packages",
      "portfolio",
      "blogs",
      "leads",
      "clients",
      "proposals",
      "testimonials",
      "faqs",
      "settings",
      "partners",
      "activity_logs",
      "benefits"
    ];

    console.log(" [PostgreSQL Verification Audit - Active Table Counts]:");
    let totalRecords = 0;
    for (const tableName of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const count = parseInt(res.rows[0].count, 10) || 0;
        totalRecords += count;
        console.log(`   - ${tableName.padEnd(16)} : ${count} rows`);
      } catch (err: any) {
        console.warn(`   - ${tableName.padEnd(16)} : Warning (${err.message})`);
      }
    }

    console.log("=================================================");
    console.log(` [PostgreSQL Engine] Ready for Coolify Deployment. Total active records: ${totalRecords}`);
    console.log("=================================================");
  } catch (err: any) {
    console.error(" [PostgreSQL Init Notice] Database not yet connected or initializing:", err.message);
  }
}
