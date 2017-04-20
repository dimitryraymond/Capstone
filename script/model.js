function Model()
{
  this.mesh = []; //triangles
  this.convexPolygon = []; //triangles

  //physics related properties
  this.position = new THREE.Vector3(0, 0, 0);
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.acceleration = new THREE.Vector3(0, 0, 0);
  this.mass = 0;
  this.force = 0; //this gets set and then 'consumed'

  this.angle = new THREE.Vector3(0 ,0 ,1);
  this.angularVelocity = new THREE.Vector3(0, 0, 0);
  this.innertia = 0; //TODO: compute this using a callback probably
  this.torque = 0; //this gets set and then 'consumed'
}

Model.prototype.update = function () {
};

Model.prototype.computeConvextPolygon = function()
{

}
