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

var imgbpp = 8;
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

  var offsets = [-imgH - 1, -imgH, -imgH + 1, -1, 1, imgH -1, imgH, imgH + 1];
	for(let bufferOffset = 0; bufferOffset < maxOffset; bufferOffset++)
	{
    if(! bufferInput[bufferOffset]) {
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
    if(currentColor) {
      if(count == 3) {
        currentColor = 0;
      }
    }
    else {
      if((count < 2) || (count > 3)) {
        currentColor = -1;
      }
    }
    bufferOutput[bufferOffset] = currentColor;
  }
}

var currentBuffer = Graphics.createArrayBuffer(imageW,imageH,imgbpp);

function DisplayCurrentBuffer() {
  g.drawImage({
    width:imageW, height:imageH, bpp: imgbpp,
    buffer : currentBuffer.buffer,
  },0,0,{scale:imgscale});
}

console.log("InitConway inputBuffer=", inputBuffer);
DisplayCurrentBuffer();

//////////////////////////////////////////////////////////////////////
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

const setPixelSub = (i, j) => {
  currentBuffer.buffer[i * imageW + j] = 0;
}


const setPixel = (i, j) => {
  setPixelSub(2*i, 2*j);
  setPixelSub(2*i, 2*j + 1);
  setPixelSub(2*i + 1, 2*j);
  setPixelSub(2*i + 1, 2*j + 1);
};

const setNum = (character, i, j) => {
  const startJ = j;
  character.forEach(row => {
    j = startJ;
    row.forEach(pixel => {
      if (pixel) setPixel(i, j);
      j++;
    });
    i++;
  });
};

const setDots = () => {
  setPixel(10, 10);
  setPixel(12, 10);
};

function DrawTime()
{
  currentBuffer.setColor(0);
  /*
  var date = new Date(); // Actually the current date, this one is shown
  var timeStr = require("locale").time(date, 1); // Hour and minute
  currentBuffer.setColor(0);
  currentBuffer.setFontAlign(0, 0).setFont("12x20").drawString(timeStr, 45, 20); // draw time
  */
  const d = new Date();
  const hourTens = Math.floor(d.getHours() / 10);
  const hourOnes = d.getHours() % 10;
  const minuteTens = Math.floor(d.getMinutes() / 10);
  const minuteOnes = d.getMinutes() % 10;
  setNum(NUMBERS[hourTens], 8, 1);
  setNum(NUMBERS[hourOnes], 8, 6);
  setDots();
  setNum(NUMBERS[minuteTens], 8, 13);
  setNum(NUMBERS[minuteOnes], 8, 18);
}

//////////////////////////////////////////////////////////////////////


function Cycle()
{
  let outputBuffer = Graphics.createArrayBuffer(imageW,imageH,imgbpp);
  ConwayBuffer(imageW, imageH, currentBuffer.buffer, outputBuffer.buffer);

  currentBuffer = outputBuffer;
  DrawTime();

  DisplayCurrentBuffer();
}

var loopCount = 100;

function Looper()
{
  console.log("loopCount=", loopCount);
  if(loopCount > 0) {
    loopCount--;
  	setTimeout(Looper, 1000);
    Cycle();
  }
}

console.log("Init buffer done");
Looper();
