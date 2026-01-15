// Create shared variable for the vertex and fragment shaders
varying vec3 interpolatedNormal;
uniform vec3 remotePosition;
varying float remoteDistance;
uniform float elapsedTime;
/* HINT: YOU WILL NEED A DIFFERENT SHARED VARIABLE TO COLOR ACCORDING TO POSITION */

void main() {
    // Set shared variable to vertex normal
    interpolatedNormal = normal;
    
    vec4 pos =  modelMatrix * vec4(position, 1.0);
    remoteDistance = sqrt(((pos.x - remotePosition.x) * (pos.x - remotePosition.x)) + ((pos.y - remotePosition.y) * (pos.y - remotePosition.y)) + ((pos.z - remotePosition.z) * (pos.z - remotePosition.z)));
    
    // Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
    gl_Position = projectionMatrix * viewMatrix * vec4(pos.x,pos.y + sin(elapsedTime + pos.x), pos.z,  pos.w);//
}
