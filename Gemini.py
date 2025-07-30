import os
from dotenv import load_dotenv
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, db

# .env dosyasını yükle
load_dotenv()

# Firebase bağlantısı
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://dokai-8b7f8-default-rtdb.firebaseio.com/'
})

# Google Gemini API bağlantısı
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("models/gemini-pro")

def get_diseasename_from_db(path="/2"):
    """
    Firebase'den disease adını alır
    """
    ref = db.reference(path)
    data = ref.get()
    if data and "disease" in data:
        return data["disease"]
    return None

def create_text_from_disease(diseasename):
    """
    Gemini kullanarak bilgilendirici metin üretir
    """
    prompt = f"{diseasename} hastalığı hakkında bilgilendirici bir podcast metni ver."
    response = model.generate_content(prompt)
    return response.text
