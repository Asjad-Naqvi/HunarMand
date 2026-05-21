# 📱 Haazir: Standalone APK Compilation Guide

This guide provides step-by-step instructions to compile your **Haazir** React Native (Expo) application into a fully working standalone **APK** file.

> [!IMPORTANT]
> **Critical Network Warning for Standsalone APKs:**
> If you run the compiled APK on a physical Android device or a remote emulator, it **cannot** reach the backend server using `localhost` or `127.0.0.1`.
> Before building, you **must** update your frontend `.env` configuration (or environment variables) to point to your backend using:
> 1. A public tunneling URL like **ngrok** (e.g., `https://your-subdomain.ngrok-free.app`).
> 2. Or your local computer's Wi-Fi IPv4 address (e.g., `http://192.168.18.42:5000`), provided both the phone and backend are on the exact same Wi-Fi network.

---

## 🛠️ Method 1: Remote EAS Build (Recommended & Simplest)

Expo Application Services (EAS) is the official remote build system. It compiles the APK on Expo's high-performance cloud servers, meaning **you do not need to install Android Studio, Gradle, or Java** on your system.

### Step 1: Install EAS CLI
Install the official EAS command-line tools globally:
```bash
npm install -g eas-cli
```

### Step 2: Log In or Register
If you do not have an Expo account, create one at [expo.dev](https://expo.dev) and log in:
```bash
eas login
```

### Step 3: Configure EAS Build
Initialize EAS in your project directory:
```bash
eas build:configure
```
This command will automatically create an `eas.json` file in your project root.

### Step 4: Configure for APK Output
By default, EAS builds `.aab` (Android App Bundle) files for Google Play Store. To configure it to output an **installable `.apk` file**, edit your `eas.json` to include an APK profile under `preview` or `development`:

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Step 5: Start the Remote Build
Run the following command to start the build on Expo cloud servers:
```bash
eas build -p android --profile preview
```
- Select your Expo project account when prompted.
- The CLI will upload your JavaScript code, build assets, and start the remote compilation.
- Once finished, it will display a **QR Code** and a **direct download link** to download your working **`Haazir.apk`**!

---

## 💻 Method 2: Local Native Gradle Build (No Expo Account Required)

If you prefer to compile the APK entirely offline on your local Windows PC, you can generate native Android code and build using Gradle.

### 📋 Prerequisites
Before compiling locally, you **must** have:
1. **JDK 17** (Java Development Kit) installed and the `JAVA_HOME` environment variable configured.
2. **Android Studio** installed with the **Android SDK**, **SDK Build-Tools**, and the `ANDROID_HOME` environment variable pointing to your SDK path.

### Step 1: Generate Native Android Directory
Run the Expo prebuild command to scaffold the native `android` project structure:
```bash
npx expo prebuild --platform android
```
*Note: This generates a standard native `/android` folder in your project root.*

### Step 2: Compile the Release APK
Navigate into the generated `android` folder and trigger the Gradle release compile:

**On Windows (PowerShell / Command Prompt):**
```powershell
cd android
.\gradlew.bat assembleRelease
```

**On macOS / Linux:**
```bash
cd android
chmod +x gradlew
./gradlew assembleRelease
```

### Step 3: Retrieve the Working APK
Once compilation completes successfully, your working installable APK will be generated at:
```
d:\oddconnector\hidmetgo\android\app\build\outputs\apk\release\app-release.apk
```
Copy this file to your phone via USB or email to install and test!

---

## ⚡ Troubleshooting & Performance Tips

> [!TIP]
> - **Clear Expo Cache**: If you see compilation or dependency mismatch errors during prebuild, clear the caches:
>   `npx expo start --clear`
> - **Gradle Sync Issues**: If you run into native compilation errors, open the `/android` folder in **Android Studio** and let the Gradle sync finish to auto-resolve missing Android SDK licenses or components.
