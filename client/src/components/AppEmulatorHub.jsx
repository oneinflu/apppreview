import React, { useState } from 'react';
import { 
  Upload, 
  Smartphone, 
  Play, 
  Camera, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Tablet, 
  Image as ImageIcon, 
  FileCode,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AppEmulatorHub({
  apkData,
  setApkData,
  customLogo,
  setCustomLogo,
  screenshots,
  setScreenshots,
  envStatus,
  refreshEnv,
  onProceedToAi
}) {
  const [uploadingApk, setUploadingApk] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingScreens, setUploadingScreens] = useState(false);
  const [emulatorActionLoading, setEmulatorActionLoading] = useState(false);
  const [emulatorLog, setEmulatorLog] = useState('');

  const avds = envStatus?.androidAvds || [];
  const runningDevs = envStatus?.runningAndroidDevices || [];
  const isDeviceRunning = runningDevs.some(d => d.state === 'device');
  const activeDeviceId = runningDevs[0]?.id || null;

  // Handle APK Upload
  const handleApkDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file || !file.name.endsWith('.apk')) {
      alert('Please upload a valid .apk file');
      return;
    }

    setUploadingApk(true);
    setEmulatorLog(`Uploading and analyzing APK: ${file.name}...`);

    const formData = new FormData();
    formData.append('apk', file);

    try {
      const res = await fetch('/api/upload-apk', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setApkData(data);
        setEmulatorLog(`✅ APK Parsed! App Name: "${data.appName}", Package: "${data.packageName}"`);
        if (data.iconUrl && !customLogo) {
          setCustomLogo(data.iconUrl);
        }
      } else {
        setEmulatorLog(`❌ Error parsing APK: ${data.error}`);
      }
    } catch (err) {
      setEmulatorLog(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploadingApk(false);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setCustomLogo(data.logoUrl);
        setEmulatorLog('✅ Custom App Logo uploaded successfully.');
      }
    } catch (err) {
      setEmulatorLog(`❌ Logo upload failed: ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle Custom Screenshot Upload
  const handleScreenshotUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingScreens(true);
    const formData = new FormData();
    files.forEach(f => formData.append('screenshots', f));

    try {
      const res = await fetch('/api/upload-screenshots', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setScreenshots(prev => [...prev, ...data.screenshots.map((s, idx) => ({
          ...s,
          headline: `FEATURE HIGHLIGHT ${prev.length + idx + 1}`,
          subtitle: 'Seamless, intuitive user experience designed for mobile.',
          badge: 'FEATURED',
          gradientStart: '#0f172a',
          gradientEnd: '#3b82f6',
          accentColor: '#38bdf8',
          textColor: '#ffffff',
          frameStyle: 'iphone17',
          perspective: 'flat'
        }))]);
        setEmulatorLog(`✅ Added ${data.screenshots.length} screenshot(s).`);
      }
    } catch (err) {
      setEmulatorLog(`❌ Screenshot upload failed: ${err.message}`);
    } finally {
      setUploadingScreens(false);
    }
  };

  // Launch Android Emulator
  const handleLaunchEmulator = async () => {
    const avd = avds[0] || 'Pixel_9a';
    setEmulatorActionLoading(true);
    setEmulatorLog(`Booting Android Emulator (${avd})... Please allow 20-40 seconds for Android to start.`);

    try {
      const res = await fetch('/api/emulator/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avdName: avd })
      });
      const data = await res.json();
      setEmulatorLog(data.message || 'Emulator launched.');
      // Poll environment status
      setTimeout(refreshEnv, 5000);
      setTimeout(refreshEnv, 15000);
      setTimeout(refreshEnv, 30000);
    } catch (err) {
      setEmulatorLog(`❌ Failed to start emulator: ${err.message}`);
    } finally {
      setEmulatorActionLoading(false);
    }
  };

  // Install APK
  const handleInstallApk = async () => {
    if (!apkData?.apkPath) {
      alert('Please upload an APK file first.');
      return;
    }
    setEmulatorActionLoading(true);
    setEmulatorLog(`Installing ${apkData.apkFilename} on device ${activeDeviceId || ''}...`);

    try {
      const res = await fetch('/api/emulator/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apkPath: apkData.apkPath, deviceId: activeDeviceId })
      });
      const data = await res.json();
      setEmulatorLog(data.message);
    } catch (err) {
      setEmulatorLog(`❌ Install error: ${err.message}`);
    } finally {
      setEmulatorActionLoading(false);
    }
  };

  // Launch App
  const handleLaunchApp = async () => {
    if (!apkData?.packageName) {
      alert('No APK package name detected.');
      return;
    }
    setEmulatorActionLoading(true);
    setEmulatorLog(`Launching app ${apkData.packageName}...`);

    try {
      const res = await fetch('/api/emulator/launch-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: apkData.packageName,
          launchActivity: apkData.launchActivity,
          deviceId: activeDeviceId
        })
      });
      const data = await res.json();
      setEmulatorLog(data.message);
    } catch (err) {
      setEmulatorLog(`❌ Launch app error: ${err.message}`);
    } finally {
      setEmulatorActionLoading(false);
    }
  };

  // Capture Current Screen
  const handleCaptureScreen = async (platform = 'android') => {
    setEmulatorActionLoading(true);
    setEmulatorLog(`Capturing ${platform} screen...`);

    try {
      const res = await fetch('/api/emulator/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          deviceId: activeDeviceId
        })
      });
      const data = await res.json();
      if (data.success && data.screenshot) {
        const newScreen = {
          id: `capture_${Date.now()}`,
          url: data.screenshot.url,
          filePath: data.screenshot.filePath,
          headline: `DISCOVER ${apkData?.appName ? apkData.appName.toUpperCase() : 'FEATURES'}`,
          subtitle: 'Intuitive interface engineered for lightning speed.',
          badge: 'NEW RELEASE',
          gradientStart: '#0f172a',
          gradientEnd: '#312e81',
          accentColor: '#6366f1',
          textColor: '#ffffff',
          frameStyle: 'iphone17',
          perspective: 'flat'
        };
        setScreenshots(prev => [...prev, newScreen]);
        setEmulatorLog(`✅ Screenshot captured and added to Studio!`);
      } else {
        setEmulatorLog(`❌ Capture error: ${data.error}`);
      }
    } catch (err) {
      setEmulatorLog(`❌ Screencap error: ${err.message}. Make sure emulator is booted and running.`);
    } finally {
      setEmulatorActionLoading(false);
    }
  };

  // Capture Multi-device
  const handleCaptureMultiDevice = async () => {
    setEmulatorActionLoading(true);
    setEmulatorLog('Capturing multi-device set: Phone, 7" Tablet, 10" Tablet (emulating resolutions)...');

    try {
      const res = await fetch('/api/emulator/multi-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: activeDeviceId })
      });
      const data = await res.json();
      if (data.success && data.screenshots) {
        const mapped = data.screenshots.map(s => ({
          id: `multi_${Date.now()}_${s.type}`,
          url: s.url,
          filePath: s.filePath,
          headline: s.name.toUpperCase(),
          subtitle: 'Optimized for all tablet and phone form factors.',
          badge: s.type.toUpperCase(),
          gradientStart: '#0f172a',
          gradientEnd: '#1e1b4b',
          accentColor: '#a855f7',
          textColor: '#ffffff',
          frameStyle: s.type.includes('tablet') ? 'tablet' : 'iphone17',
          perspective: 'flat'
        }));
        setScreenshots(prev => [...prev, ...mapped]);
        setEmulatorLog(`✅ Captured ${data.screenshots.length} device format screenshots!`);
      }
    } catch (err) {
      setEmulatorLog(`❌ Multi-capture error: ${err.message}`);
    } finally {
      setEmulatorActionLoading(false);
    }
  };

  return (
    <div className="grid-sidebar">
      {/* Left Column: Uploads & Metadata */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* APK Upload Zone */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={18} color="var(--primary-light)" />
              APK Upload & Analysis
            </h3>
            {apkData && (
              <span className="store-pill-badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)' }}>
                Loaded
              </span>
            )}
          </div>

          <label 
            className={`dropzone ${uploadingApk ? 'active' : ''}`}
            onDragOver={e => e.preventDefault()}
            onDrop={handleApkDrop}
          >
            <input 
              type="file" 
              accept=".apk" 
              style={{ display: 'none' }} 
              onChange={handleApkDrop}
              disabled={uploadingApk}
            />
            <div className="dropzone-icon">
              {uploadingApk ? <RefreshCw className="spin" size={24} /> : <Upload size={24} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {uploadingApk ? 'Analyzing APK Badging & Icons...' : 'Drop your Android .apk file here'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                or click to browse from your computer
              </div>
            </div>
          </label>

          {/* Extracted APK Metadata Card */}
          {apkData && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
                {apkData.iconUrl ? (
                  <img 
                    src={apkData.iconUrl} 
                    alt="APK Icon" 
                    style={{ width: 52, height: 52, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }} 
                  />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={26} />
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{apkData.appName}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {apkData.packageName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-dim)' }}>Version: </span>
                  <span style={{ fontWeight: 600 }}>{apkData.versionName} ({apkData.versionCode})</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-dim)' }}>Target SDK: </span>
                  <span style={{ fontWeight: 600 }}>{apkData.targetSdkVersion || '34'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Logo Upload & App Brand */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} color="var(--accent-cyan)" />
              App Brand & Logo
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="App Logo" 
                  style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', boxShadow: 'var(--shadow-md)' }} 
                />
              ) : (
                <div style={{ width: 68, height: 68, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-subtle)' }}>
                  <ImageIcon size={28} color="var(--text-dim)" />
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Upload High-Res Logo
              </div>
              <p style={{ fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                Used in Feature Graphics, Store Icons, and screenshot headers.
              </p>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <Upload size={13} />
                <span>{uploadingLogo ? 'Uploading...' : 'Choose PNG/SVG'}</span>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                  style={{ display: 'none' }} 
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Manual Screenshot Upload */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Layers size={18} color="var(--accent-purple)" />
            Add Existing Screenshots
          </h3>
          <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            Already have captured PNGs or simulator captures? Import them directly.
          </p>
          <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
            <Upload size={16} />
            <span>{uploadingScreens ? 'Uploading...' : 'Upload Screen Images (PNG/JPG)'}</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleScreenshotUpload}
              disabled={uploadingScreens}
            />
          </label>
        </div>
      </div>

      {/* Right Column: Emulator Automation Panel & Gallery */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel highlighted">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Smartphone size={22} color="var(--primary-light)" />
                Android & iOS Emulator Bridge
              </h2>
              <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Control local emulators, automate screenshot capture across all device resolutions, and stream into the Preview Studio.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={refreshEnv} title="Refresh device status">
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Device Controls Grid */}
          <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
            {/* Step 1: Start Emulator */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Step 1: Emulator
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {avds.length > 0 ? avds[0] : 'No AVD found'}
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ width: '100%' }}
                onClick={handleLaunchEmulator}
                disabled={emulatorActionLoading || isDeviceRunning}
              >
                <Play size={14} />
                <span>{isDeviceRunning ? 'Emulator Running' : 'Boot Emulator'}</span>
              </button>
            </div>

            {/* Step 2: Install APK & Launch */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Step 2: Deploy & Open
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {apkData?.appName || 'Upload APK first'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ flex: 1 }}
                  onClick={handleInstallApk}
                  disabled={emulatorActionLoading || !apkData}
                >
                  Install
                </button>
                <button 
                  className="btn btn-accent btn-sm" 
                  style={{ flex: 1 }}
                  onClick={handleLaunchApp}
                  disabled={emulatorActionLoading || !apkData}
                >
                  Launch
                </button>
              </div>
            </div>

            {/* Step 3: Screencap */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Step 3: Capture Screen
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Instant Grabber
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-emerald btn-sm" 
                  style={{ flex: 1 }}
                  onClick={() => handleCaptureScreen('android')}
                  disabled={emulatorActionLoading}
                  title="Capture current Android emulator frame"
                >
                  <Camera size={14} />
                  <span>Capture</span>
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleCaptureMultiDevice}
                  disabled={emulatorActionLoading}
                  title="Automatically capture Phone + 7-inch + 10-inch tablet set"
                >
                  <Tablet size={14} />
                  <span>Multi-Res</span>
                </button>
              </div>
            </div>
          </div>

          {/* Console / Status Log */}
          {emulatorLog && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(10, 14, 26, 0.9)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {emulatorLog}
            </div>
          )}
        </div>

        {/* Captured / Uploaded Screenshots Gallery */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--accent-cyan)" />
                Screenshots in Pipeline ({screenshots.length})
              </h3>
              <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                These screenshots will be analyzed by OpenAI and framed into App Store and Google Play assets.
              </p>
            </div>
            {screenshots.length > 0 && (
              <button className="btn btn-primary btn-sm" onClick={onProceedToAi}>
                <Sparkles size={14} />
                <span>Next: AI Copilot</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {screenshots.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
              <Smartphone size={40} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                No screenshots captured yet
              </div>
              <p style={{ fontSize: '0.85rem', maxWidth: 450, margin: '0 auto 1.25rem' }}>
                Launch the Android emulator and tap "Capture", upload screenshot files, or click "Load Demo" at the top to populate instantly!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {screenshots.map((screen, idx) => (
                <div 
                  key={screen.id || idx}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', paddingTop: '160%', background: '#0a0e1a', overflow: 'hidden' }}>
                    <img 
                      src={screen.url} 
                      alt={`Screen ${idx + 1}`} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>
                      #{idx + 1}
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {screen.headline || `Screen ${idx + 1}`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {screen.subtitle || 'Preview Screen'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
