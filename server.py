from flask import Flask, request, render_template
from io import BytesIO
from PIL import Image
import numpy as np
import base64
import joblib

# create flask app
app = Flask("app", static_url_path='/', static_folder="web/static", template_folder="web/templates")

# load model
label_encoder = joblib.load("model/shapes_label_encoder.joblib")
classifier = joblib.load("model/shapes_classifier.joblib")

@app.route('/')
def hello_world():
  return render_template("index.html")

@app.route("/api/upload", methods=["POST"])
def upload():
    body = request.get_json()
    pil_image = Image.open(BytesIO(base64.b64decode(body["image"]))).convert('1').resize((200, 200))
    test_image = [ 255 if pixel else 0 for pixel in np.asarray(pil_image).flatten() ]
    pil_image.save("web/static/uploads/test.png")
    prediction = label_encoder.inverse_transform(classifier.predict([ test_image ]))
    return { "prediction": prediction[0] }
app.run(host="localhost", port=5000, debug=True)