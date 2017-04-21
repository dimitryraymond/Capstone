var rotate = function(vector, around, angle)
{
  //vector and around: THREE.Vector3
  var quaternion = new THREE.Quaternion().setFromAxisAngle(around.normalize(), angle);
  return vector.clone().applyQuaternion(quaternion);
}

var isNullVector = function(vector)
{
  return vector.x == 0 && vector.y == 0 && vector.z == 0
}

var triangleIsClockwise = function(vertices, camera)
{
  var a = vertices[1].clone().sub(vertices[0]);
  var b = vertices[2].clone().sub(vertices[0]);

  var cameraVector = a.clone().sub(camera.position);

  return a.cross(b).dot(cameraVector) > 0 || true;
}

var mightBeColliding = function(model1, model2)
{
  var distance = model1.position.distanceTo(model2.position);
  return distance < model1.boundingRadius + model2.boundingRadius
}
