const {
  json,
  options,
  audiusFetch
} = require("../_lib");

function decodeTrackId(rawId) {
  const value = decodeURIComponent(String(rawId || ""));
  return value.startsWith("audius:") ? value.slice(7) : value;
}

async function resolveStream(trackId) {
  const response = await audiusFetch(
    `/tracks/${encodeURIComponent(trackId)}/stream`
  );

  if (!response.ok) {
    try {
      await response.body?.cancel();
    } catch {}
    return null;
  }

  const finalUrl = response.url;

  try {
    await response.body?.cancel();
  } catch {}

  if (!/^https?:\/\//i.test(finalUrl)) {
    return null;
  }

  return finalUrl;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return options(res);
  }

  if (req.method !== "GET") {
    return json(res, 405, {
      error: "Method not allowed"
    });
  }

  const trackId = decodeTrackId(req.query?.id);

  if (!trackId || trackId.length > 200) {
    return json(res, 404, {
      error: "Track not found"
    });
  }

  try {
    const url = await resolveStream(trackId);

    if (!url) {
      return json(res, 404, {
        error: "Audius could not provide a playable stream"
      });
    }

    return json(res, 200, {
      url,
      format: "mp3",
      quality: "HIGH",
      codec: "mp3",
      container: "mp3",
      manifest: "none",
      encrypted: false
    });
  } catch (error) {
    console.error("Audius stream error:", error);

    return json(res, 502, {
      error: "Unable to resolve Audius stream"
    });
  }
};
