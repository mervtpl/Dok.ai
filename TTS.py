import os
import mimetypes
from dotenv import load_dotenv
from Gemini import get_diseasename_from_db, create_text_from_disease

from google.cloud import texttospeech

import firebase_admin
from firebase_admin import credentials, storage, db

# Ortam değişkenlerini yükle
load_dotenv()


os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")


if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://dokai-8b7f8-default-rtdb.firebaseio.com/',
        'storageBucket': 'dokai-8b7f8.appspot.com'
    })


def convert_disease_to_speech_once(output_filename="output.mp3"):
    # Firebase'den hastalık verisini çek
    ref = db.reference("/")
    data = ref.get()

    if not data or "disease" not in data:
        raise ValueError("Firebase'de disease bilgisi bulunamadı.")

    disease_name = data["disease"]

    # Zaten varsa yeniden üretme
    if "audio_url" in data and "podcast_text" in data:
        print("✅ Daha önce üretildi. Tekrar oluşturulmadı.")
        print("🎧 Audio URL:", data["audio_url"])
        return

    # Gemini'den podcast metni oluştur
    text = create_text_from_disease(disease_name)

    # Google TTS istemcisi ile sese dönüştür
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="tr-TR",
        name="tr-TR-Wavenet-A",  
        ssml_gender=texttospeech.SsmlVoiceGender.MALE
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    # MP3 dosyasını kaydet
    with open(output_filename, "wb") as out:
        out.write(response.audio_content)
    print(f"✔️ Ses dosyası kaydedildi: {output_filename}")

    # Firebase Storage'a yükle
    bucket = storage.bucket()
    blob = bucket.blob(f"audio/{output_filename}")
    content_type, _ = mimetypes.guess_type(output_filename)
    blob.upload_from_filename(output_filename, content_type=content_type)
    blob.make_public()
    public_url = blob.public_url

    # Veritabanına URL ve metin yaz
    ref.update({
        "audio_url": public_url,
        "podcast_text": text
    })

    print("🎧 Audio yüklenip DB'ye eklendi.")
    print("📝 Podcast metni de eklendi.")


if __name__ == "__main__":
    try:
        convert_disease_to_speech_once()
    except Exception as e:
        print(f"❌ İşlem sırasında hata oluştu: {e}")
