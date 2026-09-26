# BitChord Audius Addon

A small Vercel serverless addon that exposes Audius as a BitChord custom HTTP source.

BitChord expects:

- `GET /manifest.json`
- `GET /search?q=...`
- `GET /stream/{id}`

This project provides those routes through Vercel rewrites.

## What it does

- Searches the Audius public catalog.
- Converts Audius track metadata to BitChord's addon format.
- Skips tracks that are marked stream-gated or non-streamable.
- Resolves the Audius stream redirect server-side and returns the final absolute media URL.
- Supports BitChord's `quality` query parameter without pretending Audius provides lossless audio.
- Adds CORS headers for easy testing.

## Deploy on Vercel

### Option A — GitHub

1. Create a new GitHub repository.
2. Upload all files from this folder.
3. In Vercel, import that repository.
4. Framework preset: **Other**.
5. No build command is required.
6. Deploy.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## Optional Audius API key

The addon works with Audius' read-only API without credentials for endpoints that allow anonymous access.

For higher limits, add an environment variable in Vercel:

`AUDIUS_API_KEY=your_key_here`

Then redeploy.

Do not put the API key in `manifest.json`, frontend code, or the BitChord URL.

## Test after deployment

If your deployment is:

`https://your-addon.vercel.app`

Open these in a browser:

```text
https://your-addon.vercel.app/manifest.json
https://your-addon.vercel.app/search?q=daft%20punk
```

A stream test needs a real Audius track id:

```text
https://your-addon.vercel.app/stream/audius%3ATRACK_ID
```

## Add to BitChord

In BitChord:

**Settings → Sources → Add an addon**

Paste:

```text
https://your-addon.vercel.app
```

You can also paste:

```text
https://your-addon.vercel.app/manifest.json
```

BitChord's current addon protocol accepts either the root URL or the manifest URL.

## Important limitation

Audius is not Spotify. The search catalog depends on music available on Audius, and some tracks may be gated or unavailable for streaming. This addon only returns public, directly playable Audius streams and does not bypass access controls.

Audius' API documents track search and a track stream endpoint. BitChord's addon documentation defines the manifest/search/stream contract used here.

## Troubleshooting

### Addon says the manifest is invalid

Check:

`/manifest.json`

It should return JSON with a non-empty `id` and:

```json
{
  "resources": ["search", "stream"]
}
```

### Search works but playback fails

Try another Audius result. Some tracks can be stream-gated or unavailable.

Also test:

```text
/search?q=test
```

and confirm the returned track has an `id`, `title`, `artist`, and `duration`.

### Too many Audius requests

Add an `AUDIUS_API_KEY` environment variable in Vercel and redeploy.

### Vercel deployment works but BitChord cannot connect

Make sure you pasted the HTTPS deployment URL, not a localhost URL, and that `/manifest.json` is publicly accessible.

## License

This addon is provided as a small integration example. Review Audius' current API terms and the licenses/permissions associated with individual tracks before distributing or using it at scale.
