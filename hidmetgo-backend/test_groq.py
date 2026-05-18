import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GROQ_API_KEY')
print(f"Testing Groq API key: {api_key[:10]}...{api_key[-10:] if api_key else ''}")

try:
    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": "Hello"}
        ]
    )
    print("[SUCCESS] Groq API connected successfully!")
    print(f"Response: {completion.choices[0].message.content}")
except Exception as e:
    print(f"[ERROR] Groq connection failed: {e}")
