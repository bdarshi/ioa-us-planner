const cache = {};
const CACHE_TTL = 5 * 60 * 1000;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const parkId = event.queryStringParameters?.park;
  if (!["64", "65"].includes(parkId)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid park id" }) };
  }

  const cached = cache[parkId];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { statusCode: 200, headers, body: JSON.stringify(cached.data) };
  }

  try {
    const res = await fetch(`https://queue-times.com/parks/${parkId}/queue_times.json`, {
      headers: { "User-Agent": "DuoDash/2.0" }
    });
    if (!res.ok) throw new Error(`queue-times returned ${res.status}`);
    const data = await res.json();
    cache[parkId] = { ts: Date.now(), data };
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
  }
};
