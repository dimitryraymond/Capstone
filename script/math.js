//for rounding errors
var e = 0.0001;

// for debugVertex identification
var colors = [
        // 'rgba(148, 0, 211, 1)', //red used for other things
        'rgba(75, 0, 130, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 255, 0, 1)',
        'rgba(255, 255, 0, 1)',
        'rgba(255, 127, 0, 1)',
        'rgba(255, 192, 203, 1)'
      ];

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

//used to avoid duplicates
//in the models' meshes, every corner touches 4 triangles(usually)
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

//get's all unique vertices from mesh
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

//debuging purposes
var hasSameElements = function(group1, gropu1)
{
  for(var i = 0; i < group1.length; i++)
  {
    var hasMatch = false;
    for(var j = 0; j < group1.length; j++)
    {
      if(group1[i].equals(group2[j]))
        hasMatch = true;
    }
    if(!hasMatch)
      return false;
  }

  return true;
}

///BOUNDING HULL BEGIN ########################################################
//Inspired by this: https://www.youtube.com/watch?v=Z58_Zsa6YTo
var QuickHull3D = function(givenVertices, targetDebugVertexSets, targetDebugFaceSets)
{

  var remainingVertices = removeDuplicateVertices(givenVertices);
  if(remainingVertices.length < 4)
    throw new Error("Can't form a hull.");

  //randomness for testing
  var vertices = [];
  for(var i = 0; i < 4; i++)
  {
    var index = getRandomInt(0, remainingVertices.length - 1);
    // index = i + 1;
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

  //copy over to debug info
  if(targetDebugFaceSets !== undefined)
  {
    var set = [];
    hull.forEach(function(triangle){
      set.push(triangle.clone());
    });
    targetDebugFaceSets.push(set);
  }

  if(targetDebugVertexSets !== undefined)
  {
    var set = [];
    for(var i = 0; i < vertices.length; i++)
    {
      vertices[i].color = colors[i];
      set.push(vertices[i].clone());
    }
    targetDebugVertexSets.push(set);
  }

  //algorithm itteration

  //1. starting triangle
  var index = getNextFace(hull, remainingVertices);
  if(index !== undefined)
  {
    QuickHull3DItteration(hull, remainingVertices, index, targetDebugVertexSets, targetDebugFaceSets);
  }

  return hull;
}

var QuickHull3DItteration = function(hull, remainingVertices, nextFaceIndex, targetDebugVertexSets, targetDebugFaceSets)
{
  //2. create half-space partition, find furthest vertex
  var furthestVertexIndex = getFurthestVertex(hull[nextFaceIndex], remainingVertices);
  var vertex = remainingVertices.splice(furthestVertexIndex, 1)[0];
  //3. find visible faces to that vertex
  var faceIndexes = getVisibleFaces(vertex, hull);
  //4. delete visible faces, determine horizontal ridge
  var ridge = removeFaces(faceIndexes, hull);
  var ridge = sortClockwise(ridge, vertex);

  var center = getCenter(ridge);
  center.color = 'black';
  //5. connect furthest vertex with horizontal ridge
  connectVertexToHull(hull, vertex, ridge);

  if(targetDebugFaceSets !== undefined)
  {
    var set = [];
    hull.forEach(function(triangle){
      set.push(triangle.clone());
    });
    targetDebugFaceSets.push(set);
  }

  if(targetDebugVertexSets !== undefined)
  {
    var set = [];
    for(var i = 0; i < ridge.length; i++)
    {
      ridge[i].color = colors[i];
      set.push(ridge[i]);
    }
    vertex.color = 'red';
    set.push(vertex);
    set.push(center);
    targetDebugVertexSets.push(set);
  }

  var index = getNextFace(hull, remainingVertices);
  if(index !== undefined)
  {
    QuickHull3DItteration(hull, remainingVertices, index, targetDebugVertexSets, targetDebugFaceSets);
  }
}

var getNextFace = function(hull, remainingVertices)
{
  for(var i = 0; i < hull.length; i++)
  {
    var normal = hull[i].getNormal();
    for(var j = 0; j < remainingVertices.length; j++)
    {
      var vectorTo = remainingVertices[j].clone().sub(normal.point).normalize();
      if(normal.direction.dot(vectorTo) > 0 + e)
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
    if(normal.direction.dot(vectorTo) > 0 + e)
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

Array.prototype.swap = function (x,y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
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
  for(var i = 1; i < ridge.length; i++)
  {
    for(var j = 1; j < ridge.length; j++)
    {
      //old approach
      // var cross = ridge[j - 1].clone().sub(center).cross(ridge[j].clone().sub(center)).normalize();
      //new approach
      //basically, projecting both of the vectors onto a plane orthagonal to the normal(camera to center of ridge of points)
      var vectorA = ridge[j - 1].clone().sub(center);
      var vectorB = ridge[j].clone().sub(center);
      var projectionA = normal.clone().cross(vectorA).cross(normal);
      var projectionB = normal.clone().cross(vectorB).cross(normal);
      var cross = projectionA.cross(projectionB).normalize();
      var dot = normal.dot(cross);
      if(dot < 0)
      {
        ridge.swap(j, j - 1);
      }
      else if(dot >= 0 && dot <0)
      {
        //if two vertexes are completely opposite (180 degree angle)
        //then offset vertex by an unnoticable ammount and retry the sort
        var xOffset = Math.random();
        var yOffset = Math.random();
        var zOffset = Math.random();
        console.log(xOffset, yOffset, zOffset);
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        return sortClockwise(ridge, vertex); //recursively restart
      }
    }
  }
  //last check
  // for(var i = 0; i < ridge.length; i++)
  // {
  //   var a = i;
  //   var b = (i + 1) % ridge.length;
  //   var cross = ridge[a].clone().sub(center).cross(ridge[b].clone().sub(center)).normalize();
  //   var dot = normal.dot(cross);
  // }
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
//BOUNDING HULL END ###########################################################

//COLLISION BEGIN #############################################################

var mightBeColliding = function(model1, model2)
{
  var distance = model1.position.distanceTo(model2.position);
  return distance < model1.boundingRadius + model2.boundingRadius
}

var getCenterOfHull = function(hull)
{
  if(hull.length == 0)
    return

  //get the center point of hull
  var center = new THREE.Vector3();
  hull.forEach(function(triangle){
    center.add(triangle.getNormal().point);
  });
  center.divideScalar(hull.length)

  return center;
}
//works for our purposes of checking convex hull (based on how we generate and needs)
//but isn't technically correct in the general case
var pointIsInsideHull = function(point, hull)
{
  var inside = true;
  //check that each face is not looking at the center
  hull.forEach(function(triangle){
    var normal = triangle.getNormal();
    var vectorTo = normal.point.clone().sub(point).normalize();
    var dot = normal.direction.dot(vectorTo);
    if(dot > 0)
    {
      // console.log('true');
    }
    else if(dot < 0)
    {
      inside = false;
    }
    else
    {
      // console.log('orthagonal');
    }
  });

  // console.log(dot);
  return inside;
}

var getMinkowskiDifference = function(hullA, hullB)
{
  //get the cross product of all points using relation A - B
  var points = [];
  var verticesA = extractVertices(hullA);
  var verticesB = extractVertices(hullB);

  verticesA.forEach(function(vA){
    verticesB.forEach(function(vB){
      points.push(vA.clone().sub(vB));
    });
  });

  return QuickHull3D(points);
}

//COLLISION END ###############################################################
