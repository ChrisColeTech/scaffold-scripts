#!/usr/bin/env python3
"""
Test Python script for Scaffold Scripts CLI
Shows a tkinter hello world alert box
"""

import tkinter as tk
from tkinter import messagebox
import os

def main():
    # Create a root window (but hide it)
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    
    # Show a message box
    messagebox.showinfo(
        "Scaffold Scripts CLI Test", 
        "Hello World! 🚀\n\nPython script executed successfully from Scaffold Scripts CLI!\n\nWorking directory: " + os.getcwd()
    )
    
    # Also print to console
    print("✅ Python script executed successfully!")
    print(f"📁 Working directory: {os.getcwd()}")
    print("🎉 Tkinter alert box displayed")

if __name__ == "__main__":
    main()