const AUDIUS_BASE = "https://api.audius.co/v1";

function json(res, status, body, extraHeaders = {}) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  return res.end(JSON.stringify(body));
}

function options(res) {
  res.status(204);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return res.end();
}

function audiusUrl(path, params = {}) {
  const url = new URL(`${AUDIUS_BASE}${path}`);
  const apiKey = process.env.AUDIUS_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function audiusFetch(path, params = {}, init = {}) {
  const response = await fetch(audiusUrl(path, params), {
    redirect: "follow",
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": "BitChord-Audius-Addon/1.0",
      ...(init.headers || {})
    }
  });
  return response;
}

function artworkUrl(track) {
  const artwork = track?.artwork;

  if (typeof artwork === "string" && /^https?:\/\//i.test(artwork)) {
    return artwork;
  }

  if (artwork && typeof artwork === "object") {
    return (
      artwork["1000x1000"] ||
      artwork["480x480"] ||
      artwork["150x150"] ||
      artwork.large ||
      artwork.medium ||
      artwork.small ||
      null
    );
  }

  return null;
}

function artistName(track) {
  if (track?.user?.name) return track.user.name;
  if (track?.user?.handle) return track.user.handle;
  if (Array.isArray(track?.artists) && track.artists[0]?.name) {
    return track.artists[0].name;
  }
  return "Unknown Artist";
}

function albumName(track) {
  return (
    track?.album_name ||
    track?.album?.name ||
    track?.album_backlink?.playlist_name ||
    track?.album_backlink?.name ||
    ""
  );
}

function isPlayable(track) {
  if (!track?.id || !track?.title) return false;
  if (track.is_stream_gated === true) return false;
  if (track.is_streamable === false) return false;
  if (track.access && track.access.stream === false) return false;
  return true;
}

function toBitChordTrack(track) {
  const result = {
    id: `audius:${track.id}`,
    title: String(track.title),
    artist: artistName(track),
    album: albumName(track),
    duration: Number.isFinite(Number(track.duration))
      ? Number(track.duration)
      : undefined,
    artworkURL: artworkUrl(track),
    format: "mp3",
    audioQuality: "HIGH"
  };

  // Remove undefined fields before serialization.
  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

module.exports = {
  json,
  options,
  audiusUrl,
  audiusFetch,
  artworkUrl,
  artistName,
  albumName,
  isPlayable,
  toBitChordTrack
};
