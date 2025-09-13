-- Add foreign key, indexes, and basic CHECK constraints for enums
PRAGMA foreign_keys=OFF;

-- Create new table with constraints (SQLite needs table rebuild)
CREATE TABLE IF NOT EXISTS __new_buyer_history (
  id text PRIMARY KEY NOT NULL,
  buyer_id text NOT NULL,
  changed_by text NOT NULL,
  changed_at integer,
  diff text NOT NULL,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
);

-- Migrate data from old table
INSERT INTO __new_buyer_history (id, buyer_id, changed_by, changed_at, diff)
SELECT id, buyer_id, changed_by, changed_at, diff FROM buyer_history;

DROP TABLE buyer_history;
ALTER TABLE __new_buyer_history RENAME TO buyer_history;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_buyer_history_buyer_id ON buyer_history (buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyers_updated_at ON buyers (updated_at);
CREATE INDEX IF NOT EXISTS idx_buyers_owner_id ON buyers (owner_id);

-- Basic CHECK constraints are tricky to add post-facto in SQLite without full rebuild; skipping here to avoid destructive migration.
-- If desired, rebuild buyers table with CHECK(city IN (...)) etc.

PRAGMA foreign_keys=ON;
