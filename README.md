# AppStore Studio PRO 🚀
### Automated Store Preview, Screenshot & Asset Suite for Android APK & iOS

AppStore Studio PRO is a full-stack developer suite that automates the generation of compliant **Google Play Store** and **Apple App Store** marketing previews, screenshots, feature graphics, app icons, and search promotional assets.

---

## ✨ Key Features

### 1. APK Upload & Automated Inspection
- **Drag-and-Drop APK Analysis**: Upload any standard Android `.apk` file.
- **Deep Metadata Parsing**: Extracts App Name, Package Name, Launchable Activity, Version Name/Code, and Target SDK using Android SDK `aapt`/`aapt2` with ZIP fallback.
- **Auto-Extracted App Icon**: Automatically extracts the highest-resolution launcher icon (`xxxhdpi`/`xxhdpi`) directly from the APK binary.
- **Custom Brand Logo Support**: Upload SVG, PNG, or WebP brand logos with customizable squircle/circle corner radius and shadow effects.

### 2. Android Emulator & iOS Simulator Automation
- **Bridge to Host Emulators**: Auto-detects local Android AVDs (`emulator -list-avds`) such as `Pixel_9a`, running ADB devices, and Apple Xcode simulators (`xcrun simctl`).
- **1-Click Emulator Boot & Deployment**: Boots Android emulators, installs the APK via `adb install`, and launches the app directly.
- **Real-Time Screenshot Grabber**: Direct high-resolution screen captures (`adb exec-out screencap -p`).
- **Multi-Device Resolution Emulation**: Dynamically emulates Phone (`1080x2400`), 7" Tablet (`1200x1920`), and 10" Tablet (`1600x2560`) resolutions via `adb shell wm size` & `density` commands and resets automatically.
- **Manual Upload & Quick Demo Mode**: Test with real APKs, uploaded PNG/JPG screens, or click **"Load Demo"** for instantaneous testing.

### 3. OpenAI AI Creative Copilot
- **GPT-4o Vision Screen Analyzer**: Analyzes screenshot UI screens pixel-by-pixel to extract the core user benefit, craft catchy App Store headlines (under 32 chars), write punchy subtitles, assign pill badges, and extract brand color palettes.
- **DALL-E 3 Feature Graphic Art Generator**: Generates custom high-resolution 3D glassmorphic and volumetric background illustrations for Google Play Feature Graphics (1024x500) and App Store search banners.
- **ASO Copywriter**: Drafts compliant Google Play descriptions (under 80 chars & formatted full descriptions) and Apple App Store promotional text and comma-separated keywords (under 100 chars).

### 4. Interactive High-DPI Canvas Studio
- **Multi-Device Store Presets**:
  - **Google Play Phone**: 1080 × 2400 px (9:20 aspect ratio)
  - **Google Play 7" Tablet**: 1200 × 1920 px
  - **Google Play 10" Tablet**: 1600 × 2560 px
  - **Google Play Feature Graphic**: 1024 × 500 px (with 15% safe boundary enforcement)
  - **Google Play App Icon**: 512 × 512 px (32-bit PNG)
  - **Apple iPhone 6.9" / 6.7"**: 1290 × 2796 px (iPhone 16/17 Pro Max)
  - **Apple iPhone 6.5"**: 1242 × 2688 px
  - **Apple iPhone 5.5"**: 1242 × 2208 px
  - **Apple iPad Pro 13"**: 2048 × 2732 px (M4 / 6th Gen)
  - **Apple App Store Icon**: 1024 × 1024 px (no transparency)
- **Device Frames**: iPhone 17 Pro Max Titanium (with Dynamic Island), Modern Android Flagship (centered punch-hole), Tablet Frame, and Minimal Frameless.
- **3D Perspective Controls**: Flat front-facing, Tilt Left, Tilt Right, and Floating Lift.
- **1-Click Theme Sync**: "Apply Style to All" propagates colors, fonts, and frame styles across all screens.

### 5. 1-Click Complete Store Assets ZIP Export
Bundles all assets into a submission-ready archive:
```
App_Store_Assets.zip
├── Google-Play/
│   ├── Phone-Screenshots-1080x2400/
│   ├── Tablet-7in-1200x1920/
│   ├── Tablet-10in-1600x2560/
│   ├── Feature-Graphic-1024x500/
│   ├── App-Icon-512x512/
│   └── Play-Store-Listing.txt
└── Apple-App-Store/
    ├── iPhone-6.9in-1290x2796/
    ├── iPhone-6.5in-1242x2688/
    ├── iPhone-5.5in-1242x2208/
    ├── iPad-Pro-13in-2048x2732/
    ├── App-Store-Icon-1024x1024/
    ├── App-Store-Metadata.txt
    └── manifest.json
```

---

## 🛠️ Setup & Running

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`
# apppreview
