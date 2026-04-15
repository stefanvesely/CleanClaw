from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]:
        ...


class OpenAICompatibleEmbeddingProvider(EmbeddingProvider):
    """Handles openai, vllm-local, and ollama-local — all speak the OpenAI embeddings API."""

    def __init__(self, api_key: str, model: str, base_url: str | None = None):
        from openai import OpenAI
        self._client = OpenAI(api_key=api_key or "local", base_url=base_url)
        self._model = model

    def embed(self, texts: list[str]) -> list[list[float]]:
        response = self._client.embeddings.create(input=texts, model=self._model)
        return [item.embedding for item in response.data]


class HttpEmbeddingProvider(EmbeddingProvider):
    """Generic fallback — any endpoint that accepts a POST with an OpenAI-shaped body."""

    def __init__(self, base_url: str, model: str, api_key: str = ""):
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._api_key = api_key

    def embed(self, texts: list[str]) -> list[list[float]]:
        import urllib.request
        import json
        payload = json.dumps({"input": texts, "model": self._model}).encode()
        headers = {"Content-Type": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        req = urllib.request.Request(f"{self._base_url}/embeddings", data=payload, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        return [item["embedding"] for item in data["data"]]


_OPENAI_COMPATIBLE = {"openai", "vllm-local", "ollama-local"}

_DEFAULT_BASE_URLS = {
    "ollama-local": "http://localhost:11434/v1",
    "vllm-local": "http://localhost:8000/v1",
}

_DEFAULT_MODELS = {
    "openai": "text-embedding-3-small",
    "ollama-local": "nomic-embed-text",
    "vllm-local": "nomic-embed-text",
}


def get_provider(config: dict) -> EmbeddingProvider:
    emb = config.get("embeddings", {})
    provider = emb.get("provider", config.get("provider", "openai"))
    model = emb.get("model") or _DEFAULT_MODELS.get(provider, "text-embedding-3-small")
    api_key = emb.get("apiKey") or config.get(provider, {}).get("apiKey", "")

    if provider in _OPENAI_COMPATIBLE:
        base_url = emb.get("baseUrl") or _DEFAULT_BASE_URLS.get(provider)
        return OpenAICompatibleEmbeddingProvider(api_key=api_key, model=model, base_url=base_url)

    if provider == "http":
        base_url = emb.get("baseUrl", "")
        if not base_url:
            raise ValueError("embeddings.baseUrl is required for provider 'http'")
        return HttpEmbeddingProvider(base_url=base_url, model=model, api_key=api_key)

    raise ValueError(
        f"Unknown embedding provider: {provider!r}. "
        f"Supported: {', '.join(sorted(_OPENAI_COMPATIBLE | {'http'}))}"
    )
