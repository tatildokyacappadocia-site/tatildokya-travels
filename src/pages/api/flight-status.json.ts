import type { APIRoute } from 'astro';

export const prerender = false;

const OFFICIAL_URL = 'https://shmkapadokya.kapadokya.edu.tr/';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=38.6431&longitude=34.8289&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=ms&timezone=Europe%2FIstanbul';

type SectorStatus = 'CANCELED' | 'FLOWN' | 'PENDING';

type Sector = {
  key: 'A' | 'B' | 'C';
  status: SectorStatus;
  rawStatus: string;
  lastUpdate: string;
  validDateRange: string;
};

function cleanText(value = '') {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function statusFromText(text: string): SectorStatus {
  const upper = text.toLocaleUpperCase('tr-TR');
  if (/UÇULMAZ|UÇUŞ\s*YOK|İPTAL|CANCELLED|CANCELED|NOT\s*FLY/.test(upper)) return 'CANCELED';
  if (/\bUÇULUR\b|UÇUŞA\s*UYGUN|FLYING|FLOWN|SUITABLE\s*FOR\s*FLIGHT/.test(upper)) return 'FLOWN';
  return 'PENDING';
}

function extractDateValue(text: string, label: 'update' | 'valid') {
  if (label === 'update') {
    const m = text.match(/(?:GÜNCELLEME\s*TARİHİ\s*ve\s*SAATİ|UPDATE\s*DATE\s*(?:and|&)\s*TIME)\s*:?\s*(\d{2}\.\d{2}\.\d{4}\s*-\s*\d{2}:\d{2})/i);
    return m?.[1]?.trim() || '';
  }
  const m = text.match(/(?:GEÇERLİ\s*TARİH\s*ve\s*SAATLER|VALID\s*DATE\s*(?:and|&)\s*HOURS)\s*:?\s*(\d{2}\.\d{2}\.\d{4}\s*-\s*\d{2}:\d{2}\s*-\s*\d{2}:\d{2})/i);
  return m?.[1]?.trim() || '';
}

function parseSector(html: string, key: 'A' | 'B' | 'C'): Sector {
  const next = key === 'A' ? 'B' : key === 'B' ? 'C' : null;
  const startRe = new RegExp(`SEKTÖR\\s*${key}[^<\\n]*`, 'i');
  const startMatch = html.match(startRe);
  const startIndex = startMatch?.index ?? -1;

  let sectionHtml = html;
  if (startIndex >= 0) {
    const tail = html.slice(startIndex);
    if (next) {
      const nextMatch = tail.match(new RegExp(`SEKTÖR\\s*${next}[^<\\n]*`, 'i'));
      sectionHtml = nextMatch?.index && nextMatch.index > 0 ? tail.slice(0, nextMatch.index) : tail.slice(0, 9000);
    } else {
      const boundary = tail.search(/İKİNCİL\s*UÇUŞ|METAR|TAFF/i);
      sectionHtml = boundary > 0 ? tail.slice(0, boundary) : tail.slice(0, 9000);
    }
  }

  const text = cleanText(sectionHtml);
  const heading = cleanText(startMatch?.[0] || `SEKTÖR ${key}`);

  return {
    key,
    status: statusFromText(`${heading} ${text}`),
    rawStatus: heading.replace(new RegExp(`SEKTÖR\\s*${key}`, 'i'), '').trim(),
    lastUpdate: extractDateValue(text, 'update'),
    validDateRange: extractDateValue(text, 'valid'),
  };
}

function overallStatus(sectors: Sector[]) {
  const canceled = sectors.filter((s) => s.status === 'CANCELED').length;
  const flown = sectors.filter((s) => s.status === 'FLOWN').length;
  if (canceled === sectors.length) return 'CANCELED';
  if (flown === sectors.length) return 'FLOWN';
  if (canceled > 0 || flown > 0) return 'PARTIAL';
  return 'PENDING';
}

export const GET: APIRoute = async () => {
  try {
    const officialResponse = await fetch(OFFICIAL_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TatildokyaTravels/1.0)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
    });

    if (!officialResponse.ok) {
      throw new Error(`Official flight-status source returned HTTP ${officialResponse.status}`);
    }

    const html = await officialResponse.text();
    const sectors = (['A', 'B', 'C'] as const).map((key) => parseSector(html, key));
    const status = overallStatus(sectors);
    const firstWithUpdate = sectors.find((s) => s.lastUpdate) || sectors[0];

    let weather: Record<string, unknown> | null = null;
    try {
      const weatherResponse = await fetch(WEATHER_URL, { cache: 'no-store' });
      if (weatherResponse.ok) {
        const weatherJson = await weatherResponse.json();
        const current = weatherJson?.current;
        if (current) {
          weather = {
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            precipitation: current.precipitation,
            windSpeed: current.wind_speed_10m,
            windDirection: current.wind_direction_10m,
            weatherCode: current.weather_code,
            time: current.time,
          };
        }
      }
    } catch {
      weather = null;
    }

    return new Response(JSON.stringify({
      success: true,
      status,
      sectors,
      lastUpdate: firstWithUpdate?.lastUpdate || '',
      validDateRange: firstWithUpdate?.validDateRange || '',
      sourceUrl: OFFICIAL_URL,
      weather,
      fetchedAt: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Flight-status data could not be loaded.';
    console.error('Flight status API error:', error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
};
