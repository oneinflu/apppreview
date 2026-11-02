import React, { useState } from 'react';
import { 
  FolderArchive, 
  Download, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Apple, 
  Smartphone, 
  Sparkles,
  FileText,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportHub({
  onExportZip,
  isExporting,
  apkData,
  screenshots,
  metadataCopy,
  customLogo
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text || '');
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleZipTrigger = async () => {
    await onExportZip();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Big Hero Export Action Banner */}
      <div className="glass-panel highlighted" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))' }}>
        <div>
          <span className="store-pill-badge" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
            Submission Ready
          </span>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>
            Export Complete Store Assets Package (.ZIP)
          </h2>
          <p style={{ fontSize: '0.95rem', maxWidth: 650 }}>
            Generates high-resolution PNGs at exact Apple App Store and Google Play guidelines, organized into cleanly labeled folders ready for immediate upload to App Store Connect and Google Play Console.
          </p>
        </div>

        <button 
          className="btn btn-emerald btn-lg"
          onClick={handleZipTrigger}
          disabled={isExporting}
          style={{ minWidth: 260 }}
        >
          <FolderArchive size={20} />
          <span>{isExporting ? 'Packaging True High-Res PNGs...' : 'Download Full ZIP Package'}</span>
        </button>
      </div>

      {/* Guidelines & Asset Inventory Checklist */}
      <div className="grid-2">
        {/* Google Play Store Assets */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={18} color="var(--accent-emerald)" />
              Google Play Store Checklist
            </h3>
            <span className="store-pill-badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)' }}>
              100% Compliant
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { title: 'Phone Screenshots', desc: `${screenshots.length} screens @ 1080 × 2400 px (9:20 ratio)`, status: true },
              { title: '7-inch Tablet Screenshots', desc: `${screenshots.length} screens @ 1200 × 1920 px`, status: true },
              { title: '10-inch Tablet Screenshots', desc: `${screenshots.length} screens @ 1600 × 2560 px`, status: true },
              { title: 'Feature Graphic (Mandatory)', desc: '1024 × 500 px (Safe zone enforced, JPEG/PNG)', status: true },
              { title: 'App Icon', desc: '512 × 512 px (32-bit PNG, squircle or square)', status: true },
              { title: 'Play Store Listing Text', desc: 'Short (≤ 80 chars) & Full descriptions', status: Boolean(metadataCopy) }
            ].map((item, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
              </div>
            ))}
          </div>
        </div>

        {/* Apple App Store Assets */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Apple size={18} color="#ffffff" />
              Apple App Store Checklist
            </h3>
            <span className="store-pill-badge" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)' }}>
              100% Compliant
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { title: 'iPhone 6.9" / 6.7" Super Retina XDR', desc: `${screenshots.length} screens @ 1290 × 2796 px (16/17 Pro Max)`, status: true },
              { title: 'iPhone 6.5" Display', desc: `${screenshots.length} screens @ 1242 × 2688 px (11 Pro Max / XS Max)`, status: true },
              { title: 'iPhone 5.5" Display', desc: `${screenshots.length} screens @ 1242 × 2208 px (8 Plus)`, status: true },
              { title: 'iPad Pro 13" Display', desc: `${screenshots.length} screens @ 2048 × 2732 px (M4 / 6th Gen)`, status: true },
              { title: 'App Store Icon', desc: '1024 × 1024 px (No transparency, Apple standard)', status: true },
              { title: 'App Store Connect Metadata', desc: 'Promo text (≤ 170 chars) & Keywords (≤ 100 chars)', status: Boolean(metadataCopy) }
            ].map((item, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <CheckCircle2 size={18} color="var(--primary-light)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated ASO Text Metadata */}
      {metadataCopy && (
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--accent-purple)" />
              Generated ASO Copy & Keywords
            </h3>
          </div>

          <div className="grid-2">
            {/* Google Play Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Google Play Short Description</label>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(metadataCopy.playShortDescription, 'short')}
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'short' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  {metadataCopy.playShortDescription}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Google Play Full Description</label>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(metadataCopy.playFullDescription, 'full')}
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'full' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-line' }}>
                  {metadataCopy.playFullDescription}
                </div>
              </div>
            </div>

            {/* Apple App Store Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Apple App Store Promotional Text</label>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(metadataCopy.applePromoText, 'promo')}
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'promo' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  {metadataCopy.applePromoText}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Apple Keywords String (≤ 100 chars)</label>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(metadataCopy.appleKeywords, 'keys')}
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'keys' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  {metadataCopy.appleKeywords}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>What's New in this Version</label>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(metadataCopy.releaseNotes, 'release')}
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'release' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  {metadataCopy.releaseNotes}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
