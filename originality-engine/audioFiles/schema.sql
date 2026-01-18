CREATE TABLE IF NOT EXISTS fingerprints (
    hash        INTEGER NOT NULL,
    song_id     INTEGER NOT NULL,
    anchor_time INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hash ON fingerprints(hash);
CREATE INDEX IF NOT EXISTS idx_song ON fingerprints(song_id);

CREATE TABLE IF NOT EXISTS image_hashes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id    TEXT NOT NULL,
    phash       TEXT NOT NULL,
    segment     TEXT DEFAULT 'full'
);

CREATE INDEX IF NOT EXISTS idx_phash ON image_hashes(phash);
CREATE INDEX IF NOT EXISTS idx_image_id ON image_hashes(image_id);

CREATE TABLE IF NOT EXISTS text_assets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    text_id     TEXT NOT NULL,
    signature   BLOB NOT NULL,
    embedding   BLOB
);

CREATE INDEX IF NOT EXISTS idx_text_id ON text_assets(text_id);
