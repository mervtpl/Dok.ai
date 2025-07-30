from Gemini import get_diseasename_from_db, create_text_from_disease
import firebase_admin
from firebase_admin import db

# Firebase zaten initialize edilmişse tekrar etme
if not firebase_admin._apps:
    from firebase_admin import credentials
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://dokai-8b7f8-default-rtdb.firebaseio.com/'
    })

def test_generate_and_optionally_save_text():
    disease = get_diseasename_from_db(path="/")
    if not disease:
        print(" Disease bilgisi bulunamadı.")
        return

    print(f" Hastalık: {disease}")

    text = create_text_from_disease(disease)
    print("\n Üretilen Metin:\n")
    print(text)


if __name__ == "__main__":
    test_generate_and_optionally_save_text()
