package db

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB, err = sql.Open("sqlite3", "fingerprints.db")
	if err != nil {
		return err
	}

	schema := `
	CREATE TABLE IF NOT EXISTS fingerprints (
		hash INTEGER,
		song_id INTEGER,
		anchor_time INTEGER
	);
	CREATE INDEX IF NOT EXISTS idx_hash ON fingerprints(hash);
	`
	_, err = DB.Exec(schema)
	return err
}

func Insert(hash uint32, songID uint32, anchor uint32) error {
	_, err := DB.Exec(
		"INSERT INTO fingerprints(hash, song_id, anchor_time) VALUES(?,?,?)",
		hash, songID, anchor,
	)
	return err
}

func GetByHashes(hashes []uint32) (map[uint32][][2]uint32, error) {
	query := "SELECT hash, song_id, anchor_time FROM fingerprints WHERE hash IN ("
	for i := range hashes {
		if i > 0 {
			query += ","
		}
		query += "?"
	}
	query += ")"

	args := make([]any, len(hashes))
	for i, h := range hashes {
		args[i] = h
	}

	rows, err := DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[uint32][][2]uint32)

	for rows.Next() {
		var h, sid, t uint32
		rows.Scan(&h, &sid, &t)
		result[h] = append(result[h], [2]uint32{sid, t})
	}

	return result, nil
}
