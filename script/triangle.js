function Triangle(vertices, color)
{
  var vertices = vertices ? vertices : [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
  this.vertices(vertices);

  this.color = color ? color : 'black';
  this.isDebug = false;
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

  return { point: point, direction: b.cross(a) };
}

Triangle.prototype.isClockwise = function(camera)
{
  var normal = this.getNormal();
  var cameraVector = normal.point.clone().sub(camera.position);

  return normal.direction.clone().dot(cameraVector) <= .2; //.2 because poormans way of dealing with close objects
}
