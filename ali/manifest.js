const { json, options } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return options(res);
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  return json(res, 200, {
    id: "med101.bitchord.audius",
    name: "Audius",
    version: "1.0.0",
    resources: ["search", "stream"]
  });
};
