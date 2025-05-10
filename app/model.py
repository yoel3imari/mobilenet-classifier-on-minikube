from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
from PIL import Image
import io

model = MobileNetV2(weights="imagenet")

def predict_image(file: bytes):
    image = Image.open(io.BytesIO(file)).convert("RGB")
    image = image.resize((224, 224))
    image_array = img_to_array(image)
    image_array = np.expand_dims(image_array, axis=0)
    image_array = preprocess_input(image_array)

    preds = model.predict(image_array)
    decode = decode_predictions(preds, top=3)[0]

    return [{
        "label": label,
        "descrip": desc,
        "proba": float(prob)
    } for (label, desc, prob) in decode]

