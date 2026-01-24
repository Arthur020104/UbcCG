/*
 * UBC CPSC 314 2020W1
 * Assignment 2
 * Transformations
 */


//*****************************TEMPLATE CODE DO NOT MODIFY********************************//
// ASSIGNMENT-SPECIFIC API EXTENSION
class node{
  constructor(obj, localM, children=[])
  {
    this.obj = obj;
    this.localM = localM;
    this.children = children;
  }
  addChild(childN)
  {
    this.children.push(childN);
  }
  update(parentM)
  {
    let localM = new THREE.Matrix4().multiplyMatrices(parentM, this.localM);
    if (this.obj != null)
      this.obj.setMatrix(localM);
    this.children.forEach(child => {
      child.update(localM);
    });

  }
}
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}
// SETUP RENDERER AND SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);
// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
camera.position.set(-28,10,28);
camera.lookAt(scene.position);
scene.add(camera);
// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;
// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
// FLOOR WITH CHECKERBOARD 
var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);
var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -4.5;
floor.rotation.x = Math.PI / 2;
scene.add(floor);
//****************************************************************************************//

// OCTOPUS MATRIX: To make octopus move, modify this matrix in updatebody()
var octopusMatrix = {type: 'm4', value: new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,1.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  )};

//*****************************TEMPLATE CODE DO NOT MODIFY********************************//
// MATERIALS
var normalMaterial = new THREE.MeshNormalMaterial();
var octopusMaterial = new THREE.ShaderMaterial({
  uniforms:{
    octopusMatrix: octopusMatrix,
  },
});
var shaderFiles = [
  './glsl/octopus.vs.glsl',
  './glsl/octopus.fs.glsl'
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  console.log(shaders['./glsl/octopus.vs.glsl']);
  console.log(shaders['./glsl/octopus.fs.glsl']); 
  
  octopusMaterial.vertexShader = shaders['./glsl/octopus.vs.glsl'];
  octopusMaterial.fragmentShader = shaders['./glsl/octopus.fs.glsl'];

  octopusMaterial.needsUpdate = true;
});



// GEOMETRY
function loadOBJ(file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var onProgress = function(query) {
    if ( query.lengthComputable ) {
      var percentComplete = query.loaded / query.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  };
  var onError = function() {
    console.log('Failed to load ' + file);
  };
  var loader = new THREE.OBJLoader();
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
    object.position.set(xOff,yOff,zOff);
    object.rotation.x= xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale,scale,scale);
    scene.add(object);
  }, onProgress, onError);
  
}
// We set octopus on (0,0,0) without scaling
// so we can change these values with transformation matrices.
loadOBJ('obj/Octopus_04_A.obj',octopusMaterial,1.0,0,0,0,0,0,0);

//***** YOU MAY FIND THESE FUNCTIONS USEFUL ******//
function defineRotation_X(theta) {
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
  var mtx = new THREE.Matrix4().set(
    1.0,       0.0,      0.0,       0.0, 
    0.0,       cosTheta, -sinTheta, 0.0, 
    0.0,       sinTheta, cosTheta,  0.0, 
    0.0,       0.0,      0.0,       1.0
  );
  return mtx;
}
function defineRotation_Y(theta) {
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
  var mtx = new THREE.Matrix4().set(
    cosTheta,  0.0,      sinTheta,  0.0, 
    0.0,       1.0,      0.0,       0.0, 
    -sinTheta, 0.0,      cosTheta,  0.0, 
    0.0,       0.0,      0.0,       1.0
  );
  return mtx;
}
function defineRotation_Z(theta) {
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
  var mtx = new THREE.Matrix4().set(
    cosTheta,  -sinTheta, 0.0,       0.0, 
    sinTheta,  cosTheta,  0.0,       0.0, 
    0.0,       0.0,       1.0,       0.0, 
    0.0,       0.0,       0.0,       1.0
  );
  return mtx;
}
let octopusN = new node(null, octopusMatrix.value, []);

//************************************************//
function addEyeAndPupil(material, eyeballTS, pupilTS, pupilTheta) {
  var eyegeo = new THREE.SphereGeometry(1.0,64,64);
  // Eyeball
  var eyeball = new THREE.Mesh(eyegeo, material);
  var eyeballMtx = new THREE.Matrix4().multiplyMatrices(
  octopusMatrix.value,
  eyeballTS 
  );
  let eyeNode = new node(eyeball, eyeballTS, []);
  octopusN.addChild(eyeNode);
  eyeball.setMatrix(eyeballMtx);
  scene.add(eyeball);
  // Pupil
  var pupilRT = defineRotation_Y(pupilTheta);
  var pupilTSR = new THREE.Matrix4().multiplyMatrices(
    pupilRT, 
    pupilTS
  );
  var pupilMtx = new THREE.Matrix4().multiplyMatrices(
    eyeballMtx, 
    pupilTSR
  );

  var pupil = new THREE.Mesh(eyegeo, material);
  let pupilNode = new node(pupil, pupilTSR, []);
  eyeNode.addChild(pupilNode);
  pupil.setMatrix(pupilMtx);
  scene.add(pupil);
  return [eyeball, pupil];
}

// Left eye
var eyeballTS_L = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,0.92, 
  0.0,0.0,0.0,1.0
);
var pupilTS_L = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
);
var theta_L = Math.PI * (130 /180.0);
// Right eye
var eyeballTS_R = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,-0.92, 
  0.0,0.0,0.0,1.0
);
var pupilTS_R = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
);
var theta_R = Math.PI * (50 /180.0);
lefteye = addEyeAndPupil(normalMaterial, eyeballTS_L, pupilTS_L, theta_L);
eyeball_L = lefteye[0];
pupil_L = lefteye[1];
righteye = addEyeAndPupil(normalMaterial, eyeballTS_R, pupilTS_R, theta_R);
eyeball_R = righteye[0];
pupil_R = righteye[1];
//****************************************************************************************//


//***** YOUR CODE HERE *****//
// You need to add 3 joints and 3 links for each arm
// Each arm starts with a joint and ends with a link
// joint-link-joint-link-joint-link

// Geometries of the arm
var j1 = new THREE.SphereGeometry(0.5,64,64);
var l1 = new THREE.CylinderGeometry(0.35, 0.45, 2, 64);
var j2 = new THREE.SphereGeometry(0.4, 64, 64);
var l2 = new THREE.CylinderGeometry(0.25, 0.35, 2, 64);
var j3 = new THREE.SphereGeometry(0.3, 64, 64);
var l3 = new THREE.CylinderGeometry(0.1, 0.25, 2, 64);
function getMatrixColumn4(m, col) 
{
  const e = m.elements;
  const i = col * 4;
  return new THREE.Vector4(e[i], e[i+1], e[i+2], e[i+3]);
}
function createLookAtMatrix(e, t, u)
{
  //casting e t and u to vector3
  e = new THREE.Vector3(e.x, e.y, e.z);
  t = new THREE.Vector3(t.x, t.y, t.z);
  u = new THREE.Vector3(u.x, u.y, u.z);
  let f = new THREE.Vector3().subVectors(t, e).normalize();
  let r = new THREE.Vector3().crossVectors(u, f).normalize();
  u = u.crossVectors(f, r).normalize();
  const lookAtMtx = new THREE.Matrix4().set(
    r.x, u.x, f.x, 0.0,
    r.y, u.y, f.y, 0.0,
    r.z, u.z, f.z, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
  return lookAtMtx;
}

// ***** Q1 *****//
function addOneArm(angle_Y, angle_Z, socketPosition) {
  /* angle_Y, angle_Z determines the direction of the enire arm
   * i.e. you create a arm on world scene's origin, rotate along
   * y-axis, and z-axis by these angles will let you insert your
   * arm into the socket
  */

  // Add joint1
  /* Hint: You should rotate joint1 so that for future links and joints,
   *       They can be along the direction of the socket
   *       Even though the sphere looks unchanged but future links are
   *       chidren frames of this joint1
   * Hint: You also need to translate joint1
  */
  let zRot = new THREE.Matrix4().set(
  Math.cos(angle_Z),-Math.sin(angle_Z),0.0,0.0, 
  Math.sin(angle_Z),Math.cos(angle_Z),0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  );

  let yRot = new THREE.Matrix4().set(
  Math.cos(angle_Y),0.0,Math.sin(angle_Y),0.0, 
  0.0,1.0,0.0,0.0, 
  -Math.sin(angle_Y),0.0,Math.cos(angle_Y),0.0, 
  0.0,0.0,0.0,1.0
  );

  const t = new THREE.Matrix4().set(
  1.0,0.0,0.0, socketPosition[0], 
  0.0,1.0,0.0,socketPosition[1], 
  0.0,0.0,1.0,socketPosition[2], 
  0.0,0.0,0.0,1.0
  );

  const l = Math.sqrt(socketPosition[0] * socketPosition[0] + socketPosition[1] * socketPosition[1] + socketPosition[2] * socketPosition[2]);
  const td = new THREE.Matrix4().set(
  1.0,0.0,0.0, 0, 
  0.0,1.0,0.0,0, 
  0.0,0.0,1.0,l, 
  0.0,0.0,0.0,1.0
  );

  const rd = new THREE.Matrix4().set(
  1.0,0.0,0.0, 0, 
  0.0,1.0,0.0,0, 
  0.0,0.0,1.0,l/2, 
  0.0,0.0,0.0,1.0
  );
  const sd = new THREE.Matrix4().set(
  1.0,0.0,0.0, 0, 
  0.0,1.0,0.0,0, 
  0.0,0.0,l/2,0, 
  0.0,0.0,0.0,1.0
  );
  const xOffset  = new THREE.Matrix4().set(
  1.0,0.0,0.0, 0, 
  0.0,Math.cos(Math.PI / 2),-Math.sin(Math.PI / 2),0, 
  0.0,Math.sin(Math.PI / 2),Math.cos(Math.PI / 2),0, 
  0.0,0.0,0.0,1.0
  );
  const addLink = (link, parent, pNode)=>{
    let local = new THREE.Matrix4();
    let f = getMatrixColumn4(td,3);
    f = new THREE.Vector3(f.x, f.y, f.z).normalize();
    let lookAtMtx = createLookAtMatrix(new THREE.Vector3(0, 0, 0), f, new THREE.Vector3(0,1,0));

    local.multiplyMatrices(sd,xOffset)
    local.multiplyMatrices(rd,local)
    local.multiplyMatrices(lookAtMtx,local)
    let localNodeM = new THREE.Matrix4().copy(local);
    let nLink = new node(link, localNodeM, []);

    lookAtMtx.multiplyMatrices(parent.matrix, local);

    link.matrixAutoUpdate = false;
    link.matrix.copy(lookAtMtx);

    
    pNode.addChild(nLink);
    
    scene.add(link);

    return nLink;
  }
  const addJoint = (joint, localM, pNode)=>{
    let j = new node(joint, localM, []);

    let m = new THREE.Matrix4().multiplyMatrices(pNode.localM, localM);
    joint.matrixAutoUpdate = false;  
    joint.matrix.copy(m);

    pNode.addChild(j);
    scene.add(joint);

    return j;
  }
  let jm1 = new THREE.Matrix4();
  jm1.multiplyMatrices(zRot, yRot);
  jm1.multiplyMatrices(t, jm1);

  var joint1 = new THREE.Mesh(j1, normalMaterial);
  let j1N = addJoint(joint1, jm1, octopusN);

  var link1 = new THREE.Mesh(l1, normalMaterial);
  let l1N = addLink(link1, joint1, j1N);

  let localj23 = new THREE.Matrix4().copy(td);
  var joint2 = new THREE.Mesh(j2, normalMaterial);
  let j2N = addJoint(joint2, localj23, j1N);

  var link2 = new THREE.Mesh(l2, normalMaterial);
  let l2N = addLink(link2, joint2, j2N);

  var joint3 = new THREE.Mesh(j3, normalMaterial);
  let j3N = addJoint(joint3, localj23, j2N);

  var link3 = new THREE.Mesh(l3, normalMaterial);
  let l3N = addLink(link3, joint3, j3N);

  return [j1N, l1N, j2N, l2N, j3N, l3N];
}

/* Now, call addOneArm() 4 times with 4 directions and
 * and 4 socket positions, you will add 4 arms on octopus
 * We return a tuple of joints and links, use them to 
 * animate the octupus
*/

// Socket positions
socketPos1 = [-2.4, -0.35, 2.4];
socketPos2 = [2.4, -0.35, 2.4];
socketPos3 = [2.4, -0.35, -2.4];
socketPos4 = [-2.4, -0.35, -2.4];
//***** Q2 *****//
let arm1InitalRots = [Math.PI*(-45/180), Math.PI*(-15/180)];
let arm2InitalRots = [Math.PI*(45/180), Math.PI*(-15/180)];
let arm3InitalRots = [Math.PI*(-225/180), Math.PI*(345/180)];
let arm4InitalRots = [Math.PI*(-135/180), Math.PI*(-15/180)];
var arm1 = addOneArm(arm1InitalRots[0], arm1InitalRots[1], socketPos1);
var arm2 = addOneArm(arm2InitalRots[0], arm2InitalRots[1], socketPos2);
var arm3 = addOneArm(arm3InitalRots[0], arm3InitalRots[1], socketPos3);
var arm4 = addOneArm(arm4InitalRots[0], arm4InitalRots[1], socketPos4);

//***** Q3.b *****/
function animateArm(time, arm, socketPosition, initialRots) {
  joint1 = arm[0];
  link1 = arm[1];
  joint2 = arm[2];
  link2 = arm[3];
  joint3 = arm[4];
  link3 = arm[5];
  /* copy and paste your function of addOneArm() here,
   * remove the lines of new THREE.mesh(...) and scene.add(...)
   * will update the matrices of the meshes so that 
   * the arms move with the body, but without effects of swimming
   * 
   * Hint: In addOneArm(), you computed the transformation
   *       matrices of joints and links, simulating swimmiing effect
   *       requires you to rotate only links in links' own frame
   *       You also have computed transformation matrices that
   *       transform link to its parent, think about how you can
   *       do rotation only in the link's frame and then transform
   *       points to its parents
   * 
   * Hint: T_{oct-joint} * T_{joint-link}
   *                       |
   *       T_{oct-joint} * R * T_{joint-link}
   *       Your task is to find R for 3 links and multiply R between
   *       transformation matrices.
   * 
   * Hint: To generate time related rotation, use
   *       rotate along axis you want by angle of function of
   *       sine t, then we have a periodic effect
   *       var rotation = defineRotation_{AXIS}(f(sin(t)))
  */
  const l = Math.sqrt(socketPosition[0] * socketPosition[0] + socketPosition[1] * socketPosition[1] + socketPosition[2] * socketPosition[2]);


  let createZRot = (angle_Z)=>{
    return new THREE.Matrix4().set(
    Math.cos(angle_Z),-Math.sin(angle_Z),0.0,0.0, 
    Math.sin(angle_Z),Math.cos(angle_Z),0.0,0.0, 
    0.0,0.0,1.0,0.0, 
    0.0,0.0,0.0,1.0
  );
  };
  let createYRot = (angle_Y)=>{
  return new THREE.Matrix4().set(
  Math.cos(angle_Y),0.0,Math.sin(angle_Y),0.0, 
  0.0,1.0,0.0,0.0, 
  -Math.sin(angle_Y),0.0,Math.cos(angle_Y),0.0, 
  0.0,0.0,0.0,1.0
  );
  };
  let createXRot = (angle_X)=>{
    return new THREE.Matrix4().set(
    1.0,0.0,0.0, 0, 
    0.0,Math.cos(angle_X),-Math.sin(angle_X),0, 
    0.0,Math.sin(angle_X),Math.cos(angle_X),0, 
    0.0,0.0,0.0,1.0
    );
  };
  let zRot = createZRot(initialRots[1] + Math.cos(time)/2);

  let yRot = createYRot(initialRots[0] + Math.sin(time)/2);

  let yRot2 = createYRot(Math.sin(time)/50000.0);

  let xRot2 = createXRot(Math.cos(time)/200.0);

  let t = new THREE.Matrix4().set(
  1.0,0.0,0.0, socketPosition[0], 
  0.0,1.0,0.0,socketPosition[1], 
  0.0,0.0,1.0,socketPosition[2], 
  0.0,0.0,0.0,1.0
  );


  let m = new THREE.Matrix4();
  m.multiplyMatrices(zRot, yRot);
  m.multiplyMatrices(t, m);

  let rot = new THREE.Matrix4();
  rot.multiplyMatrices(yRot2, xRot2);
  let rot2 = rot.clone();

  rot.multiplyMatrices(joint2.localM, rot);
  rot2.multiplyMatrices(joint3.localM, rot2);
  
  

  joint1.localM = m;
  joint2.localM = rot;
  joint3.localM = rot2;
  //chamar update aqui funcionaria, mas como vou chamar no pai para cada frame, n eh necessario
}

var clock = new THREE.Clock(true);
var initalMtx = octopusMatrix.value;
function updateBody() {
  switch(channel)
  {
    case 0: 
      break;

    case 1:
      //***** Example of how to rotate eyes with octopus *****//
      // Your animations should be similar to this
      // i.e. octopus' body parts moves at the same time
      var t = clock.getElapsedTime();
      octopusMatrix.value = new THREE.Matrix4().multiplyMatrices(
        defineRotation_Y(t),
        initalMtx
      );
      // Right eye
      eyeball_R.setMatrix(new THREE.Matrix4().multiplyMatrices(
        octopusMatrix.value,
        eyeballTS_R
      ));
      pupil_R.setMatrix(new THREE.Matrix4().multiplyMatrices(
        new THREE.Matrix4().multiplyMatrices(
          octopusMatrix.value,
          eyeballTS_R
        ),
        new THREE.Matrix4().multiplyMatrices(
          defineRotation_Y(theta_R),
          pupilTS_R
        )
      ));
      scene.add(eyeball_R);
      scene.add(pupil_R);
      // You can also define the matrices and multiply
      // Left eye
      oct_eye_L = new THREE.Matrix4().multiplyMatrices(
        octopusMatrix.value,
        eyeballTS_L
      );
      pupil_L_TSR = new THREE.Matrix4().multiplyMatrices(
        defineRotation_Y(theta_L),
        pupilTS_L
      );
      oct_pupil = new THREE.Matrix4().multiplyMatrices(
        oct_eye_L,
        pupil_L_TSR
      );
      eyeball_L.setMatrix(oct_eye_L);
      pupil_L.setMatrix(oct_pupil);
      break;
    case 2:
      break;

    //animation
    case 3:
      {
        var time = clock.getElapsedTime();
        console.log(t);
        // Animate Octopus Body
        //octopusMaterial.matrixAutoUpdate = false;
        
        octopusMatrix = new THREE.Matrix4().set(
          1.0,0.0,0.0,0.0, 
          0.0,1.0,0.0,(Math.sin(time/1.1+11)*1.8)+3, 
          0.0,0.0,1.0,0.0, 
          0.0,0.0,0.0,1.0
        );
        octopusMaterial.uniforms.octopusMatrix.value = octopusMatrix;
        octopusN.localM = octopusMatrix;
       
        animateArm(time, arm1, socketPos1, arm1InitalRots);
        animateArm(time, arm2, socketPos2, arm2InitalRots);
        animateArm(time, arm3, socketPos3, arm3InitalRots);
        animateArm(time, arm4, socketPos4, arm4InitalRots)
        
      }

      break;
    case 4:
      //arrumando o case 1 que nao funciona(deveria ser um exemplo fornecido pelo codigo original).
      time = clock.getElapsedTime();
      angle_Y = time /2;
      octopusMatrix = new THREE.Matrix4().set(
      Math.cos(angle_Y),0.0,Math.sin(angle_Y),0.0, 
      0.0,1.0,0.0,0.0, 
      -Math.sin(angle_Y),0.0,Math.cos(angle_Y),0.0, 
      0.0,0.0,0.0,1.0
      );
      octopusMaterial.uniforms.octopusMatrix.value = octopusMatrix;
      octopusN.localM = octopusMatrix;
      break;
    default:
      break;
  }
}


// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
var channel = 0;
function checkKeyboard() {
  for (var i=0; i<6; i++)
  {
    if (keyboard.pressed(i.toString()))
    {
      octopusMaterial.needsUpdate = true;
      channel = i;
      break;
    }
  }
}


// SETUP UPDATE CALL-BACK
function update() {

  octopusN.update(new THREE.Matrix4().identity());
  
  checkKeyboard();
  updateBody();
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();