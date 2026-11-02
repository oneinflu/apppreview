import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  Image as ImageIcon, 
  FileText, 
  Key, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Palette,
  Wand2,
  Lock,
  Unlock
} from 'lucide-react';

export default function AiCopilot({
  apiKey,
  setApiKey,
  apkData,
  screenshots,
  setScreenshots,
  customLogo,
  dalleBanner,
  setDalleBanner,
  metadataCopy,
  setMetadataCopy,
  onProceedToStudio
}) {
  const [showKey, setShowKey] = useState(false);
  const [analyzingVision, setAnalyzingVision] = useState(false);
  const [generatingDalle, setGeneratingDalle] = useState(false);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [promptCategory, setPromptCategory] = useState('modern_3d');
  const [customPrompt, setCustomPrompt] = useState('');
  const [statusLog, setStatusLog] = useState('');

  const isKeyPresent = Boolean(apiKey && apiKey.trim().length > 10);

  const promptStyles = {
    modern_3d: 'Modern 3D glassmorphism floating shapes, subtle ambient neon glow, sleek metallic accents, clean studio lighting, 8k resolution, cinematic depth of field, minimalist app promo background.',
    cyberpunk: 'Vibrant futuristic cybernetic gradient mesh, iridescent neon purple and cyan ribbons, soft atmospheric fog, hyper-premium tech visual.',
    emerald_fintech: 'Luxurious emerald and gold geometric glass crystals, clean abstract financial telemetry waves, soft dark studio background, ultra high-end aesthetic.',
    sunset_creative: 'Warm sunset coral and amber fluid silk ripples, elegant volumetric lighting, ultra-modern luxury app header art.'
  };

  // 1. Analyze Screens with GPT-4o Vision
  const handleAnalyzeVision = async () => {
    if (!isKeyPresent) {
      alert('Please enter your OpenAI API Key first.');
      return;
    }
    if (screenshots.length === 0) {
      alert('No screenshots to analyze. Please capture or upload screenshots first.');
      return;
    }

    setAnalyzingVision(true);
    setStatusLog('Analyzing screenshot UI layouts with GPT-4o Vision...');

    try {
      const res = await fetch('/api/ai/analyze-screens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          screenshots,
          appInfo: {
            appName: apkData?.appName || 'Mobile App',
            packageName: apkData?.packageName || ''
          }
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setScreenshots(prev => prev.map((screen, idx) => {
          const match = data.results[idx] || data.results.find(r => r.index === idx);
          if (match) {
            return {
              ...screen,
              headline: match.headline || screen.headline,
              subtitle: match.subtitle || screen.subtitle,
              badge: match.badge || screen.badge,
              accentColor: match.accentColor || screen.accentColor,
              gradientEnd: match.primaryColor || screen.gradientEnd,
              perspective: match.recommendedAngle || screen.perspective
            };
          }
          return screen;
        }));
        setStatusLog(`✅ Vision analysis complete! Updated ${data.results.length} screenshots with marketing copy and color themes.`);
      } else {
        setStatusLog(`❌ Vision analysis failed: ${data.error}`);
      }
    } catch (err) {
      setStatusLog(`❌ Vision request error: ${err.message}`);
    } finally {
      setAnalyzingVision(false);
    }
  };

  // 2. Generate DALL-E 3 Feature Graphic Background
  const handleGenerateDalle = async () => {
    if (!isKeyPresent) {
      alert('Please enter your OpenAI API Key first.');
      return;
    }

    setGeneratingDalle(true);
    setStatusLog('Generating high-resolution background art with DALL-E 3...');

    const prompt = customPrompt.trim() || promptStyles[promptCategory];

    try {
      const res = await fetch('/api/ai/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          appInfo: {
            appName: apkData?.appName || 'App',
            category: prompt,
            customPrompt: prompt
          }
        })
      });

      const data = await res.json();
      if (data.success && data.localUrl) {
        setDalleBanner(data.localUrl);
        setStatusLog('✅ DALL-E 3 promotional background generated! Available across Studio and Feature Graphic.');
      } else {
        setStatusLog(`❌ DALL-E 3 failed: ${data.error}`);
      }
    } catch (err) {
      setStatusLog(`❌ DALL-E request error: ${err.message}`);
    } finally {
      setGeneratingDalle(false);
    }
  };

  // 3. Generate Store Listing Copy
  const handleGenerateCopy = async () => {
    if (!isKeyPresent) {
      alert('Please enter your OpenAI API Key first.');
      return;
    }

    setGeneratingCopy(true);
    setStatusLog('Drafting compliant Google Play & App Store listing copy...');

    try {
      const res = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          appInfo: {
            appName: apkData?.appName || 'Mobile App',
            packageName: apkData?.packageName || 'com.app',
            features: screenshots.map(s => `${s.headline}: ${s.subtitle}`)
          }
        })
      });

      const data = await res.json();
      if (data.success && data.metadata) {
        setMetadataCopy(data.metadata);
        setStatusLog('✅ Store listing metadata generated! Short description, keywords, and full copy ready.');
      } else {
        setStatusLog(`❌ Copy generation failed: ${data.error}`);
      }
    } catch (err) {
      setStatusLog(`❌ Copy generation error: ${err.message}`);
    } finally {
      setGeneratingCopy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* OpenAI API Key Card */}
      <div className="glass-panel highlighted">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Key size={18} color="var(--primary-light)" />
              OpenAI API Key Configuration
            </h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Used directly to power GPT-4o Vision screen analysis, DALL-E 3 feature graphic generation, and App Store copywriting.
            </p>
          </div>
          <span className="store-pill-badge" style={{ background: isKeyPresent ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: isKeyPresent ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
            {isKeyPresent ? 'Key Configured' : 'Key Required'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type={showKey ? 'text' : 'password'}
              className="input-text"
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                localStorage.setItem('openai_api_key', e.target.value);
              }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', paddingRight: '2.5rem' }}
            />
            <button 
              type="button" 
              onClick={() => setShowKey(!showKey)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              {showKey ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (apiKey) localStorage.setItem('openai_api_key', apiKey);
              setStatusLog('API key saved locally in your browser.');
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* 3 AI Copilot Action Cards */}
      <div className="grid-3">
        {/* Card 1: GPT-4o Vision Screen Analyzer */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                <Eye size={20} />
              </div>
              <h4 style={{ fontSize: '1.05rem', margin: 0 }}>GPT-4o Vision Analyzer</h4>
            </div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Inspects your screenshots pixel-by-pixel to extract the core purpose, craft high-converting App Store headlines, subtitles, and extract brand color palettes.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--text-dim)' }}>Screens in Queue:</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {screenshots.length} Screenshot(s)
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={handleAnalyzeVision}
            disabled={analyzingVision || screenshots.length === 0}
            style={{ width: '100%' }}
          >
            {analyzingVision ? <RefreshCw className="spin" size={16} /> : <Wand2 size={16} />}
            <span>{analyzingVision ? 'Analyzing Screens...' : 'Analyze All Screens'}</span>
          </button>
        </div>

        {/* Card 2: DALL-E 3 Feature Graphic Art Generator */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <ImageIcon size={20} />
              </div>
              <h4 style={{ fontSize: '1.05rem', margin: 0 }}>DALL-E 3 Backdrop Art</h4>
            </div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Generates a tailored 3D promotional background for your Google Play Feature Graphic and search banners.
            </p>

            <div className="form-group">
              <label className="form-label">Art Preset</label>
              <select 
                className="select-input"
                value={promptCategory}
                onChange={e => setPromptCategory(e.target.value)}
              >
                <option value="modern_3d">Modern 3D Glassmorphism</option>
                <option value="cyberpunk">Cyberpunk Neon Ribbons</option>
                <option value="emerald_fintech">Emerald & Gold Fintech</option>
                <option value="sunset_creative">Sunset Coral Fluid Silk</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Prompt (Optional)</label>
              <input 
                type="text" 
                className="input-text" 
                placeholder="Leave blank to use preset..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <button 
            className="btn btn-accent"
            onClick={handleGenerateDalle}
            disabled={generatingDalle}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {generatingDalle ? <RefreshCw className="spin" size={16} /> : <Sparkles size={16} />}
            <span>{generatingDalle ? 'Generating Art...' : 'Generate 3D Art'}</span>
          </button>
        </div>

        {/* Card 3: Store Listing Copywriter */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
                <FileText size={20} />
              </div>
              <h4 style={{ fontSize: '1.05rem', margin: 0 }}>ASO Copywriter</h4>
            </div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Generates compliant Google Play descriptions (under 80 & 4000 chars) and Apple App Store promo copy & keyword strings.
            </p>

            {metadataCopy && (
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.2rem' }}>
                  ✓ Play Short Tagline:
                </div>
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  "{metadataCopy.playShortDescription}"
                </div>
              </div>
            )}
          </div>

          <button 
            className="btn btn-secondary"
            onClick={handleGenerateCopy}
            disabled={generatingCopy}
            style={{ width: '100%' }}
          >
            {generatingCopy ? <RefreshCw className="spin" size={16} /> : <FileText size={16} />}
            <span>{generatingCopy ? 'Generating Copy...' : 'Draft Store Listing'}</span>
          </button>
        </div>
      </div>

      {/* Generated DALL-E 3 Background Preview */}
      {dalleBanner && (
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--accent-cyan)" />
              Active AI Background Art
            </h4>
            <span className="store-pill-badge" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)' }}>
              Ready for Store Graphics
            </span>
          </div>
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 220, position: 'relative', border: '1px solid var(--border-subtle)' }}>
            <img 
              src={dalleBanner} 
              alt="DALL-E Generated Background" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>
      )}

      {/* Status Log & Next Step */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(10,14,26,0.8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          {statusLog || 'AI Copilot ready. Run Vision Analysis or proceed directly to the Canvas Studio.'}
        </div>
        <button className="btn btn-primary btn-sm" onClick={onProceedToStudio}>
          <span>Open Canvas Studio</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
