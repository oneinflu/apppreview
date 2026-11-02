import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Sparkles, 
  Palette, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Type
} from 'lucide-react';
import { renderFeatureGraphic, GRADIENT_PRESETS } from '../utils/canvasRenderer';

export default function FeatureGraphicEditor({
  apkData,
  customLogo,
  screenshots,
  dalleBanner
}) {
  const [appName, setAppName] = useState(apkData?.appName || 'NovaFit Pro');
  const [tagline, setTagline] = useState('Next-Generation AI Fitness & Performance Telemetry');
  const [badge, setBadge] = useState('FEATURED ON GOOGLE PLAY');
  const [gradientStart, setGradientStart] = useState('#0f172a');
  const [gradientEnd, setGradientEnd] = useState('#3b82f6');
  const [accentColor, setAccentColor] = useState('#38bdf8');
  const [useDalleBg, setUseDalleBg] = useState(Boolean(dalleBanner));
  const [selectedScreenIdx, setSelectedScreenIdx] = useState(0);

  const canvasRef = useRef(null);

  // Update app name if APK changes
  useEffect(() => {
    if (apkData?.appName) {
      setAppName(apkData.appName);
    }
  }, [apkData]);

  // Render Feature Graphic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isCancelled = false;

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

    const screenToUse = screenshots[selectedScreenIdx]?.url || null;

    Promise.all([
      loadImage(customLogo || apkData?.iconUrl),
      loadImage(screenToUse),
      loadImage(useDalleBg ? dalleBanner : null)
    ]).then(([logoImg, screenImg, bgImg]) => {
      if (isCancelled) return;

      renderFeatureGraphic(canvas, {
        appName,
        tagline,
        badge,
        logoImage: logoImg,
        screenImage: screenImg,
        bgImage: bgImg,
        gradientStart,
        gradientEnd,
        accentColor,
        textColor: '#ffffff'
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [appName, tagline, badge, gradientStart, gradientEnd, accentColor, useDalleBg, dalleBanner, customLogo, apkData, screenshots, selectedScreenIdx]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Google_Play_Feature_Graphic_1024x500.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Info */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ImageIcon size={22} color="var(--accent-cyan)" />
            Google Play Feature Graphic Studio (1024 × 500 px)
          </h2>
          <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
            A mandatory asset for Google Play Store featuring. Built with automated safe-zone margins and high-DPI rendering.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleDownload}>
          <Download size={14} />
          <span>Export 1024x500 PNG</span>
        </button>
      </div>

      <div className="grid-sidebar">
        {/* Left Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Content Controls */}
          <div className="glass-panel">
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Type size={16} color="var(--primary-light)" />
              Branding & Copy
            </h4>

            <div className="form-group">
              <label className="form-label">App Title</label>
              <input 
                type="text" 
                className="input-text" 
                value={appName} 
                onChange={e => setAppName(e.target.value)} 
                placeholder="App Name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hero Tagline</label>
              <textarea 
                className="textarea-input" 
                rows={2} 
                value={tagline} 
                onChange={e => setTagline(e.target.value)} 
                placeholder="High-converting tagline"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Promo Pill Badge</label>
              <input 
                type="text" 
                className="input-text" 
                value={badge} 
                onChange={e => setBadge(e.target.value)} 
                placeholder="FEATURED ON GOOGLE PLAY"
              />
            </div>

            {screenshots.length > 0 && (
              <div className="form-group">
                <label className="form-label">Device Mockup Screen</label>
                <select 
                  className="select-input"
                  value={selectedScreenIdx}
                  onChange={e => setSelectedScreenIdx(Number(e.target.value))}
                >
                  {screenshots.map((s, idx) => (
                    <option key={s.id || idx} value={idx}>
                      Screen #{idx + 1} - {s.headline || 'Feature'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Theme & AI Background */}
          <div className="glass-panel">
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Palette size={16} color="var(--accent-purple)" />
              Background Theme
            </h4>

            {dalleBanner && (
              <div style={{ marginBottom: '1rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${useDalleBg ? 'btn-accent' : 'btn-secondary'}`}
                  onClick={() => setUseDalleBg(!useDalleBg)}
                  style={{ width: '100%' }}
                >
                  <Sparkles size={14} />
                  <span>{useDalleBg ? 'Using DALL-E 3 Art' : 'Switch to DALL-E 3 Art'}</span>
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Gradients</label>
              <div className="color-swatch-row">
                {Object.entries(GRADIENT_PRESETS).map(([k, g]) => (
                  <button
                    key={k}
                    type="button"
                    className="swatch-btn"
                    title={g.name}
                    style={{
                      background: `linear-gradient(135deg, ${g.start}, ${g.end})`,
                      boxShadow: gradientEnd === g.end ? '0 0 10px #ffffff' : 'none'
                    }}
                    onClick={() => {
                      setGradientStart(g.start);
                      setGradientEnd(g.end);
                      setAccentColor(g.accent);
                      setUseDalleBg(false);
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: 2 }}>Start</label>
                <input 
                  type="color" 
                  value={gradientStart}
                  onChange={e => { setGradientStart(e.target.value); setUseDalleBg(false); }}
                  style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: 'none', background: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: 2 }}>End</label>
                <input 
                  type="color" 
                  value={gradientEnd}
                  onChange={e => { setGradientEnd(e.target.value); setUseDalleBg(false); }}
                  style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: 'none', background: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: 2 }}>Accent</label>
                <input 
                  type="color" 
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: 'none', background: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Compliance Checklist Box */}
          <div className="glass-panel" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={16} />
              Google Play Guidelines Compliance
            </h4>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li>Exact dimension: 1024 px width by 500 px height</li>
              <li>24-bit PNG / JPEG without transparency</li>
              <li>Core branding positioned inside the 15% safe boundary</li>
              <li>No pricing info or store badges that violate store policies</li>
            </ul>
          </div>
        </div>

        {/* Right Canvas Preview */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 7, 12, 0.95)', minHeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            <span>Exact Google Play Store Ratio</span>
            <span>•</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>1024 × 500 px</span>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '860px',
            boxShadow: 'var(--shadow-glow-cyan)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <canvas 
              ref={canvasRef}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-lg)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
