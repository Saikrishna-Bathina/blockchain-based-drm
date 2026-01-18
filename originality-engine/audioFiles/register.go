package main

import (
	"audio-originality/db"
	"audio-originality/shazam"
	"audio-originality/wav"
)

func RegisterSong(path string, songID uint32) error {

	wavPath, err := wav.ConvertToWAV(path)
	if err != nil {
		return err
	}

	info, err := wav.ReadWavInfo(wavPath)
	if err != nil {
		return err
	}

	spec, _ := shazam.Spectrogram(info.LeftChannelSamples, info.SampleRate)
	peaks := shazam.ExtractPeaks(spec, info.Duration, info.SampleRate)
	fp := shazam.Fingerprint(peaks, songID)

	for h, c := range fp {
		db.Insert(h, c.SongID, c.AnchorTimeMs)
	}
	return nil
}
