import os
import requests
import mimetypes
from dotenv import load_dotenv
from Gemini import get_diseasename_from_db, create_text_from_disease

import firebase_admin
from firebase_admin import credentials, storage, db

load_dotenv()

# Firebase başlat (bir kez)
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://dokai-8b7f8-default-rtdb.firebaseio.com/',
        'storageBucket': 'dokai-8b7f8.appspot.com'
    })

API_KEY = os.getenv("ELEVEN_API_KEY")
VOICE_ID = os.getenv("ELEVEN_VOICE_ID")

def convert_disease_to_speech_once(output_filename="output.mp3"):
    if not API_KEY or not VOICE_ID:
        raise ValueError("API anahtarı veya VOICE_ID .env dosyasında tanımlı değil.")

    # Kullanıcı verisini çek
    ref = db.reference("/")
    data = ref.get()

    if not data or "disease" not in data:
        raise ValueError("Firebase'de disease bilgisi bulunamadı.")

    disease_name = data["disease"]

    # Eğer zaten varsa metin ve ses linki, tekrar üretme
    if "audio_url" in data and "podcast_text" in data:
        print("✅ Daha önce üretildi. Tekrar oluşturulmadı.")
        print("🎧 Audio URL:", data["audio_url"])
        return

    # Gemini ile metni oluştur
    text = create_text_from_disease(disease_name)

    # ElevenLabs ile ses üret
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.7
        }
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        with open(output_filename, "wb") as f:
            f.write(response.content)
        print(f"✔️ Ses dosyası kaydedildi: {output_filename}")

        # Firebase Storage'a yükle
        bucket = storage.bucket()
        blob = bucket.blob(f"audio/{output_filename}")
        content_type, _ = mimetypes.guess_type(output_filename)
        blob.upload_from_filename(output_filename, content_type=content_type)
        blob.make_public()
        public_url = blob.public_url

        # Firebase DB'ye hem ses hem metin yaz
        ref.update({
            "audio_url": public_url,
            "podcast_text": text
        })

        print("🎧 Audio yüklenip DB'ye eklendi.")
        print("📝 Podcast metni de eklendi.")
    else:
        print(f"❌ Hata oluştu: {response.status_code} - {response.text}")
