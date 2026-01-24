#!/usr/bin/env python
"""Simple server runner"""
import os
import sys

# Change to backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

# Import and run
try:
    from app import app
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
