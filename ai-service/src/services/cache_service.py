import redis
import json
import os
from typing import Optional

class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            password=os.getenv('REDIS_PASSWORD', None),
            decode_responses=True,
            db=0
        )
        self.ttl = 86400 * 7  # 7 days cache

    def get_match_result(self, pet_hash: str, sighting_hash: str) -> Optional[dict]:
        """Retrieve cached match result"""
        cache_key = f"match:{pet_hash}:{sighting_hash}"

        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            print(f"Cache retrieval error: {e}")

        return None

    def set_match_result(self, pet_hash: str, sighting_hash: str, result: dict) -> bool:
        """Cache match result"""
        cache_key = f"match:{pet_hash}:{sighting_hash}"

        try:
            self.redis_client.setex(
                cache_key,
                self.ttl,
                json.dumps(result)
            )
            return True
        except Exception as e:
            print(f"Cache storage error: {e}")
            return False

    def invalidate_pet_cache(self, pet_id: int) -> bool:
        """Invalidate all cached matches for a specific pet"""
        try:
            pattern = f"match:pet_{pet_id}:*"
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            print(f"Cache invalidation error: {e}")
            return False
