import os
import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, render_template
import tensorflow as tf

app = Flask(__name__)

# Load model (assuming it's in the same directory)
MODEL_PATH = 'best_model.xception.keras'
model = None

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully. Input shape:", model.input_shape)
except Exception as e:
    print(f"Error loading model: {e}")

def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize according to user input: 150x150
        img = img.resize((150, 150))
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Normalize: Xception typically expects [-1, 1], so we use preprocess_input
        img_array = img_array.astype('float32')
        img_array = tf.keras.applications.xception.preprocess_input(img_array)
        
        # Expand dims for batch size: (1, 150, 150, 3)
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        print(f"Error in preprocessing: {e}")
        return None

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model is not loaded.'}), 500
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request.'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file.'}), 400
        
    try:
        image_bytes = file.read()
        processed_img = preprocess_image(image_bytes)
        
        if processed_img is None:
            return jsonify({'error': 'Could not process the image. Please upload a valid image file.'}), 400
            
        predictions = model.predict(processed_img)
        
        if predictions.shape[-1] == 1: # Binary classification with 1 output node
            prob = float(predictions[0][0])
            class_idx = 1 if prob > 0.5 else 0
            confidence = prob if class_idx == 1 else (1.0 - prob)
        else: # Multi-class classification with >= 2 output nodes (softmax)
            class_idx = int(np.argmax(predictions[0]))
            confidence = float(predictions[0][class_idx])
            
        class_name = 'Dog' if class_idx == 1 else 'Cat'
        
        return jsonify({
            'success': True,
            'prediction': class_name,
            'confidence': f"{confidence * 100:.2f}%"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
