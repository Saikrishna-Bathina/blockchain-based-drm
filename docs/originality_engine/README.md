# Originality Engine Documentation

The Originality Engine is a Python-based service responsible for detecting duplicate content across various media types (Text, Image, Video, Audio).

## Table of Contents
- [Overview](#overview)
- [Components](#components)

## Overview

The engine exposes a local HTTP API (or can be integrated as a library) that the Backend calls during the asset upload process.

## Components

1.  **Text Engine**: Uses vector embeddings (e.g., TF-IDF or Transformer models) to check semantic similarity.
2.  **Image Engine**: Uses Perceptual Hashing (pHash) or Feature Matching to detect visual duplicates.
3.  **Video Engine**: Extracts keyframes and applies image matching techniques.
4.  **Audio Engine**: Uses acoustic fingerprinting (like Chromaprint) to match audio segments.

## Integration

-   **Input**: File path and Content Type.
-   **Output**: JSON Object `{ is_original: boolean, score: float, details: string }`.
