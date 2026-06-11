from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self):
        self._model = None
        self.model_name = "all-MiniLM-L6-v2"

    @property
    def model(self):
        # Lazy loading the model to prevent API cold-start penalties when starting Uvicorn
        if self._model is None:
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def embed_text(self, text: str) -> list[float]:
        embedding = self.model.encode(text)
        return embedding.tolist()

    def embed_experience(self, title: str, description: str, skills: list[str]) -> list[float]:
        # Formulate rich text representation of the experience
        skills_text = ", ".join(skills)
        combined_text = f"Title: {title}. Description: {description}. Skills: {skills_text}"
        return self.embed_text(combined_text)

embedding_service = EmbeddingService()
