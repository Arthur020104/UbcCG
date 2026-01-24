varying vec4 v_Color;
uniform mat4 octopusMatrix;
void main() {
  // Set final rendered color according to the surface normal
 // gl_FragColor = vec4(0, 1, 0, 1);
  gl_FragColor = v_Color;
  //gl_FragColor = vec4( 0.5 * normalize( interpolatedNormal ) + 0.5, 1.0 );

}
