from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from .model import predict_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = predict_image(image_bytes)
    return {"predictions": result}

@app.get("/api")
def root():
    return {"message": "Hello World"}