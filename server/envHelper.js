import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

// Standard Android SDK paths
const homeDir = os.homedir();
const potentialAndroidHomes = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(homeDir, 'Library/Android/sdk'),
  path.join(homeDir, 'Android/Sdk'),
  '/Users/suuryaprabhat/Library/Android/sdk'
].filter(Boolean);

let detectedAndroidHome = potentialAndroidHomes.find(p => fs.existsSync(p)) || '';

export function getAndroidPaths() {
  const sdk = detectedAndroidHome;
  const adb = sdk && fs.existsSync(path.join(sdk, 'platform-tools', 'adb'))
    ? path.join(sdk, 'platform-tools', 'adb')
    : 'adb';
  
  const emulator = sdk && fs.existsSync(path.join(sdk, 'emulator', 'emulator'))
    ? path.join(sdk, 'emulator', 'emulator')
    : 'emulator';

  // Find build-tools aapt or aapt2
  let aapt = 'aapt';
  let aapt2 = 'aapt2';
  if (sdk) {
    const buildToolsDir = path.join(sdk, 'build-tools');
    if (fs.existsSync(buildToolsDir)) {
      const versions = fs.readdirSync(buildToolsDir).sort().reverse();
      for (const ver of versions) {
        const candidateAapt = path.join(buildToolsDir, ver, 'aapt');
        const candidateAapt2 = path.join(buildToolsDir, ver, 'aapt2');
        if (fs.existsSync(candidateAapt)) {
          aapt = candidateAapt;
          break;
        } else if (fs.existsSync(candidateAapt2)) {
          aapt2 = candidateAapt2;
        }
      }
    }
  }

  return { sdk, adb, emulator, aapt, aapt2 };
}

export async function checkEnvironment() {
  const paths = getAndroidPaths();
  const status = {
    androidSdk: !!paths.sdk,
    sdkPath: paths.sdk,
    adbFound: false,
    emulatorFound: false,
    aaptFound: false,
    iosSimctlFound: false,
    androidAvds: [],
    runningAndroidDevices: [],
    iosSimulators: []
  };

  // Check ADB
  try {
    const { stdout } = await execAsync(`"${paths.adb}" version`);
    if (stdout.includes('Android Debug Bridge')) {
      status.adbFound = true;
    }
  } catch (e) {
    status.adbFound = false;
  }

  // Check running ADB devices
  if (status.adbFound) {
    try {
      const { stdout } = await execAsync(`"${paths.adb}" devices`);
      const lines = stdout.trim().split('\n').slice(1);
      status.runningAndroidDevices = lines
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('*'))
        .map(l => {
          const [id, state] = l.split(/\s+/);
          return { id, state };
        });
    } catch (e) {
      // ignore
    }
  }

  // Check Android Emulator & AVDs
  try {
    const { stdout } = await execAsync(`"${paths.emulator}" -list-avds`);
    status.emulatorFound = true;
    status.androidAvds = stdout
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  } catch (e) {
    status.emulatorFound = false;
  }

  // Check iOS simctl
  try {
    const { stdout } = await execAsync('xcrun simctl list devices available -j');
    const parsed = JSON.parse(stdout);
    status.iosSimctlFound = true;
    const allDevices = [];
    for (const [runtime, list] of Object.entries(parsed.devices || {})) {
      if (runtime.includes('iOS')) {
        for (const dev of list) {
          allDevices.push({
            name: dev.name,
            udid: dev.udid,
            state: dev.state,
            isBooted: dev.state === 'Booted',
            runtime
          });
        }
      }
    }
    status.iosSimulators = allDevices;
  } catch (e) {
    status.iosSimctlFound = false;
  }

  return status;
}
