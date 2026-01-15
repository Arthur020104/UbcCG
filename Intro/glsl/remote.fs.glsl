uniform int rcState;


void main() {
	// HINT: WORK WITH rcState HERE

	//Paint it red


    gl_FragColor = vec4(rcState == 1? 1: 0, rcState == 2? 1:0, rcState == 3?1:0, 1);


}
