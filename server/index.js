import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { checkEnvironment } from './envHelper.js';
import { parseApk } from './apkParser.js';
import {
  launchAndroidEmulator,
  installApk,
  launchApp,
  captureAndroidScreenshot,
  captureIosSimulatorScreenshot,
  captureMultiDeviceSet
} from './emulatorService.js';
import {
  analyzeScreensWithVision,
  generateDalleBanner,
  generateStoreListingCopy
} from './openaiService.js';
import { createZipArchive } from './exportService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(rootDir, 'uploads');

// Ensure upload folders exist
['apks', 'icons', 'screenshots', 'generated'].forEach(folder => {
  const dir = path.join(uploadsDir, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadsDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'screenshots';
    if (file.fieldname === 'apk') folder = 'apks';
    else if (file.fieldname === 'logo') folder = 'icons';
    cb(null, path.join(uploadsDir, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB for APKs
});

// 1. Health & Environment Status
app.get('/api/status', async (req, res) => {
  try {
    const env = await checkEnvironment();
    res.json({
      success: true,
      env,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. APK Upload & Extraction
app.post('/api/upload-apk', upload.single('apk'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No APK file provided.' });
    }

    const apkPath = req.file.path;
    const metadata = await parseApk(apkPath, uploadsDir);

    res.json({
      success: true,
      apkPath,
      apkFilename: req.file.filename,
      fileSize: req.file.size,
      ...metadata
    });
  } catch (err) {
    console.error('APK upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Logo Upload
app.post('/api/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No logo file provided.' });
    }

    const logoUrl = `/uploads/icons/${req.file.filename}`;
    res.json({
      success: true,
      logoUrl,
      filename: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Custom Screenshot Upload
app.post('/api/upload-screenshots', upload.array('screenshots', 12), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No screenshot files uploaded.' });
    }

    const screenshots = req.files.map((file, idx) => ({
      id: `screen_upload_${Date.now()}_${idx}`,
      url: `/uploads/screenshots/${file.filename}`,
      filePath: file.path,
      name: file.originalname
    }));

    res.json({ success: true, screenshots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Emulator Control Endpoints
app.post('/api/emulator/launch', async (req, res) => {
  try {
    const { avdName } = req.body;
    const result = await launchAndroidEmulator(avdName);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/emulator/install', async (req, res) => {
  try {
    const { apkPath, deviceId } = req.body;
    if (!apkPath) {
      return res.status(400).json({ success: false, error: 'apkPath is required.' });
    }

    const result = await installApk(apkPath, deviceId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/emulator/launch-app', async (req, res) => {
  try {
    const { packageName, launchActivity, deviceId } = req.body;
    if (!packageName) {
      return res.status(400).json({ success: false, error: 'packageName is required.' });
    }

    const result = await launchApp(packageName, launchActivity, deviceId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/emulator/screenshot', async (req, res) => {
  try {
    const { platform = 'android', deviceId, udid = 'booted' } = req.body;
    const screensDir = path.join(uploadsDir, 'screenshots');

    let result;
    if (platform === 'ios') {
      result = await captureIosSimulatorScreenshot(screensDir, udid);
    } else {
      result = await captureAndroidScreenshot(screensDir, deviceId);
    }

    res.json({ success: true, screenshot: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/emulator/multi-screenshot', async (req, res) => {
  try {
    const { deviceId } = req.body;
    const screensDir = path.join(uploadsDir, 'screenshots');
    const screenshots = await captureMultiDeviceSet(screensDir, deviceId);
    res.json({ success: true, screenshots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. OpenAI AI Studio Endpoints
app.post('/api/ai/analyze-screens', async (req, res) => {
  try {
    const { apiKey, screenshots, appInfo } = req.body;
    const resolvedScreens = (screenshots || []).map(s => {
      if (s.url && s.url.startsWith('/uploads/')) {
        const localRel = s.url.replace(/^\//, '');
        return {
          ...s,
          filePath: path.join(rootDir, localRel)
        };
      }
      return s;
    });

    const results = await analyzeScreensWithVision(apiKey, resolvedScreens, appInfo);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ai/generate-banner', async (req, res) => {
  try {
    const { apiKey, appInfo } = req.body;
    const result = await generateDalleBanner(apiKey, appInfo, uploadsDir);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ai/generate-metadata', async (req, res) => {
  try {
    const { apiKey, appInfo } = req.body;
    const metadata = await generateStoreListingCopy(apiKey, appInfo);
    res.json({ success: true, metadata });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Store Asset ZIP Export
app.post('/api/export-zip', (req, res) => {
  try {
    const assetData = req.body;
    createZipArchive(assetData, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Sample Demo Loader for immediate instant testing
app.get('/api/sample-demo', (req, res) => {
  res.json({
    appName: 'HyperTrack Fit Pro',
    packageName: 'com.hypertrack.fitpro',
    versionName: '2.4.0',
    versionCode: '42',
    category: 'Health & Fitness Tracker',
    screens: [
      {
        id: 'sample-1',
        title: 'Realtime GPS Workout Tracking',
        headline: 'CRUSH YOUR RUNS',
        subtitle: 'Live pace, elevation & biometric heart rate telemetry.',
        badge: '⚡ Realtime GPS',
        type: 'phone',
        gradientStart: '#0f172a',
        gradientEnd: '#3b82f6',
        accentColor: '#38bdf8',
        textColor: '#ffffff',
        frameStyle: 'iphone17',
        perspective: 'flat',
        preset: 'midnight_nebula'
      },
      {
        id: 'sample-2',
        title: 'AI Smart Nutrition Coach',
        headline: 'AI MEAL SCANNER',
        subtitle: 'Instant macro breakdowns with a single camera snap.',
        badge: '🤖 GPT-4o Vision',
        type: 'phone',
        gradientStart: '#130e2b',
        gradientEnd: '#8b5cf6',
        accentColor: '#c084fc',
        textColor: '#ffffff',
        frameStyle: 'iphone17',
        perspective: 'tilt-left',
        preset: 'cyberpunk_glow'
      },
      {
        id: 'sample-3',
        title: 'Weekly Performance Analytics',
        headline: 'DATA-DRIVEN GAINS',
        subtitle: 'Interactive charts comparing weekly volume and recovery.',
        badge: '📊 Deep Analytics',
        type: 'phone',
        gradientStart: '#064e3b',
        gradientEnd: '#10b981',
        accentColor: '#34d399',
        textColor: '#ffffff',
        frameStyle: 'android_flagship',
        perspective: 'flat',
        preset: 'emerald_aurora'
      },
      {
        id: 'sample-4',
        title: 'Community Leaderboards',
        headline: 'COMPETE & CONQUER',
        subtitle: 'Join global challenges and climb local leaderboards.',
        badge: '🏆 Global Arena',
        type: 'phone',
        gradientStart: '#451a03',
        gradientEnd: '#f97316',
        accentColor: '#fbbf24',
        textColor: '#ffffff',
        frameStyle: 'iphone17',
        perspective: 'tilt-right',
        preset: 'sunset_blaze'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AppStore Studio Server running on http://localhost:${PORT}`);
});
