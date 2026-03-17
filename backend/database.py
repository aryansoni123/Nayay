import os
import pickle
import hashlib
from langchain_community.vectorstores import FAISS
from config import embeddings
from processors import load_pdf

# Configuration
DB_PATH = "faiss_index"
METADATA_PATH = "faiss_metadata.pkl"
SUPPORTED_EXTENSIONS = {".pdf"}

# Global Storage
text_db = None       # FAISS — legal PDF chunks

# Track processed files: { "file_path": { "hash": "...", "ids": [...] } }
processed_files = {}

def get_file_hash(file_path):
    """Generates SHA-256 hash of a file to detect changes."""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def save_db():
    """Persists the database and tracking metadata to disk."""
    if text_db:
        text_db.save_local(DB_PATH)
    
    metadata = {
        "processed_files": processed_files
    }
    with open(METADATA_PATH, "wb") as f:
        pickle.dump(metadata, f)

    print("Database and metadata saved locally.")

def load_db():
    """Loads the database and tracking metadata from disk."""
    global text_db, processed_files
    
    if os.path.exists(DB_PATH):
        text_db = FAISS.load_local(DB_PATH, embeddings, allow_dangerous_deserialization=True)
        print("Loaded existing Text Vector Store.")
    
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "rb") as f:
            metadata = pickle.load(f)
            processed_files = metadata.get("processed_files", {})
        print("Loaded Ingestion Metadata.")

def add_file_to_db(file_path):
    """
    Processes a file and adds it to the DB if it's new or changed.
    Supports PDF only.
    """
    global text_db
    
    current_hash = get_file_hash(file_path)
    file_ext = os.path.splitext(file_path)[-1].lower()

    if file_ext not in SUPPORTED_EXTENSIONS:
        print(f"Skipping unsupported file format: {file_path}")
        return False
    
    # Check if file is already processed and unchanged
    if file_path in processed_files and processed_files[file_path]["hash"] == current_hash:
        print(f"Skipping {os.path.basename(file_path)} (Unchanged)")
        return False

    # Remove old version if it exists
    if file_path in processed_files:
        remove_file_from_db(file_path)

    print(f"Ingesting: {os.path.basename(file_path)}")
    
    new_docs = []
    if file_ext == ".pdf":
        new_docs = load_pdf(file_path)

    if new_docs:
        # Generate unique IDs for these documents to allow future deletion
        ids = [f"{file_path}_{i}" for i in range(len(new_docs))]
        
        if text_db is None:
            # Initialize with an empty index if needed, but here we can just use the first batch
            # We must pass the ids specifically to maintain tracking consistency
            text_db = FAISS.from_documents(new_docs, embeddings, ids=ids)
        else:
            text_db.add_documents(new_docs, ids=ids)
        
        processed_files[file_path] = {"hash": current_hash, "ids": ids}
        save_db()
        return True
    
    return False

def remove_file_from_db(file_path):
    """Removes a file's documents from the FAISS index."""
    global text_db
    if file_path in processed_files:
        print(f"Removing old index entries for: {file_path}")
        ids_to_remove = processed_files[file_path]["ids"]
        try:
            text_db.delete(ids_to_remove)
        except Exception as e:
            print(f"Warning during deletion: {e}")
        
        del processed_files[file_path]
        
        save_db()

# ---------------------------------------------------------------------------
# Use robust absolute pathing for Data directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_DATA_DIR = os.path.join(ROOT_DIR, "Data")

def init_dbs(data_dir=None):
    """Scans the data directory and initializes everything."""
    if data_dir is None:
        data_dir = DEFAULT_DATA_DIR
        
    load_db()

    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created data directory: {data_dir}")
        
    print(f"Initializing Knowledge Base from: {data_dir}")
    for root, _, files in os.walk(data_dir):
        for file in files:
            file_path = os.path.join(root, file)
            add_file_to_db(file_path)
    
    # Initialize an empty DB if nothing was found to prevent crashes
    global text_db
    if text_db is None:
        text_db = FAISS.from_texts(["Initial system prompt: System initialized."], embeddings)
