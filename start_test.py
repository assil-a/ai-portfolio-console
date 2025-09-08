#!/usr/bin/env python3
"""
Simple test startup script for the AI Portfolio Console.
This runs the backend with a SQLite database for testing purposes.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Set environment variables for testing
os.environ.update({
    "PORT": "40256",
    "DATABASE_URL": "sqlite:///./test.db",
    "GITHUB_APP_ID": "",
    "GITHUB_APP_PRIVATE_KEY": "",
    "GITHUB_WEBHOOK_SECRET": "",
    "OAUTH_GITHUB_CLIENT_ID": "",
    "OAUTH_GITHUB_CLIENT_SECRET": "",
    "ALLOWED_ORGS": "",
    "CONTRIBUTOR_WINDOW_DAYS": "90",
})

def main():
    print("🚀 Starting AI Portfolio Console (Test Mode)")
    print("=" * 50)
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    try:
        # Start the FastAPI server
        print("Starting backend server on http://localhost:40256")
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "40256",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())