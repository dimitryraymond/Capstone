var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
//Inspired by this: https://www.youtube.com/watch?v=Z58_Zsa6YTo
var QuickHull3D = function(mesh)
{
  var allVertices = extractVertices(mesh);
  if(allVertices.length < 4)
    throw new Error("Can't form a hull.");

  //randomness for testing
  var vertices = [];
  for(var i = 0; i < 4; i++)
  {
    var index = getRandomInt(0, allVertices.length - 1);
    vertices.push(allVertices[index]);
    allVertices.splice(index, 1);
  }

  var hull = [];

  //create the initial tetrahedron
  var tri1 = new Triangle([vertices[0], vertices[1], vertices[2]]).clone();
  var normal = tri1.getNormal();
  var vectorTo = vertices[3].clone().sub(normal.point);
  var dotProduct = normal.direction.dot(vectorTo.normalize());
  if(dotProduct > 0)
    tri1.flipNormal();
    //TODO: figure out co-planar vertices

  hull.push(tri1);
  for(var i = 0; i < 3; i++)
  {
    var first = i % 3;
    var third = (i + 1) % 3;
    var nextTri = new Triangle([tri1.vertices[first].clone(), vertices[3].clone(), tri1.vertices[third].clone()])
    hull.push(nextTri)
  }

  //1. starting triangle
  //2. create half-space partition, find furthest vertex
  //3. find visible faces to that vertex
  //4. delete visible faces, determine horizontal ridge
  //5. connect furthest vertex with horizontal ridge

  return hull;
}
