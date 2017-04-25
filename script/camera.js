function Camera(){
  this.position = new THREE.Vector3(0, 0, 300);
  this.angle = new THREE.Vector3(0, 0, -1);
  this.angleH = new THREE.Vector3(0, 0, -1);
  this.quaternionV = new THREE.Quaternion();
  this.quaternionH = new THREE.Quaternion();
  this.zoom = 600;
  this.sensitivity = 1;
}

Camera.prototype.getAngle = function()
{
  return new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternionH).applyQuaternion(this.quaternionV);
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
  this.position.x -= (this.angleH.z * distance);
  this.position.z += (this.angleH.x * distance);
}

Camera.prototype.shiftFrontToBack = function(distance)
{
  this.position.x += (this.angleH.x * distance);
  this.position.z += (this.angleH.z * distance);
}

Camera.prototype.shiftVertical = function(distance)
{
  this.position.y += distance;
}

Camera.prototype.slideRight = function()
{
  this.shiftHorizontal(this.sensitivity * 20)
}

Camera.prototype.slideLeft = function()
{
  this.shiftHorizontal(this.sensitivity * -20);
}

Camera.prototype.slideForward = function()
{
  this.shiftFrontToBack(this.sensitivity * 20);
}

Camera.prototype.slideBack = function()
{
  this.shiftFrontToBack(this.sensitivity * -20);
}

Camera.prototype.slideUp = function()
{
  this.shiftVertical(this.sensitivity * 20);
}

Camera.prototype.slideDown = function()
{
  this.shiftVertical(this.sensitivity * -20);
}

Camera.prototype.turnRight = function()
{
  var quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.sensitivity / 40 * Math.PI);
  this.quaternionH.multiply(quaternion);
  this.angleH.applyQuaternion(quaternion);
  this.angle.applyQuaternion(quaternion);
}

Camera.prototype.turnLeft = function()
{
  var quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.sensitivity / 40 * Math.PI);
  this.quaternionH.multiply(quaternion);
  this.angleH.applyQuaternion(quaternion);
  this.angle.applyQuaternion(quaternion);
}

Camera.prototype.turnUp = function()
{
  if(this.angle.y > .5)
    return;
  var quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.sensitivity / 40 * Math.PI);
  this.quaternionV.multiply(quaternion);
  this.angle.applyQuaternion(quaternion);
  // this.angle = rotate(this.angle, new THREE.Vector3(1, 0, 0), this.sensitivity / 40 * Math.PI)
}

Camera.prototype.turnDown = function()
{
  if(this.angle.y < -.5)
    return;
  var quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -this.sensitivity / 40 * Math.PI);
  this.quaternionV.multiply(quaternion);
  this.angle.applyQuaternion(quaternion);
  // this.angle = rotate(this.angle, new THREE.Vector3(1, 0, 0), this.sensitivity / 40 * Math.PI * -1);
}
