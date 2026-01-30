import Papa from 'papaparse';

const PINCODE_CSV_URL = (() => {
  try {
    if (typeof window === 'undefined' || !window.location) return '/memory/Address.csv';
    const base = (import.meta?.env?.BASE_URL || '/').toString();
    const baseUrl = new URL(base, window.location.href);
    return new URL('memory/Address.csv', baseUrl).toString();
  } catch {
    return '/memory/Address.csv';
  }
})();

const cache = new Map();
const inflight = new Map();

const normalizePin = (val) => String(val || '').replace(/\D/g, '').slice(0, 6);

const toTitleCase = (s) => {
  const str = String(s || '').trim();
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
};

const uniq = (arr) => {
  const set = new Set();
  for (const v of arr || []) {
    const val = String(v || '').trim();
    if (val) set.add(val);
  }
  return Array.from(set);
};

export const normalizePincode = normalizePin;

export async function lookupAddressByPincode(pincode) {
  const pin = normalizePin(pincode);
  if (pin.length !== 6) {
    return { pincode: pin, matches: [], states: [], districts: [], localities: [], areas: [], towns: [] };
  }

  if (cache.has(pin)) return cache.get(pin);
  if (inflight.has(pin)) return inflight.get(pin);

  const promise = new Promise((resolve, reject) => {
    const matches = [];

    const addMatch = (row) => {
      // CSV headers are lower-case.
      const district = toTitleCase(row?.district);
      const state = toTitleCase(row?.statename);
      const locality = toTitleCase(row?.officename);
      const area = toTitleCase(row?.divisionname);
      const town = locality;

      matches.push({
        pincode: pin,
        locality,
        area,
        town,
        district,
        state,
        officetype: String(row?.officetype || '').trim(),
        delivery: String(row?.delivery || '').trim(),
        division: String(row?.divisionname || '').trim(),
        region: String(row?.regionname || '').trim(),
        circle: String(row?.circlename || '').trim(),
      });
    };

    let foundAny = false;

    Papa.parse(PINCODE_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      worker: true,
      step: (results, parser) => {
        const row = results?.data;
        if (!row) return;

        const rowPin = normalizePin(row.pincode);
        if (rowPin !== pin) return;

        foundAny = true;
        addMatch(row);

        // We only need a reasonable number of locality options.
        if (matches.length >= 50) {
          parser.abort();
        }
      },
      complete: () => {
        const states = uniq(matches.map((m) => m.state)).sort();
        const districts = uniq(matches.map((m) => m.district)).sort();
        const localities = uniq(matches.map((m) => m.locality)).sort();
        const areas = uniq(matches.map((m) => m.area)).sort();
        const towns = uniq(matches.map((m) => m.town)).sort();

        const payload = {
          pincode: pin,
          matches,
          states,
          districts,
          localities,
          areas,
          towns,
          found: foundAny,
        };

        cache.set(pin, payload);
        inflight.delete(pin);
        resolve(payload);
      },
      error: (err) => {
        inflight.delete(pin);
        reject(err);
      },
    });
  });

  inflight.set(pin, promise);
  return promise;
}
