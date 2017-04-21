function Camera(){
  this.position = new THREE.Vector3(0, 0, 0);
  this.angle = new THREE.Vector3(0, 0, -1);
  this.zoom = 600;
  this.sensitivity = 1;
}

Camera.prototype.lookAt = function(vector)
{
  if(position != vector)
  {
    this.angle.x = vector.x - position.x;
    this.angle.y = vector.y - position.y;
    this.angle.z = vector.z - position.z;
    this.angle.normalize();
  }
}

Camera.prototype.shiftHorizontal = function(distance)
{
  this.position.x -= (this.angle.z * distance);
  this.position.z += (this.angle.x * distance);
}

Camera.prototype.shiftFrontToBack = function(distance)
{
  this.position.x += (this.angle.x * distance);
  this.position.z += (this.angle.z * distance);
}

Camera.prototype.shiftVertical = function(distance)
{
  this.position.y += distance;
}

Camera.prototype.slideRight = function()
{
  this.shiftHorizontal(this.sensitivity * 10)
}

Camera.prototype.slideLeft = function()
{
  this.shiftHorizontal(this.sensitivity * -10);
}

Camera.prototype.slideForward = function()
{
  this.shiftFrontToBack(this.sensitivity * 10);
}

Camera.prototype.slideBack = function()
{
  this.shiftFrontToBack(this.sensitivity * -10);
}

Camera.prototype.slideUp = function()
{
  this.shiftVertical(this.sensitivity * 10);
}

Camera.prototype.slideDown = function()
{
  this.shiftVertical(this.sensitivity * -10);
}

Camera.prototype.turnRight = function()
{
  this.angle = rotate(this.angle, new THREE.Vector3(0, 1, 0), -this.sensitivity / 40 * Math.PI);
}

Camera.prototype.turnLeft = function()
{
  this.angle = rotate(this.angle, new THREE.Vector3(0, 1, 0), this.sensitivity / 40 * Math.PI);
}

Camera.prototype.turnUp = function()
{
  // this.angle = rotate(this.angle, new THREE.Vector3(1, 0, 0), this.sensitivity / 40 * Math.PI)
}

Camera.prototype.turnDown = function()
{
  // this.angle = rotate(this.angle, new THREE.Vector3(1, 0, 0), this.sensitivity / 40 * Math.PI * -1);
}
