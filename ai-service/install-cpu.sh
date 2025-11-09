#!/bin/bash
# Installation script for CPU-only deployment (reduced disk space requirements)
# This script installs PyTorch CPU-only versions to avoid large CUDA dependencies

echo "Installing CPU-only dependencies for AI service..."
echo "This will save several GB compared to GPU versions."
echo ""

# Install PyTorch CPU-only versions from PyTorch index
echo "Installing PyTorch CPU-only packages..."
pip install --no-cache-dir torch==2.1.1+cpu torchvision==0.16.1+cpu --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
echo "Installing remaining dependencies..."
pip install --no-cache-dir fastapi==0.104.1 uvicorn[standard]==0.24.0 python-multipart==0.0.6 pillow==10.1.0 numpy==1.26.2 scikit-learn==1.3.2 redis==5.0.1 psycopg2-binary==2.9.9 python-dotenv==1.0.0 requests==2.31.0 imagehash==4.3.1

echo ""
echo "Installation complete! CPU-only dependencies installed successfully."
echo "Disk space saved: ~2-3 GB compared to GPU installation"
