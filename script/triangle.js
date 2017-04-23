function Triangle(vertices, color)
{
  var vertices = vertices ? vertices : [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
  this.vertices(vertices);

  this.color = color ? color : 'black';
  this.isDebug = false;
}

//deep copy constructor
Triangle.prototype.clone = function()
{
  var myClone = new Triangle();
  for(var i = 0; i < 3; i++)
  {
    myClone.vertices[i] = this.vertices[i].clone();
  }
  myClone.color = this.color;
  myClone.isDebug = this.isDebug;

  return myClone;
}

Triangle.prototype.vertices = function(vertices)
{
  if(vertices.length == 3)
    this.vertices = vertices;
  else
    throw new Error("Invalid vertices");

  return this;
}

Triangle.prototype.getNormal = function()
{
  var a = this.vertices[1].clone().sub(this.vertices[0]);
  var b = this.vertices[2].clone().sub(this.vertices[0]);

  var point = new THREE.Vector3();
  point.x = this.vertices[0].x + this.vertices[1].x + this.vertices[2].x;
  point.x /= 3;
  point.y = this.vertices[0].y + this.vertices[1].y + this.vertices[2].y;
  point.y /= 3;
  point.z = this.vertices[0].z + this.vertices[1].z + this.vertices[2].z;
  point.z /= 3;

  return { point: point, direction: b.cross(a).normalize() };
}

Triangle.prototype.isClockwise = function(camera)
{
  var normal = this.getNormal();
  //this is where the user's eyes are relative to screen (simulated by camera.zoom)
  var viewPosition = camera.position.clone().sub(camera.angle.clone().multiplyScalar(camera.zoom));
  var cameraVector = normal.point.clone().sub(viewPosition);

  //normalize becasue this is between two equally sized vectors
  var dotProduct = normal.direction.clone().normalize().dot(cameraVector.normalize());

  return dotProduct <= 0;
}

Triangle.prototype.flipNormal = function()
{
  var v3 = this.vertices[2];
  this.vertices[2] = this.vertices[1];
  this.vertices[1] = v3;
}
