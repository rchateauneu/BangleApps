// Initial content of emulator was:
// setTimeout(load,100);Bangle.factoryReset()
// /?code=setTimeout(load,100);Bangle.factoryReset()&emulator&upload

// Software reference: http://www.espruino.com/ReferenceBANGLEJS2

console.log("Start");

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.clear();

var w=g.getWidth();
var h=g.getHeight();

// White on all platforms.
// g.setColor(-1)

var bufferW = w;
var bufferH = h;
var bufferSize = bufferW * bufferH;

// Web Safe 216 color palette
// https://en.wikipedia.org/wiki/Web_colors#Web-safe_colors
// r,g,b = (0..5, 0..5, 0..5)
var COLOR_RED = 5 * 36;
var COLOR_GREEN = 5 * 16;
var COLOR_BLUE = 5;
var COLOR_WHITE = 255; // If 8 bits
var COLOR_BLACK = 0;
var imgbpp = 8;
// var imgbpp = 24;
var imgscale = 4;
var imageW = bufferW/imgscale;
var imageH = bufferH/imgscale;
var imageSize = imageW * imageH;

console.log("Init w=", w, "h=", h, "imageSize=", imageSize);

// For imgscale = 2, imgSize=7744 : Fast enough !!
function ConwayBuffer(imgW, imgH, bufferInput, bufferOutput)
{
  let maxOffset = imgW * imgH;

  // New buffers are initialised to zero. No need to reset. This is not documented.
  // Consider XXX.fill(0);
	//for(let bufferOffset = 0; bufferOffset < maxOffset; bufferOffset++) {
  //  bufferOutput[bufferOffset] = 0;
  //}

  // Sorted in increasing order.
  var offsets = [-imgH - 1, -imgH, -imgH + 1, -1, 1, imgH -1, imgH, imgH + 1];
  
  // bufferOutput is used first to store the number of neighbours, then for the color.
	for(let bufferOffset = 0; bufferOffset < maxOffset; bufferOffset++)
	{
    if(COLOR_WHITE != bufferInput[bufferOffset]) {
      // This is rarely done because most pixels are not set.
      for(let offset of offsets) {
        let fullOffset = bufferOffset + offset;
        if(fullOffset < 0) continue;
        if(fullOffset >= maxOffset) break;
        bufferOutput[fullOffset]++;
      }
    }
  }

	for(let bufferOffset = 0; bufferOffset < maxOffset; bufferOffset++) {
    let currentColor = bufferInput[bufferOffset];
    let count = bufferOutput[bufferOffset];
    if(currentColor == COLOR_RED) currentColor = 0;
    if(currentColor) {
      if(count == 3) {
        currentColor = COLOR_BLACK;
      }
    }
    else {
      if((count < 2) || (count > 3)) {
        currentColor = COLOR_WHITE;
      }
    }
    bufferOutput[bufferOffset] = currentColor;
  }
}

var currentBuffer = Graphics.createArrayBuffer(imageW,imageH,imgbpp);

/////////////////////////////////////////////////////////////
// Display digits with pre-computed images.
// Problem with the two dots, because createImage reduces the expected size.

function createChar(str) {
  console.log("str=", str);
  img = Graphics.createImage(str);
  //arrayBuffer = Graphics.createArrayBuffer(3,7,imgbpp);
  //arrayBuffer.setColor(COLOR_RED);
  //arrayBuffer.drawImage(img, 0, 0);
  console.log("img=", img);
  //return arrayBuffer;
  return img;
}

var img0 = createChar(`
 1
1 1
1 1
1 1
1 1
1 1
 1
`);
var img1 = createChar(`
 1
11
 1
 1
 1
 1
111
`);
var img2 = createChar(`
 1
1 1
  1
 1
1
1
111
`);
var img3 = createChar(`
 1
1 1
  1
 1
  1
1 1
 1
`);
var img4 = createChar(`
  1
1 1
1 1
111
  1
  1
  1
`);
var img5 = createChar(`
111
1
1
 1
  1
1 1
 1
`);
var img6 = createChar(`
 1
1 1
1
11
1 1
1 1
 1
`);
var img7 = createChar(`
111
1 1
  1
 1
 1
 1
 1
`);
var img8 = createChar(`
 1
1 1
1 1
 1
1 1
1 1
 1
`);
var img9 = createChar(`
 1
1 1
1 1
 11
  1
1 1
 1
`);
var imgD = createChar(`

   
 1 
   
 1 
   
   
`);
const ImagesArray = [img0, img1, img2, img3, img4, img5, img6, img7, img8, img9, imgD];

const setNumImages = (img, x, y, offsety, color) => {
  // TODO: White pixels could be transparent.
  console.log("img=", img);
  // currentBuffer.drawImage(img,2*j,2*i,{scale:2});
  //myobj = {width:3, height:7, bpp:8, transparent:0,buffer:img.buffer};
  //myobj = {width:3, height:7, bpp:1, transparent:0,buffer:img.buffer};
  myobj = {width:img.width, height:img.height, bpp:1, transparent:0,buffer:img.buffer};
  // currentBuffer.drawImage(myobj,2*j + (7-img.height),2*i + (3-img.width),{scale:2});
  // currentBuffer.drawImage(myobj,2*(j + (3-img.width)),2*(i + (7-img.height)),{scale:2});
  currentBuffer.drawImage(myobj,2*x,2*y + 2 * offsety,{scale:2});
};

function WriteTimeImages(hourTens, hourOnes, minuteTens, minuteOnes, color)
{
  currentBuffer.setColor(COLOR_RED);
  setNumImages(ImagesArray[hourTens], 1, 8, 0, color);
  setNumImages(ImagesArray[hourOnes], 6, 8, 0, color);
  setNumImages(ImagesArray[10], 10, 8, 2, color);
  //setNumImages(ImagesArray[10], 8, 10, color);
  setNumImages(ImagesArray[minuteTens], 14, 8, 0, color);
  setNumImages(ImagesArray[minuteOnes], 19, 8, 0, color);
}

/////////////////////////////////////////////////////////////
// Another way to display digits.

const ONE = [
  [0, 1, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1],
];
const TWO = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 1],
];
const THREE = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 0, 1],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const FOUR = [
  [0, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 1],
  [0, 0, 1],
];
const FIVE = [
  [1, 1, 1],
  [1, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const SIX = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 0],
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const SEVEN = [
  [1, 1, 1],
  [1, 0, 1],
  [0, 0, 1],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
];
const EIGHT = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const NINE = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const ZERO = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const NUMBERS = [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE];

const setPixelSub = (i, j, color) => {
  currentBuffer.buffer[i * imageW + j] = color;
};

const setPixel = (i, j, color) => {
  setPixelSub(2*i, 2*j, color);
  setPixelSub(2*i, 2*j + 1, color);
  setPixelSub(2*i + 1, 2*j, color);
  setPixelSub(2*i + 1, 2*j + 1, color);
};

const setNum = (character, i, j, color) => {
  const startJ = j;
  character.forEach(row => {
    j = startJ;
    row.forEach(pixel => {
      if (pixel) setPixel(i, j, color);
      j++;
    });
    i++;
  });
};

const setDots = (color) => {
  setPixel(10, 10, color);
  setPixel(12, 10, color);
};

function WriteTimeArrays(hourTens, hourOnes, minuteTens, minuteOnes, color)
{
    setNum(NUMBERS[hourTens], 8, 1, color);
    setNum(NUMBERS[hourOnes], 8, 6, color);
    setDots(color);
    setNum(NUMBERS[minuteTens], 8, 13, color);
    setNum(NUMBERS[minuteOnes], 8, 18, color);
}

/////////////////////////////////////////////////////////////

function DrawTime(black)
{
  const d = new Date();
  const hourTens = Math.floor(d.getHours() / 10);
  const hourOnes = d.getHours() % 10;
  const minuteTens = Math.floor(d.getMinutes() / 10);
  const minuteOnes = d.getMinutes() % 10;
  const seconds = d.getSeconds();
  // WriteTimeImages(hourTens, hourOnes, minuteTens, minuteOnes, COLOR_RED);
  WriteTimeArrays(hourTens, hourOnes, minuteTens, minuteOnes, COLOR_RED);
}

//////////////////////////////////////////////////////////////////////


function DrawCurrentBuffer() {
  g.drawImage({
    width:imageW, height:imageH, bpp: imgbpp,
    buffer : currentBuffer.buffer,
  },0,0,{scale:imgscale});
}

DrawCurrentBuffer();

function CreateImage()
{
  let outputBuffer = Graphics.createArrayBuffer(imageW,imageH,imgbpp);
  ConwayBuffer(imageW, imageH, currentBuffer.buffer, outputBuffer.buffer);

  currentBuffer = outputBuffer;
  DrawTime();

  DrawCurrentBuffer();
}

function MainLoop()
{
  setTimeout(MainLoop, 1000);
  CreateImage();
}

Bangle.setUI("clock");
// Bangle.loadWidgets();

console.log("Init buffer done");
MainLoop();
