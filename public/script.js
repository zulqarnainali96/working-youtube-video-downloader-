// Video download functionality
// document.getElementById("fetch-btn").addEventListener("click", async function () {
//   const urlInput = document.getElementById("video-url").value.trim();

//   if (!urlInput) {
//     showStatus("Please enter a YouTube URL", "error");
//     return;
//   }

//   try {
//     showStatus("Fetching video info...", "loa  ding");

//     const response = await fetch(`/api/videoInfo?url=${encodeURIComponent(urlInput)}`);
//     const data = await response.json();

//     if (response.ok) {
//       updateVideoInfo({
//         title: data.title,
//         author: data.author || "Unknown Author",
//         duration: data.duration,
//         date: new Date().toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         }),
//         description: data.description || "No description available",
//         thumbnail: data.thumbnail,
//         formats: data.formats
//       });

//       document.getElementById("preview-section").style.display = "block";
//       showStatus("Video info loaded successfully", "success");

//       // Scroll to the preview section
//       document.getElementById("preview-section").scrollIntoView({
//         behavior: "smooth",
//       });
//     } else {
//       showStatus(`Error: ${data.error}`, "error");
//     }
//   } catch (error) {
//     showStatus(`Error: ${error.message}`, "error");
//   }
// });
// Fetch video info and populate UI
document.getElementById("fetch-btn").addEventListener("click", async () => {
  const url = document.getElementById("video-url").value.trim();
  if (!url) return showStatus("Please enter a YouTube URL", "error");

  try {
    showStatus("Fetching video info...", "loading");
    showLoader("block")
    const resp = await fetch(`/api/videoInfo?url=${encodeURIComponent(url)}`);
    const data = await resp.json();

    if (!resp.ok) return showStatus(`Error: ${data.error}`, "error") && showLoader('none')

    updateVideoInfo({
      title: data.title,
      author: data.author,
      duration: `${Math.floor(data.duration / 60)}:${(data.duration % 60)
        .toString()
        .padStart(2, "0")}`,
      description: data.description,
      thumbnail: data.thumbnail,
      formats: data.formats,
    });

    document.getElementById("preview-section").style.display = "block";
    showStatus("Video info loaded", "success");
    showLoader("none")
    document
      .getElementById("preview-section")
      .scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    showLoader("none")
    showStatus(`Error: ${err.message}`, "error");
  }
});

// New video button functionality
document.getElementById("new-video-btn").addEventListener("click", function () {
  resetVideoForm();
});

function resetVideoForm() {
  document.getElementById("video-url").value = "";
  document.getElementById("preview-section").style.display = "none";
  document.getElementById("video-url").focus();
  showStatus("", "success");
  showLoader("none")
}

// Download button functionality
document.getElementById("download-now-btn").addEventListener("click", () => {
  const sel = document.querySelector(".option-btn.active");
  if (!sel) return showStatus("Select a format first", "error");

  const url = document.getElementById("video-url").value.trim();
  const itag = sel.dataset.itag;
  const newWin = window.open(
    `/api/download?url=${encodeURIComponent(url)}&itag=${itag}`,
    "_blank"
  );
  if (!newWin) return showStatus("Popup blocked! Allow popups", "error");
  showStatus("Download started", "success");
});

// document.getElementById("download-now-btn").addEventListener("click", async function () {
//   const selectedOption = document.querySelector(".option-btn.active");
//   if (!selectedOption) {
//     showStatus("Please select a format first", "error");
//     return;
//   }

//   const videoUrl = document.getElementById("video-url").value.trim();
//   const itag = selectedOption.dataset.itag;

//   if (!videoUrl) {
//     showStatus("Please enter a YouTube URL first", "error");
//     return;
//   }

//   try {
//     showStatus("Preparing download...", "loading");

//     // Open download in new tab
//     const downloadWindow = window.open(`/api/download?url=${encodeURIComponent(videoUrl)}&itag=${itag}`, '_blank');

//     if (!downloadWindow) {
//       showStatus("Popup blocked. Please allow popups for this site", "error");
//       return;
//     }

//     showStatus("Download started in new tab", "success");
//   } catch (error) {
//     showStatus(`Download error: ${error.message}`, "error");
//   }
// });

// Helper function to extract YouTube video ID
function extractVideoId(url) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

// Update video info in preview
function updateVideoInfo({
  title,
  author,
  duration,
  description,
  thumbnail,
  formats,
}) {
  document.getElementById("video-title").textContent = title;
  document.getElementById("video-author").textContent = author;
  document.getElementById("video-duration").textContent = duration;
  document.getElementById("video-description").textContent = description;
  const thumb = document.getElementById("video-thumbnail");
  thumb.style.backgroundImage = `url('${thumbnail}')`;

  updateFormatOptions(formats);
}
function selectFormatOption(opt) {
  document
    .querySelectorAll(".option-btn")
    .forEach((b) => b.classList.remove("active"));
  opt.classList.add("active");
}

// function showStatus(msg, type) {
//   const st = document.getElementById("status");
//   st.textContent = msg;
//   st.className = type;
//   st.style.display = msg ? "block" : "none";
// }

// function updateVideoInfo(info) {
//   document.getElementById("video-title").textContent = info.title;
//   document.getElementById("video-author").textContent = info.channelOwner;
//   document.getElementById("video-duration").textContent = info.duration;
//   document.getElementById("video-date").textContent = info.date;
//   document.getElementById("video-description").textContent = `${info.description?.substring(0,60)}...`;

//   // Set thumbnail background image
//   const thumbnail = document.getElementById("video-thumbnail");
//   thumbnail.style.backgroundImage = `url('${info.thumbnail}')`;
//   thumbnail.innerHTML = '<i class="fas fa-play-circle" style="font-size: 60px; text-shadow: 0 0 10px rgba(0,0,0,0.5);"></i>';

//   // Update format options
//   updateFormatOptions(info.formats);
// }

function updateFormatOptions(formats) {
  const grid = document.getElementById("format-options");
  grid.innerHTML = "";
  if (!formats.length) {
    grid.innerHTML = '<p class="no-formats">No formats available</p>';
    return;
  }
  formats.forEach((f) => {
    const div = document.createElement("div");
    div.className = "option-btn";
    div.dataset.itag = f.itag;
    div.innerHTML = `<h4>${f.quality}</h4><p>${f.size}</p>`;
    div.addEventListener("click", () => selectFormatOption(div));
    grid.append(div);
  });
  selectFormatOption(grid.firstChild);
}

// function updateFormatOptions(formats) {
//   const optionsGrid = document.getElementById("format-options");
//   optionsGrid.innerHTML = '';

//   if (formats && formats.length > 0) {
//     formats.forEach(format => {
//       const option = document.createElement("div");
//       option.className = "option-btn";
//       option.dataset.itag = format.itag;
//       option.innerHTML = `
//         <h4>${format.quality}</h4>
//         <p>${format.size}</p>
//       `;
//       option.addEventListener("click", function() {
//         selectFormatOption(this);
//       });
//       optionsGrid.appendChild(option);
//     });

//     // Activate the first option by default
//     if (optionsGrid.firstChild) {
//       selectFormatOption(optionsGrid.firstChild);
//     }
//   } else {
//     optionsGrid.innerHTML = '<p class="no-formats">No download formats available</p>';
//   }
// }

function selectFormatOption(optionElement) {
  document
    .querySelectorAll(".option-btn")
    .forEach((btn) => btn.classList.remove("active"));
  optionElement.classList.add("active");
}

// Show status message
function showStatus(message, type) {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  statusElement.className = type;
  statusElement.style.display = message ? "inline-block" : "none";
}
function showLoader(display) {
  document.getElementById("loader").style.display = display;
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("preview-section").style.display = "none";
  showStatus("", "success"); // Initialize with empty status
});

// const homeLink = document.getElementById("home-link");
// // Function to show a page
// function showPage(pageName) {
//   // Hide all pages
//   Object.values(pages).forEach((page) => (page.style.display = "none"));

//   // Show the requested page
//   pages[pageName].style.display = "block";

//   // Show navigation buttons on non-home pages
//   document.querySelector(".page-navigation").style.display =
//     pageName === "home" ? "none" : "flex";
// }

// document.getElementById("fetch-btn").addEventListener("click", function () {
//   const urlInput = document.getElementById("video-url").value;

//   if (urlInput) {
//     // Show the preview section
//     document.getElementById("preview-section").style.display = "block";

//     // Update video info based on URL
//     const videoId = extractVideoId(urlInput);
//     if (videoId) {
//       // In a real app, we would fetch video info from a backend
//       // For this demo, we'll simulate with sample data
//       updateVideoInfo({
//         title: `Video Title for ${videoId}`,
//         author: "Sample Channel",
//         duration: "10:25",
//         date: new Date().toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         }),
//         description:
//           "This is a sample video description. In a real application, this would be fetched from YouTube.",
//         thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
//       });
//     }

//     // Scroll to the preview section
//     document.getElementById("preview-section").scrollIntoView({
//       behavior: "smooth",
//     });
//   } else {
//     alert("Please enter a YouTube URL");
//   }
// });

// // New video button functionality
// document.getElementById("new-video-btn").addEventListener("click", function () {
//   document.getElementById("video-url").value = "";
//   document.getElementById("preview-section").style.display = "none";
//   document.getElementById("video-url").focus();
// });

// // Option selection functionality
// const optionButtons = document.querySelectorAll(".option-btn");
// optionButtons.forEach((button) => {
//   button.addEventListener("click", function () {
//     optionButtons.forEach((btn) => btn.classList.remove("active"));
//     this.classList.add("active");
//   });
// });

// // Download button functionality
// document
//   .getElementById("download-now-btn")
//   .addEventListener("click", function () {
//     const selectedFormat =
//       document.querySelector(".option-btn.active").dataset.format;
//     const videoUrl = document.getElementById("video-url").value;
//     const videoId = extractVideoId(videoUrl);

//     if (!videoId) {
//       alert("Please enter a valid YouTube URL");
//       return;
//     }

//     // In a real application, this would call a backend service
//     // For this demo, we'll simulate download with a sample file

//     // Filename based on format
//     let filename = `youtube_video_${videoId}`;
//     if (selectedFormat === "mp3") {
//       filename += ".mp3";
//     } else {
//       filename += ".mp4";
//     }

//     // Create a sample file to download
//     const sampleContent =
//       "This is a simulated download. In a real application, this would be the actual video content.";
//     const blob = new Blob([sampleContent], {
//       type: "application/octet-stream",
//     });
//     const url = URL.createObjectURL(blob);

//     // Create download link and trigger click
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();

//     // Clean up
//     setTimeout(() => {
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     }, 100);
//   });

// // Helper function to extract YouTube video ID
// function extractVideoId(url) {
//   const regExp =
//     /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[7].length === 11 ? match[7] : null;
// }

// // Update video info in preview
// function updateVideoInfo(info) {
//   document.getElementById("video-title").textContent = info.title;
//   document.getElementById("video-author").textContent = info.author;
//   document.getElementById("video-duration").textContent = info.duration;
//   document.getElementById("video-date").textContent = info.date;
//   document.getElementById("video-description").textContent = info.description;

//   // Set thumbnail background image
//   const thumbnail = document.getElementById("video-thumbnail");
//   thumbnail.style.backgroundImage = `url('${info.thumbnail}')`;
//   thumbnail.innerHTML =
//     '<i class="fas fa-play-circle" style="font-size: 60px; text-shadow: 0 0 10px rgba(0,0,0,0.5);"></i>';
// }

// // Initialize page
// document.addEventListener("DOMContentLoaded", function () {
//   setupNavigation();

//   // Show home page by default
//   // showPage("home");

//   // Sample video data for demo
//   const sampleVideo = {
//     title: "How to Build a Modern Website - Complete Tutorial",
//     author: "Web Dev Tutorials",
//     duration: "15:42",
//     date: "Jun 15, 2023",
//     description:
//       "In this comprehensive tutorial, you'll learn how to build a responsive, modern website from scratch using HTML, CSS, and JavaScript.",
//     thumbnail: "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
//   };

//   // Set sample video for demo purposes
//   updateVideoInfo(sampleVideo);
// });
