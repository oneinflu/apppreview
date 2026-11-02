import React from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Layers, 
  Image as ImageIcon, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Apple, 
  Key,
  FolderArchive
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  envStatus, 
  apiKey, 
  setApiKeyModalOpen, 
  onExportZip, 
  isExporting,
  onLoadDemo
}) {
  const hasAdb = envStatus?.adbFound;
  const runningDevs = envStatus?.runningAndroidDevices || [];
  const hasRunningDevice = runningDevs.some(d => d.state === 'device');
  const hasIosSim = envStatus?.iosSimctlFound;
  const isKeySet = Boolean(apiKey && apiKey.trim().length > 10);

  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="brand-logo-badge">
          <Smartphone size={22} />
        </div>
        <div>
          <div className="brand-title">
            AppStore Studio <span className="badge-pro">PRO</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
            APK Emulator Automation & AI Preview Suite
          </p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="tabs-navigation">
        <button 
          className={`tab-btn ${activeTab === 'hub' ? 'active' : ''}`}
          onClick={() => setActiveTab('hub')}
        >
          <Smartphone size={16} />
          <span>APK & Emulator</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Sparkles size={16} />
          <span>AI Copilot</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Layers size={16} />
          <span>Canvas Studio</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'feature' ? 'active' : ''}`}
          onClick={() => setActiveTab('feature')}
        >
          <ImageIcon size={16} />
          <span>Feature Graphic (1024x500)</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <Download size={16} />
          <span>Export & Guidelines</span>
        </button>
      </nav>

      {/* Indicators and Actions */}
      <div className="nav-indicators">
        {/* ADB & Emulator Status */}
        <div 
          className="status-pill" 
          title={hasRunningDevice ? `Active Android Device: ${runningDevs[0]?.id}` : 'Android Emulator not booted yet'}
        >
          <Cpu size={14} color={hasRunningDevice ? 'var(--accent-emerald)' : 'var(--text-dim)'} />
          <span>{hasRunningDevice ? 'ADB Active' : hasAdb ? 'ADB Ready' : 'ADB Off'}</span>
          <span className={`status-dot ${hasRunningDevice ? 'active' : hasAdb ? 'warning' : ''}`} />
        </div>

        {/* iOS Simulator Status */}
        <div className="status-pill" title={hasIosSim ? 'Apple xcrun simctl detected on Mac' : 'iOS Simctl not detected'}>
          <Apple size={14} color={hasIosSim ? '#ffffff' : 'var(--text-dim)'} />
          <span>{hasIosSim ? 'iOS Sim Ready' : 'iOS Sim Off'}</span>
          <span className={`status-dot ${hasIosSim ? 'active' : ''}`} />
        </div>

        {/* OpenAI Key */}
        <button 
          className={`status-pill ${isKeySet ? '' : 'warning'}`}
          onClick={() => setApiKeyModalOpen(true)}
          style={{ cursor: 'pointer', background: isKeySet ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)' }}
        >
          <Key size={14} color={isKeySet ? 'var(--primary-light)' : 'var(--accent-amber)'} />
          <span>{isKeySet ? 'OpenAI Active' : 'Set API Key'}</span>
          <span className={`status-dot ${isKeySet ? 'active' : 'warning'}`} />
        </button>

        {/* Sample Demo Button */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onLoadDemo}
          title="Load pre-built fitness demo app with screenshots and copy for quick testing"
        >
          <Sparkles size={14} />
          <span>Load Demo</span>
        </button>

        {/* Export ZIP */}
        <button 
          className="btn btn-emerald btn-sm"
          onClick={onExportZip}
          disabled={isExporting}
        >
          <FolderArchive size={15} />
          <span>{isExporting ? 'Packaging...' : 'Export ZIP'}</span>
        </button>
      </div>
    </header>
  );
}
