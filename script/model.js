function Model()
{
  this.mesh = []; //triangles
  this.boundingMesh = []; //used to show bounding perimeter
  this.convexMesh = []; //convex hull of the mesh used for collisions
  this.debugVertices = []; //use to figure out how vertices are treated in the QuickHull3D, etc
  this.boundingRadius = 0;
  this.lastCheckedMeshSize = 0;

  //physics related properties
  this.position = new THREE.Vector3(0, 0, 0);
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.acceleration = new THREE.Vector3(0, 0, 0);
  this.mass = 100;
  this.force = new THREE.Vector3(0, 0, 0); //this gets set and then 'consumed'

  this.angle = new THREE.Vector3(0 ,0 ,1);
  this.quaternion = new THREE.Quaternion();
  this.angularVelocity = new THREE.Vector3(0, 0, 0);
  this.innertia = 0; //TODO: compute this using a callback probably
  this.torque = 0; //this gets set and then 'consumed'

  this.useGravity = false;
}

Model.prototype.update = function()
{
    if(this.lastCheckedMeshSize != this.mesh.length)
    {
      this.updateBounds();
    }
}

Model.prototype.updateBounds = function()
{
  for(var i = 0; i < this.mesh.length; i++) //in case you modified the mesh (doesn't work when adding and removing same type of primitive)
  {
    for(var j = 0; j < 3; j++)
    {
      var distance = this.mesh[i].vertices[j].distanceTo(new THREE.Vector3());
      if(this.boundingRadius < distance)
        this.boundingRadius = distance;
    }
  }

  this.updateBoundingMesh();
  this.updateConvexHull();

  this.lastCheckedMeshSize = this.mesh.length;
}

Model.prototype.updateBoundingMesh = function()
{
  Meshes.addCircle(this.boundingMesh, new THREE.Vector3(this.boundingRadius, 0, 0), this.boundingRadius, new THREE.Vector3(0, 1, 0), 16);
  Meshes.addCircle(this.boundingMesh, new THREE.Vector3(0, 0, this.boundingRadius), this.boundingRadius, new THREE.Vector3(1, 0, 0), 16);
  Meshes.addCircle(this.boundingMesh, new THREE.Vector3(this.boundingRadius, 0, 0), this.boundingRadius, new THREE.Vector3(0, 0, 1), 16);
}

Model.prototype.updateConvexHull = function()
{
  this.convexMesh = QuickHull3D(this.mesh, this.debugVertices);
}

Model.prototype.updatePhysics = function () {
  //apply forces
  this.acceleration = this.force.divideScalar(this.mass);
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);

  //reset the force
  this.force = new THREE.Vector3();
  this.acceleration = new THREE.Vector3();

  //TODO: figure out innertia implementation
  //apply angularVelocity
  if(!isNullVector(this.angularVelocity))
  {

    var magnitude = this.angularVelocity.distanceTo(new THREE.Vector3()) * Math.PI / 30 / 2 //30 for fps
    quaternion = new THREE.Quaternion().setFromAxisAngle(this.angularVelocity.clone().normalize(), magnitude);
    this.angle.applyQuaternion(quaternion);

    this.quaternion.multiply(quaternion);
  }
};

Model.prototype.computeConvexPolygon = function()
{

}

Model.prototype.getGlobalMesh = function(targetMesh, targetBoundsMesh, targetHullMesh, targetVertices)
{
  for(var i = 0; i < this.mesh.length; i++)
  {
    var tri = this.mesh[i].clone();
    for(var j = 0; j < 3; j++)
    {
      tri.vertices[j].applyQuaternion(this.quaternion);//apply rotation of model
      tri.vertices[j].add(this.position);
    }
    targetMesh.push(tri);
  }

  for(var i = 0; i < this.boundingMesh.length; i++)
  {
    var tri = this.boundingMesh[i].clone();
    for(var j = 0; j < 3; j++)
    {
      tri.vertices[j].applyQuaternion(this.quaternion);//apply rotation of model
      tri.vertices[j].add(this.position);
    }
    targetBoundsMesh.push(tri);
  }

  for(var i = 0; i < this.convexMesh.length; i++)
  {
    var tri = this.convexMesh[i].clone();
    for(var j = 0; j < 3; j++)
    {
      tri.vertices[j].applyQuaternion(this.quaternion);//apply rotation of model
      tri.vertices[j].add(this.position);
    }
    targetHullMesh.push(tri);
  }

  for(var i = 0; i < this.debugVertices.length; i++)
  {
    var vertex = this.debugVertices[i].clone().applyQuaternion(this.quaternion);//apply rotation of model
    targetVertices.push(vertex);
  }

}
