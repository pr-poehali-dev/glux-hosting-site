ALTER TABLE hosts ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
UPDATE hosts SET is_demo = true WHERE tg_user IN ('@steve', '@alex');