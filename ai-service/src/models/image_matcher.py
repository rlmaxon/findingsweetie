import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import hashlib
import imagehash

class ImageMatcher:
    def __init__(self, model_name='mobilenet_v3_large'):
        """Initialize the image matching model with MobileNetV3"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")

        # Load pre-trained MobileNetV3
        if model_name == 'mobilenet_v3_large':
            self.model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
        else:
            self.model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)

        # Remove the classification layer to get embeddings
        self.model.classifier = torch.nn.Identity()
        self.model.eval()
        self.model.to(self.device)

        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def load_image(self, image_data):
        """Load image from bytes or file path"""
        if isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
        elif isinstance(image_data, str):
            image = Image.open(image_data).convert('RGB')
        else:
            image = image_data.convert('RGB')

        return image

    def get_image_embedding(self, image_data):
        """Extract feature embeddings from an image"""
        image = self.load_image(image_data)
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model(image_tensor)

        return embedding.cpu().numpy().flatten()

    def compute_similarity(self, embedding1, embedding2):
        """Compute cosine similarity between two embeddings"""
        similarity = cosine_similarity([embedding1], [embedding2])[0][0]
        # Convert from [-1, 1] to [0, 1] range
        normalized_similarity = (similarity + 1) / 2
        return float(normalized_similarity)

    def match_images(self, pet_image_data, sighting_image_data):
        """
        Match a pet image with a sighting image
        Returns similarity score between 0 and 1
        """
        pet_embedding = self.get_image_embedding(pet_image_data)
        sighting_embedding = self.get_image_embedding(sighting_image_data)

        similarity_score = self.compute_similarity(pet_embedding, sighting_embedding)

        return {
            'confidence': similarity_score,
            'match': similarity_score >= 0.78,  # Default threshold
            'pet_embedding': pet_embedding.tolist(),
            'sighting_embedding': sighting_embedding.tolist()
        }

    def batch_match(self, pet_image_data, sighting_images_data):
        """
        Match one pet image against multiple sighting images
        Returns list of similarity scores
        """
        pet_embedding = self.get_image_embedding(pet_image_data)

        results = []
        for sighting_data in sighting_images_data:
            sighting_embedding = self.get_image_embedding(sighting_data)
            similarity = self.compute_similarity(pet_embedding, sighting_embedding)

            results.append({
                'confidence': similarity,
                'match': similarity >= 0.78
            })

        return results

    @staticmethod
    def compute_image_hash(image_data):
        """Compute perceptual hash of an image for caching"""
        if isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data))
        elif isinstance(image_data, str):
            image = Image.open(image_data)
        else:
            image = image_data

        # Use perceptual hash
        phash = str(imagehash.phash(image))
        return phash

    @staticmethod
    def compute_md5_hash(image_data):
        """Compute MD5 hash for exact duplicate detection"""
        if isinstance(image_data, bytes):
            data = image_data
        else:
            # Convert to bytes
            buffer = io.BytesIO()
            if isinstance(image_data, str):
                img = Image.open(image_data)
            else:
                img = image_data
            img.save(buffer, format='PNG')
            data = buffer.getvalue()

        return hashlib.md5(data).hexdigest()
