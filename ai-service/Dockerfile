FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies (using PyTorch CPU-only index for reduced size)
# Install PyTorch CPU-only versions first from PyTorch index
RUN pip install --no-cache-dir torch==2.1.1+cpu torchvision==0.16.1+cpu --index-url https://download.pytorch.org/whl/cpu
# Then install remaining dependencies
RUN pip install --no-cache-dir fastapi uvicorn[standard] python-multipart pillow numpy scikit-learn redis psycopg2-binary python-dotenv requests imagehash

# Copy source code
COPY src ./src

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
