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

var mightBeColliding = function(model1, model2)
{
  var distance = model1.position.distanceTo(model2.position);
  return distance < model1.boundingRadius + model2.boundingRadius
}

//used to avoid duplicates
//in the models' meshes, every corner touches 4 triangles
//therefore 4 vertices share a common place in the mesh
var collectionIncludesVector = function(collection, vector)
{
  for(var i = 0; i < collection.length; i++)
  {
    if(vector.equals(collection[i]))
      return true;
  }
  return false;
}

var extractVertices = function(mesh)
{
  var vertices = [];
  mesh.forEach(function(triangle){
    triangle.vertices.forEach(function(vertex){
      if(!collectionIncludesVector(vertices, vertex))
        vertices.push(vertex.clone());
    });
  });

  return vertices;
}
var getBoundingHull = function(target, vertices)
{
  
}
