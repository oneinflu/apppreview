import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  Smartphone, 
  Tablet, 
  Download, 
  Palette, 
  Sliders, 
  Type, 
  Sparkles, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';
import { STORE_PRESETS, GRADIENT_PRESETS, renderScreenshotCanvas } from '../utils/canvasRenderer';

export default function CanvasStudio({
  screenshots,
  setScreenshots,
  apkData,
  customLogo,
  dalleBanner
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [targetPresetKey, setTargetPresetKey] = useState('apple_iphone_69');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const canvasRef = useRef(null);

  const currentScreen = screenshots[selectedIdx] || {
    headline: 'EXPLORE ALL FEATURES',
    subtitle: 'Streamlined design engineered for performance.',
    badge: 'FEATURED',
    gradientStart: '#0f172a',
    gradientEnd: '#312e81',
    accentColor: '#6366f1',
    textColor: '#ffffff',
    frameStyle: 'iphone17',
    perspective: 'flat',
    showBadge: true,
    showLogo: true,
    textPosition: 'top',
    useDalleBg: false
  };

  const preset = STORE_PRESETS[targetPresetKey] || STORE_PRESETS.apple_iphone_69;

  // Update current screen attributes
  const updateCurrentScreen = (fields) => {
    setScreenshots(prev => {
      const updated = [...prev];
      if (updated[selectedIdx]) {
        updated[selectedIdx] = { ...updated[selectedIdx], ...fields };
      } else {
        updated[selectedIdx] = { ...currentScreen, ...fields };
      }
      return updated;
    });
  };

  // Apply styling to all screens
  const applyStyleToAll = () => {
    setScreenshots(prev => prev.map(s => ({
      ...s,
      gradientStart: currentScreen.gradientStart,
      gradientEnd: currentScreen.gradientEnd,
      accentColor: currentScreen.accentColor,
      textColor: currentScreen.textColor,
      frameStyle: currentScreen.frameStyle,
      showBadge: currentScreen.showBadge,
      showLogo: currentScreen.showLogo,
      textPosition: currentScreen.textPosition,
      useDalleBg: currentScreen.useDalleBg
    })));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Re-render canvas whenever screen attributes, preset, or assets change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isCancelled = false;

    // Load assets
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

    Promise.all([
      loadImage(currentScreen.url),
      loadImage(currentScreen.showLogo ? (customLogo || apkData?.iconUrl) : null),
      loadImage(currentScreen.useDalleBg ? dalleBanner : null)
    ]).then(([screenImg, logoImg, bgImg]) => {
      if (isCancelled) return;

      renderScreenshotCanvas(canvas, {
        width: preset.width,
        height: preset.height,
        screenImage: screenImg,
        logoImage: logoImg,
        bgImage: bgImg,
        headline: currentScreen.headline || 'APP FEATURE PREVIEW',
        subtitle: currentScreen.subtitle || 'Built with exceptional craft and speed.',
        badge: currentScreen.badge || 'PRO',
        gradientStart: currentScreen.gradientStart || '#0f172a',
        gradientEnd: currentScreen.gradientEnd || '#1e1b4b',
        accentColor: currentScreen.accentColor || '#6366f1',
        textColor: currentScreen.textColor || '#ffffff',
        frameStyle: currentScreen.frameStyle || (preset.platform === 'ios' ? 'iphone17' : 'android_flagship'),
        perspective: currentScreen.perspective || 'flat',
        showBadge: currentScreen.showBadge !== false,
        showLogo: currentScreen.showLogo !== false,
        textPosition: currentScreen.textPosition || 'top'
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [currentScreen, preset, customLogo, apkData, dalleBanner]);

  // Download individual canvas PNG
  const handleDownloadSingle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${targetPresetKey}_screen_${selectedIdx + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Strip: Preset Switcher & Screen Thumbnail Ribbon */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Preset Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Target Preset:
            </span>
            <select 
              className="select-input"
              value={targetPresetKey}
              onChange={e => setTargetPresetKey(e.target.value)}
              style={{ width: 'auto', minWidth: 260 }}
            >
              <optgroup label="Apple App Store">
                <option value="apple_iphone_69">iPhone 6.9" / 6.7" (1290 x 2796)</option>
                <option value="apple_iphone_65">iPhone 6.5" (1242 x 2688)</option>
                <option value="apple_iphone_55">iPhone 5.5" (1242 x 2208)</option>
                <option value="apple_ipad_13">iPad Pro 13" (2048 x 2732)</option>
              </optgroup>
              <optgroup label="Google Play Store">
                <option value="play_phone">Google Play Phone (1080 x 2400)</option>
                <option value="play_tablet_7">Play 7" Tablet (1200 x 1920)</option>
                <option value="play_tablet_10">Play 10" Tablet (1600 x 2560)</option>
              </optgroup>
            </select>
          </div>

          {/* Screen Ribbon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', maxWidth: 650 }}>
            {screenshots.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: selectedIdx === idx ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: selectedIdx === idx ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                  color: selectedIdx === idx ? '#ffffff' : 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <span>Screen #{idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={applyStyleToAll}
              title="Copy current colors and frame styling to all screens"
            >
              <Copy size={13} />
              <span>{copiedNotification ? 'Theme Applied!' : 'Apply Style to All'}</span>
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleDownloadSingle}
            >
              <Download size={14} />
              <span>Export PNG ({preset.width}x{preset.height})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Area: Controls Inspector on Left, Live Canvas on Right */}
      <div className="grid-sidebar">
        {/* Left Inspector Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Typography Controls */}
          <div className="glass-panel">
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Type size={16} color="var(--primary-light)" />
              Text & Headings
            </h4>

            <div className="form-group">
              <label className="form-label">
                Marketing Headline
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {(currentScreen.headline || '').length}/32 chars
                </span>
              </label>
              <input 
                type="text"
                className="input-text"
                value={currentScreen.headline || ''}
                onChange={e => updateCurrentScreen({ headline: e.target.value })}
                placeholder="e.g. CRUSH YOUR RUNS"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Secondary Subtitle
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {(currentScreen.subtitle || '').length}/65 chars
                </span>
              </label>
              <textarea 
                className="textarea-input"
                rows={2}
                value={currentScreen.subtitle || ''}
                onChange={e => updateCurrentScreen({ subtitle: e.target.value })}
                placeholder="e.g. Live telemetry and heart rate monitoring."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pill Badge Text</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text"
                  className="input-text"
                  value={currentScreen.badge || ''}
                  onChange={e => updateCurrentScreen({ badge: e.target.value })}
                  placeholder="e.g. ⚡ REALTIME GPS"
                  style={{ flex: 1 }}
                />
                <button
                  className={`btn btn-sm ${currentScreen.showBadge !== false ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => updateCurrentScreen({ showBadge: currentScreen.showBadge === false })}
                  type="button"
                >
                  {currentScreen.showBadge !== false ? 'Shown' : 'Hidden'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Show App Logo</span>
              <button
                className={`btn btn-sm ${currentScreen.showLogo !== false ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updateCurrentScreen({ showLogo: currentScreen.showLogo === false })}
                type="button"
              >
                {currentScreen.showLogo !== false ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Device Frame & 3D Angle */}
          <div className="glass-panel">
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Smartphone size={16} color="var(--accent-cyan)" />
              Device Frame & Perspective
            </h4>

            <div className="form-group">
              <label className="form-label">Device Bezel</label>
              <select 
                className="select-input"
                value={currentScreen.frameStyle || 'iphone17'}
                onChange={e => updateCurrentScreen({ frameStyle: e.target.value })}
              >
                <option value="iphone17">iPhone 17 Pro Max Titanium (Dynamic Island)</option>
                <option value="android_flagship">Modern Android Flagship (Punch-Hole)</option>
                <option value="tablet">iPad / Android Tablet Bezel</option>
                <option value="frameless">Minimal Frameless Card</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">3D Perspective Tilt</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                {['flat', 'tilt-left', 'tilt-right', 'floating'].map(angle => (
                  <button
                    key={angle}
                    type="button"
                    className={`btn btn-sm ${currentScreen.perspective === angle ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateCurrentScreen({ perspective: angle })}
                    style={{ fontSize: '0.725rem', padding: '0.4rem 0.2rem', textTransform: 'capitalize' }}
                  >
                    {angle.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Text Position</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {['top', 'bottom'].map(pos => (
                  <button
                    key={pos}
                    type="button"
                    className={`btn btn-sm ${currentScreen.textPosition === pos ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateCurrentScreen({ textPosition: pos })}
                    style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Palettes & Backgrounds */}
          <div className="glass-panel">
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Palette size={16} color="var(--accent-purple)" />
              Gradient & Background
            </h4>

            {dalleBanner && (
              <div style={{ marginBottom: '1rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${currentScreen.useDalleBg ? 'btn-accent' : 'btn-secondary'}`}
                  onClick={() => updateCurrentScreen({ useDalleBg: !currentScreen.useDalleBg })}
                  style={{ width: '100%' }}
                >
                  <Sparkles size={14} />
                  <span>{currentScreen.useDalleBg ? 'Using AI DALL-E Art' : 'Use AI DALL-E Backdrop'}</span>
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Theme Presets</label>
              <div className="color-swatch-row">
                {Object.entries(GRADIENT_PRESETS).map(([k, g]) => (
                  <button
                    key={k}
                    type="button"
                    className="swatch-btn"
                    title={g.name}
                    style={{
                      background: `linear-gradient(135deg, ${g.start}, ${g.end})`,
                      boxShadow: currentScreen.gradientEnd === g.end ? '0 0 10px #ffffff' : 'none'
                    }}
                    onClick={() => updateCurrentScreen({
                      gradientStart: g.start,
                      gradientEnd: g.end,
                      accentColor: g.accent,
                      useDalleBg: false
                    })}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: 2 }}>Start</label>
                <input 
                  type="color" 
                  value={currentScreen.gradientStart || '#0f172a'}
                  onChange={e => updateCurrentScreen({ gradientStart: e.target.value, useDalleBg: false })}
                  style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: 'none', background: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: 2 }}>End</label>
                <input 
                  type="color" 
                  value={currentScreen.gradientEnd || '#1e1b4b'}
                  onChange={e => updateCurrentScreen({ gradientEnd: e.target.value, useDalleBg: false })}
                  style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: 'none', background: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: 2 }}>Accent</label>
                <input 
                  type="color" 
                  value={currentScreen.accentColor || '#6366f1'}
                  onChange={e => updateCurrentScreen({ accentColor: e.target.value })}
                  style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: 'none', background: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Canvas Stage: True Store Dimension Render */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 7, 12, 0.95)', minHeight: 700, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            <span>Live Output Preview</span>
            <span>•</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{preset.width} × {preset.height} px</span>
            <span>•</span>
            <span>Store Guideline Compliant</span>
          </div>

          {/* Interactive Screen Container */}
          <div style={{
            position: 'relative',
            maxHeight: '660px',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <canvas 
              ref={canvasRef}
              style={{
                display: 'block',
                maxHeight: '660px',
                width: 'auto',
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)'
              }}
            />
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedIdx(prev => Math.max(0, prev - 1))}
              disabled={selectedIdx === 0}
            >
              <ChevronLeft size={14} />
              <span>Previous Screen</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedIdx(prev => Math.min(screenshots.length - 1, prev + 1))}
              disabled={selectedIdx >= screenshots.length - 1}
            >
              <span>Next Screen</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
