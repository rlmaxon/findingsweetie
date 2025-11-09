# AI Service - Installation Options

This directory contains the AI service for Finding Sweetie, which uses PyTorch for image matching and pet recognition.

## Installation Options

### Option 1: CPU-Only Installation (Recommended for limited disk space)

**Disk space required**: ~1-2 GB for PyTorch CPU version

**Use this if**:
- You have limited hard drive space
- You're running a small-scale deployment
- You're developing/testing the application
- You don't have a GPU available

**Installation**:
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
bash install-cpu.sh
```

**Performance**: CPU-only is sufficient for small to medium workloads (< 1000 matches per day). Image matching will take a few seconds per comparison.

### Option 2: Standard Installation (includes GPU support)

**Disk space required**: ~3-5 GB (includes CUDA dependencies)

**Use this if**:
- You have adequate disk space
- You're running a production deployment with high traffic
- You have a CUDA-compatible GPU available
- You need maximum performance

**Installation**:
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Performance**: GPU acceleration provides 10-50x faster inference for image matching, recommended for production deployments.

## Docker Installation

The Dockerfile is pre-configured for CPU-only deployment to minimize image size.

**Build and run**:
```bash
cd ai-service
docker build -t findingsweetie-ai .
docker run -p 8000:8000 findingsweetie-ai
```

## Running the Service

After installation:

```bash
cd ai-service
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Or in development mode with auto-reload:
```bash
uvicorn src.main:app --reload --port 8000
```

## Verifying Installation

Check that PyTorch is installed correctly:

```bash
python -c "import torch; print(f'PyTorch {torch.__version__}')"
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
```

For CPU-only installation, CUDA available will be `False` (this is expected).

## Dependencies

### Core Dependencies
- **FastAPI**: Web framework for the REST API
- **PyTorch**: Deep learning framework for image analysis
- **Pillow**: Image processing
- **NumPy**: Numerical computations
- **scikit-learn**: Machine learning utilities
- **imagehash**: Perceptual image hashing

### Supporting Dependencies
- **uvicorn**: ASGI server
- **redis**: Caching layer
- **psycopg2-binary**: PostgreSQL database driver

## Disk Space Comparison

| Component | Standard (GPU) | CPU-Only | Savings |
|-----------|---------------|----------|---------|
| PyTorch | ~2.5 GB | ~200 MB | ~2.3 GB |
| TorchVision | ~300 MB | ~50 MB | ~250 MB |
| CUDA deps | ~500 MB | 0 MB | ~500 MB |
| **Total** | **~3.3 GB** | **~250 MB** | **~3 GB** |

## Troubleshooting

### Import Error: No module named 'torch'

Make sure you've activated the virtual environment:
```bash
source venv/bin/activate
```

### Out of Disk Space During Installation

Use the CPU-only installation script:
```bash
bash install-cpu.sh
```

### Slow Performance

- CPU-only: This is expected. Each image matching operation takes 2-5 seconds.
- To improve performance, consider:
  - Upgrading to GPU installation if you have a GPU
  - Implementing caching for repeated matches
  - Increasing memory allocation

### CUDA Errors (if using GPU version)

If you see CUDA-related errors but only need CPU:
```bash
pip uninstall torch torchvision
bash install-cpu.sh
```

## Performance Benchmarks

Based on typical workloads:

| Operation | CPU-Only | GPU (CUDA) |
|-----------|----------|------------|
| Single image match | ~3 sec | ~0.1 sec |
| Batch 10 images | ~15 sec | ~0.5 sec |
| Batch 100 images | ~2.5 min | ~3 sec |

## Environment Variables

The service uses these environment variables (configured in `.env`):

```env
PORT=8000
REDIS_HOST=localhost
REDIS_PORT=6379
DB_HOST=localhost
DB_PORT=5432
DB_NAME=findingsweetie
DB_USER=postgres
DB_PASSWORD=your_password
```

## API Endpoints

- `GET /health` - Health check
- `POST /match` - Match a pet image against the database
- `POST /analyze` - Analyze image features

See the main API documentation for detailed endpoint information.
