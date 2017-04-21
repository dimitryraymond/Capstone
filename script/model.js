function Model()
{
  this.mesh = []; //triangles
  this.globalMesh = [];
  this.convexPolygon = []; //triangles

  //physics related properties
  this.position = new THREE.Vector3(0, 0, 0);
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.acceleration = new THREE.Vector3(0, 0, 0);
  this.mass = 0;
  this.force = 0; //this gets set and then 'consumed'

  this.angle = new THREE.Vector3(0 ,0 ,1);
  this.quaternion = new THREE.Quaternion();
  this.angularVelocity = new THREE.Vector3(0, 0, 0);
  this.innertia = 0; //TODO: compute this using a callback probably
  this.torque = 0; //this gets set and then 'consumed'
}

Model.prototype.updatePhysics = function () {
  this.position.add(this.velocity);

  if(!isNullVector(this.angularVelocity))
  {
    var magnitude = this.angularVelocity.distanceTo(new THREE.Vector3()) * Math.PI / 30 / 2 //30 for fps
    quaternion = new THREE.Quaternion().setFromAxisAngle(this.angularVelocity.clone().normalize(), magnitude);
    this.angle.applyQuaternion(quaternion);

    this.quaternion = (new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.angle);
  }
};

Model.prototype.computeConvexPolygon = function()
{

}

Model.prototype.getGlobalMesh = function()
{
  var globalMesh = [];
  for(var i = 0; i < this.mesh.length; i++)
  {
    var tri = new Triangle();
    for(var j = 0; j < 3; j++)
    {
      var vertex = this.mesh[i].vertices[j].clone(); //original vertex
      vertex.applyQuaternion(this.quaternion);//apply rotation of model
      vertex.add(this.position); //apply model location
      tri.vertices[j] = vertex;
    }
    globalMesh.push(tri);
  }

  return globalMesh;
}
