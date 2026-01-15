// Create shared variable. The value is given as the interpolation between normals computed in the vertex shader
varying vec3 interpolatedNormal;
varying float remoteDistance;
/* HINT: YOU WILL NEED A DIFFERENT SHARED VARIABLE TO COLOR ACCORDING TO POSITION */

void main() {
  // Set final rendered color according to the surface normal

  gl_FragColor = vec4(normalize(interpolatedNormal), 1.0); // REPLACE ME

  if(remoteDistance < 3.0)
    gl_FragColor = vec4(1.0, 0.85, 0.0, 1.0); // REPLACE ME
}
