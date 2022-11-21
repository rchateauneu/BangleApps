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
var imgscale = 2;
var imageW = bufferW/imgscale;
var imageH = bufferH/imgscale;
var imageSize = imageW * imageH;

console.log("Init w=", w, "h=", h, "imageSize=", imageSize);

var bufferImage = new Uint8Array(bufferSize);
bufferImage.fill(0, 0, bufferSize);

// For imgscale = 2, imgSize=7744 : Not fast enough.
function ConwayBufferFirst(imgW, imgH, bufferInput, bufferOutput)
{
  let maxOffset = imgW * imgH;

  var offsets = [-imgH - 1, -imgH, -imgH + 1, -1, 1, imgH -1, imgH, imgH + 1];
	for(let bufferOffset = 0; bufferOffset < maxOffset; bufferOffset++)
	{
    let count = 0;
    for(let offset of offsets) {
      let fullOffset = bufferOffset + offset;
      if(fullOffset < 0) continue;
      if(fullOffset >= maxOffset) break;
      if(bufferInput[fullOffset] == 0) {
        count++;
        if(count > 3) break;
      }
    }
    let currentColor = bufferInput[bufferOffset];
    if(currentColor == 0) {
      if((count < 2) || (count > 3)) {
        currentColor = -1;
      }
    }
    else {
      if(count == 3) {
        currentColor = 0;
      }
    }
    bufferOutput[bufferOffset] = currentColor;
	}
}

// For imgscale = 2, imgSize=7744 : Fast enough !!
function ConwayBufferSecond(imgW, imgH, bufferInput, bufferOutput)
{
  let maxOffset = imgW * imgH;

  // New buffers are initialised to zero. No need to reset. This is not documented.
	//for(let bufferOffset = 0; bufferOffset < maxOffset; bufferOffset++) {
  //  bufferOutput[bufferOffset] = 0;
  //}

  var offsets = [-imgH - 1, -imgH, -imgH + 1, -1, 1, imgH -1, imgH, imgH + 1];
	for(let bufferOffset = 0; bufferOffset < maxOffset; bufferOffset++)
	{
    //if(bufferInput[bufferOffset] == 0) {
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
  let img = {width:imageW, height:imageH, buffer:currentBuffer.buffer, bpp:imgbpp};
  g.drawImage(img,0,0,{scale:imgscale});
}

function InitConway(inputBuffer)
{
  //inputBuffer.drawLine(0,0,10,10);
  //inputBuffer.drawCircle(10,10,10);
  inputBuffer.drawString("Conway", 30, 20);
  //inputBuffer.drawRect(0, 0, 20, 20);
  console.log("InitConway inputBuffer=", inputBuffer);
  DisplayCurrentBuffer();
}

InitConway(currentBuffer);

function Cycle()
{
  let outputBuffer = Graphics.createArrayBuffer(imageW,imageH,imgbpp);
  //ConwayBufferFirst(imageW, imageH, currentBuffer.buffer, outputBuffer.buffer);
  ConwayBufferSecond(imageW, imageH, currentBuffer.buffer, outputBuffer.buffer);

  currentBuffer = outputBuffer;

  var date = new Date(); // Actually the current date, this one is shown
  var timeStr = require("locale").time(date, 1); // Hour and minute
  currentBuffer.setColor(0);
  currentBuffer.setFontAlign(0, 0).setFont("12x20").drawString(timeStr, 45, 20); // draw time

  DisplayCurrentBuffer();
}

var loopCount = 10;

/*
Fonts: [  "4x6",  "6x8",  "12x20",  "6x15",  "Vector" ]
console.log("Fonts:", g.getFonts());
*/

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
