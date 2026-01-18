package shazam

import (
	"audio-originality/db"
	"sort"
)

type Match struct {
	SongID    uint32
	Score     float64
	Timestamp uint32
}

func FindMatches(samples []float64, duration float64, rate int) ([]Match, error) {

	// 1. Spectrogram
	spec, err := Spectrogram(samples, rate)
	if err != nil {
		return nil, err
	}

	// 2. Peak extraction
	peaks := ExtractPeaks(spec, duration, rate)
	if len(peaks) == 0 {
		return nil, nil
	}

	// 3. Fingerprint query sample (songID = 0)
	fp := Fingerprint(peaks, 0)

	sampleTimes := make(map[uint32]uint32)
	var hashes []uint32

	for h, c := range fp {
		sampleTimes[h] = c.AnchorTimeMs
		hashes = append(hashes, h)
	}

	// 4. Query fingerprint DB (NO Open / Close here)
	couples, err := db.GetCouples(hashes)
	if err != nil {
		return nil, err
	}

	// 5. Build time-aligned match structure
	matches := make(map[uint32][][2]uint32)
	earliest := make(map[uint32]uint32)

	for h, list := range couples {
		for _, c := range list {
			matches[c.SongID] = append(
				matches[c.SongID],
				[2]uint32{sampleTimes[h], c.AnchorTimeMs},
			)

			if t, ok := earliest[c.SongID]; !ok || c.AnchorTimeMs < t {
				earliest[c.SongID] = c.AnchorTimeMs
			}
		}
	}

	// 6. Time-coherence scoring
	scores := analyzeRelativeTiming(matches)

	// 7. Sort output
	var out []Match
	for id, score := range scores {
		out = append(out, Match{
			SongID:    id,
			Score:     score,
			Timestamp: earliest[id],
		})
	}

	sort.Slice(out, func(i, j int) bool {
		return out[i].Score > out[j].Score
	})

	return out, nil
}

func analyzeRelativeTiming(matches map[uint32][][2]uint32) map[uint32]float64 {
	scores := make(map[uint32]float64)

	for songID, pairs := range matches {
		buckets := make(map[int32]int)

		for _, p := range pairs {
			offset := int32(p[1]) - int32(p[0])
			buckets[offset/100]++
		}

		max := 0
		for _, c := range buckets {
			if c > max {
				max = c
			}
		}

		scores[songID] = float64(max)
	}
	return scores
}
