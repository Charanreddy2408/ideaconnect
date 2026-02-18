const fs = require('fs');
const https = require('https');
const path = require('path');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir);
}

const file = fs.createWriteStream(path.join(publicDir, "scene.splinecode"));
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

const request = https.get("https://prod.spline.design/kZSsqwDRuobymhIV/scene.splinecode", options, function(response) {
  if (response.statusCode !== 200) {
      console.error(`Failed to download: ${response.statusCode}`);
      return;
  }
  response.pipe(file);
  file.on('finish', () => {
      file.close();
      console.log("Download Completed with size: " + file.bytesWritten);
  });
}).on('error', (err) => {
    console.error("Error downloading file:", err);
});
