import os
import torch
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings

# Suppress all warnings
# warnings.filterwarnings("ignore")

# Load environment variables from .env
load_dotenv()

# Configuration / Constants
API_KEY = os.getenv("GOOGLE_API_KEY", "")
COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Model Singletons ---

print(f"Using device: {DEVICE}")

# Embeddings Model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
