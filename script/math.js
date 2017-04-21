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

var createCircle = function(target, startPoint, radius, around, n)
{
  var circlePoints = [];
  var firstPoint = startPoint;
  circlePoints.push(firstPoint);

  //define the perimeter points
  var rad = Math.PI * 2 / n;
  for(var i = 0; i < n - 1; i++)
  {
    var nextPoint = rotate(circlePoints[i], around, rad);
    circlePoints.push(nextPoint);
  }

  //use the perimeter points to create a circumference of triangles
  for(var i = 0; i < n; i++)
  {
    var first = circlePoints[i].clone();
    var second = circlePoints[(i + 1) % 16].clone();
    var third = first.clone();

    var tri = new Triangle([first, second, third]);
    target.push(tri);
  }
}
