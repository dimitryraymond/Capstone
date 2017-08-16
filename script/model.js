function Model()
{
  this.mesh = []; //triangles
  this.boundingMesh = []; //used to show bounding perimeter
  this.convexMesh = []; //convex hull of the mesh used for collisions
  this.debugVertexSets = [[]]; //use to figure out how vertices are treated in the QuickHull3D, etc
  this.debugFaceSets = [[]]; //array of arrays of triangles
  this.debugIndex = 0;
  this.boundingRadius = 0;
  this.lastCheckedMeshSize = 0;

  //physics related properties
  this.position = new THREE.Vector3(0, 0, 0);
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.acceleration = new THREE.Vector3(0, 0, 0);
  this.mass = 100;
  this.force = new THREE.Vector3(0, 0, 0); //this gets set and then 'consumed'

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
  this.convexMesh = QuickHull3D(extractVertices(this.mesh), this.debugVertexSets, this.debugFaceSets);
  pointIsInsideHull(getCenterOfHull(this.convexMesh), this.convexMesh);
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

    this.quaternion.multiply(quaternion);
  }
};

Model.prototype.getGlobalMesh = function()
{
  var globalMesh = [];
  for(var i = 0; i < this.mesh.length; i++)
  {
    var tri = this.mesh[i].clone();
    for(var j = 0; j < 3; j++)
    {
      tri.vertices[j].applyQuaternion(this.quaternion);//apply rotation of model
      tri.vertices[j].add(this.position);
    }
    globalMesh.push(tri);
  }

  return globalMesh;
}

Model.prototype.getGlobalRenderObjects = function(targetMesh, targetBoundsMesh, targetHullMesh, targetVertexSet, targetDebugFaceSet)
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

  for(var i = 0; i < this.debugFaceSets[this.debugIndex].length; i++)
  {
    var tri = this.debugFaceSets[this.debugIndex][i].clone();
    for(var j = 0; j < 3; j++)
    {
      tri.vertices[j].applyQuaternion(this.quaternion);//apply rotation of model
      tri.vertices[j].add(this.position);
    }
    targetDebugFaceSet.push(tri);
  }

  for(var i = 0; i < this.debugVertexSets[this.debugIndex].length; i++)
  {
    var vertex = this.debugVertexSets[this.debugIndex][i].clone().applyQuaternion(this.quaternion);//apply rotation of model
    vertex.color = this.debugVertexSets[this.debugIndex][i].color;
    vertex.add(this.position)
    targetVertexSet.push(vertex);
  }

}
