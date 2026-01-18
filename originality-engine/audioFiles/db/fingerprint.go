package db

type Couple struct {
	SongID       uint32
	AnchorTimeMs uint32
}

func InsertFingerprint(hash uint32, songID uint32, anchor uint32) error {
	_, err := DB.Exec(
		"INSERT INTO fingerprints(hash, song_id, anchor_time) VALUES (?, ?, ?)",
		hash, songID, anchor,
	)
	return err
}

func GetCouples(hashes []uint32) (map[uint32][]Couple, error) {
	out := make(map[uint32][]Couple)

	stmt, err := DB.Prepare(
		"SELECT song_id, anchor_time FROM fingerprints WHERE hash = ?",
	)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	for _, h := range hashes {
		rows, err := stmt.Query(h)
		if err != nil {
			continue
		}

		for rows.Next() {
			var songID, anchor int
			rows.Scan(&songID, &anchor)

			out[h] = append(out[h], Couple{
				SongID:       uint32(songID),
				AnchorTimeMs: uint32(anchor),
			})
		}
		rows.Close()
	}
	return out, nil
}
