function Camera(){
  this.position = new THREE.Vector3(0, 0, 0);
  this.angle = new THREE.Vector3(0, 0, -1);
}

Camera.prototype.lookAt = function(vector)
{
  if(position != vector)
  {
    //draw a vector from current position to vector
    //set new angle to the result
  }
}
