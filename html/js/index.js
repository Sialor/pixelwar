var camera;

var offsetCamera;

var canvasMoved = false;

var sizePixel = 1;

var currentColor = 0;
var colorMap = [];

var isUsePipette = false;

var bgCanvas;
var bgCtx;

var fgCanvas;
var fgCtx;

var mmCanvas; //MiniMap
var mmCtx;

var timer = null; // require init null

// create html elements
function CreatePalette() {
	let rgbToHex = function(r, g, b) {
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

	let attr = [];

	let appendColor = function(id) {
		attr[0] = document.createAttribute("id");
		attr[1] = document.createAttribute("src");
		attr[2] = document.createAttribute("style");
		
		attr[0].value = "colorelement" + id;
		attr[1].value = "icons/color_element.png";
		attr[2].value = "background-color: " + 
			rgbToHex(Math.floor(colorMap[id].r), Math.floor(colorMap[id].g), Math.floor(colorMap[id].b));

		let element = document.createElement("img");

		element.setAttributeNode(attr[0]);
		element.setAttributeNode(attr[1]);
		element.setAttributeNode(attr[2]);

		document.querySelector("#colormap").appendChild(element);
	}

	for (let i = 0; i < 256; ++i)
		appendColor(i);

	// for (let i = 0; i < 24; ++i) 	appendColor(i);
	// for (let i = 255; i > 215; --i) appendColor(i);
	// for (let i = 24; i < 88; ++i) 	appendColor(i);
	// for (let i = 88; i < 152; ++i) 	appendColor(i);
	// for (let i = 152; i < 216; ++i) appendColor(i);
}

function CreateBgCanvas() {
	let attribute = document.createAttribute("id");
	attribute.value = "bgcanvas";

	bgCanvas = document.createElement("Canvas");
	bgCanvas.setAttributeNode(attribute);
	document.body.appendChild(bgCanvas);
}

// возвращает Color из colorMap
function UsePipette(color) {
	for (let i = 0; i < 256; ++i) {
		if (colorMap[i].r != color.r || colorMap[i].g != color.g || colorMap[i].b != color.b)
			continue;

		currentColor = i;

		let brush = document.querySelector("#colorbrush");
		let element = document.querySelector("#colorelement" + currentColor);
		
		brush.style.backgroundColor = element.style.backgroundColor;
		// console.log(brush);

		return;
	}
}

function RedrawMiniMap() {
	//clear
	mmCanvas.width = mmCanvas.width;

	mmCtx.drawImage(bgCanvas, 0, 0, bgCanvas.width, bgCanvas.height, 0, 0, mmCanvas.width, mmCanvas.height);

	// minimap pixels per background pixel
	let mpPbp = new Vec2(mmCanvas.width / bgCanvas.width, mmCanvas.height / bgCanvas.height);

	mmCtx.strokeRect(camera.x * mpPbp.x, camera.y * mpPbp.y, camera.width * mpPbp.x, camera.height * mpPbp.y);
}

function RedrawFgCanvas() {
	// clear
	fgCanvas.width = fgCanvas.width;

	fgCtx.imageSmoothingEnabled = false;

	fgCtx.drawImage(bgCanvas,
		camera.x - 1, camera.y - 1, camera.width + 2, camera.height + 2,
		offsetCamera.x - sizePixel, offsetCamera.y - sizePixel, (camera.width + 2) * sizePixel, (camera.height + 2) * sizePixel);
}

function RecalcSizeFgCanvas() {
	fgCanvas.width = window.innerWidth;
	fgCanvas.height = window.innerHeight - document.querySelector("header").clientHeight;
	// console.log(window.innerWidth, window.innerHeight, ' ', fgCanvas.width, ' ', fgCanvas.height);
	// console.log(document.querySelector("header").clientHeight);
	camera = new Rect(0, 0, fgCanvas.width, fgCanvas.height);

	sizePixel = 1;
}

// перемещает камеру в рамки bgCanvas
function ReturnCameraToMap() {
	camera.x = Math.max(0, Math.min(camera.x, bgCanvas.width - camera.width));
	camera.y = Math.max(0, Math.min(camera.y, bgCanvas.height - camera.height));

	if (camera.x == 0)
		offsetCamera.x = Math.min(0, offsetCamera.x);
	else if (camera.x == bgCanvas.width - camera.width)
		offsetCamera.x = Math.max(0, offsetCamera.x);
	
	if (camera.y == 0)
		offsetCamera.y = Math.min(0, offsetCamera.y);
	else if (camera.y == bgCanvas.height - camera.height)
		offsetCamera.y = Math.max(0, offsetCamera.y);
}

//status - bool
// 0 - off
// 1 - on
function PipetteTurn(status) {
	isUsePipette = status;

	let pipette = document.querySelector("#pipette");

	if (isUsePipette) {
		// вкл
		pipette.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
		pipette.style.borderColor = "rgba(127, 127, 127, 0.5)";
		// pipette.style.borderStyle = "inset";
	} else {
		// выкл
		pipette.style.backgroundColor = "rgba(0, 0, 0, 0)";
		pipette.style.borderColor = "rgba(127, 127, 127, 0)";
		// pipette.style.borderStyle = "outset";
	}
}

function EventMouseClickElementColor(event) {
	document.querySelector("#colorbrush").style.backgroundColor = event.currentTarget.style.backgroundColor;
	
	currentColor = Number(event.currentTarget.id.slice(12));
	
	if (isUsePipette)
		PipetteTurn(false);
}

function EventMouseClick(event) {
	if (canvasMoved) {
		canvasMoved = false;
		return;
	}

	event.preventDefault();

	let point = new Vec2(
		(event.offsetX - offsetCamera.x) / sizePixel,
		(event.offsetY - offsetCamera.y) / sizePixel);

	point.x = camera.x + Math.trunc(point.x);
	point.y = camera.y + Math.trunc(point.y);

	// console.log("click: " + event.offsetX + ' ' + event.offsetY);
	// console.log("offsetCamera: " + offsetCamera.x + ' ' + offsetCamera.y);
	// console.log("point: " + point.x + ' ' + point.y);

	let pxl;

	if (isUsePipette) {
		// взятие пикселя из background canvas
		pxl = bgCtx.getImageData(point.x, point.y, 1, 1);
		UsePipette(new Color(pxl.data[0], pxl.data[1], pxl.data[2]));
		return;
	}

	if (timer != null)
		return;

	// создание пикселя
	pxl = bgCtx.createImageData(1, 1);
	
	pxl.data[0] = colorMap[currentColor].r;
	pxl.data[1] = colorMap[currentColor].g;
	pxl.data[2] = colorMap[currentColor].b;
	pxl.data[3] = 255;

	bgCtx.putImageData(pxl, point.x, point.y);
	
	SendPixel(currentColor, point.x, point.y);

	if (timer == null) {
		document.querySelector("#timer").textContent = "10";

		timer = setInterval(function () {
			if (document.querySelector("#timer").textContent == "1") { // cancel
				clearInterval(timer);

				timer = null;

				document.querySelector("#timer").textContent = "";
			}
			else // default
				document.querySelector("#timer").textContent = 
					Number(document.querySelector("#timer").textContent) - 1 + '';
			// console.log(document.querySelector("#timer").textContent);
		}, 1000);
	}

	RedrawFgCanvas();
}

function EventMouseMove(event) {
	if (event.buttons == 1) {
		offsetCamera.x += event.movementX;
		offsetCamera.y += event.movementY;

		let move = new Vec2();
		if (offsetCamera.x < 0 || offsetCamera.x >= sizePixel) {
			move.x = Math.trunc(offsetCamera.x / sizePixel);
			offsetCamera.x %= sizePixel;
		}

		if (offsetCamera.y < 0 || offsetCamera.y >= sizePixel) {
			move.y = Math.trunc(offsetCamera.y / sizePixel);
			offsetCamera.y %= sizePixel;
		}

		camera.x -= move.x;
		camera.y -= move.y;

		canvasMoved = true;

		ReturnCameraToMap();
		RedrawFgCanvas();
		RedrawMiniMap();
	}
}

// чем меньше размерность пикселей, тем меньше видно границу холста
function EventMouseScroll(event) {
	event.preventDefault();

	let sign = Math.sign(event.deltaY);

	camera.width *= sizePixel;
	camera.height *= sizePixel;

	sizePixel -= sign;
	sizePixel = Math.max(1, Math.min(64, sizePixel));

	camera.width /= sizePixel;
	camera.height /= sizePixel;

	ReturnCameraToMap();
	RedrawFgCanvas();
	RedrawMiniMap();
}

function ReceiveMapSize(canvas) {
	let xhr = new XMLHttpRequest();
	xhr.onload = function() {
		let tmp = xhr.response.split(' ');
		canvas.width = Number(tmp[0]);
		canvas.height = Number(tmp[1]);
	};

	xhr.open("GET", "/server/?action=getmapsize", true);
	xhr.send();
}

function ReceivePieceOfCanvas(x, y, width, height) {
	let xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if (xhr.response == null)
			return;

		let pxl = bgCtx.createImageData(width, height);

		let byteArray = new Uint8Array(xhr.response);

		for (var i = 0; i < byteArray.byteLength; i++) {
			pxl.data[i * 4 + 0] = colorMap[byteArray[i]].r;
			pxl.data[i * 4 + 1] = colorMap[byteArray[i]].g;
			pxl.data[i * 4 + 2] = colorMap[byteArray[i]].b;
			pxl.data[i * 4 + 3] = 255;
		}
		
		bgCtx.putImageData(pxl, x, y);
	};

	xhr.open("GET", "/server/?action=getpieceofcanvas&x=" + Math.trunc(x) + "&y=" + Math.trunc(y) + "&width=" + Math.trunc(width) + "&height=" + Math.trunc(height), true);
	xhr.responseType = "arraybuffer";
	xhr.send();
}

function SendPixel(clr, x, y) {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", "/server/?action=setpixel&clr=" + clr + "&x=" + x + "&y=" + y, true);
	xhr.send();
}

function EventBodyResize() {
	RecalcSizeFgCanvas();
	RedrawFgCanvas();
	RedrawMiniMap();
}

function EventOnLoad() {
	// create palette
	for (let i = 1; i < 9; ++i) {
		colorMap.push(new Color(256 / 9 * i, 0, 0));
		colorMap.push(new Color(0, 256 / 9 * i, 0));
		colorMap.push(new Color(0, 0, 256 / 9 * i));
	}

	for (let i = 1; i < 9; ++i)
		for (let j = 1; j < 9; ++j) {
			colorMap.push(new Color(256 / 9 * i, 256 / 9 * j, 0));
			colorMap.push(new Color(256 / 9 * i, 0, 256 / 9 * j));
			colorMap.push(new Color(0, 256 / 9 * j, 256 / 9 * j));
		}

	for (let i = 0; i < 39; ++i)
		colorMap.push(new Color(256 / 39 * i, 256 / 39 * i, 256 / 39 * i));

	colorMap.push(new Color(255, 255, 255));
	// end create palette

	offsetCamera = new Vec2();
	camera = new Rect(0, 0, 400, 300);

	fgCanvas = document.querySelector("#fgcanvas");
	mmCanvas = document.querySelector("#minimap");

	CreateBgCanvas();
	ReceiveMapSize(bgCanvas);

	// fgCtx = fgCanvas.getContext("2d", { alpha: false });
	fgCtx = fgCanvas.getContext("2d");
	bgCtx = bgCanvas.getContext("2d");
	mmCtx = mmCanvas.getContext("2d");

	CreatePalette();

	document.querySelectorAll("img[id^=\"colorelement\"]").forEach(
		element => element.addEventListener("click", EventMouseClickElementColor)
	);

	// events
	fgCanvas.addEventListener("click", EventMouseClick);
	fgCanvas.addEventListener("mousemove", EventMouseMove);
	fgCanvas.addEventListener("wheel", EventMouseScroll);

	document.querySelector("#pipette").addEventListener("click", function() {
		PipetteTurn(!isUsePipette);
	});

	window.addEventListener("resize", EventBodyResize);
	EventBodyResize();

	setInterval(function () {
		ReceivePieceOfCanvas(camera.x, camera.y, camera.width, camera.height);
	}, 1000);

	setInterval(function () {
		RedrawFgCanvas();
		RedrawMiniMap();
	}, 1000);
}