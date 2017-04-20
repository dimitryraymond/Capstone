var Meshes = {
  addBox: function(target, position, size, color)
  {
    //easier to do calculations if i offset the position to center
    //this makes position equal to botLeftFar corner
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
  }
}
