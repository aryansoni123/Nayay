import requests # pip install requests
import os
import shutil
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import supabase  # Import the client you created earlier
from datetime import datetime
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi import FastAPI, UploadFile, File, Form
from shutil import copyfileobj

app = FastAPI()

# 1. Get the EXACT folder where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Define Absolute Paths
DOC_DIR = os.path.join(BASE_DIR, "uploads", "documents")
REC_DIR = os.path.join(BASE_DIR, "uploads", "recordings")

# 3. Create folders if they don't exist
os.makedirs(DOC_DIR, exist_ok=True)
os.makedirs(REC_DIR, exist_ok=True)

# --- STEP 1: ENABLE CORS ---
# This allows your React app (usually on port 5173) 
# to talk to your Python app (on port 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # This allows React to talk to Python
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/api/auth/login")
async def handle_login(request: Request):
    data = await request.json()
    token = data.get("token")

    # 1. Ask Google who this token belongs to
    google_verify_url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}"
    user_info = requests.get(google_verify_url).json()

    email = user_info.get("email")
    
    # 2. THE DATABASE MOVE
    try:
        # NOTICE: We only send 'email'. 
        # We do NOT send 'user_id' because the DB handles the numeric ID automatically.
        user_data = {
            "email": email
        }
        
        # 'on_conflict' ensures that if the email exists, it just logs them in
        result = supabase.table("users").upsert(user_data, on_conflict="email").execute()
        
        # 3. Get the numeric ID from the result
        actual_id = result.data[0]['user_id']
        
        print(f"📁 Database Sync: {email} identified with Numeric ID: {actual_id}")
        
        return {
            "status": "success", 
            "user_id": actual_id, 
            "message": "Backend received the data!"
        }
        
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/chat")
async def handle_legal_chat(request: Request):
    data = await request.json()
    session_id = data.get("session_id")
    user_msg = data.get("message")

    # 1. Fetch current summary from Supabase
    current_data = supabase.table("sessions").select("summary").eq("session_id", session_id).single().execute()
    old_summary = current_data.data.get("summary", "")

    # 2. Get Gemini's Response
    # (Imagine Gemini gives us: "Based on Section 420...")
    ai_reply = "Based on your input, this looks like a civil dispute..." 

    # 3. Append to the "Log"
    new_log = f"{old_summary}\nUser: {user_msg}\nAI: {ai_reply}\n---"

    # 4. Update the Session Table
    supabase.table("sessions").update({
        "summary": new_log,
        "legal_meter": "65" # AI can update this live too!
    }).eq("session_id", session_id).execute()

    return {"reply": ai_reply}

'''
# ADD THIS NEW FUNCTION BELOW YOUR LOGIN FUNCTION
@app.post("/api/upload-evidence")
async def upload_evidence(
    file: UploadFile = File(...), 
    session_id: str = Form(...), 
    user_id: str = Form(...)
):
    try:
        # 1. Read the file into memory
        file_bytes = await file.read()
        
        # 2. Define where it goes in the Supabase Bucket (Folder/Filename)
        storage_path = f"{user_id}/{file.filename}"
        
        # 3. Upload to the 'legal-evidence' Bucket
        supabase.storage.from_("legal-evidence").upload(storage_path, file_bytes)
        
        # 4. Get the Public URL so we can see it later
        file_url = supabase.storage.from_("legal-evidence").get_public_url(storage_path)
        
        # 5. Save the details to your 'data_evidence' table
        evidence_entry = {
            "user_id": user_id,
            "session_id": session_id,
            "file_name": file.filename,
            "supabase_url": file_url,
            "file_type": "pdf" if ".pdf" in file.filename else "audio"
        }
        supabase.table("data_evidence").insert(evidence_entry).execute()

        print(f"✅ File Uploaded & Linked: {file.filename}")
        return {"status": "success", "url": file_url}

    except Exception as e:
        print(f"❌ Upload Error: {e}")
        return {"status": "error", "message": str(e)}

        '''

@app.post("/api/upload-evidence")
async def upload_evidence(
    file: UploadFile = File(...), 
    session_id: str = Form(...), 
    user_id: str = Form(...)
):
    try:
        # Determine destination
        is_audio = any(ext in file.filename.lower() for ext in ['.wav', '.mp3', '.m4a', '.blob'])
        target_folder = REC_DIR if is_audio else DOC_DIR
        
        # Create full path
        file_path = os.path.join(target_folder, file.filename)

        # 4. Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 5. Log it for debugging
        print(f"📂 SUCCESS: File saved to {file_path}")
        
        return {"status": "success", "path": file_path}

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)