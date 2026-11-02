import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { getAndroidPaths, checkEnvironment } from './envHelper.js';

const execAsync = promisify(exec);

// Cache running emulator processes
const runningProcesses = new Map();

export async function getDevices() {
  return await checkEnvironment();
}

export async function launchAndroidEmulator(avdName) {
  const { emulator, adb } = getAndroidPaths();

  // Check if emulator already running
  const env = await checkEnvironment();
  const running = env.runningAndroidDevices.find(d => d.state === 'device');
  if (running) {
    return {
      status: 'already_running',
      deviceId: running.id,
      message: `An emulator/device (${running.id}) is already active and ready.`
    };
  }

  // Spawn emulator process in background
  const avd = avdName || (env.androidAvds[0] || 'Pixel_9a');
  console.log(`Starting emulator with AVD: ${avd}`);

  const child = spawn(emulator, ['-avd', avd, '-netdelay', 'none', '-netspeed', 'full'], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  runningProcesses.set(avd, child);

  return {
    status: 'launching',
    avd,
    message: `Emulator ${avd} is starting up. It will appear in devices list once booted.`
  };
}

export async function waitForDeviceReady(maxWaitMs = 60000) {
  const { adb } = getAndroidPaths();
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    try {
      const { stdout } = await execAsync(`"${adb}" shell getprop sys.boot_completed`);
      if (stdout.trim() === '1') {
        return true;
      }
    } catch (e) {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

export async function installApk(apkPath, deviceId = null) {
  const { adb } = getAndroidPaths();
  const devFlag = deviceId ? `-s "${deviceId}"` : '';

  try {
    const { stdout, stderr } = await execAsync(`"${adb}" ${devFlag} install -r -d -t "${apkPath}"`, { timeout: 120000 });
    const output = stdout + '\n' + stderr;
    if (output.includes('Success')) {
      return { success: true, message: 'APK installed successfully.' };
    }
    return { success: false, message: output };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function launchApp(packageName, launchActivity = null, deviceId = null) {
  const { adb } = getAndroidPaths();
  const devFlag = deviceId ? `-s "${deviceId}"` : '';

  try {
    if (launchActivity) {
      const fullActivity = launchActivity.startsWith('.')
        ? `${packageName}/${packageName}${launchActivity}`
        : `${packageName}/${launchActivity}`;
      await execAsync(`"${adb}" ${devFlag} shell am start -n "${fullActivity}"`);
    } else {
      // Launch via monkey launcher trigger
      await execAsync(`"${adb}" ${devFlag} shell monkey -p "${packageName}" -c android.intent.category.LAUNCHER 1`);
    }
    return { success: true, message: `Launched ${packageName}` };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function captureAndroidScreenshot(outputDir, deviceId = null, suffix = '') {
  const { adb } = getAndroidPaths();
  const devFlag = deviceId ? `-s "${deviceId}"` : '';
  const filename = `screen_${Date.now()}${suffix ? '_' + suffix : ''}.png`;
  const filePath = path.join(outputDir, filename);

  try {
    // Run screencap directly to file on host
    await execAsync(`"${adb}" ${devFlag} exec-out screencap -p > "${filePath}"`);

    // Verify file size
    const stat = fs.statSync(filePath);
    if (stat.size < 1000) {
      throw new Error('Screenshot capture produced an empty or corrupted file.');
    }

    return {
      success: true,
      filename,
      url: `/uploads/screenshots/${filename}`,
      filePath
    };
  } catch (err) {
    // Fallback: capture to /sdcard/ and pull
    try {
      const remotePath = `/sdcard/screenshot_${Date.now()}.png`;
      await execAsync(`"${adb}" ${devFlag} shell screencap -p "${remotePath}"`);
      await execAsync(`"${adb}" ${devFlag} pull "${remotePath}" "${filePath}"`);
      await execAsync(`"${adb}" ${devFlag} shell rm "${remotePath}"`);
      return {
        success: true,
        filename,
        url: `/uploads/screenshots/${filename}`,
        filePath
      };
    } catch (fallbackErr) {
      throw new Error(`Failed to capture screenshot: ${err.message} / ${fallbackErr.message}`);
    }
  }
}

export async function captureIosSimulatorScreenshot(outputDir, udid = 'booted') {
  const filename = `ios_screen_${Date.now()}.png`;
  const filePath = path.join(outputDir, filename);

  try {
    await execAsync(`xcrun simctl io ${udid} screenshot "${filePath}"`);
    return {
      success: true,
      filename,
      url: `/uploads/screenshots/${filename}`,
      filePath
    };
  } catch (err) {
    throw new Error(`iOS Simulator screenshot failed: ${err.message}. Make sure an iOS Simulator is booted.`);
  }
}

export async function captureMultiDeviceSet(outputDir, deviceId = null) {
  const { adb } = getAndroidPaths();
  const devFlag = deviceId ? `-s "${deviceId}"` : '';
  const results = [];

  // 1. Phone screenshot (Native resolution)
  const phoneRes = await captureAndroidScreenshot(outputDir, deviceId, 'phone_1080x2400');
  results.push({
    type: 'phone',
    name: 'Android Phone (1080x2400)',
    ...phoneRes
  });

  // 2. 7-inch Tablet (1200x1920, 320 dpi)
  try {
    await execAsync(`"${adb}" ${devFlag} shell wm size 1200x1920`);
    await execAsync(`"${adb}" ${devFlag} shell wm density 320`);
    await new Promise(r => setTimeout(r, 2000));

    const tablet7Res = await captureAndroidScreenshot(outputDir, deviceId, 'tablet_7in_1200x1920');
    results.push({
      type: 'tablet_7',
      name: 'Android 7" Tablet (1200x1920)',
      ...tablet7Res
    });
  } catch (e) {
    console.warn('Could not emulate 7" tablet wm size:', e.message);
  }

  // 3. 10-inch Tablet (1600x2560, 320 dpi)
  try {
    await execAsync(`"${adb}" ${devFlag} shell wm size 1600x2560`);
    await execAsync(`"${adb}" ${devFlag} shell wm density 320`);
    await new Promise(r => setTimeout(r, 2000));

    const tablet10Res = await captureAndroidScreenshot(outputDir, deviceId, 'tablet_10in_1600x2560');
    results.push({
      type: 'tablet_10',
      name: 'Android 10" Tablet (1600x2560)',
      ...tablet10Res
    });
  } catch (e) {
    console.warn('Could not emulate 10" tablet wm size:', e.message);
  } finally {
    // Reset resolution and density
    try {
      await execAsync(`"${adb}" ${devFlag} shell wm size reset`);
      await execAsync(`"${adb}" ${devFlag} shell wm density reset`);
    } catch (resetErr) {
      // ignore
    }
  }

  return results;
}
