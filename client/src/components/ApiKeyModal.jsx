import React, { useState } from 'react';
import { Key, Lock, Unlock, X, CheckCircle2 } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey.trim());
    localStorage.setItem('openai_api_key', tempKey.trim());
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 480, position: 'relative', boxShadow: 'var(--shadow-glow)' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
            <Key size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>OpenAI API Key</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
              Stored locally in your browser session
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
          Enter your OpenAI API key to enable GPT-4o Vision screen understanding, DALL-E 3 background art generation, and App Store ASO copy generation.
        </p>

        <div className="form-group">
          <label className="form-label">API Key</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showKey ? 'text' : 'password'}
              className="input-text"
              placeholder="sk-proj-..."
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', paddingRight: '2.5rem' }}
            />
            <button 
              type="button" 
              onClick={() => setShowKey(!showKey)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              {showKey ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
