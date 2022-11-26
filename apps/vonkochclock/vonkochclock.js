Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.clear();

const ScreenWidth=g.getWidth();
const ScreenHeight=g.getHeight();

const CenterX=ScreenWidth/2;
const CenterY=ScreenHeight/2;
const r = ScreenHeight/2;

console.log("Start log", ScreenWidth, ScreenHeight);

var ax = CenterX + r * Math.sin(0.0);
var ay = CenterY + r * Math.cos(0.0);
var bx = CenterX + r * Math.sin(2*Math.PI/3.0);
var by = CenterY + r * Math.cos(2*Math.PI/3.0);
var cx = CenterX + r * Math.sin(-2*Math.PI/3.0);
var cy = CenterY + r * Math.cos(-2*Math.PI/3.0);
var ratio = Math.sqrt(3.0)/2.0;

function drawVK(x1,y1,x2,y2,depth)
{
  depth--;

  let vx = (x2-x1)/3;
  let vy = (y2-y1)/3;
  let hx = -vy*ratio;
  let hy = vx*ratio;
  let xi = x1 + (vx * 1.5) + hx;
  let yi = y1 + (vy * 1.5) + hy;
  let x11 = x1+vx;
  let y11 = y1+vy;
  let x22 = x2-vx;
  let y22 = y2-vy;

  if(depth == 1) {
    // This avoids recursive calls at the lowest level.
    g.drawPoly([x1,y1,x11,y11,xi,yi,x22,y22,x2,y2], false);
  }
  else {
    drawVK(x1,y1,x11,y11,depth);
    drawVK(x11,y11,xi,yi,depth);
    drawVK(xi,yi,x22,y22,depth);
    drawVK(x22,y22,x2,y2,depth);
  }
}

function calcVK(poly,x1,y1,x2,y2,depth)
{
  depth--;

  let vx = (x2-x1)/3;
  let vy = (y2-y1)/3;
  let hx = -vy*ratio;
  let hy = vx*ratio;
  let xi = x1 + (vx * 1.5) + hx;
  let yi = y1 + (vy * 1.5) + hy;
  let x11 = x1+vx;
  let y11 = y1+vy;
  let x22 = x2-vx;
  let y22 = y2-vy;

  if(depth == 1) {
    // This avoids recursive calls at the lowest level.
    poly.push(x1,y1,x11,y11,xi,yi,x22,y22,x2,y2);
  }
  else {
    calcVK(poly,x1,y1,x11,y11,depth);
    calcVK(poly,x11,y11,xi,yi,depth);
    calcVK(poly,xi,yi,x22,y22,depth);
    calcVK(poly,x22,y22,x2,y2,depth);
  }
}

function drawVonKoch(dp)
{
  drawVK(ax,ay,bx,by,dp);
  drawVK(bx,by,cx,cy,dp);
  drawVK(cx,cy,ax,ay,dp);
}

function calcVonKoch(dp)
{
  poly = []
  calcVK(poly,ax,ay,bx,by,dp);
  calcVK(poly,bx,by,cx,cy,dp);
  calcVK(poly,cx,cy,ax,ay,dp);
  return poly;
}

poly = calcVonKoch(5);
g.drawPoly(poly, false);

let outerRadius = Math.min(CenterX,CenterY) * 0.9;

Bangle.setUI('clock');

Bangle.loadWidgets();

let HourHandLength = outerRadius * 0.5;
let HourHandWidth  = 2*3, halfHourHandWidth = HourHandWidth/2;

let MinuteHandLength = outerRadius * 0.7;
let MinuteHandWidth  = 2*2, halfMinuteHandWidth = MinuteHandWidth/2;

let twoPi  = 2*Math.PI;
let Pi     = Math.PI;
let halfPi = Math.PI/2;

let sin = Math.sin, cos = Math.cos;

let HourHandPolygon = [
  -halfHourHandWidth,halfHourHandWidth,
  -halfHourHandWidth,halfHourHandWidth-HourHandLength,
   halfHourHandWidth,halfHourHandWidth-HourHandLength,
   halfHourHandWidth,halfHourHandWidth,
];

let MinuteHandPolygon = [
  -halfMinuteHandWidth,halfMinuteHandWidth,
  -halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
   halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
   halfMinuteHandWidth,halfMinuteHandWidth,
];

/**** drawClockFace ****/

function drawClockFace () {
  g.setColor(g.theme.fg);
  g.setFont('Vector', 22);

  radiusFaces = 50;
  faces = ["II", "XII", "X", "VIII", "VI", "IV"];

  angle = Math.PI/6.0;
  for(var i = 0; i < 6; i++)
  {
    var text = faces[i];
    angle = Math.PI/6.0 + i * Math.PI/3.0;
    var x = CenterX + radiusFaces * Math.cos(angle) + text.length * 1;
    var y = CenterY - radiusFaces * Math.sin(angle);
    g.setFontAlign(0,0);
    g.drawString(faces[i], x, y);
  }
}

let transformedPolygon = new Array(HourHandPolygon.length);

function transformPolygon (originalPolygon, OriginX,OriginY, Phi) {
  let sPhi = sin(Phi), cPhi = cos(Phi), x,y;

  for (let i = 0, l = originalPolygon.length; i < l; i+=2) {
    x = originalPolygon[i];
    y = originalPolygon[i+1];

    transformedPolygon[i]   = OriginX + x*cPhi + y*sPhi;
    transformedPolygon[i+1] = OriginY + x*sPhi - y*cPhi;
  }
}

/* This creates an array of seconds to an index in the polygon
representing the Von Koch curve. */
function calcPolyToSeconds(poly)
{
  console.log("calcPolyToSeconds poly.length:", poly.length);
  // Seconds to poly
  let secondsToPoint = Array(60).fill(-1);
  let thirtyDivPi = 30.0 / Math.PI;
  for(let indexPoly = 0; indexPoly < poly.length; indexPoly += 2)
  {
    let vx = poly[indexPoly] - CenterX;
    let vy = poly[indexPoly+1] - CenterY;
    // Angle is between -pi and +pi.
    let angle = Math.atan2(vx, vy);
    let index = angle * thirtyDivPi;
    // Clockwise.
    index = 29 - Math.floor(index);
    if(index == 60) {
      index = 0;
    }
    // index is homogenous to a second between 0 and 60.
    secondsToPoint[index] = indexPoly;
  }
  console.log("secondsToPoint=", secondsToPoint);
  console.log("secondsToPoint.length=", secondsToPoint.length);
  // Another pass if some indices do not have a destination point.
  for(let indexJ = 0; indexJ < 60; ++indexJ)
  {
    if(secondsToPoint[indexJ] == -1) {
      if(indexJ == 0) {
        secondsToPoint[indexJ] = secondsToPoint[indexJ + 1];
      }
      else {
        secondsToPoint[indexJ] = secondsToPoint[indexJ - 1];
      }
    }
  }
  console.log("calcPolyToSeconds secondsToPoint.length:", secondsToPoint.length);
  return secondsToPoint;
}

let polyVonKoch = calcVonKoch(5);
let polyToSeconds = calcPolyToSeconds(polyVonKoch);
console.log("polyVonKoch.length:", polyVonKoch.length);

function drawClockHands () {
  let now = new Date();

  let Hours   = now.getHours() % 12;
  let Minutes = now.getMinutes();
  let Seconds = now.getSeconds();

  let HoursAngle   = (Hours+(Minutes/60))/12 * twoPi - Pi;
  let MinutesAngle = (Minutes/60)            * twoPi - Pi;
  let SecondsAngle = (Seconds/60)            * twoPi - Pi;

  g.setColor(g.theme.fg);

  transformPolygon(HourHandPolygon, CenterX,CenterY, HoursAngle);
  g.fillPoly(transformedPolygon);

  transformPolygon(MinuteHandPolygon, CenterX,CenterY, MinutesAngle);
  g.fillPoly(transformedPolygon);

  let indexDestSeconds = polyToSeconds[Seconds];
  console.log("Seconds:", Seconds, " indexDestSeconds:", indexDestSeconds);
  let xDestSeconds = polyVonKoch[indexDestSeconds];
  let yDestSeconds = polyVonKoch[indexDestSeconds + 1];
  g.setColor(g.theme.fg2);
  g.drawLine(
    CenterX,
    CenterY,
    xDestSeconds,
    yDestSeconds
  );
}

function FillPolygon(poly)
{
  /*
  This algorithm does not work because it does not fill the proper side of each sub-polygonn.
  Maybe filling the triangles recursively, but before drawing the hands.
  */
  let start = 0;
  let end = 128;
  while(true) {
    g.fillPoly(polyVonKoch.slice(start,end));
    if(end >= poly.length) break;
    start = end;
    end = end + 128;
    if(end > poly.length) end = poly.length;
  }
}

let Timer;
function refreshDisplay () {
  g.clear(true); // also loads current theme

  // TODO: Documentation indicates an upper limit of 64 points, but this works with hundreds.
  // However, this limits of valid for fillPoly
  g.drawPoly(polyVonKoch, false);
  //FillPolygon(poly);
  drawClockFace();
  drawClockHands();

  let Pause = 1000 - (Date.now() % 1000);
  Timer = setTimeout(refreshDisplay,Pause);
}

setTimeout(refreshDisplay, 500);                 // enqueue first draw request
