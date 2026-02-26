const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const treePath = path.join(__dirname, '../frontend/public/sprites/player.png');

if (!fs.existsSync(treePath)) {
    console.error("Player sprite not found at", treePath);
    process.exit(1);
}

Jimp.read(treePath)
  .then(image => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];

      // Detect Black (very low RGB values)
      // Usually pure black is 0,0,0, but we'll allow slight artifacts up to 30.
      const isBlack = (red < 30 && green < 30 && blue < 30);

      if (isBlack) {
        this.bitmap.data[idx + 3] = 0; // Set Alpha to 0 (Transparent)
      }
    });

    return image.writeAsync(treePath);
  })
  .then(() => {
    console.log("Successfully removed violet background from tree.png");
  })
  .catch(err => {
    console.error("Error processing image:", err);
  });
