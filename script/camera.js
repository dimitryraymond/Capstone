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

Camera.prototype.slideRight = function()
{
  this.position.x += this.sensitivity * 10;
  // this.position.x += (vector.z * -x);
  // this.position.z += (vector.x * -x);
}

Camera.prototype.slideLeft = function()
{
  this.position.x -= this.sensitivity * 10;
}

Camera.prototype.slideForward = function()
{
  this.position.z -= this.sensitivity * 10;
}

Camera.prototype.slideBack = function()
{
  this.position.z += this.sensitivity * 10;
}

Camera.prototype.slideUp = function()
{
  this.position.y += this.sensitivity * 10;
}

Camera.prototype.slideDown = function()
{
  this.position.y -= this.sensitivity * 10;
}

Camera.prototype.turnRight = function()
{
  this.angle = rotate(this.angle, new THREE.Vector3(0, 1, 0), -this.sensitivity / 40 * Math.PI);
}

Camera.prototype.turnLeft = function()
{
  this.angle = rotate(this.angle, new THREE.Vector3(0, 1, 0), this.sensitivity / 40 * Math.PI);
}
