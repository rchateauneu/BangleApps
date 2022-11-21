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
  //console.log("In func:", depth, x1,y1,x2,y2);
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
  //console.log("In func:", depth, x1,y1,x2,y2);
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

///////////////////////////////


  let outerRadius = Math.min(CenterX,CenterY) * 0.9;

  Bangle.setUI('clock');

  Bangle.loadWidgets();

  let HourHandLength = outerRadius * 0.5;
  let HourHandWidth  = 2*3, halfHourHandWidth = HourHandWidth/2;

  let MinuteHandLength = outerRadius * 0.7;
  let MinuteHandWidth  = 2*2, halfMinuteHandWidth = MinuteHandWidth/2;

  let SecondHandLength = outerRadius * 0.9;
  let SecondHandOffset = 6;

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
    faces = ["II", "XII", "X", "VIII", "VI", "IV"]
    
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

/**** transforme polygon ****/

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

/**** draw clock hands ****/

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

    let sPhi = Math.sin(SecondsAngle), cPhi = Math.cos(SecondsAngle);

    g.setColor(g.theme.fg2);
    g.drawLine(
      CenterX + SecondHandOffset*sPhi,
      CenterY - SecondHandOffset*cPhi,
      CenterX - SecondHandLength*sPhi,
      CenterY + SecondHandLength*cPhi
    );
  }

/**** refreshDisplay ****/

  poly = calcVonKoch(5);

  let Timer;
  function refreshDisplay () {
    g.clear(true);                                   // also loads current theme

    // drawVonKoch(5);
    g.drawPoly(poly, false);
    console.log("Len poly:", poly.length);
    drawClockFace();
    drawClockHands();

    let Pause = 1000 - (Date.now() % 1000);
    Timer = setTimeout(refreshDisplay,Pause);
  }

  setTimeout(refreshDisplay, 500);                 // enqueue first draw request
