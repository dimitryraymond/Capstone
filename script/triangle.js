function Triangle(vertices, color)
{
  var vertices = vertices ? vertices : [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
  this.vertices(vertices);

  this.color = color ? color : 'black';
}

Triangle.prototype.vertices = function(vertices)
{
  if(vertices.length == 3)
    this.vertices = vertices;
  else
    throw new Error("Invalid vertices");

  return this;
}
