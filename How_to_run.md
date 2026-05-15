# How to Run OddJobs Project

This project consists of a **Python Flask Backend** and a **React Native (Expo) Frontend**.

## 🚀 Prerequisites
- **Python 3.10+** installed.
- **Node.js** installed.
- **Expo Go** app installed on your physical phone (Android or iOS).

---

## 🛠️ 1. Backend Setup (API)

The backend is located in the `hidmetgo-backend` directory.

### Step 1: Activate Virtual Environment
Open a terminal and navigate to the backend folder:
```powershell
cd hidmetgo-backend
.\venv\Scripts\activate
```

### Step 2: Configure Environment Variables
Ensure you have a `.env` file in the `hidmetgo-backend` directory with the following content:
```bash
GROQ_API_KEY=gsk_your_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### Step 3: Run the Server
```powershell
python app.py
```
The backend will start at `http://127.0.0.1:5000`.

---

## 📱 2. Frontend Setup (Mobile App)

The frontend is located in the root directory.

### Step 1: Install Dependencies
(Only needed once)
```powershell
npm install --legacy-peer-deps
```

### Step 2: Start the Expo Server
```powershell
npx expo start
```

### Step 3: Launch on your Phone
1. Open the **Expo Go** app on your phone.
2. Scan the QR code displayed in your terminal.

---

## ⚠️ Troubleshooting: "Failed to download remote update"
If you see an error on your phone saying "Failed to download remote update," follow these steps:

1. **Hotspot Method (Recommended):**
   - Turn on your **Phone's Mobile Hotspot**.
   - Connect your **Laptop** to your phone's hotspot.
   - Restart the Expo server: `npx expo start`.
   - Scan the QR code again.
   
2. **Network Profile:**
   - Ensure your Windows Network Profile is set to **Private** (Settings > Network & Internet > Wi-Fi > [Your Network] > Private).
   
3. **Firewall:**
   - Ensure Windows Firewall is allowing **Node.js** to communicate.
