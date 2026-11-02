/**
 * High-Resolution Canvas Renderer for App Store & Google Play Graphics
 */

export const STORE_PRESETS = {
  // Google Play
  play_phone: { name: 'Google Play Phone', width: 1080, height: 2400, platform: 'android', type: 'phone' },
  play_tablet_7: { name: 'Google Play 7" Tablet', width: 1200, height: 1920, platform: 'android', type: 'tablet_7' },
  play_tablet_10: { name: 'Google Play 10" Tablet', width: 1600, height: 2560, platform: 'android', type: 'tablet_10' },
  play_feature: { name: 'Google Play Feature Graphic', width: 1024, height: 500, platform: 'android', type: 'feature_graphic' },
  play_icon: { name: 'Google Play App Icon', width: 512, height: 512, platform: 'android', type: 'icon' },

  // Apple App Store
  apple_iphone_69: { name: 'iPhone 6.9" / 6.7" (16/17 Pro Max)', width: 1290, height: 2796, platform: 'ios', type: 'phone' },
  apple_iphone_65: { name: 'iPhone 6.5" (XS Max / 11 Pro Max)', width: 1242, height: 2688, platform: 'ios', type: 'phone' },
  apple_iphone_55: { name: 'iPhone 5.5" (8 Plus)', width: 1242, height: 2208, platform: 'ios', type: 'phone' },
  apple_ipad_13: { name: 'iPad Pro 13" (M4 / 6th Gen)', width: 2048, height: 2732, platform: 'ios', type: 'tablet' },
  apple_icon: { name: 'Apple App Store Icon', width: 1024, height: 1024, platform: 'ios', type: 'icon' },
  apple_promo: { name: 'App Store Promo / Search Banner', width: 1920, height: 1080, platform: 'ios', type: 'banner' }
};

export const GRADIENT_PRESETS = {
  midnight_nebula: {
    name: 'Midnight Nebula',
    start: '#0a0e1a',
    end: '#1e1b4b',
    accent: '#6366f1'
  },
  cyberpunk_glow: {
    name: 'Cyberpunk Glow',
    start: '#180828',
    end: '#4c1d95',
    accent: '#a855f7'
  },
  emerald_aurora: {
    name: 'Emerald Aurora',
    start: '#022c22',
    end: '#064e3b',
    accent: '#10b981'
  },
  sunset_blaze: {
    name: 'Sunset Blaze',
    start: '#431407',
    end: '#9a3412',
    accent: '#f97316'
  },
  deep_ocean: {
    name: 'Deep Ocean',
    start: '#082f49',
    end: '#0f172a',
    accent: '#0284c7'
  },
  clean_minimal: {
    name: 'Clean Light',
    start: '#f8fafc',
    end: '#e2e8f0',
    accent: '#6366f1'
  }
};

/**
 * Helper to wrap text cleanly on canvas
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, align = 'center') {
  const words = (text || '').split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  lines.forEach((l, index) => {
    ctx.textAlign = align;
    ctx.fillText(l.trim(), x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

/**
 * Helper to draw rounded rectangle
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Render a complete screenshot preview onto a high-DPI canvas
 */
export async function renderScreenshotCanvas(canvas, config) {
  const {
    width,
    height,
    screenImage, // HTMLImageElement or null
    logoImage,   // HTMLImageElement or null
    bgImage,     // HTMLImageElement or null (e.g. DALL-E)
    headline = 'PREVIEW HEADLINE',
    subtitle = 'Engaging feature description for the store',
    badge = 'FEATURED',
    gradientStart = '#0f172a',
    gradientEnd = '#312e81',
    accentColor = '#6366f1',
    textColor = '#ffffff',
    frameStyle = 'iphone17', // 'iphone17' | 'android_flagship' | 'tablet' | 'frameless'
    perspective = 'flat',    // 'flat' | 'tilt-left' | 'tilt-right' | 'floating'
    showBadge = true,
    showLogo = true,
    textPosition = 'top'     // 'top' | 'bottom'
  } = config;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Background
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, width, height);
    // Add subtle dark gradient overlay for legibility
    const dimGrad = ctx.createLinearGradient(0, 0, 0, height);
    dimGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
    dimGrad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    dimGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = dimGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Rich Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width * 0.8, height);
    bgGrad.addColorStop(0, gradientStart);
    bgGrad.addColorStop(1, gradientEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative ambient glow orbs
    const glow1 = ctx.createRadialGradient(width * 0.2, height * 0.2, 50, width * 0.2, height * 0.2, width * 0.6);
    glow1.addColorStop(0, `${accentColor}33`);
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width * 0.8, height * 0.8, 50, width * 0.8, height * 0.8, width * 0.7);
    glow2.addColorStop(0, `${accentColor}22`);
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Text Content (Headline, Subtitle, Badge, Logo)
  ctx.save();
  const contentWidth = width * 0.88;
  const centerX = width / 2;
  const isTop = textPosition === 'top';
  let textY = isTop ? height * 0.08 : height * 0.72;

  // Optional App Logo in Header
  if (showLogo && logoImage) {
    const logoSize = Math.round(width * 0.09);
    const logoX = centerX - logoSize / 2;
    const logoY = textY;

    // Draw shadow
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;

    // Draw rounded squircle logo
    drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, logoSize * 0.24);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    textY += logoSize + height * 0.02;
  }

  // Pill Badge
  if (showBadge && badge) {
    ctx.font = `800 ${Math.round(width * 0.03)}px 'Outfit', sans-serif`;
    const badgeMetrics = ctx.measureText(badge.toUpperCase());
    const badgeW = badgeMetrics.width + width * 0.06;
    const badgeH = width * 0.065;
    const badgeX = centerX - badgeW / 2;
    const badgeY = textY;

    // Badge background
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.fillStyle = `${accentColor}35`;
    ctx.fill();
    ctx.strokeStyle = `${accentColor}80`;
    ctx.lineWidth = Math.max(2, width * 0.002);
    ctx.stroke();

    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge.toUpperCase(), centerX, badgeY + badgeH / 2);

    textY += badgeH + height * 0.025;
  }

  // Main Headline
  ctx.fillStyle = textColor;
  ctx.font = `900 ${Math.round(width * 0.065)}px 'Outfit', sans-serif`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 4;
  const headlineHeight = wrapText(ctx, headline.toUpperCase(), centerX, textY, contentWidth, width * 0.078);
  textY += headlineHeight + height * 0.015;

  // Subtitle
  ctx.font = `500 ${Math.round(width * 0.034)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  wrapText(ctx, subtitle, centerX, textY, contentWidth * 0.95, width * 0.046);

  ctx.restore();

  // 3. Device Mockup Frame & Screen Capture
  const mockupW = width * 0.76;
  const mockupH = height * 0.65;
  const mockupX = (width - mockupW) / 2;
  const mockupY = isTop ? height * 0.36 : height * 0.05;

  ctx.save();

  // Perspective / Tilt transformations
  if (perspective === 'tilt-left') {
    ctx.translate(width * 0.08, 0);
    ctx.transform(0.96, 0.06, -0.04, 0.98, 0, 0);
  } else if (perspective === 'tilt-right') {
    ctx.translate(-width * 0.08, 0);
    ctx.transform(0.96, -0.06, 0.04, 0.98, 0, 0);
  } else if (perspective === 'floating') {
    ctx.translate(0, -height * 0.02);
  }

  // Draw Device Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = width * 0.08;
  ctx.shadowOffsetY = height * 0.03;

  const cornerRadius = frameStyle === 'tablet' ? width * 0.05 : width * 0.08;
  const bezel = Math.max(12, Math.round(width * 0.025));

  // Outer Device Body (Titanium / Slate Dark)
  drawRoundedRect(ctx, mockupX, mockupY, mockupW, mockupH + 40, cornerRadius);
  ctx.fillStyle = frameStyle === 'iphone17' ? '#1c1d22' : '#111827';
  ctx.fill();

  // Reset shadow for inner screen
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Outer rim reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = Math.max(2, width * 0.003);
  ctx.stroke();

  // Inner Screen Clipping Area
  const screenX = mockupX + bezel;
  const screenY = mockupY + bezel;
  const screenW = mockupW - bezel * 2;
  const screenH = mockupH - bezel * 2 + 40;
  const innerRadius = Math.max(8, cornerRadius - bezel);

  ctx.save();
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, innerRadius);
  ctx.clip();

  // Draw Screen Capture or Placeholder Graphic
  if (screenImage) {
    ctx.drawImage(screenImage, screenX, screenY, screenW, screenH);
  } else {
    // Beautiful placeholder app UI
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(screenX, screenY, screenW, screenH);

    // Placeholder UI wireframe elements
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(screenX + 30, screenY + 60, screenW - 60, 40);
    ctx.fillRect(screenX + 30, screenY + 120, (screenW - 60) * 0.6, 25);

    // Cards
    for (let c = 0; c < 3; c++) {
      drawRoundedRect(ctx, screenX + 30, screenY + 180 + c * 130, screenW - 60, 110, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
    }
  }

  // Draw Dynamic Island / Camera Notch
  if (frameStyle === 'iphone17') {
    const pillW = screenW * 0.28;
    const pillH = screenW * 0.08;
    const pillX = screenX + (screenW - pillW) / 2;
    const pillY = screenY + 14;

    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Camera lens reflection
    ctx.beginPath();
    ctx.arc(pillX + pillW * 0.8, pillY + pillH / 2, pillH * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = '#08142b';
    ctx.fill();
  } else if (frameStyle === 'android_flagship') {
    // Punch-hole camera
    const holeRadius = screenW * 0.024;
    ctx.beginPath();
    ctx.arc(screenX + screenW / 2, screenY + 22, holeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
  }

  ctx.restore(); // end screen clip

  // Screen glare overlay reflection
  const glareGrad = ctx.createLinearGradient(mockupX, mockupY, mockupX + mockupW, mockupY + mockupH);
  glareGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
  glareGrad.addColorStop(0.3, 'rgba(255,255,255,0.02)');
  glareGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glareGrad;
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, innerRadius);
  ctx.fill();

  ctx.restore(); // end device transform
}

/**
 * Render Google Play Feature Graphic (1024 x 500 px)
 * Follows Google Play design guidelines:
 * - 1024 x 500 px, 24-bit PNG or JPEG
 * - Important elements in the safe area (avoids 15% margins from edge)
 */
export async function renderFeatureGraphic(canvas, config) {
  const width = 1024;
  const height = 500;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const {
    appName = 'My App',
    tagline = 'The Next Generation Mobile Experience',
    badge = 'FEATURED ON GOOGLE PLAY',
    logoImage,
    screenImage,
    bgImage,
    gradientStart = '#0f172a',
    gradientEnd = '#3b82f6',
    accentColor = '#38bdf8',
    textColor = '#ffffff'
  } = config;

  // 1. Background
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, width, height);
    // Darkening gradient
    const grad = ctx.createLinearGradient(0, 0, width * 0.7, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, gradientStart);
    bgGrad.addColorStop(1, gradientEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Tech mesh / accent circles
    const orb = ctx.createRadialGradient(width * 0.3, height * 0.5, 40, width * 0.3, height * 0.5, 450);
    orb.addColorStop(0, `${accentColor}44`);
    orb.addColorStop(1, 'transparent');
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Safe Area Margin (Google guidelines: 15% safe boundary from edges)
  const leftX = width * 0.08;
  const centerY = height * 0.5;

  // Left Content Column (Logo, Title, Tagline, Store Badge)
  let textY = height * 0.22;

  // Logo + Badge Row
  if (logoImage) {
    const logoSize = 64;
    drawRoundedRect(ctx, leftX, textY - 10, logoSize, logoSize, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.drawImage(logoImage, leftX, textY - 10, logoSize, logoSize);
    ctx.restore();

    // Badge next to logo
    if (badge) {
      ctx.font = "800 12px 'Outfit', sans-serif";
      const bW = ctx.measureText(badge.toUpperCase()).width + 24;
      const bH = 28;
      const bX = leftX + logoSize + 18;
      const bY = textY + 6;

      drawRoundedRect(ctx, bX, bY, bW, bH, bH / 2);
      ctx.fillStyle = `${accentColor}33`;
      ctx.fill();
      ctx.strokeStyle = `${accentColor}88`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(badge.toUpperCase(), bX + 12, bY + 18);
    }

    textY += logoSize + 22;
  }

  // App Name
  ctx.font = "900 44px 'Outfit', sans-serif";
  ctx.fillStyle = textColor;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 4;
  wrapText(ctx, appName, leftX, textY, width * 0.48, 50, 'left');
  textY += 60;

  // Tagline
  ctx.font = "500 18px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  wrapText(ctx, tagline, leftX, textY, width * 0.48, 26, 'left');

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 3. Right Mockup Device Display (angled phone showing app screen)
  const mockupW = 220;
  const mockupH = 460;
  const mockupX = width * 0.7;
  const mockupY = 50;

  ctx.save();
  ctx.translate(mockupX, mockupY);
  ctx.transform(0.96, -0.06, 0.05, 0.98, 0, 0);

  // Device shadow
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 15;

  drawRoundedRect(ctx, 0, 0, mockupW, mockupH, 28);
  ctx.fillStyle = '#111827';
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Inner screen
  const sMargin = 8;
  const sW = mockupW - sMargin * 2;
  const sH = mockupH - sMargin * 2;

  ctx.save();
  drawRoundedRect(ctx, sMargin, sMargin, sW, sH, 20);
  ctx.clip();

  if (screenImage) {
    ctx.drawImage(screenImage, sMargin, sMargin, sW, sH);
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sMargin, sMargin, sW, sH);
  }

  // Camera hole
  ctx.beginPath();
  ctx.arc(sMargin + sW / 2, sMargin + 14, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  ctx.restore(); // end screen clip

  ctx.restore(); // end device transform
}

/**
 * Render App Icon (1024x1024 for Apple, 512x512 for Google Play)
 */
export async function renderAppIcon(canvas, config) {
  const { size = 1024, logoImage, appName = 'App', bgColor = '#6366f1', isApple = false } = config;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // App Store requires square with no alpha channel; Apple rounds corners automatically in App Store
  // Google Play allows rounded squircle or flat square
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, bgColor);
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  if (logoImage) {
    const lSize = size * 0.65;
    const lX = (size - lSize) / 2;
    const lY = (size - lSize) / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;

    ctx.drawImage(logoImage, lX, lY, lSize, lSize);
  } else {
    // Initial letter logo
    ctx.font = `900 ${size * 0.4}px 'Outfit', sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(appName.charAt(0).toUpperCase(), size / 2, size / 2);
  }
}
