import type { APIRoute } from 'astro';

export const prerender = false;

const GOREME = { lat: 38.6431, lon: 34.8289 };
const OPERATION_RADIUS_KM = 10;
const OPERATION_RING_POINTS = 12;
const STORM_RADII_KM = [20, 30];
const STORM_RING_POINTS = 8;
const TARGET_ALT_M = 1829; // ~6000 ft MSL
const LAYER_MIN_M = 1676;  // 5500 ft
const LAYER_MAX_M = 1981;  // 6500 ft

type AnyRecord = Record<string, any>;

type Point = {
  lat: number;
  lon: number;
  label: string;
  scope: 'operational' | 'storm';
};

type ModelBundle = {
  name: string;
  surface: AnyRecord[];
  upper: AnyRecord[];
};

const ECMWF_SURFACE = [
  'temperature_2m',
  'dew_point_2m',
  'relative_humidity_2m',
  'precipitation',
  'rain',
  'snowfall',
  'weather_code',
  'visibility',
  'cloud_cover_low',
  'cape',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'wind_speed_100m',
  'wind_direction_100m'
];

const ECMWF_UPPER = [
  'wind_speed_850hPa',
  'wind_direction_850hPa',
  'geopotential_height_850hPa',
  'wind_speed_700hPa',
  'wind_direction_700hPa',
  'geopotential_height_700hPa'
];

const ICON_SURFACE = [...ECMWF_SURFACE];

const ICON_UPPER = [
  'wind_speed_850hPa',
  'wind_direction_850hPa',
  'geopotential_height_850hPa',
  'wind_speed_800hPa',
  'wind_direction_800hPa',
  'geopotential_height_800hPa'
];

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round = (n: number, digits = 1) =>
  Number.isFinite(n) ? Number(n.toFixed(digits)) : null;
const ktToKmh = (kt: number) => kt * 1.852;
const mToFt = (m: number) => m * 3.28084;

function offsetPoint(lat: number, lon: number, distanceKm: number, bearingDeg: number) {
  const R = 6371;
  const brng = bearingDeg * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lon1 = lon * Math.PI / 180;
  const d = distanceKm / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );

  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: lat2 * 180 / Math.PI,
    lon: lon2 * 180 / Math.PI
  };
}

function analysisPoints(): Point[] {
  const points: Point[] = [
    { ...GOREME, label: 'Göreme Center', scope: 'operational' }
  ];

  for (let i = 0; i < OPERATION_RING_POINTS; i++) {
    const bearing = i * (360 / OPERATION_RING_POINTS);
    points.push({
      ...offsetPoint(GOREME.lat, GOREME.lon, OPERATION_RADIUS_KM, bearing),
      label: `10 km ${bearing}°`,
      scope: 'operational'
    });
  }

  for (const radius of STORM_RADII_KM) {
    for (let i = 0; i < STORM_RING_POINTS; i++) {
      const bearing = i * (360 / STORM_RING_POINTS);
      points.push({
        ...offsetPoint(GOREME.lat, GOREME.lon, radius, bearing),
        label: `${radius} km ${bearing}°`,
        scope: 'storm'
      });
    }
  }

  return points;
}

function turkeyDateParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  return Object.fromEntries(parts.map(p => [p.type, p.value])) as Record<string, string>;
}

function isoForOffset(offset: number) {
  const p = turkeyDateParts();
  const d = new Date(Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day) + offset
  ));

  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function sunriseMinutes(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const lat = GOREME.lat;
  const lon = GOREME.lon;
  const zen = 90.833;

  const start = Date.UTC(y, 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const lngHour = lon / 15;
  const tt = dayOfYear + ((6 - lngHour) / 24);
  const M = (0.9856 * tt) - 3.289;
  const L = (
    M +
    (1.916 * Math.sin(M * Math.PI / 180)) +
    (0.020 * Math.sin(2 * M * Math.PI / 180)) +
    282.634 + 360
  ) % 360;

  let RA = (
    Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI + 360
  ) % 360;

  RA = (
    RA +
    ((Math.floor(L / 90)) * 90 - (Math.floor(RA / 90)) * 90)
  ) / 15;

  const sinDec = 0.39782 * Math.sin(L * Math.PI / 180);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (
    Math.cos(zen * Math.PI / 180) -
    (sinDec * Math.sin(lat * Math.PI / 180))
  ) / (cosDec * Math.cos(lat * Math.PI / 180));

  const H = (
    360 - (Math.acos(clamp(cosH, -1, 1)) * 180 / Math.PI)
  ) / 15;

  const UT = (
    H + RA - (0.06571 * tt) - 6.622 - lngHour + 24
  ) % 24;

  // Göreme = UTC/Zulu + 3 hours all year.
  const local = (UT + 3 + 24) % 24;
  let minutes = Math.round(local * 60);
  if (minutes >= 1440) minutes -= 1440;

  return minutes;
}

function hm(totalMinutes: number) {
  const m = (totalMinutes + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/**
 * Hourly model slices that intersect the operational interval:
 * sunrise -30 min through sunrise +60 min.
 *
 * Example sunrise 05:55 => 05:25–06:55 => 05:00 and 06:00 model slices.
 */
function analysisHours(iso: string, sunriseMin: number) {
  const start = sunriseMin - 30;
  const end = sunriseMin + 60;
  const firstHour = Math.floor(start / 60);
  const lastHour = Math.floor(Math.max(start, end - 1) / 60);

  const hours: string[] = [];
  for (let h = firstHour; h <= lastHour; h++) {
    if (h >= 0 && h <= 23) hours.push(`${iso}T${pad(h)}:00`);
  }

  return hours;
}

async function fetchVariables(
  name: string,
  endpoint: string,
  points: Point[],
  hourlyVars: string[]
): Promise<AnyRecord[]> {
  const qs = new URLSearchParams({
    latitude: points.map(p => p.lat.toFixed(5)).join(','),
    longitude: points.map(p => p.lon.toFixed(5)).join(','),
    hourly: hourlyVars.join(','),
    forecast_days: '7',
    timezone: 'Europe/Istanbul',
    wind_speed_unit: 'kn',
    precipitation_unit: 'mm'
  });

  const response = await fetch(`${endpoint}?${qs.toString()}`, {
    headers: {
      'User-Agent': 'TatildokyaTravels/flight-status'
    }
  });

  if (!response.ok) {
    throw new Error(`${name} ${response.status}: ${await response.text()}`);
  }

  const raw = await response.json();
  return Array.isArray(raw) ? raw : [raw];
}

async function fetchModel(
  name: string,
  endpoint: string,
  points: Point[],
  surfaceVars: string[],
  upperVars: string[]
): Promise<ModelBundle> {
  const [surfaceResult, upperResult] = await Promise.allSettled([
    fetchVariables(`${name} surface`, endpoint, points, surfaceVars),
    fetchVariables(`${name} upper`, endpoint, points, upperVars)
  ]);

  if (surfaceResult.status !== 'fulfilled') {
    throw surfaceResult.reason;
  }

  return {
    name,
    surface: surfaceResult.value,
    upper: upperResult.status === 'fulfilled' ? upperResult.value : []
  };
}

function idxForTime(hourly: AnyRecord, time: string) {
  return Array.isArray(hourly?.time) ? hourly.time.indexOf(time) : -1;
}

/**
 * Critical data-safety rule:
 * null / undefined / empty is missing data, NEVER zero.
 */
function numAt(hourly: AnyRecord, key: string, idx: number, fallback = NaN) {
  const value = hourly?.[key]?.[idx];

  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function ceilingEstimateM(tempC: number, dewPointC: number) {
  if (!Number.isFinite(tempC) || !Number.isFinite(dewPointC)) return NaN;

  // LCL proxy. It is shown as an estimate, not as an observed cloud ceiling.
  return Math.max(0, 125 * Math.max(0, tempC - dewPointC));
}

function windProbability(gustKt: number) {
  if (gustKt > 13) return 0;
  if (gustKt > 12) return 5;
  if (gustKt > 10) return 15;
  if (gustKt > 8) return 40;
  if (gustKt > 6) return 90;
  return 100;
}

function rainProbability(mmPerHour: number) {
  if (mmPerHour > 2.5) return 0;
  if (mmPerHour >= 1.0) return 15;
  if (mmPerHour >= 0.5) return 25;
  if (mmPerHour > 0) return 65;
  return 100;
}

function snowProbability(mmWaterEquivalentPerHour: number) {
  if (mmWaterEquivalentPerHour > 1.0) return 0;
  if (mmWaterEquivalentPerHour >= 0.2) return 12;
  if (mmWaterEquivalentPerHour > 0) return 55;
  return 100;
}

function ceilingProbability(ceilingFt: number) {
  if (!Number.isFinite(ceilingFt)) return 100;
  if (ceilingFt < 300) return 0;
  if (ceilingFt < 500) return 22;
  if (ceilingFt < 700) return 50;
  if (ceilingFt < 1000) return 75;
  return 100;
}

function visibilityProbability(visibilityKm: number) {
  // Missing visibility is neutral. It is rendered as "—", never as "0 km".
  if (!Number.isFinite(visibilityKm) || visibilityKm <= 0) return 100;

  if (visibilityKm < 1.5) return 0;
  if (visibilityKm < 3) return 42;  // midpoint of 35–50%
  if (visibilityKm <= 5) return 82; // midpoint of 75–90%
  return 100;                        // midpoint rounded to 100 for 95–100%
}

function compass(deg: number) {
  const dirs = [
    'N','NNE','NE','ENE','E','ESE','SE','SSE',
    'S','SSW','SW','WSW','W','WNW','NW','NNW'
  ];

  const normal = ((deg % 360) + 360) % 360;
  return dirs[Math.round(normal / 22.5) % 16];
}

function launchAndViewing(deg: number) {
  const d = ((deg % 360) + 360) % 360;

  const maps = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, Cappadocia`)}`;

  const point = (name: string, query = name) => ({
    name,
    url: maps(query)
  });

  if (d <= 30) {
    return {
      launch: 'Çavuşin Okul Arkası veya Paşabağ Kavşak',
      viewing: [
        point('Potuk Burnu', 'Potuk Burnu Aşk Vadisi'),
        point('Aşk Vadisi', 'Salıncak Cafe Love Valley')
      ]
    };
  }

  if (d <= 60) {
    return {
      launch: 'Paşabağı Tezgahlar veya Güllüdere (Meskendere)',
      viewing: [
        point('Göreme Center'),
        point('Göreme Festival Alanı')
      ]
    };
  }

  if (d <= 100) {
    return {
      launch: 'Zelve Üçgen veya Kızılçukur Dağdibi',
      viewing: [
        point('Göreme Center'),
        point('Aşıklar Tepesi', 'Aşıklar Tepesi Göreme')
      ]
    };
  }

  if (d <= 135) {
    return {
      launch: 'Kızılçukur Area - Kılıçlar Vadisi - Kaya Kamping - Efes Bölgesi',
      viewing: [
        point('Aşıklar Tepesi', 'Aşıklar Tepesi Göreme'),
        point('Göreme Center')
      ]
    };
  }

  if (d <= 180) {
    return {
      launch: 'Ortahisar Yeni Yol - Turist Otel Altı - Efes Bölgesi - Ortahisar Yakut Otel Altı',
      viewing: [
        point('Aşıklar Tepesi', 'Aşıklar Tepesi Göreme'),
        point('Göreme Center')
      ]
    };
  }

  if (d <= 215) {
    return {
      launch: 'Esentepe Bölgesi - Göreme Antenler - Aşk Vadisi Tekkya',
      viewing: [
        point('Aşıklar Tepesi', 'Aşıklar Tepesi Göreme'),
        point('Göreme Center')
      ]
    };
  }

  if (d <= 250) {
    return {
      launch: 'Aşk Vadisi Bademlik Bölgesi - Aşk Vadisi Butterfly Kalkış Alanı',
      viewing: [
        point('Aşk Vadisi', 'Salıncak Cafe Love Valley'),
        point('Potuk Burnu', 'Potuk Burnu Aşk Vadisi')
      ]
    };
  }

  if (d <= 280) {
    return {
      launch: 'Aşk Vadisi Portakalcı - Aşk Vadisi Giriş',
      viewing: [
        point('Aşk Vadisi', 'Salıncak Cafe Love Valley'),
        point('Potuk Burnu', 'Potuk Burnu Aşk Vadisi')
      ]
    };
  }

  return {
    launch: 'Çavuşin Okul Arkası - Pembe Vadisi (Kiilik Mevkii - Çeşme)',
    viewing: [
      point('Aşk Vadisi', 'Salıncak Cafe Love Valley'),
      point('Potuk Burnu', 'Potuk Burnu Aşk Vadisi')
    ]
  };
}

function upperCandidate(
  hourly: AnyRecord,
  idx: number,
  levels: number[]
) {
  const candidates = levels.map(level => ({
    level,
    heightM: numAt(hourly, `geopotential_height_${level}hPa`, idx),
    speedKt: numAt(hourly, `wind_speed_${level}hPa`, idx),
    directionDeg: numAt(hourly, `wind_direction_${level}hPa`, idx)
  })).filter(c =>
    Number.isFinite(c.speedKt) &&
    Number.isFinite(c.directionDeg)
  );

  if (!candidates.length) return null;

  const inside = candidates.filter(c =>
    Number.isFinite(c.heightM) &&
    c.heightM >= LAYER_MIN_M &&
    c.heightM <= LAYER_MAX_M
  );

  if (inside.length) {
    inside.sort((a, b) =>
      Math.abs(a.heightM - TARGET_ALT_M) -
      Math.abs(b.heightM - TARGET_ALT_M)
    );
    return inside[0];
  }

  // If the model does not expose an exact level inside 5500–6500 ft,
  // vector-interpolate between the nearest available levels around 6000 ft.
  const withHeight = candidates.filter(c => Number.isFinite(c.heightM));
  if (withHeight.length >= 2) {
    withHeight.sort((a, b) => a.heightM - b.heightM);
    const below = [...withHeight].reverse().find(c => c.heightM <= TARGET_ALT_M);
    const above = withHeight.find(c => c.heightM >= TARGET_ALT_M);

    if (below && above && below !== above && above.heightM !== below.heightM) {
      const f = clamp(
        (TARGET_ALT_M - below.heightM) / (above.heightM - below.heightM),
        0,
        1
      );

      const bx = Math.sin(below.directionDeg * Math.PI / 180) * below.speedKt;
      const by = Math.cos(below.directionDeg * Math.PI / 180) * below.speedKt;
      const ax = Math.sin(above.directionDeg * Math.PI / 180) * above.speedKt;
      const ay = Math.cos(above.directionDeg * Math.PI / 180) * above.speedKt;

      const x = bx + (ax - bx) * f;
      const y = by + (ay - by) * f;

      return {
        level: 0,
        heightM: TARGET_ALT_M,
        speedKt: Math.hypot(x, y),
        directionDeg: (Math.atan2(x, y) * 180 / Math.PI + 360) % 360
      };
    }
  }

  candidates.sort((a, b) =>
    Math.abs((a.heightM || TARGET_ALT_M) - TARGET_ALT_M) -
    Math.abs((b.heightM || TARGET_ALT_M) - TARGET_ALT_M)
  );

  return candidates[0];
}

function aggregateDay(
  date: string,
  sunriseMin: number,
  models: ModelBundle[],
  points: Point[]
) {
  const times = analysisHours(date, sunriseMin);

  const operational: AnyRecord[] = [];
  const stormScan: AnyRecord[] = [];
  const upperOperational: AnyRecord[] = [];
  const centerOperational: AnyRecord[] = [];

  models.forEach(model => {
    model.surface.forEach((location, locationIndex) => {
      const point = points[locationIndex];
      if (!point) return;

      const hourly = location.hourly || {};

      times.forEach(time => {
        const idx = idxForTime(hourly, time);
        if (idx < 0) return;

        const temp = numAt(hourly, 'temperature_2m', idx);
        const dew = numAt(hourly, 'dew_point_2m', idx);
        const precipitation = Math.max(0, numAt(hourly, 'precipitation', idx, 0));
        const rain = Math.max(0, numAt(hourly, 'rain', idx, 0));
        const snowfallCm = Math.max(0, numAt(hourly, 'snowfall', idx, 0));

        // Snowfall water equivalent:
        // Open-Meteo documents snowfall in cm; 0.7 cm snowfall ~= 1 mm water.
        const snowWaterEquivalentMm =
          snowfallCm > 0 ? snowfallCm / 0.7 : Math.max(0, precipitation - rain);

        const visibilityMeters = numAt(hourly, 'visibility', idx);
        const visibilityKm =
          Number.isFinite(visibilityMeters) && visibilityMeters > 0
            ? visibilityMeters / 1000
            : NaN;

        const record = {
          model: model.name,
          point,
          locationIndex,
          time,
          temp,
          dew,
          humidity: numAt(hourly, 'relative_humidity_2m', idx),
          precipitation,
          rain,
          snowfallCm,
          snowWaterEquivalentMm,
          weatherCode: numAt(hourly, 'weather_code', idx, 0),
          visibilityKm,
          lowCloudPct: numAt(hourly, 'cloud_cover_low', idx),
          cape: numAt(hourly, 'cape', idx),
          wind10Kt: numAt(hourly, 'wind_speed_10m', idx, 0),
          dir10: numAt(hourly, 'wind_direction_10m', idx),
          gust10Kt: numAt(hourly, 'wind_gusts_10m', idx, 0),
          wind100Kt: numAt(hourly, 'wind_speed_100m', idx, 0),
          dir100: numAt(hourly, 'wind_direction_100m', idx),
          ceilingM: ceilingEstimateM(temp, dew)
        };

        stormScan.push(record);

        if (point.scope === 'operational') {
          operational.push(record);

          if (locationIndex === 0) {
            centerOperational.push(record);
          }
        }
      });
    });

    model.upper.forEach((location, locationIndex) => {
      const point = points[locationIndex];
      if (!point || point.scope !== 'operational') return;

      const hourly = location.hourly || {};
      const levels = model.name.startsWith('ECMWF') ? [850, 700] : [850, 800];

      times.forEach(time => {
        const idx = idxForTime(hourly, time);
        if (idx < 0) return;

        const candidate = upperCandidate(hourly, idx, levels);
        if (candidate) {
          upperOperational.push({
            ...candidate,
            model: model.name,
            point,
            time
          });
        }
      });
    });
  });

  if (!operational.length) {
    throw new Error(`No operational model data for ${date}`);
  }

  const maxOf = (values: number[]) => {
    const valid = values.filter(Number.isFinite);
    return valid.length ? Math.max(...valid) : NaN;
  };

  const minOf = (values: number[]) => {
    const valid = values.filter(Number.isFinite);
    return valid.length ? Math.min(...valid) : NaN;
  };

  const avgOf = (values: number[]) => {
    const valid = values.filter(Number.isFinite);
    return valid.length
      ? valid.reduce((sum, value) => sum + value, 0) / valid.length
      : NaN;
  };

  // 10 km operational envelope: use the worst valid value in the sunrise window.
  const maxGustKt = maxOf(operational.map(r => r.gust10Kt));
  const maxWindKt = maxOf(operational.map(r => r.wind10Kt));
  const maxRainMm = maxOf(operational.map(r => r.rain));
  const maxSnowWaterMm = maxOf(operational.map(r => r.snowWaterEquivalentMm));
  const maxSnowfallCm = maxOf(operational.map(r => r.snowfallCm));
  const maxLowCloudPct = maxOf(operational.map(r => r.lowCloudPct));

  // VISIBILITY FIX:
  // Only actual positive model values are considered.
  // Missing/null/unsupported/0 values are ignored.
  const visibilityRecords = operational.filter(r =>
    Number.isFinite(r.visibilityKm) && r.visibilityKm > 0
  );

  const minVisibilityKm = visibilityRecords.length
    ? Math.min(...visibilityRecords.map(r => r.visibilityKm))
    : NaN;

  const visibilitySourceModels = [
    ...new Set(visibilityRecords.map(r => r.model))
  ];

  const visibilitySamplesUsed = visibilityRecords.length;

  const minCeilingM = minOf(operational.map(r => r.ceilingM));
  const minCeilingFt = Number.isFinite(minCeilingM)
    ? mToFt(minCeilingM)
    : NaN;

  // Wider storm/CB scan: 10 km + 20 km + 30 km sampled points.
  // This is a forecast proxy, not direct radar detection.
  const thunderstormRisk = stormScan.some(r => {
    const code = Number(r.weatherCode);
    const cape = Number(r.cape);
    const lowCloud = Number(r.lowCloudPct);
    const precip = Number(r.precipitation);

    return (
      code >= 95 ||
      (Number.isFinite(cape) && cape >= 800 && precip >= 0.5) ||
      (Number.isFinite(cape) && cape >= 1200 && lowCloud >= 70)
    );
  });

  const maxCapeJkg = maxOf(stormScan.map(r => r.cape));

  const windPct = windProbability(maxGustKt);
  const rainPct = rainProbability(maxRainMm);
  const snowPct = snowProbability(maxSnowWaterMm);
  const precipitationPct = Math.min(rainPct, snowPct);
  const ceilingPct = ceilingProbability(minCeilingFt);
  const visibilityPct = visibilityProbability(minVisibilityKm);

  const vetoReasons: string[] = [];

  if (Number.isFinite(maxGustKt) && maxGustKt > 13) {
    vetoReasons.push(`10 km gust > 13 kt (${round(maxGustKt)} kt)`);
  }

  if (Number.isFinite(maxRainMm) && maxRainMm > 2.5) {
    vetoReasons.push(`rain > 2.5 mm/h (${round(maxRainMm, 2)} mm/h)`);
  }

  if (Number.isFinite(minVisibilityKm) && minVisibilityKm < 1.5) {
    vetoReasons.push(`visibility < 1.5 km (${round(minVisibilityKm)} km)`);
  }

  if (thunderstormRisk) {
    vetoReasons.push('CB / thunderstorm forecast risk inside the wider 30 km scan');
  }

  let probability =
    (windPct / 100) *
    (precipitationPct / 100) *
    (ceilingPct / 100) *
    (visibilityPct / 100) *
    100;

  // Two or more simultaneously critical factors => suppress to <=15%.
  const borderlineCount = [
    windPct,
    precipitationPct,
    ceilingPct,
    visibilityPct
  ].filter(value => value <= 40).length;

  if (borderlineCount >= 2 && probability > 15) {
    probability = 15;
  }

  if (vetoReasons.length) {
    probability = 0;
  }

  probability = Math.round(clamp(probability, 0, 100));

  // 5500–6500 ft steering wind: vector mean over the whole 10 km operational area.
  let x = 0;
  let y = 0;
  let speedTotal = 0;
  let upperCount = 0;

  upperOperational.forEach(u => {
    const speed = Number(u.speedKt);
    const dir = Number(u.directionDeg);

    if (!Number.isFinite(speed) || !Number.isFinite(dir)) return;

    const rad = dir * Math.PI / 180;
    x += Math.sin(rad) * speed;
    y += Math.cos(rad) * speed;
    speedTotal += speed;
    upperCount++;
  });

  const upperDirectionDeg = upperCount
    ? (Math.atan2(x, y) * 180 / Math.PI + 360) % 360
    : NaN;

  const upperSpeedKt = upperCount
    ? speedTotal / upperCount
    : NaN;

  const locations = Number.isFinite(upperDirectionDeg)
    ? launchAndViewing(upperDirectionDeg)
    : {
        launch: 'Direction data unavailable',
        viewing: []
      };

  const centerTemp = avgOf(centerOperational.map(r => r.temp));
  const centerWind10 = avgOf(centerOperational.map(r => r.wind10Kt));
  const centerWind100 = avgOf(centerOperational.map(r => r.wind100Kt));

  return {
    date,
    sunrise: hm(sunriseMin),
    window: {
      start: hm(sunriseMin - 30),
      end: hm(sunriseMin + 60),
      timezone: 'TRT (UTC+3)'
    },

    flightProbability: probability,
    cancelRisk: 100 - probability,

    weather: {
      temperatureC: round(centerTemp),
      rainMm: round(maxRainMm, 2),
      snowfallCm: round(maxSnowfallCm, 2),
      snowfallWaterEquivalentMm: round(maxSnowWaterMm, 2),

      precipitationRisk: 100 - precipitationPct,
      windRisk: 100 - windPct,
      ceilingRisk: 100 - ceilingPct,

      visibilityKm: round(minVisibilityKm),
      visibilityProbabilityPct: visibilityPct,
      visibilityRisk: 100 - visibilityPct,
      visibilitySamplesUsed,
      visibilitySourceModels,

      ceilingFt: round(minCeilingFt, 0),
      ceilingMethod: 'Estimated LCL proxy from temperature/dew point',

      lowCloudMaxPct: round(maxLowCloudPct, 0),
      maxCapeJkg: round(maxCapeJkg, 0),
      thunderstormProxy: thunderstormRisk,
      vetoReasons
    },

    surface: {
      maxWindKmh: round(ktToKmh(maxWindKt)),
      maxWindKt: round(maxWindKt),
      maxGustKmh: round(ktToKmh(maxGustKt)),
      maxGustKt: round(maxGustKt),
      avgWind10mKmh: round(ktToKmh(centerWind10)),
      avgWind100mKmh: round(ktToKmh(centerWind100))
    },

    upper: {
      speedKmh: round(ktToKmh(upperSpeedKt)),
      speedKt: round(upperSpeedKt),
      directionDeg: round(upperDirectionDeg, 0),
      compass: Number.isFinite(upperDirectionDeg)
        ? compass(upperDirectionDeg)
        : '—',
      reference: '5,500–6,500 ft MSL / 10 km operational area'
    },

    launchArea: locations.launch,
    viewingPoints: locations.viewing,

    area: {
      radiusKm: OPERATION_RADIUS_KM,
      operationalSampledPoints: 1 + OPERATION_RING_POINTS,
      stormScanMaxRadiusKm: 30
    }
  };
}

export const GET: APIRoute = async () => {
  try {
    const points = analysisPoints();

    const settled = await Promise.allSettled([
      fetchModel(
        'ECMWF',
        'https://api.open-meteo.com/v1/ecmwf',
        points,
        ECMWF_SURFACE,
        ECMWF_UPPER
      ),
      fetchModel(
        'ICON',
        'https://api.open-meteo.com/v1/dwd-icon',
        points,
        ICON_SURFACE,
        ICON_UPPER
      )
    ]);

    const models = settled
      .filter(
        (result): result is PromiseFulfilledResult<ModelBundle> =>
          result.status === 'fulfilled'
      )
      .map(result => result.value);

    if (!models.length) {
      const errors = settled
        .map(result =>
          result.status === 'rejected' ? String(result.reason) : ''
        )
        .filter(Boolean)
        .join(' | ');

      throw new Error(errors || 'Weather feeds unavailable');
    }

    const days = Array.from({ length: 7 }, (_, offset) => {
      const date = isoForOffset(offset);
      return aggregateDay(
        date,
        sunriseMinutes(date),
        models,
        points
      );
    });

    return new Response(JSON.stringify({
      success: true,
      generatedAt: new Date().toISOString(),
      methodology: {
        flightWindow: 'Göreme sunrise -30 min to +60 min, TRT (UTC+3)',
        operationalArea: 'Göreme center + 10 km operational ring',
        stormArea: 'Additional 20 km and 30 km thunderstorm/CB proxy scan',
        upperWind: '5,500–6,500 ft MSL steering wind across the operational area',
        visibility: 'Minimum valid positive hourly visibility in the 10 km operational area; missing values are ignored and never converted to 0 km',
        combination: 'wind × precipitation × estimated ceiling × visibility, then hard veto rules',
        ceiling: 'LCL estimate only; not an observed METAR ceiling'
      },
      days
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=300, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('balloon forecast error', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }
};
