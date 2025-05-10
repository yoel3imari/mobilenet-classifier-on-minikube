FROM python:3.10-slim

WORKDIR /app

ENV UV_HTTP_TIMEOUT=120

RUN pip install uv

COPY pyproject.toml ./

# RUN uv venv

RUN uv venv && . .venv/bin/activate && uv pip install .

COPY . .

EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
