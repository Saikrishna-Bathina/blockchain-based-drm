import os
import shutil
import requests
from moviepy import VideoFileClip

# Microservices Configuration
_audio_base = os.environ.get("AUDIO_ENGINE_URL", "http://localhost:8080")
if not _audio_base.startswith("http"): _audio_base = "http://" + _audio_base
# Render internal hostnames specifically: if no dot in hostname, it's a service name, add .onrender.com for cluster resolution
from urllib.parse import urlparse
_a_parsed = urlparse(_audio_base)
if _a_parsed.hostname and '.' not in _a_parsed.hostname and 'localhost' not in _a_parsed.hostname:
    _audio_base = _audio_base.replace(_a_parsed.hostname, f"{_a_parsed.hostname}.onrender.com")
AUDIO_SERVER_URL = _audio_base + "/check"

_image_base = os.environ.get("IMAGE_ENGINE_URL", "http://localhost:8081")
if not _image_base.startswith("http"): _image_base = "http://" + _image_base
_i_parsed = urlparse(_image_base)
if _i_parsed.hostname and '.' not in _i_parsed.hostname and 'localhost' not in _i_parsed.hostname:
    _image_base = _image_base.replace(_i_parsed.hostname, f"{_i_parsed.hostname}.onrender.com")
IMAGE_SERVER_URL = _image_base + "/check"

class VideoOriginalityRequest:
    def __init__(self):
        self.temp_dir = "temp_video_proc"
        os.makedirs(self.temp_dir, exist_ok=True)

    def process_video(self, video_path):
        """Extracts frames and audio from video."""
        clip = VideoFileClip(video_path)
        
        # 1. Extract Audio
        audio_path = os.path.join(self.temp_dir, "extracted_audio.wav")
        try:
            if clip.audio:
                clip.audio.write_audiofile(audio_path, logger=None)
            else:
                audio_path = None
        except Exception as e:
            print(f"Error extracting audio: {e}")
            audio_path = None

        # 2. Extract Key Frames (e.g., every 5 seconds)
        duration = clip.duration
        frame_paths = []
        try:
            # Limit frames to avoid spamming the image server
            # INCREASED STEP: Less frames will reduce processing time for 4K video rendering.
            step = max(10, int(duration / 5)) 
            print(f"Video duration: {duration}s. Extracting frames every {step}s.")
            for t in range(0, int(duration), step):
                frame_path = os.path.join(self.temp_dir, f"frame_{t}.jpg")
                clip.save_frame(frame_path, t)
                frame_paths.append(frame_path)
        except Exception as e:
            print(f"Error extracting frames: {e}")
            
        clip.close()
        return audio_path, frame_paths

    def check_originality(self, video_path):
        audio_path = None
        frame_paths = []
        try:
            audio_path, frame_paths = self.process_video(video_path)
            
            # Check Audio
            audio_result = "NO_AUDIO"
            audio_score = 0.0
            audio_matches = []
            
            if audio_path and os.path.exists(audio_path):
                try:
                    print(f"Sending audio to: {AUDIO_SERVER_URL}")
                    with open(audio_path, 'rb') as f:
                        resp = requests.post(AUDIO_SERVER_URL, files={'file': f}, timeout=60)
                    
                    print(f"Audio server responded with: {resp.status_code}")
                    if resp.status_code == 200:
                        data = resp.json()
                        # Audio server returns { "status": "ORIGINAL/DUPLICATE", "top_score": float, "matches": [] }
                        # Check audioFiles/main.go CheckResponse struct
                        audio_result = data.get("status", "UNKNOWN")
                        audio_score = data.get("top_score", 0.0)
                        audio_matches = data.get("matches", [])
                    else:
                        print(f"Audio server error: {resp.status_code}")
                except Exception as e:
                    print(f"Audio check failed (Server unreachable?): {e}")

            # Check Visuals
            visual_results = []
            max_visual_score = 0.0
            
            for i, fp in enumerate(frame_paths):
                try:
                    print(f"Sending frame {i+1}/{len(frame_paths)} to image server...")
                    with open(fp, 'rb') as f:
                        resp = requests.post(IMAGE_SERVER_URL, files={'file': f}, timeout=30)
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        # Image server returns { "status": "...", "distance": int, "match_id": ... }
                        # Distance 0 = Exact match. Higher distance = less similar.
                        # Wait, Image Engine uses 'distance' (lower is better, 0 is exact). 
                        # We need to normalize distance to a similarity score if possible, or just interpret distance.
                        # Typically ImageHash distance < 5 is duplicate.
                        dist = data.get("distance", -1)
                        if dist != -1 and dist <= 10: # Threshold for near duplicate
                            visual_results.append(data)
                            # Approximate similarity for scoring purposes (0 distance = 1.0 sim)
                            sim = max(0, 1.0 - (dist / 20.0)) 
                            if sim > max_visual_score: max_visual_score = sim
                except Exception:
                    pass

            # Cleanup
            if audio_path and os.path.exists(audio_path): os.remove(audio_path)
            for fp in frame_paths:
                if os.path.exists(fp): os.remove(fp)

            # Synthesis Logic
            status = "Original"
            match_id = None
            if len(visual_results) > 0: # Found visual match
                 status = "Duplicate (Visual)"
                 match_id = visual_results[0].get("match_id") # Capture first visual match ID
            
            if audio_result == "DUPLICATE":
                 if status == "Duplicate (Visual)":
                     status = "Duplicate (Audio+Visual)"
                 else:
                     status = "Duplicate (Audio)"
                     # If only audio matches, we might need match_id from audio_matches
                     # but audio server returns uint32 IDs.
                     if len(audio_matches) > 0:
                         match_id = str(audio_matches[0].get("song_id"))

            final_score = max(max_visual_score, audio_score / 100.0) # Audio score is likely 0-100 based on 'PARTIAL_SCORE_THRESH = 35'

            return {
                "status": status,
                "match_id": match_id,
                "visual_score": float(max_visual_score),
                "audio_result": audio_result,
                "audio_score": float(audio_score),
                "visual_matches_count": len(visual_results),
                "description": f"Video analyzed. Audio: {audio_result}. Visual Matches: {len(visual_results)}."
            }

        except Exception as e:
            return {"error": str(e)}

    def register_video(self, video_path, asset_id):
        """
        Registers a video by extracting its audio and frames,
        and registering them with the respective microservices.
        """
        audio_base = os.environ.get("AUDIO_ENGINE_URL", "http://localhost:8080")
        if not audio_base.startswith("http"): audio_base = "http://" + audio_base
        from urllib.parse import urlparse
        _a_parsed = urlparse(audio_base)
        if _a_parsed.hostname and '.' not in _a_parsed.hostname and 'localhost' not in _a_parsed.hostname:
            audio_base = audio_base.replace(_a_parsed.hostname, f"{_a_parsed.hostname}.onrender.com")
        AUDIO_REGISTER_URL = audio_base + "/register"

        image_base = os.environ.get("IMAGE_ENGINE_URL", "http://localhost:8081")
        if not image_base.startswith("http"): image_base = "http://" + image_base
        _i_parsed = urlparse(image_base)
        if _i_parsed.hostname and '.' not in _i_parsed.hostname and 'localhost' not in _i_parsed.hostname:
            image_base = image_base.replace(_i_parsed.hostname, f"{_i_parsed.hostname}.onrender.com")
        IMAGE_REGISTER_URL = image_base + "/register"

        audio_path = None
        frame_paths = []
        
        results = {
            "audio_registered": False,
            "visual_frames_registered": 0,
            "errors": []
        }

        try:
            audio_path, frame_paths = self.process_video(video_path)
            
            # 1. Register Audio
            if audio_path and os.path.exists(audio_path):
                try:
                    # Audio server requires an integer ID.
                    # We generate a deterministic integer from the asset_id string.
                    import zlib
                    audio_id = zlib.crc32(asset_id.encode('utf-8')) & 0xffffffff # Ensure unsigned 32-bit
                    
                    with open(audio_path, 'rb') as f:
                        # Audio server expects 'file' and 'id'
                        resp = requests.post(AUDIO_REGISTER_URL, files={'file': f}, data={'id': str(audio_id)})
                    
                    if resp.status_code == 200:
                        results["audio_registered"] = True
                    else:
                        results["errors"].append(f"Audio registration failed: {resp.text}")
                except Exception as e:
                    results["errors"].append(f"Audio registration exception: {str(e)}")

            # 2. Register Frames
            # Using the same asset_id for frames might be tricky if image engine expects unique IDs per image.
            # Usually we might want to register them as "asset_id_frame_index".
            # Let's check image server logic. It takes an ID. 
            # If we register multiple frames with SAME ID, it might overwrite or just add multiple hashes for same ID?
            # Looking at imageFiles/main.py, it uses ID to register. Engine implementation generic.
            # We'll append frame index to ID to be safe and distinct: ID_0, ID_1, ...
            
            for i, fp in enumerate(frame_paths):
                try:
                    frame_id = f"{asset_id}_{i}"
                    with open(fp, 'rb') as f:
                        resp = requests.post(IMAGE_REGISTER_URL, files={'file': f}, data={'id': frame_id})
                    
                    if resp.status_code == 200:
                        results["visual_frames_registered"] += 1
                except Exception as e:
                    pass # non-critical if one frame fails?

            # Cleanup
            if audio_path and os.path.exists(audio_path): os.remove(audio_path)
            for fp in frame_paths:
                if os.path.exists(fp): os.remove(fp)

            if results["audio_registered"] or results["visual_frames_registered"] > 0:
                return True, results
            else:
                return False, results

        except Exception as e:
            return False, {"error": str(e)}
