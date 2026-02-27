const fs = require('fs');
const PNG = require('pngjs').PNG;

function makeTransparent(filePath) {
    if (!fs.existsSync(filePath)) return;
    const data = fs.readFileSync(filePath);
    const png = PNG.sync.read(data);

    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            let idx = (png.width * y + x) << 2;
            let r = png.data[idx];
            let g = png.data[idx+1];
            let b = png.data[idx+2];
            
            // Checkerboard is usually white (#fff) and light gray (#ccc).
            // Any light greyscale pixel gets transparent.
            if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 165) {
                png.data[idx+3] = 0; // Alpha = fully transparent
            }
        }
    }
    
    const buffer = PNG.sync.write(png);
    fs.writeFileSync(filePath, buffer);
    console.log(`Successfully processed ${filePath}`);
}

makeTransparent('./public/sprites/tree.png');
makeTransparent('./public/sprites/building.png');
makeTransparent('./public/sprites/player.png');
