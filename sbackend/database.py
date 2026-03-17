import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Force load the .env file
load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

# --- DEBUG PRINT ---
print(f"🔍 DEBUG: URL found: {url}")
# -------------------

if not url or not key:
    raise ValueError("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in .env file!")

supabase: Client = create_client(url, key)
print("✅ Supabase Client Initialized successfully!")