import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export function createZipArchive(assetData, res) {
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  res.attachment(`App_Store_Assets_${Date.now()}.zip`);
  res.setHeader('Content-Type', 'application/zip');

  archive.pipe(res);

  // Helper to parse base64 and append
  const addBase64File = (folder, filename, dataUrl) => {
    if (!dataUrl) return;
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    archive.append(buffer, { name: `${folder}/${filename}` });
  };

  // 1. Google Play Phone Screenshots
  if (Array.isArray(assetData.googlePlayPhone)) {
    assetData.googlePlayPhone.forEach((item, index) => {
      addBase64File('Google-Play/Phone-Screenshots-1080x2400', `0${index + 1}_${item.name || 'phone_preview'}.png`, item.dataUrl);
    });
  }

  // 2. Google Play Tablet 7-inch
  if (Array.isArray(assetData.googlePlayTablet7)) {
    assetData.googlePlayTablet7.forEach((item, index) => {
      addBase64File('Google-Play/Tablet-7in-1200x1920', `0${index + 1}_${item.name || 'tablet7_preview'}.png`, item.dataUrl);
    });
  }

  // 3. Google Play Tablet 10-inch
  if (Array.isArray(assetData.googlePlayTablet10)) {
    assetData.googlePlayTablet10.forEach((item, index) => {
      addBase64File('Google-Play/Tablet-10in-1600x2560', `0${index + 1}_${item.name || 'tablet10_preview'}.png`, item.dataUrl);
    });
  }

  // 4. Google Play Feature Graphic (1024x500)
  if (assetData.featureGraphic) {
    addBase64File('Google-Play/Feature-Graphic-1024x500', 'Feature-Graphic-1024x500.png', assetData.featureGraphic);
  }

  // 5. Google Play App Icon (512x512)
  if (assetData.playIcon) {
    addBase64File('Google-Play/App-Icon-512x512', 'App-Icon-512x512.png', assetData.playIcon);
  }

  // 6. Apple App Store iPhone 6.9" / 6.7" (1290x2796)
  if (Array.isArray(assetData.appStoreIphone69)) {
    assetData.appStoreIphone69.forEach((item, index) => {
      addBase64File('Apple-App-Store/iPhone-6.9in-1290x2796', `0${index + 1}_${item.name || 'iphone_69_preview'}.png`, item.dataUrl);
    });
  }

  // 7. Apple App Store iPhone 6.5" (1242x2688)
  if (Array.isArray(assetData.appStoreIphone65)) {
    assetData.appStoreIphone65.forEach((item, index) => {
      addBase64File('Apple-App-Store/iPhone-6.5in-1242x2688', `0${index + 1}_${item.name || 'iphone_65_preview'}.png`, item.dataUrl);
    });
  }

  // 8. Apple App Store iPhone 5.5" (1242x2208)
  if (Array.isArray(assetData.appStoreIphone55)) {
    assetData.appStoreIphone55.forEach((item, index) => {
      addBase64File('Apple-App-Store/iPhone-5.5in-1242x2208', `0${index + 1}_${item.name || 'iphone_55_preview'}.png`, item.dataUrl);
    });
  }

  // 9. Apple App Store iPad Pro 13" (2048x2732)
  if (Array.isArray(assetData.appStoreIpad13)) {
    assetData.appStoreIpad13.forEach((item, index) => {
      addBase64File('Apple-App-Store/iPad-Pro-13in-2048x2732', `0${index + 1}_${item.name || 'ipad13_preview'}.png`, item.dataUrl);
    });
  }

  // 10. Apple App Store Icon (1024x1024)
  if (assetData.appleIcon) {
    addBase64File('Apple-App-Store/App-Store-Icon-1024x1024', 'App-Store-Icon-1024x1024.png', assetData.appleIcon);
  }

  // 11. Metadata text documents
  if (assetData.metadata) {
    const playText = `=== GOOGLE PLAY STORE METADATA ===
App Name: ${assetData.metadata.appName || ''}
Package: ${assetData.metadata.packageName || ''}

--- SHORT DESCRIPTION (Max 80 chars) ---
${assetData.metadata.playShortDescription || ''}

--- FULL DESCRIPTION ---
${assetData.metadata.playFullDescription || ''}
`;
    archive.append(playText, { name: 'Google-Play/Play-Store-Listing.txt' });

    const appleText = `=== APPLE APP STORE METADATA ===
App Name: ${assetData.metadata.appName || ''}

--- PROMOTIONAL TEXT (Max 170 chars) ---
${assetData.metadata.applePromoText || ''}

--- KEYWORDS (Max 100 chars, comma-separated) ---
${assetData.metadata.appleKeywords || ''}

--- WHAT'S NEW IN THIS VERSION ---
${assetData.metadata.releaseNotes || ''}
`;
    archive.append(appleText, { name: 'Apple-App-Store/App-Store-Metadata.txt' });

    archive.append(JSON.stringify(assetData.metadata, null, 2), { name: 'manifest.json' });
  }

  archive.finalize();
}
