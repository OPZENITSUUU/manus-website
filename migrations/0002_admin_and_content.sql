CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE TABLE IF NOT EXISTS password_codes (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_password_codes_admin ON password_codes(admin_id, created_at);
CREATE TABLE IF NOT EXISTS login_limits (
  bucket TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  price TEXT,
  image_key TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_menu_available_sort ON menu_items(available, sort_order);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);
INSERT OR IGNORE INTO menu_items (id,name,category,note,available,sort_order) VALUES
('1','Chole Poori','Popular plates','Crisp poori with spiced chole.',1,1),
('2','Meethi Lassi','Drinks','Sweet lassi.',1,2),
('3','Aloo Sabji','Sides','Aloo sabji.',1,3),
('4','Samosa','Snacks','Classic samosa.',1,4),
('5','Gulab Jamun','Sweet','Gulab jamun.',1,5),
('6','Dal Kachori','Snacks','Dal-filled kachori.',1,6);
