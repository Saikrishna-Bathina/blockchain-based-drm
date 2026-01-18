package main

import (
	"audio-originality/shazam"
	"audio-originality/wav"
)

func CheckAudioOriginality(path string) ([]shazam.Match, error) {

	// 1. Convert MP3 → WAV
	wavPath, err := wav.ConvertToWAV(path)
	if err != nil {
		return nil, err
	}

	// 2. Read WAV samples
	info, err := wav.ReadWavInfo(wavPath)
	if err != nil {
		return nil, err
	}

	// 3. Delegate EVERYTHING to Shazam engine
	return shazam.FindMatches(
		info.LeftChannelSamples,
		info.Duration,
		info.SampleRate,
	)
}
