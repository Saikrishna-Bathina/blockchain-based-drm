import os
import sqlite3
import re
import pickle
import argparse
from datasketch import MinHash
import docx

try:
    from pypdf import PdfReader
except ImportError:
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        PdfReader = None

# SBERT Imports
try:
    os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE' # Workaround for some Windows OpenMP conflicts
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    SBERT_AVAILABLE = True
except Exception as e:
    SBERT_AVAILABLE = False
    print(f"Warning: Semantic Engine (SBERT/Torch) failed to load: {e}")
    # Fallback or disable semantic features

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audioFiles', 'fingerprints.db')
NUM_PERM = 128

class TextOriginalityRequest:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_db()
        
        self.model = None
        if SBERT_AVAILABLE:
            # Load SBERT model (this might take a moment on first run)
            # Using a lightweight model for speed
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2') 
            except Exception as e:
                print(f"Failed to load SBERT model: {e}")
                self.model = None

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS text_assets (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                text_id     TEXT NOT NULL,
                signature   BLOB NOT NULL,
                embedding   BLOB
            )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_text_id ON text_assets(text_id)')
        conn.commit()
        conn.close()

    def extract_text(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        try:
            if ext == '.txt':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
            elif ext == '.pdf':
                if not PdfReader: return None, "pypdf library not installed/found."
                reader = PdfReader(file_path)
                for page in reader.pages: text += page.extract_text() + "\n"
            elif ext == '.docx':
                doc = docx.Document(file_path)
                for para in doc.paragraphs: text += para.text + "\n"
            else:
                return None, f"Unsupported file extension: {ext}"
        except Exception as e:
            return None, f"Error reading file: {e}"
        return text, None

    def _normalize(self, text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        return text

    def _get_shingles(self, text, n=3):
        words = text.split()
        if len(words) < n: return {text}
        shingles = set()
        for i in range(len(words) - n + 1):
            shingles.add(" ".join(words[i:i+n]))
        return shingles

    def compute_minhash(self, text):
        m = MinHash(num_perm=NUM_PERM)
        norm_text = self._normalize(text)
        shingles = self._get_shingles(norm_text)
        for s in shingles: m.update(s.encode('utf8'))
        return m

    def compute_embedding(self, text):
        """Computes the SBERT embedding for the text."""
        if not self.model: return None
        # Encode the full text (or chunks if very large, but MiniLM handles 256/512 tokens)
        # For long docs, we typically trunk or mean-pool. 
        # Here we just encode the raw text -> automatic truncation by library usually.
        return self.model.encode(text)

    def register_text(self, file_path, text_id):
        text, error = self.extract_text(file_path)
        if error: return False, error
        if not text.strip(): return False, "Extracted text is empty."

        # 1. MinHash
        minhash = self.compute_minhash(text)
        signature_blob = pickle.dumps(minhash)

        # 2. Embedding
        embedding_blob = None
        if self.model:
            emb = self.compute_embedding(text)
            embedding_blob = pickle.dumps(emb)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO text_assets (text_id, signature, embedding) VALUES (?, ?, ?)', 
                           (text_id, signature_blob, embedding_blob))
            conn.commit()
            return True, f"Registered text asset {text_id} (SBERT: {'Yes' if embedding_blob else 'No'})"
        except Exception as e:
            return False, f"Database error: {e}"
        finally:
            conn.close()

    def check_originality(self, file_path):
        text, error = self.extract_text(file_path)
        if error: return "ERROR", None, 0.0
        if not text.strip(): return "ERROR: Empty Text", None, 0.0

        # Phase 1: MinHash Check (Fast)
        target_minhash = self.compute_minhash(text)
        
        # Phase 2: Embedding Check (Semantic)
        target_embedding = None
        if self.model:
            target_embedding = self.compute_embedding(text)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT text_id, signature, embedding FROM text_assets')
        rows = cursor.fetchall()
        conn.close()

        max_mh_sim = 0.0
        max_sem_sim = 0.0
        best_match_id = None
        match_type = "ORIGINAL"

        for tid, sig_blob, emb_blob in rows:
            # Check MinHash
            try:
                stored_minhash = pickle.loads(sig_blob)
                mh_sim = target_minhash.jaccard(stored_minhash)
                if mh_sim > max_mh_sim:
                    max_mh_sim = mh_sim
                    if mh_sim > 0.95: # Exact match found, stop
                         best_match_id = tid
                         # match_type = "DUPLICATE (Exact)" 
                         # We finalize types below
            except Exception: pass

            # Check Semantic (if available and needed)
            if target_embedding is not None and emb_blob is not None:
                try:
                    stored_emb = pickle.loads(emb_blob)
                    # Reshape for sklearn
                    sem_sim = cosine_similarity([target_embedding], [stored_emb])[0][0]
                    if sem_sim > max_sem_sim:
                        max_sem_sim = sem_sim
                        # semantic match might override minhash match if stronger
                        if max_mh_sim < 0.9: # Only if not already exact
                            best_match_id = tid
                except Exception: pass

        # Logic to combine scores
        # Priority: Exact (MinHash > 0.95) > Semantic (>0.85) > Near Duplicate (MinHash > 0.6)
        
        final_score = max_mh_sim
        
        if max_mh_sim > 0.95:
            return "DUPLICATE (Exact)", best_match_id, max_mh_sim
        
        if max_sem_sim > 0.85:
             return "SEMANTIC DUPLICATE (AI/Paraphrased)", best_match_id, max_sem_sim
        
        if max_mh_sim > 0.6:
            return "NEAR DUPLICATE (Edited)", best_match_id, max_mh_sim
            
        # Fallback: if semantic is moderate (0.7-0.85), maybe flag?
        if max_sem_sim > 0.75:
            return "POTENTIAL SEMANTIC MATCH", best_match_id, max_sem_sim

        return "ORIGINAL", None, max(max_mh_sim, max_sem_sim)
