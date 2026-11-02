import fs from 'fs';
import path from 'path';

export async function analyzeScreensWithVision(apiKey, screenshots, appInfo = {}) {
  if (!apiKey) {
    throw new Error('OpenAI API Key is required for AI Screen Analysis.');
  }

  const results = [];

  for (let i = 0; i < screenshots.length; i++) {
    const screen = screenshots[i];
    let base64Image = '';

    if (screen.filePath && fs.existsSync(screen.filePath)) {
      const buffer = fs.readFileSync(screen.filePath);
      const ext = path.extname(screen.filePath).replace('.', '') || 'png';
      base64Image = `data:image/${ext};base64,${buffer.toString('base64')}`;
    } else if (screen.base64) {
      base64Image = screen.base64;
    }

    if (!base64Image) {
      // Fallback placeholder analysis
      results.push({
        index: i,
        headline: `Screen ${i + 1} Highlight`,
        subtitle: 'Experience seamless and powerful features designed for you.',
        badge: 'Top Feature',
        primaryColor: '#6366f1',
        accentColor: '#38bdf8'
      });
      continue;
    }

    const prompt = `You are a world-class App Store Optimization (ASO) and UI/UX design director.
Look at this mobile app screenshot for the app "${appInfo.appName || 'My App'}".
Analyze what screen/flow this is (e.g. Home, Dashboard, Checkout, Workout Tracker, Profile, Social Feed).
Provide high-converting marketing preview copy adhering strictly to Apple App Store and Google Play guidelines:

1. "headline": An ultra-punchy, irresistible marketing headline. Max 32 characters. Must be action-oriented or benefit-driven. DO NOT be generic.
2. "subtitle": A concise secondary benefit explaining the feature. Max 65 characters.
3. "badge": A 1-3 word pill badge label (e.g., "Realtime Sync", "AI Powered", "Instant Alert", "Smart Analytics").
4. "screenType": What the screen represents (e.g., "Dashboard", "Onboarding", "Detail", "Checkout").
5. "suggestedColors": Hex codes for primary UI color and accent color extracted from this screen.
6. "recommendedAngle": One of ["flat", "tilt-left", "tilt-right", "floating"].

Respond ONLY with valid JSON in this exact structure:
{
  "headline": "...",
  "subtitle": "...",
  "badge": "...",
  "screenType": "...",
  "primaryColor": "#hex",
  "accentColor": "#hex",
  "recommendedAngle": "flat"
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Vision error:', errorText);
        throw new Error(`OpenAI API responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      results.push({
        index: i,
        id: screen.id || `screen-${i}`,
        ...content
      });
    } catch (err) {
      console.error(`Vision analysis error on screen ${i}:`, err.message);
      results.push({
        index: i,
        id: screen.id || `screen-${i}`,
        headline: i === 0 ? 'Everything You Need' : `Powerful Feature ${i + 1}`,
        subtitle: 'Designed for speed, beauty, and effortless productivity.',
        badge: 'Featured',
        primaryColor: '#6366f1',
        accentColor: '#06b6d4',
        recommendedAngle: 'flat'
      });
    }
  }

  return results;
}

export async function generateDalleBanner(apiKey, appInfo, uploadsDir) {
  if (!apiKey) {
    throw new Error('OpenAI API Key is required for DALL-E image generation.');
  }

  const { appName, category, theme, customPrompt } = appInfo;

  const defaultPrompt = `A stunning, high-end promotional graphic backdrop for an app named "${appName || 'NextGen'}". App theme: ${category || 'productivity and lifestyle'}. Style: Modern 3D glassmorphism elements, sleek metallic and glowing iridescent geometric shapes, abstract glowing curves, clean studio lighting, sophisticated depth of field, premium aesthetic, 8k resolution, suitable for a Google Play Store Feature Graphic header. No text, no letters, no logos.`;

  const finalPrompt = customPrompt || defaultPrompt;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd',
      style: 'vivid'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DALL-E generation failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const remoteUrl = data.data[0].url;

  // Download and cache locally in uploads/generated
  const genDir = path.join(uploadsDir, 'generated');
  if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });

  const filename = `dalle_banner_${Date.now()}.png`;
  const localPath = path.join(genDir, filename);

  const imgRes = await fetch(remoteUrl);
  const arrayBuffer = await imgRes.arrayBuffer();
  fs.writeFileSync(localPath, Buffer.from(arrayBuffer));

  return {
    remoteUrl,
    localUrl: `/uploads/generated/${filename}`,
    filename,
    prompt: finalPrompt
  };
}

export async function generateStoreListingCopy(apiKey, appInfo) {
  if (!apiKey) {
    throw new Error('OpenAI API Key is required.');
  }

  const prompt = `You are an expert mobile app marketing strategist and ASO (App Store Optimization) copywriter.
Generate store listing metadata for this app:
App Name: "${appInfo.appName || 'My App'}"
Package: "${appInfo.packageName || 'com.app'}"
Features/Screens summary: ${JSON.stringify(appInfo.features || [])}

Create a compliant store listing strictly matching Google Play and Apple App Store limits:
1. "playShortDescription": Under 80 characters. High conversion tagline.
2. "playFullDescription": Engaging, beautifully formatted with clean unicode bullet points (•), highlighting core benefits, key features, and call to action. Max 3500 chars.
3. "applePromoText": Under 170 characters for App Store promotional text.
4. "appleKeywords": Comma-separated list under 100 characters total, no spaces after commas, high-intent search terms.
5. "releaseNotes": Catchy "What's New in this Version" release notes.

Return ONLY a JSON object:
{
  "playShortDescription": "...",
  "playFullDescription": "...",
  "applePromoText": "...",
  "appleKeywords": "...",
  "releaseNotes": "..."
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
