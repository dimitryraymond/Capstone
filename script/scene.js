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
  this.updatePhysics();
  this.updateGraphics();
}

Scene.prototype.updatePhysics = function()
{

}

Scene.prototype.updateGraphics = function()
{
  this.clearScreen();
}

Scene.prototype.addModel = function(model)
{
  this.models.push(model);
}

function update()
{

}

Scene.prototype.play = function()
{
  var t = this;
  loadingTimer = setInterval(function(){t.update();}, 1000 / this.fps);
}
