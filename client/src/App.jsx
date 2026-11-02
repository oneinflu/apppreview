import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AppEmulatorHub from './components/AppEmulatorHub';
import AiCopilot from './components/AiCopilot';
import CanvasStudio from './components/CanvasStudio';
import FeatureGraphicEditor from './components/FeatureGraphicEditor';
import ExportHub from './components/ExportHub';
import ApiKeyModal from './components/ApiKeyModal';

import { 
  STORE_PRESETS, 
  renderScreenshotCanvas, 
  renderFeatureGraphic, 
  renderAppIcon 
} from './utils/canvasRenderer';

export default function App() {
  const [activeTab, setActiveTab] = useState('hub');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState(null);

  // App & Asset states
  const [apkData, setApkData] = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [dalleBanner, setDalleBanner] = useState(null);
  const [metadataCopy, setMetadataCopy] = useState(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Fetch environment status on mount
  const refreshEnv = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.success) {
        setEnvStatus(data.env);
      }
    } catch (err) {
      console.warn('Could not fetch status:', err);
    }
  };

  useEffect(() => {
    refreshEnv();
  }, []);

  // Load Demo App & Screenshots
  const handleLoadDemo = async () => {
    try {
      const res = await fetch('/api/sample-demo');
      const demo = await res.json();
      setApkData({
        appName: demo.appName,
        packageName: demo.packageName,
        versionName: demo.versionName,
        versionCode: demo.versionCode,
        targetSdkVersion: '34'
      });
      setScreenshots(demo.screens);
      setMetadataCopy({
        playShortDescription: 'AI-powered realtime GPS fitness telemetry, smart nutrition & community racing.',
        playFullDescription: `Elevate your training with NovaFit Pro. Engineered for elite endurance athletes, runners, and fitness enthusiasts.

FEATURES:
• Realtime GPS route tracking with pacing & cadence telemetry
• AI Camera Food Scanner: instant macros powered by Vision
• Heart rate zone analytics & recovery readiness score
• Global arena leaderboards and local challenges`,
        applePromoText: 'Experience elite biometric running and fitness telemetry powered by next-gen AI.',
        appleKeywords: 'running,gps,workout,fitness,nutrition,tracker,marathon,pace,strava,health',
        releaseNotes: 'Version 2.4.0 brings ultra-crisp GPS route mapping, Apple Watch companion sync, and instant camera macro recognition.'
      });
      setActiveTab('studio');
    } catch (err) {
      console.error('Failed to load demo:', err);
    }
  };

  // Batch Canvas Renderer for full ZIP package
  const handleExportZip = async () => {
    if (screenshots.length === 0) {
      alert('Please capture or upload at least one screenshot before exporting.');
      return;
    }

    setIsExporting(true);

    try {
      const offscreenCanvas = document.createElement('canvas');

      const loadImage = (src) => {
        return new Promise((resolve) => {
          if (!src) return resolve(null);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      };

      const logoImg = await loadImage(customLogo || apkData?.iconUrl);
      const dalleImg = await loadImage(dalleBanner);

      // Helper to render screens for a specific preset
      const renderScreenBatch = async (presetConfig) => {
        const batch = [];
        for (let i = 0; i < screenshots.length; i++) {
          const s = screenshots[i];
          const screenImg = await loadImage(s.url);
          const bgImg = s.useDalleBg ? dalleImg : null;

          await renderScreenshotCanvas(offscreenCanvas, {
            width: presetConfig.width,
            height: presetConfig.height,
            screenImage: screenImg,
            logoImage: s.showLogo !== false ? logoImg : null,
            bgImage: bgImg,
            headline: s.headline || `Screen ${i + 1}`,
            subtitle: s.subtitle || '',
            badge: s.badge || 'PRO',
            gradientStart: s.gradientStart || '#0f172a',
            gradientEnd: s.gradientEnd || '#1e1b4b',
            accentColor: s.accentColor || '#6366f1',
            textColor: s.textColor || '#ffffff',
            frameStyle: s.frameStyle || (presetConfig.platform === 'ios' ? 'iphone17' : 'android_flagship'),
            perspective: s.perspective || 'flat',
            showBadge: s.showBadge !== false,
            showLogo: s.showLogo !== false,
            textPosition: s.textPosition || 'top'
          });

          batch.push({
            name: `screen_${i + 1}_${(s.headline || 'feature').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            dataUrl: offscreenCanvas.toDataURL('image/png')
          });
        }
        return batch;
      };

      // 1. Google Play Phone (1080 x 2400)
      const playPhone = await renderScreenBatch(STORE_PRESETS.play_phone);

      // 2. Google Play Tablet 7" (1200 x 1920)
      const playTablet7 = await renderScreenBatch(STORE_PRESETS.play_tablet_7);

      // 3. Google Play Tablet 10" (1600 x 2560)
      const playTablet10 = await renderScreenBatch(STORE_PRESETS.play_tablet_10);

      // 4. Apple iPhone 6.9" / 6.7" (1290 x 2796)
      const appleIphone69 = await renderScreenBatch(STORE_PRESETS.apple_iphone_69);

      // 5. Apple iPhone 6.5" (1242 x 2688)
      const appleIphone65 = await renderScreenBatch(STORE_PRESETS.apple_iphone_65);

      // 6. Apple iPhone 5.5" (1242 x 2208)
      const appleIphone55 = await renderScreenBatch(STORE_PRESETS.apple_iphone_55);

      // 7. Apple iPad Pro 13" (2048 x 2732)
      const appleIpad13 = await renderScreenBatch(STORE_PRESETS.apple_ipad_13);

      // 8. Google Play Feature Graphic (1024 x 500)
      const firstScreenImg = await loadImage(screenshots[0]?.url);
      await renderFeatureGraphic(offscreenCanvas, {
        appName: apkData?.appName || 'My App',
        tagline: metadataCopy?.playShortDescription || 'The Next Generation Mobile Experience',
        badge: 'FEATURED ON GOOGLE PLAY',
        logoImage: logoImg,
        screenImage: firstScreenImg,
        bgImage: dalleImg,
        gradientStart: '#0f172a',
        gradientEnd: '#3b82f6',
        accentColor: '#38bdf8'
      });
      const featureGraphicDataUrl = offscreenCanvas.toDataURL('image/png');

      // 9. Play Icon (512 x 512)
      await renderAppIcon(offscreenCanvas, {
        size: 512,
        logoImage: logoImg,
        appName: apkData?.appName || 'A',
        bgColor: '#6366f1',
        isApple: false
      });
      const playIconDataUrl = offscreenCanvas.toDataURL('image/png');

      // 10. Apple App Store Icon (1024 x 1024)
      await renderAppIcon(offscreenCanvas, {
        size: 1024,
        logoImage: logoImg,
        appName: apkData?.appName || 'A',
        bgColor: '#6366f1',
        isApple: true
      });
      const appleIconDataUrl = offscreenCanvas.toDataURL('image/png');

      // Send to server ZIP endpoint
      const payload = {
        googlePlayPhone: playPhone,
        googlePlayTablet7: playTablet7,
        googlePlayTablet10: playTablet10,
        featureGraphic: featureGraphicDataUrl,
        playIcon: playIconDataUrl,
        appStoreIphone69: appleIphone69,
        appStoreIphone65: appleIphone65,
        appStoreIphone55: appleIphone55,
        appStoreIpad13: appleIpad13,
        appleIcon: appleIconDataUrl,
        metadata: {
          appName: apkData?.appName || 'App',
          packageName: apkData?.packageName || 'com.app',
          ...(metadataCopy || {})
        }
      };

      const res = await fetch('/api/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Export failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${(apkData?.appName || 'Store_Assets').replace(/[^a-zA-Z0-9_-]/g, '_')}_Store_Package.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (err) {
      alert(`ZIP export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        envStatus={envStatus}
        apiKey={apiKey}
        setApiKeyModalOpen={setApiKeyModalOpen}
        onExportZip={handleExportZip}
        isExporting={isExporting}
        onLoadDemo={handleLoadDemo}
      />

      <main className="main-content">
        {activeTab === 'hub' && (
          <AppEmulatorHub 
            apkData={apkData}
            setApkData={setApkData}
            customLogo={customLogo}
            setCustomLogo={setCustomLogo}
            screenshots={screenshots}
            setScreenshots={setScreenshots}
            envStatus={envStatus}
            refreshEnv={refreshEnv}
            onProceedToAi={() => setActiveTab('ai')}
          />
        )}

        {activeTab === 'ai' && (
          <AiCopilot 
            apiKey={apiKey}
            setApiKey={setApiKey}
            apkData={apkData}
            screenshots={screenshots}
            setScreenshots={setScreenshots}
            customLogo={customLogo}
            dalleBanner={dalleBanner}
            setDalleBanner={setDalleBanner}
            metadataCopy={metadataCopy}
            setMetadataCopy={setMetadataCopy}
            onProceedToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'studio' && (
          <CanvasStudio 
            screenshots={screenshots}
            setScreenshots={setScreenshots}
            apkData={apkData}
            customLogo={customLogo}
            dalleBanner={dalleBanner}
          />
        )}

        {activeTab === 'feature' && (
          <FeatureGraphicEditor 
            apkData={apkData}
            customLogo={customLogo}
            screenshots={screenshots}
            dalleBanner={dalleBanner}
          />
        )}

        {activeTab === 'export' && (
          <ExportHub 
            onExportZip={handleExportZip}
            isExporting={isExporting}
            apkData={apkData}
            screenshots={screenshots}
            metadataCopy={metadataCopy}
            customLogo={customLogo}
          />
        )}
      </main>

      {/* Global API Key Configuration Modal */}
      <ApiKeyModal 
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </div>
  );
}
