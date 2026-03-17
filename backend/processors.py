from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

import re

def clean_text(text):
    """
    Sanitizes text to improve embedding quality.
    Removes redundant whitespace and invisible characters.
    """
    if not text:
        return ""
    # Replace multiple newlines/tabs with a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def load_pdf(file_path):
    try:
        print(f"Processing PDF: {file_path}")
        loader = PyMuPDFLoader(file_path)
        pages = loader.load()
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, # ~250 tokens, ideal for MiniLM
            chunk_overlap=150,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        docs = splitter.split_documents(pages)
        
        # Sanitize and filter
        for doc in docs:
            doc.page_content = clean_text(doc.page_content)
            
        return [d for d in docs if len(d.page_content) > 20] # Filter junk
    except Exception as e:
        print(f"Error loading PDF {file_path}: {e}")
        return []


