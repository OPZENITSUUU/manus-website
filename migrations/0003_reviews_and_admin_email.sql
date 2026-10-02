CREATE TABLE IF NOT EXISTS admin_email_change_codes (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  new_email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_admin_email_codes_admin ON admin_email_change_codes(admin_id, created_at);
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  reviewer_name TEXT NOT NULL,
  rating INTEGER,
  review_text TEXT NOT NULL,
  image_key TEXT,
  source TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);
CREATE INDEX IF NOT EXISTS idx_reviews_published_sort ON reviews(published, sort_order, created_at DESC);
INSERT OR IGNORE INTO site_settings(key,value) VALUES ('google_rating','4.0');
INSERT OR IGNORE INTO site_settings(key,value) VALUES ('google_review_count','5052');
INSERT OR IGNORE INTO reviews(id,reviewer_name,rating,review_text,image_key,source,published,sort_order) VALUES
('review-1','Ankit Verma',NULL,'We ordered Chole Puri/Bhature along with sweet lassi, and the food was absolutely delicious!',NULL,'Google review excerpt',1,1),
('review-2','Google reviewer',NULL,'Food taste is good, crispy bhatura with mild flavoured chole. Sweet lassi was also good overall good taste.',NULL,'Google review excerpt',1,2);
