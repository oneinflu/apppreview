import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import AdmZip from 'adm-zip';
import { getAndroidPaths } from './envHelper.js';

const execAsync = promisify(exec);

export async function parseApk(apkPath, uploadsDir) {
  const result = {
    appName: path.basename(apkPath, '.apk'),
    packageName: '',
    versionName: '1.0.0',
    versionCode: '1',
    launchActivity: '',
    iconUrl: null,
    minSdkVersion: '21',
    targetSdkVersion: '34'
  };

  const { aapt, aapt2 } = getAndroidPaths();

  // Try extracting badging via aapt or aapt2
  let badgingText = '';
  try {
    const { stdout } = await execAsync(`"${aapt}" dump badging "${apkPath}"`, { maxBuffer: 10 * 1024 * 1024 });
    badgingText = stdout;
  } catch (e1) {
    try {
      const { stdout } = await execAsync(`"${aapt2}" dump badging "${apkPath}"`, { maxBuffer: 10 * 1024 * 1024 });
      badgingText = stdout;
    } catch (e2) {
      console.warn('Could not run aapt/aapt2, will inspect via zip:', e2.message);
    }
  }

  let iconPathInZip = null;

  if (badgingText) {
    // Parse package: name='com.example' versionCode='1' versionName='1.0'
    const packageMatch = badgingText.match(/package:\s+name='([^']+)'(?:\s+versionCode='([^']+)')?(?:\s+versionName='([^']+)')?/);
    if (packageMatch) {
      result.packageName = packageMatch[1] || '';
      result.versionCode = packageMatch[2] || '1';
      result.versionName = packageMatch[3] || '1.0.0';
    }

    // Parse application: label='App Name' icon='res/mipmap-xxxhdpi/ic_launcher.png'
    const appMatch = badgingText.match(/application:\s+label='([^']+)'(?:\s+icon='([^']+)')?/);
    if (appMatch) {
      if (appMatch[1]) result.appName = appMatch[1];
      if (appMatch[2]) iconPathInZip = appMatch[2];
    } else {
      const labelMatch = badgingText.match(/application-label:'([^']+)'/);
      if (labelMatch) result.appName = labelMatch[1];
    }

    // Parse launchable activity
    const activityMatch = badgingText.match(/launchable-activity:\s+name='([^']+)'/);
    if (activityMatch) {
      result.launchActivity = activityMatch[1];
    }

    // Parse SDKs
    const sdkMatch = badgingText.match(/sdkVersion:'([^']+)'/);
    if (sdkMatch) result.minSdkVersion = sdkMatch[1];
    const targetSdkMatch = badgingText.match(/targetSdkVersion:'([^']+)'/);
    if (targetSdkMatch) result.targetSdkVersion = targetSdkMatch[1];
  }

  // Extract icon from APK zip
  try {
    const zip = new AdmZip(apkPath);
    const zipEntries = zip.getEntries();

    let targetEntry = null;
    if (iconPathInZip) {
      targetEntry = zipEntries.find(e => e.entryName === iconPathInZip);
    }

    if (!targetEntry) {
      // Find highest resolution mipmap or drawable icon
      const candidateEntries = zipEntries.filter(e => 
        (e.entryName.includes('ic_launcher') || e.entryName.includes('app_icon') || e.entryName.includes('icon')) &&
        (e.entryName.endsWith('.png') || e.entryName.endsWith('.webp'))
      );

      // Prefer xxxhdpi, then xxhdpi, then xhdpi
      candidateEntries.sort((a, b) => {
        const order = ['xxxhdpi', 'xxhdpi', 'xhdpi', 'hdpi', 'mdpi'];
        const scoreA = order.findIndex(o => a.entryName.includes(o));
        const scoreB = order.findIndex(o => b.entryName.includes(o));
        return (scoreA === -1 ? 99 : scoreA) - (scoreB === -1 ? 99 : scoreB);
      });

      targetEntry = candidateEntries[0];
    }

    if (targetEntry) {
      const iconExt = path.extname(targetEntry.entryName) || '.png';
      const iconFileName = `icon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${iconExt}`;
      const iconDir = path.join(uploadsDir, 'icons');
      if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

      const iconFullPath = path.join(iconDir, iconFileName);
      fs.writeFileSync(iconFullPath, targetEntry.getData());
      result.iconUrl = `/uploads/icons/${iconFileName}`;
    }
  } catch (zipErr) {
    console.warn('Error reading APK entries with AdmZip:', zipErr.message);
  }

  // If no package name was found, fallback to safe slug
  if (!result.packageName) {
    result.packageName = `com.app.${result.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  }

  return result;
}
