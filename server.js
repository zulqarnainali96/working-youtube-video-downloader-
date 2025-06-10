const express = require("express");
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Create downloads directory if not exists
// if (!fs.existsSync("downloads")) {
//   fs.mkdirSync("downloads");
// }

// API endpoint to get video info and formats
app.get("/api/videoInfo", async (req, res) => {
  const { url } = req.query;
  if (!ytdl.validateURL(url))
    return res.status(400).json({ error: "Invalid YouTube URL" });
  try {
    const info = await ytdl.getInfo(url);

    const avFormats = ytdl.filterFormats(info.formats, "videoandaudio");
    // Collect desired quality options
    const qualities = ["1080p", "720p", "480p", "360p", "240p"];
    const formats = qualities
      .map((q) =>
        avFormats.find((f) => f.qualityLabel === q && f.container === "mp4")
      )
      .filter((f) => f)
      .map((f) => ({
        itag: f.itag,
        quality: f.qualityLabel,
        size: f.contentLength ? formatBytes(f.contentLength) : "Unknown",
      }));

    const shortDescription =
      info.videoDetails.description?.substring(0, 60) + "..." ?? "";
    return res.json({
      title: info.videoDetails.title,
      description: shortDescription,
      author: info.videoDetails.ownerChannelName,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      formats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
});
app.get("/api/download", async (req, res) => {
  try {
    const { url, itag } = req.query;

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const format = info.formats.find((f) => f.itag === parseInt(itag));
    if (!format) {
      return res.status(400).json({ error: "Invalid format selected" });
    }

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
    ytdl(url, { quality: itag }).pipe(res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
