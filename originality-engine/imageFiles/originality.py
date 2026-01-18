import imagehash
from PIL import Image
import sqlite3
import os
import uuid

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audioFiles', 'fingerprints.db')

class ImageOriginalityRequest:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initializes the database with the schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS image_hashes (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                image_id    TEXT NOT NULL,
                phash       TEXT NOT NULL,
                segment     TEXT DEFAULT 'full'
            )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_phash ON image_hashes(phash)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_image_id ON image_hashes(image_id)')
        conn.commit()
        conn.close()

    def _generate_segments(self, img):
        """
        Generates 9 segments from the image:
        - Full
        - Top Half, Bottom Half
        - Left Half, Right Half
        - 4 Quadrants
        Returns dict: {segment_name: image_obj}
        """
        w, h = img.size
        segments = {}
        segments['full'] = img
        
        # Halves
        segments['top_half'] = img.crop((0, 0, w, h // 2))
        segments['bottom_half'] = img.crop((0, h // 2, w, h))
        segments['left_half'] = img.crop((0, 0, w // 2, h))
        segments['right_half'] = img.crop((w // 2, 0, w, h))

        # Quadrants
        segments['q1_top_left'] = img.crop((0, 0, w // 2, h // 2))
        segments['q2_top_right'] = img.crop((w // 2, 0, w, h // 2))
        segments['q3_bottom_left'] = img.crop((0, h // 2, w // 2, h))
        segments['q4_bottom_right'] = img.crop((w // 2, h // 2, w, h))

        return segments

    def compute_hash(self, img_obj):
        """Computes the perceptual hash of an image object."""
        try:
            return str(imagehash.phash(img_obj)) 
        except Exception as e:
            return None

    def register_image(self, image_path, image_id=None):
        """Registers an image AND its segments in the database."""
        try:
            img = Image.open(image_path)
        except Exception as e:
            return False, f"Failed to open image: {e}"

        if not image_id:
            image_id = str(uuid.uuid4())

        segments = self._generate_segments(img)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            count = 0
            for name, segment_img in segments.items():
                phash = self.compute_hash(segment_img)
                if phash:
                    cursor.execute('INSERT INTO image_hashes (image_id, phash, segment) VALUES (?, ?, ?)', 
                                   (image_id, phash, name))
                    count += 1
            
            conn.commit()
            return True, f"Registered asset {image_id} with {count} segment hashes"
        except Exception as e:
            return False, f"Database error: {e}"
        finally:
            conn.close()

    def check_originality(self, image_path, threshold=10):
        """
        Checks if the image is original, a duplicate, or a partial crop.
        Checks 4 orientations.
        Returns: classification (str), closest_match_id (str or None), distance (int)
        """
        try:
            original_img = Image.open(image_path)
        except Exception as e:
            print(f"Error opening image {image_path}: {e}")
            return "ERROR", None, -1

        # Calculate hashes for 4 rotations + Mirroring
        hashes_to_check = []
        # Normal & Rotations
        hashes_to_check.append(imagehash.phash(original_img))
        hashes_to_check.append(imagehash.phash(original_img.rotate(90, expand=True)))
        hashes_to_check.append(imagehash.phash(original_img.rotate(180, expand=True)))
        hashes_to_check.append(imagehash.phash(original_img.rotate(270, expand=True)))
        
        # Mirroring (Horizontal Flip)
        mirrored_img = original_img.transpose(Image.FLIP_LEFT_RIGHT)
        hashes_to_check.append(imagehash.phash(mirrored_img))

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        # Fetch all hashes including segment info
        cursor.execute('SELECT image_id, phash, segment FROM image_hashes')
        rows = cursor.fetchall()
        conn.close()

        global_min_dist = float('inf')
        closest_match_id = None
        matched_segment = 'full'

        for target_hash in hashes_to_check:
            for img_id, db_phash_str, segment in rows:
                try:
                    db_phash = imagehash.hex_to_hash(db_phash_str)
                    dist = target_hash - db_phash  # Hamming distance
                    
                    if dist < global_min_dist:
                        global_min_dist = dist
                        closest_match_id = img_id
                        matched_segment = segment
                except Exception:
                    continue

        if global_min_dist < 10:
            if global_min_dist == 0 and matched_segment == 'full':
                return "DUPLICATE (Exact)", closest_match_id, 0
            
            # For all other cases (Modified, Partial, Color change, etc.)
            type_info = ""
            if matched_segment != 'full':
                type_info = f" - Partial ({matched_segment})"
            
            return f"DUPLICATE{type_info}", closest_match_id, global_min_dist
        else:
            return "ORIGINAL", None, global_min_dist
