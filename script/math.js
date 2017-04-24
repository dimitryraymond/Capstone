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

var removeDuplicateVertices = function(vertices)
{
  var newVertices = [];
  vertices.forEach(function(vertex){
    if(!collectionIncludesVector(newVertices, vertex))
      newVertices.push(vertex.clone())
  });

  return newVertices;
}

//Inspired by this: https://www.youtube.com/watch?v=Z58_Zsa6YTo
var QuickHull3D = function(mesh, targetVertices)
{
  var remainingVertices = extractVertices(mesh);
  if(remainingVertices.length < 4)
    throw new Error("Can't form a hull.");

  //randomness for testing
  var vertices = [];
  for(var i = 0; i < 4; i++)
  {
    var index = getRandomInt(0, remainingVertices.length - 1);
    vertices.push(remainingVertices[index]);
    remainingVertices.splice(index, 1);
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
  //create tetrahedron DONE

  //debug info
  for(var i = 0; i < vertices.length; i++)
    targetVertices.push(vertices[i].clone());

  //algorithm itteration
  if(remainingVertices.length > 0)
  {
    //1. starting triangle
    var index = getNextFace(hull, remainingVertices);
    if(index !== undefined)
    {
      //2. create half-space partition, find furthest vertex
      var furthestVertexIndex = getFurthestVertex(hull[index], remainingVertices);
      var vertex = remainingVertices.splice(furthestVertexIndex, 1)[0];
      vertex.color = 'red';
      targetVertices.push(vertex);
      //3. find visible faces to that vertex
      var faceIndexes = getVisibleFaces(vertex, hull);
      //4. delete visible faces, determine horizontal ridge
      var ridge = removeFaces(faceIndexes, hull);
      var ridge = sortClockwise(ridge, vertex)
      //5. connect furthest vertex with horizontal ridge
      connectVertexToHull(hull, vertex, ridge);
    }
    else
    {
      throw new Error("This should always evaluate to true due to the length check before...");
    }

  }


  return hull;
}

var getNextFace = function(hull, remainingVertices)
{
  for(var i = 0; i < hull.length; i++)
  {
    var normal = hull[i].getNormal();
    for(var j = 0; j < remainingVertices.length; j++)
    {
      var vectorTo = remainingVertices[j].clone().sub(normal.point).normalize();
      if(normal.direction.dot(vectorTo) >= 0)
        return i;
    }
  }
  return;
}

var getFurthestVertex = function(face, remainingVertices)
{
  var facingVertexIndexes = [];
  var normal = face.getNormal();
  for(var i = 0; i < remainingVertices.length; i++)
  {
    var vectorTo = remainingVertices[i].clone().sub(normal.point).normalize();
    if(normal.direction.dot(vectorTo) >= 0)
      facingVertexIndexes.push(i);
  }

  if(facingVertexIndexes.length == 0)
    throw new Error("This should be impossible, I call this after checking that at least 1 exists...");

  var biggestDistance = -Infinity;
  var biggestDistIndex = -1;
  for(var i = 0; i < facingVertexIndexes.length; i++)
  {
    var distance = normal.point.distanceToSquared(remainingVertices[i]);
    if(distance > biggestDistance)
    {
      biggestDistance = distance;
      biggestDistIndex = i;
    }
  }

  return biggestDistIndex;
}

var getVisibleFaces = function(vertex, hull)
{
  var faceIndexes = [];
  for(var i = 0; i < hull.length; i++)
  {
    var normal = hull[i].getNormal();
    var vertexTo = normal.point.clone().sub(vertex).normalize();
    if(vertexTo.dot(normal.direction) < 0)
      faceIndexes.push(i);
  }

  return faceIndexes;
}

//hull passed by reference here, and is mutated
var removeFaces = function(faceIndexes, hull)
{
  var ridge = [];
  var removedFaces = [];
  for(var i = faceIndexes.length - 1; i > -1; i--)
  {
    removedFaces.push(hull.splice(faceIndexes[i], 1)[0]);
    // hull[faceIndexes[i]].color = 'rgba(255, 0, 0, .4)';
  }

  var removedVertices = extractVertices(removedFaces);
  var keptVertices = extractVertices(hull);

  for(var i = 0; i < removedVertices.length; i++)
  {
    if(collectionIncludesVector(keptVertices, removedVertices[i]))
      ridge.push(removedVertices[i]);
  }

  ridge = removeDuplicateVertices(ridge);

  return ridge;
}

//
var swap = function(someArray, index1, index2)
{
  var x = someArray[index2];
  someArray[index2] = someArray[index1];
  someArray[index1] = x;
}

var getCenter = function(vertices)
{
  var x = 0;
  var y = 0;
  var z = 0;
  vertices.forEach(function(vertex){
    x += vertex.x;
    y += vertex.y;
    z += vertex.z;
  });
  x /= vertices.length;
  y /= vertices.length;
  z /= vertices.length;

  return new THREE.Vector3(x, y, z);
}
//use vertex as a robust reference point to calculate the normal
var sortClockwise = function(ridge, vertex)
{
  var center = getCenter(ridge);
  var normal = center.clone().sub(vertex).normalize();
  //simple bubble sort
  for(var i = 0; i < ridge.length; i++)
  {
    for(var j = 0; j < ridge.length; j++)
    {
      if(i != j)
      {
        var cross = ridge[i].clone().sub(center).cross(ridge[j].clone().sub(center));
        var dot = normal.dot(cross);
        if(dot < 0)
          swap(ridge, i, j);
      }
    }
  }
  return ridge;
}

var connectVertexToHull = function(hull, vertex, ridge)
{
  //assume ridge is already sorted in clockwise order
  for(var i = 0; i < ridge.length; i++)
  {
    var first = ridge[i].clone();
    var second = ridge[(i + 1) % ridge.length].clone();
    var third = vertex.clone();
    hull.push(new Triangle([first, second, third]));
  }
}
