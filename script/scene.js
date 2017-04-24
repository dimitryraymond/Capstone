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
  // this.ctx.fillStyle = this.defaultFillStyle;
  // this.ctx.strokeStyle = this.defaultStrokeStyle;
  this.ctx.lineWidth = 1;

  //keyboard

  this.initKeyboard();
  this.initMouse();
  this.logged = false;
  this.fill = false;
  this.showDebug = true;
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

    //toggle fill display
    if(e.keyCode == key.f)
      self.fill = !self.fill;

    //toggle debug display
    if(e.keyCode == key.z)
      self.showDebug = !self.showDebug;
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
    y: this.canvas.height / 2
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
  this.updateModels();
  this.updateInput();
  this.updatePhysics();
  this.updateGraphics();
  this.logged = false;
}

Scene.prototype.updateModels = function()
{
  for(var i = 0; i < this.models.length; i++)
  {
    this.models[i].update();
  }
}

Scene.prototype.updateInput = function()
{
  //camera walking
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

  //camera turning
  if(this.mouseCoords.x < 100)
    this.camera.turnLeft();
  else if(this.mouseCoords.x > 900)
    this.camera.turnRight();
  if(this.mouseCoords.y < 50)
    this.camera.turnUp();
  else if(this.mouseCoords.y > 450)
    this.camera.turnDown();

  //misc
  if(this.keysDown[key.r])
  {
    for(var i = 0; i < this.models.length; i++)
      this.models[i].angularVelocity = new THREE.Vector3();
  }

  if(this.keysDown[key.x])
  {
    for(var i = 0; i < this.models.length; i++)
      this.models[i].angularVelocity.x += .1;
  }
  if(this.keysDown[key.c])
  {
    for(var i = 0; i < this.models.length; i++)
      this.models[i].angularVelocity.y += .1;
  }
  if(this.keysDown[key.v])
  {
    for(var i = 0; i < this.models.length; i++)
      this.models[i].angularVelocity.z += .1;
  }
}

Scene.prototype.updatePhysics = function()
{
  for(var i = 0; i < this.models.length; i++)
  {
    this.models[i].updatePhysics();
  }
  //detect collisions
  for(var i = 0; i < this.models.length; i++)
  {
    for(var j = i + 1; j < this.models.length; j++)
    {
      var maybeColliding = mightBeColliding(this.models[i], this.models[j]);
      //do pixel perfect collision detection
      if(maybeColliding)
      {
        //bounding hull
        //check bounding hulls
      }
    }
  }
  //solve constraints
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
  //position offset
  t3DVertex = new THREE.Vector3(0, 0, 0);
  t3DVertex.x = vertex.x - this.camera.position.x;
  t3DVertex.y = vertex.y - this.camera.position.y;
  t3DVertex.z = vertex.z - this.camera.position.z;

  var quaternion = new THREE.Quaternion().setFromUnitVectors(this.camera.angle, new THREE.Vector3(0, 0, -1));

  t3DVertex.applyQuaternion(quaternion);

  return t3DVertex;
}

Scene.prototype.vertexTo2D = function(vertex)
{
  //depth perception
  tVertex = new THREE.Vector2(0, 0);
  tVertex.x = vertex.z == 0 ? vertex.x : (vertex.x * this.camera.zoom) / (-vertex.z + this.camera.zoom);
  tVertex.y = vertex.z == 0 ? vertex.y : (vertex.y * this.camera.zoom) / (-vertex.z + this.camera.zoom);

  return tVertex;
}

Scene.prototype.get2DVertices = function(triangle)
{
  var vertices2D = [];
  for(var i = 0; i < triangle.vertices.length; i++)
  {
    var vertex = triangle.vertices[i];

    if(vertex.z > 0)
      return;

    vertices2D.push(this.vertexTo2D(vertex));
  }

  return vertices2D;
}

//renders a triangle, assumes you passin in a triangle based on global location (not local to model)
Scene.prototype.renderTriangle = function(triangle, color)
{
  triangle = triangle.clone(); //get rid of reference

  for(var i = 0; i < 3; i++)
  {
    triangle.vertices[i] = this.offsetToCamera(triangle.vertices[i]);
  }
  var vertices = this.get2DVertices(triangle);

  //if return undefined then it's not a renderable Triangle (i.e. behind the camera)
  if(!vertices)
    return;

  this.ctx.beginPath();
  this.ctx.moveTo(vertices[0].x, -vertices[0].y); //* -1 because y is inverted in 2D context
  this.ctx.lineTo(vertices[1].x, -vertices[1].y);
  this.ctx.lineTo(vertices[2].x, -vertices[2].y);
  this.ctx.closePath();

  if(this.fill)
  {
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0)";
  }
  else
  {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0)";
    this.ctx.strokeStyle = "rgba(0, 0, 0, 1)";
  }

  if(color)
  {
    if(color.length == 2)
    {
      this.ctx.fillStyle = color[0];
      this.ctx.strokeStyle = color[1];
    }
    else
    {
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = color;
    }
  }

  this.ctx.fill();
  this.ctx.stroke();
}

Scene.prototype.renderNormal = function(triangle)
{
  triangle = triangle.clone(); //get rid of reference

  for(var i = 0; i < 3; i++)
  {
    triangle.vertices[i] = this.offsetToCamera(triangle.vertices[i]);
    if(triangle.vertices[i].z > 0)
      return;
  }

  var normal = triangle.getNormal();
  var point1 = this.vertexTo2D(normal.point);
  var point2 = this.vertexTo2D(normal.point.add(normal.direction.normalize().multiplyScalar(20)));

  this.ctx.beginPath();
  this.ctx.moveTo(point1.x, -point1.y);
  this.ctx.lineTo(point2.x, -point2.y);
  this.ctx.closePath();
  this.ctx.strokeStyle = 'blue';
  this.ctx.stroke();
}

Scene.prototype.renderVertex = function(vertex)
{
  var triangle = new Triangle();
  var size = 5;
  triangle.vertices[0] = vertex.clone().add(new THREE.Vector3(size, 0, -size));
  triangle.vertices[1] = vertex.clone().add(new THREE.Vector3(0, size, size));
  triangle.vertices[2] = vertex.clone().add(new THREE.Vector3(-size / 2, -size / 2, size));
  triangle.isDebug = true;
  this.renderTriangle(triangle, 'green');
}

Scene.prototype.updateGraphics = function()
{
  this.clearScreen();

  for(var i = 0; i < this.models.length; i++)
  {
    var model = this.models[i];
    var mesh = [];
    var boundsMesh = [];
    var hullMesh = [];
    model.getGlobalMesh(mesh, boundsMesh, hullMesh); //pass by reference
    //render actual model
    for(var j = 0; j < mesh.length; j++)
    {
      if(mesh[j].isClockwise(this.camera))
      {
        this.renderTriangle(mesh[j]);
        // if(this.showDebug)
        //   this.renderNormal(mesh[j]);
      }
    }

    //render the bounding sphere around the model
    if(this.showDebug)
    {
      for(var j = 0; j < boundsMesh.length; j++)
      {
        // this.renderTriangle(boundsMesh[j], 'red');
      }

      for(var j = 0; j < hullMesh.length; j++)
      {
        this.renderTriangle(hullMesh[j], ['rgba(0, 255, 0, .4)', 'green']);
        this.renderNormal(hullMesh[j]);
      }
    }

    // render the vertices of the model
    var vertices = extractVertices(mesh);
    var self = this;
    vertices.forEach(function(vertex){
      self.renderVertex(vertex);
    });
  }
}
