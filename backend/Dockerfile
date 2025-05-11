FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

RUN pip install uv

ENV UV_HTTP_TIMEOUT=120

COPY pyproject.toml ./

RUN uv venv

RUN uv pip install --system --editable .

COPY . .

EXPOSE 5000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]