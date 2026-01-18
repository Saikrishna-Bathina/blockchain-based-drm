package main

import (
	"audio-originality/db"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
)

// thresholds derived from YOUR data
const (
	PARTIAL_SCORE_THRESH = 35
)

func main() {

	if err := db.InitDB(); err != nil {
		panic(err)
	}

	// CLI MODE: If arguments are provided, run as CLI tool
	if len(os.Args) > 1 {
		runCLI(os.Args[1])
		return
	}

	// SERVER MODE: Start HTTP server
	http.HandleFunc("/check", enableCORS(handleCheck))
	http.HandleFunc("/register", enableCORS(handleRegister))

	fmt.Println("Server starting on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

func runCLI(targetPath string) {
	matches, err := CheckAudioOriginality(targetPath)
	if err != nil {
		panic(err)
	}

	if len(matches) == 0 {
		fmt.Println("CLASSIFICATION: ORIGINAL")
		return
	}

	// sort matches by score descending
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].Score > matches[j].Score
	})

	topScore := matches[0].Score
	classification := "UNCERTAIN"

	if topScore >= PARTIAL_SCORE_THRESH {
		classification = "DUPLICATE"
	} else {
		classification = "ORIGINAL"
	}

	fmt.Println("CLASSIFICATION:", classification)
	fmt.Println("MATCHES:")
	for _, m := range matches {
		fmt.Printf("SongID: %d | Score: %.0f | Time(ms): %d\n",
			m.SongID, m.Score, m.Timestamp)
	}
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			return
		}

		next(w, r)
	}
}

type CheckResponse struct {
	Status   string        `json:"status"`
	TopScore float64       `json:"top_score"`
	Matches  []MatchResult `json:"matches"`
}

type MatchResult struct {
	SongID    uint32  `json:"song_id"`
	Score     float64 `json:"score"`
	Timestamp uint32  `json:"timestamp"`
}

func handleCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 1. Upload File
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create temp file
	tempDir := os.TempDir()
	tempPath := filepath.Join(tempDir, header.Filename)
	out, err := os.Create(tempPath)
	if err != nil {
		http.Error(w, "Failed to create temp file", http.StatusInternalServerError)
		return
	}
	defer out.Close()
	defer os.Remove(tempPath) // Clean up

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, "Failed to write temp file", http.StatusInternalServerError)
		return
	}

	// 2. Run Check
	matches, err := CheckAudioOriginality(tempPath)
	if err != nil {
		http.Error(w, "Check failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Process matches
	response := CheckResponse{
		Status:  "ORIGINAL",
		Matches: []MatchResult{},
	}

	if len(matches) > 0 {
		sort.Slice(matches, func(i, j int) bool {
			return matches[i].Score > matches[j].Score
		})
		response.TopScore = matches[0].Score

		if response.TopScore >= PARTIAL_SCORE_THRESH {
			response.Status = "DUPLICATE"
		}

		for _, m := range matches {
			response.Matches = append(response.Matches, MatchResult{
				SongID:    m.SongID,
				Score:     m.Score,
				Timestamp: m.Timestamp,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 1. Get ID
	idStr := r.FormValue("id")
	if idStr == "" {
		http.Error(w, "Missing 'id' parameter", http.StatusBadRequest)
		return
	}
	songID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid 'id' parameter", http.StatusBadRequest)
		return
	}

	// 2. Upload File
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Save to local audio directory (optional, but good for persistence)
	// For now, let's just use a temp file for registration to generate fingerprints
	tempDir := os.TempDir()
	tempPath := filepath.Join(tempDir, header.Filename)
	out, err := os.Create(tempPath)
	if err != nil {
		http.Error(w, "Failed to create temp file", http.StatusInternalServerError)
		return
	}
	defer out.Close()
	defer os.Remove(tempPath) // Clean up

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, "Failed to write temp file", http.StatusInternalServerError)
		return
	}

	// 3. Register
	// Function signature assumed: RegisterSong(path string, id int)
	// We need to ensure RegisterSong works with this.
	// NOTE: RegisterSong isn't exported in original `main.go`. I need to ensure it is available or I call it from `register.go` if it's in package main.
	// Since both are package main, it should be fine.

	// Wait, CheckAudioOriginality is in check.go (package main), RegisterSong is in register.go (package main).
	// So I can call them directly.

	RegisterSong(tempPath, uint32(songID))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": fmt.Sprintf("Registered song %d", songID)})
}
