import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-pro")

response = model.generate_content("Merhaba Gemini, nasılsın?")
print("Cevap:", response.text)
