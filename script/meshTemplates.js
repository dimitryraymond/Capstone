var Meshes = {
  addBox: function(target, position, size, color)
  {
    //easier to do calculations if i offset the position to center
    //this makes position equal to botLeftFar corner
    position = position.clone(); //get rid of reference
    position.x -= (size.x / 2);
    position.y -= (size.y / 2);
    position.z -= (size.z / 2);

    //figure out the 8 corners
    var botLeftFar = position.clone();
    var topLeftFar = new THREE.Vector3(position.x, position.y + size.y, position.z);
    var topRightFar = new THREE.Vector3(position.x + size.x, position.y + size.y, position.z);
    var botRightFar = new THREE.Vector3(position.x + size.x, position.y, position.z);

    var botLeftNear = new THREE.Vector3(position.x, position.y, position.z + size.z);
    var topLeftNear = new THREE.Vector3(position.x, position.y + size.y, position.z + size.z);
    var topRightNear = new THREE.Vector3(position.x + size.x, position.y + size.y, position.z + size.z);
    var botRightNear = new THREE.Vector3(position.x + size.x, position.y, position.z + size.z);

    //TODO: if performance is an issue, don't clone any of these
    //front
    target.push(new Triangle([botLeftNear.clone(), topLeftNear.clone(), topRightNear.clone()]));
    target.push(new Triangle([botLeftNear.clone(), topRightNear.clone(), botRightNear.clone()]));
    //back
    target.push(new Triangle([botLeftFar.clone(), topRightFar.clone(), topLeftFar.clone()]));
    target.push(new Triangle([botLeftFar.clone(), botRightFar.clone(), topRightFar.clone()]));
    //right
    target.push(new Triangle([botRightNear.clone(), topRightNear.clone(), topRightFar.clone()]));
    target.push(new Triangle([botRightNear.clone(), topRightFar.clone(), botRightFar.clone()]));
    //left
    target.push(new Triangle([botLeftFar.clone(), topLeftFar.clone(), topLeftNear.clone()]));
    target.push(new Triangle([botLeftFar.clone(), topLeftNear.clone(), botLeftNear.clone()]));
    //top
    target.push(new Triangle([topLeftNear.clone(), topLeftFar.clone(), topRightFar.clone()]));
    target.push(new Triangle([topLeftNear.clone(), topRightFar.clone(), topRightNear.clone()]));
    //bottom
    target.push(new Triangle([botLeftFar.clone(), botLeftNear.clone(), botRightNear.clone()]));
    target.push(new Triangle([botLeftFar.clone(), botRightNear.clone(), botRightFar.clone()]));
  },

  addCylinder: function(target, position, size, n, color)
  {
    if(!target)
      throw new Error("Target mesh is requred.");
    position = position || new THREE.Vector3();
    size = size || new THREE.Vector3(100, 100, 100);
    color = color || 'black';
    n = n || 8;

    //figure out the n points of cross section
    var radius = size.x / 2;
    var height = size.y;
    var topLevel = height / 2;
    var botLevel = height / 2;

    var startVector = new THREE.Vector3(1 * radius, height / 2, 0);
    var topCenterVector = new THREE.Vector3(0, height || height / 2, 0).add(position);
    var topVectors = [startVector];
    var rad = Math.PI * 2 / n;
    for(var i = 0; i < n - 1; i++)
    {
      var nextVector = topVectors[i].clone();
      nextVector = rotate(nextVector, new THREE.Vector3(0, 1, 0), rad);
      topVectors.push(nextVector);
    }

    //apply position offset
    for(var i = 0; i < n; i++)
    {
      //yay for reference, this also affects the coresponding objects added to target
      topVectors[i].add(position);
    }

    var thisMesh = []; //going to reuse this so also save data here
    //build top face
    for(var i = 0; i < n; i++)
    {
      var left = topVectors[i].clone();
      var right = topVectors[(i + 1) % n].clone();
      var center = topCenterVector.clone();
      target.push(new Triangle([left, center, right]));
      thisMesh.push(new Triangle([left, center, right]));
    }

    // //build bottom face
    // for(var i = 0; i < n; i++)
    // {
    //   var triangle = new Triangle();
    //   for(var j = 0; j < 3; j++)
    //   {
    //     triangle.vertices[2 - j] = thisMesh[i].vertices[j].clone().add(new THREE.Vector3(0, -height, 0));
    //   }
    //   target.push(triangle);
    // }

    for(var i = 0; i < n; i++)
    {
      var topLeft = thisMesh[i].vertices[0].clone();
      var topRight = thisMesh[i].vertices[2].clone();
      var botLeft = thisMesh[i].vertices[0].clone().add(new THREE.Vector3(0, -height, 0));
      var botRight = thisMesh[i].vertices[2].clone().add(new THREE.Vector3(0, -height, 0));

      target.push(new Triangle([topLeft, topRight, botLeft]));
      target.push(new Triangle([botRight, botLeft, topRight]));
    }
  },

  addCircle: function(target, startPoint, radius, around, n)
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
      tri.isDebug = true;
      target.push(tri);
    }
  }
}
