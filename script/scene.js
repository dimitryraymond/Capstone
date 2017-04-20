function Scene(canvasId)
{
  this.models = [];
  this.camera = new Camera();
  this.fps = 30;

  this.canvas = document.getElementById(canvasId);
  this.ctx = this.canvas.getContext("2d");

  this.defaultFillStyle = 'black';
  this.defaultStrokeStyle = 'black';
  this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
  this.ctx.font = "30px Arial";
  this.ctx.fillStyle = this.defaultFillStyle;
  this.ctx.strokeStyle = this.defaultStrokeStyle;
  this.ctx.lineWidth = 1;

  //keyboard

  this.initKeyboard();
  this.initMouse();
}

Scene.prototype.initKeyboard = function()
{
  var self = this;
  this.keysDown = new Array(256);
  for(var i = 0; i < 256; i++){
    this.keysDown[i] = false;
  }

  document.onkeydown = function(e){
    self.keysDown[e.keyCode] = true;
  }
  document.onkeyup = function(e){
    self.keysDown[e.keyCode] = false;
  }
}

Scene.prototype.initMouse = function()
{
  //mouse
  this.mouseCoords = {
    x: this.canvas.width / 2,
    y: this.canvas.width / 2
  }

  var canvasBounds = this.canvas.getBoundingClientRect();
  var widthRatio = this.canvas.width / canvasBounds.width;
  var heightRatio = this.canvas.height / canvasBounds.height;

  var self = this;
  document.onmousemove = function(e){
    var x = (e.clientX - canvasBounds.left) * widthRatio;
    var y = (e.clientY - canvasBounds.top) * heightRatio;

    self.mouseCoords = {x, y};
  }
}

Scene.prototype.clearScreen = function()
{
  this.ctx.save();
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.restore();
}

Scene.prototype.update = function()
{
  this.updateInput();
  this.updatePhysics();
  this.updateGraphics();
}

Scene.prototype.updateInput = function()
{
  if(this.keysDown[key.a])
    this.camera.slideLeft();
  if(this.keysDown[key.d])
    this.camera.slideRight();
  if(this.keysDown[key.w])
    this.camera.slideForward();
  if(this.keysDown[key.s])
    this.camera.slideBack();
  if(this.keysDown[key.e])
    this.camera.slideUp();
  if(this.keysDown[key.q])
    this.camera.slideDown();

  if(this.mouseCoords.x < 100)
    this.camera.turnLeft();
  else if(this.mouseCoords.x > 900)
    this.camera.turnRight();
}

Scene.prototype.updatePhysics = function()
{
  for(var i = 0; i < this.models.length; i++)
  {
    this.models[i].updatePhysics();
  }
}

Scene.prototype.addModel = function(model)
{
  this.models.push(model);
}

Scene.prototype.play = function()
{
  var t = this;
  loadingTimer = setInterval(function(){t.update();}, 1000 / this.fps);
}

/// RENDER RELATED METHODS

Scene.prototype.offsetToCamera = function(vertex)
{
  t3DVertex = new THREE.Vector3(0, 0, 0);
  t3DVertex.x = vertex.x - this.camera.position.x;
  t3DVertex.y = vertex.y - this.camera.position.y;
  t3DVertex.z = vertex.z - this.camera.position.z;

  return t3DVertex;
}

Scene.prototype.vertexTo2D = function(vertex)
{
  vertex = this.offsetToCamera(vertex);

  //depth perception
  tVertex = new THREE.Vector2(0, 0);
  tVertex.x = vertex.z == 0 ? vertex.x : (vertex.x * this.camera.zoom) / (-vertex.z + this.camera.zoom);
  tVertex.y = vertex.z == 0 ? vertex.y : (vertex.y * this.camera.zoom) / (-vertex.z + this.camera.zoom);

  return tVertex;
}

Scene.prototype.get2DVertices = function(triangle)
{
  var vertices = [];
  for(var i = 0; i < triangle.vertices.length; i++)
  {
    vertices.push(this.vertexTo2D(triangle.vertices[i]));
  }

  return vertices;
}

Scene.prototype.renderTriangle = function(triangle)
{
  var vertices = this.get2DVertices(triangle);

  this.ctx.beginPath();
  this.ctx.moveTo(vertices[0].x, -vertices[0].y); //* -1 because y is inverted in 2D context
  this.ctx.lineTo(vertices[1].x, -vertices[1].y);
  this.ctx.lineTo(vertices[2].x, -vertices[2].y);
  this.ctx.closePath();

  this.ctx.stroke();
  // this.ctx.fillStyle = 'black';
  // this.ctx.fill();
}

Scene.prototype.updateGraphics = function()
{
  this.clearScreen();

  for(var i = 0; i < this.models.length; i++)
  {
    var model = this.models[i];
    var mesh = model.getGlobalMesh();
    for(var j = 0; j < mesh.length; j++)
    {
      this.renderTriangle(mesh[j]);
    }
  }
}
