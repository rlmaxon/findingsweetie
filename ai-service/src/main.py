from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
from dotenv import load_dotenv
import requests
from io import BytesIO

from models.image_matcher import ImageMatcher
from services.cache_service import CacheService

load_dotenv()

app = FastAPI(
    title="Finding Sweetie AI Service",
    description="AI-powered pet image matching service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
matcher = ImageMatcher()
cache_service = CacheService()

class MatchRequest(BaseModel):
    pet_id: int
    sighting_id: int
    pet_image_url: Optional[str] = None
    sighting_image_url: Optional[str] = None

class MatchResponse(BaseModel):
    confidence: float
    match: bool
    model_version: str
    cached: bool = False

@app.get("/")
async def root():
    return {
        "service": "Finding Sweetie AI Service",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": "MobileNetV3",
        "device": str(matcher.device)
    }

@app.post("/api/match", response_model=MatchResponse)
async def match_images(request: MatchRequest):
    """
    Match a pet image with a sighting image
    Accepts either image URLs or will fetch from the database
    """
    try:
        # Download images from URLs
        if not request.pet_image_url or not request.sighting_image_url:
            raise HTTPException(
                status_code=400,
                detail="Both pet_image_url and sighting_image_url are required"
            )

        # Fetch images
        pet_image_response = requests.get(request.pet_image_url, timeout=10)
        sighting_image_response = requests.get(request.sighting_image_url, timeout=10)

        if pet_image_response.status_code != 200 or sighting_image_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch images")

        pet_image_data = pet_image_response.content
        sighting_image_data = sighting_image_response.content

        # Compute image hashes for caching
        pet_hash = ImageMatcher.compute_image_hash(pet_image_data)
        sighting_hash = ImageMatcher.compute_image_hash(sighting_image_data)

        # Check cache first
        cached_result = cache_service.get_match_result(pet_hash, sighting_hash)
        if cached_result:
            return MatchResponse(
                confidence=cached_result['confidence'],
                match=cached_result['match'],
                model_version=cached_result.get('model_version', 'mobilenetv3_1.0'),
                cached=True
            )

        # Perform matching
        result = matcher.match_images(pet_image_data, sighting_image_data)

        # Cache the result
        cache_data = {
            'confidence': result['confidence'],
            'match': result['match'],
            'model_version': 'mobilenetv3_1.0'
        }
        cache_service.set_match_result(pet_hash, sighting_hash, cache_data)

        return MatchResponse(
            confidence=result['confidence'],
            match=result['match'],
            model_version='mobilenetv3_1.0',
            cached=False
        )

    except Exception as e:
        print(f"Matching error: {e}")
        raise HTTPException(status_code=500, detail=f"Image matching failed: {str(e)}")

@app.post("/api/match/upload")
async def match_uploaded_images(
    pet_image: UploadFile = File(...),
    sighting_image: UploadFile = File(...)
):
    """
    Match two uploaded images directly
    Useful for testing and manual verification
    """
    try:
        # Read uploaded files
        pet_image_data = await pet_image.read()
        sighting_image_data = await sighting_image.read()

        # Compute hashes
        pet_hash = ImageMatcher.compute_image_hash(pet_image_data)
        sighting_hash = ImageMatcher.compute_image_hash(sighting_image_data)

        # Check cache
        cached_result = cache_service.get_match_result(pet_hash, sighting_hash)
        if cached_result:
            return JSONResponse({
                **cached_result,
                'cached': True
            })

        # Perform matching
        result = matcher.match_images(pet_image_data, sighting_image_data)

        # Cache result
        cache_data = {
            'confidence': result['confidence'],
            'match': result['match'],
            'model_version': 'mobilenetv3_1.0'
        }
        cache_service.set_match_result(pet_hash, sighting_hash, cache_data)

        return JSONResponse({
            'confidence': result['confidence'],
            'match': result['match'],
            'model_version': 'mobilenetv3_1.0',
            'cached': False
        })

    except Exception as e:
        print(f"Upload matching error: {e}")
        raise HTTPException(status_code=500, detail=f"Image matching failed: {str(e)}")

@app.post("/api/batch-match")
async def batch_match_images(
    pet_image: UploadFile = File(...),
    sighting_images: List[UploadFile] = File(...)
):
    """
    Match one pet image against multiple sighting images
    Returns a list of match results
    """
    try:
        pet_image_data = await pet_image.read()

        sighting_images_data = []
        for sighting_image in sighting_images:
            sighting_images_data.append(await sighting_image.read())

        results = matcher.batch_match(pet_image_data, sighting_images_data)

        return JSONResponse({
            'results': results,
            'total_sightings': len(results),
            'matches': sum(1 for r in results if r['match'])
        })

    except Exception as e:
        print(f"Batch matching error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch matching failed: {str(e)}")

@app.delete("/api/cache/pet/{pet_id}")
async def invalidate_pet_cache(pet_id: int):
    """Invalidate all cached matches for a specific pet"""
    try:
        success = cache_service.invalidate_pet_cache(pet_id)
        return JSONResponse({
            'success': success,
            'message': f'Cache invalidated for pet {pet_id}'
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache invalidation failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv('PORT', 8000))
    workers = int(os.getenv('WORKERS', 4))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        workers=workers,
        reload=os.getenv('ENV', 'development') == 'development'
    )
