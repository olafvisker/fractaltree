var page = $(document);
var draw = SVG('canvas');

var c = document.getElementById("htmlcanvas");
c.width = $(window).width();
c.height = $(window).height();
var ctx = c.getContext("2d");

var tree = [];
var useSvg = false;
var batchGeneration = 1000;
var generationSpeed = 10;
var maxDepth = 20;
var baseWidth = 5;
var baseAngle = rndInt(-10, 10);
var baseLength = rndInt(135, 165);
var widthFactor = baseWidth / maxDepth;
var extraBranchChance = 0.0;
var dropoutBranchChance = 0.1;
var growLeafs = true;
var leafColor1 = '#DE1B1B';
var leafColor2 = '#c61717';
var branchStartColor = '#000000';
var branchEndColor = '#DE1B1B';
var getLeafRadius = function() { return rndInt(2, 5); };
var getLengthFactor = function() { return rndInt(7, 9) / 10; }
var getAngleFactor = function() { return rndInt(-5, 40); }

function Branch(x, y, angle, length, width, depth) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.length = length;
    this.width = width;
    this.depth = depth;
}

generateTree();    

function generateTree() {
    tree.push(new Branch(page.width() / 2, page.height(), baseAngle, baseLength, baseWidth, 0));

    var idx = 0;
    var routine = setInterval(function(){ 
        for (var i = 0; i < batchGeneration && tree.length > 0; i++) {
            var root = tree.pop();

            if (root.depth == maxDepth && growLeafs) {
                var leafRadius = getLeafRadius();
				if (useSvg)                
					drawCircle(root.x - leafRadius / 2, root.y - leafRadius / 2, leafRadius, interpolateColor(leafColor1, leafColor2, Math.random()));      
				else
					drawCircleHTML(root.x - leafRadius / 2, root.y - leafRadius / 2, leafRadius, interpolateColor(leafColor1, leafColor2, Math.random()));          
                continue;
            }
            else if (root.depth == maxDepth || Math.random() <= (dropoutBranchChance * 2) * (root.depth / maxDepth))
                continue;

            var end = angleToPoint(root.x, root.y, root.angle, root.length);
			if (useSvg)            
				drawLine(root.x, root.y, end[0], end[1], root.width, interpolateColor(branchStartColor, branchEndColor, root.depth / maxDepth));
			else            
				drawLineHTML(root.x, root.y, end[0], end[1], root.width, interpolateColor(branchStartColor, branchEndColor, root.depth / maxDepth));

            tree.push(new Branch(end[0], end[1], root.angle + getAngleFactor(), root.length * getLengthFactor(), root.width - widthFactor, root.depth + 1));
            tree.push(new Branch(end[0], end[1], root.angle - getAngleFactor(), root.length * getLengthFactor(), root.width - widthFactor, root.depth + 1)); 
            if (Math.random() < extraBranchChance)
                tree.push(new Branch(end[0], end[1], root.angle - rndInt(-50, 50), root.length * getLengthFactor(), root.width - widthFactor, root.depth + 1));               
        }
        if (tree.length == 0)
            clearInterval(routine);   
    }, generationSpeed);
}

function angleToPoint(x, y, angle, len) {
    angle = (angle - 90) * Math.PI / 180;
    return [len * Math.cos(angle) + x, len * Math.sin(angle) + y];
}

function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawLine(x1, y1, x2, y2, width, color) {
    draw.line(x1, y1, x2, y2)
    .stroke({ width: width, linecap: 'round', color: color});
} 

function drawCircle(x, y, radius, color) {
    draw.circle(radius).fill(color).move(x , y);
}

function drawLineHTML(x1, y1, x2, y2, width, color) {
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.lineWidth = width;
	ctx.strokeStyle = color;
	ctx.lineCap = 'round';
	ctx.stroke(); 
	ctx.closePath();
} 

function drawCircleHTML(x, y, diameter, color) {
    ctx.beginPath();
	ctx.arc(x,y,diameter / 2,0,2*Math.PI);
	ctx.fill();
	ctx.fillStyle = color;
	ctx.stroke(); 
	ctx.closePath();
}

function r2h(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

function h2r(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

function interpolateColor(color1, color2, factor) {
    color1 = h2r(color1);
    color2 = h2r(color2);
  var result = color1.slice();  
  for (var i=0;i<3;i++) 
    result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
  return r2h(result);
}