const {
  json,
  options,
  audiusFetch,
  isPlayable,
  toBitChordTrack
} = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return options(res);
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const q = String(req.query?.q || "").trim();

  if (!q) {
    return json(res, 200, { tracks: [] });
  }

  if (q.length > 200) {
    return json(res, 400, { error: "Query is too long" });
  }

  try {
    const response = await audiusFetch("/tracks/search", {
      query: q,
      limit: 25,
      sort_method: "relevant"
    });

    if (!response.ok) {
      return json(res, response.status === 429 ? 429 : 502, {
        error: `Audius search failed (${response.status})`
      });
    }

    const payload = await response.json();
    const tracks = Array.isArray(payload?.data)
      ? payload.data.filter(isPlayable).map(toBitChordTrack)
      : [];

    return json(res, 200, { tracks });
  } catch (error) {
    console.error("Audius search error:", error);
    return json(res, 502, { error: "Unable to reach Audius" });
  }
};
