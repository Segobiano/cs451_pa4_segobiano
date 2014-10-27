
varying vec3 fragNormal;
varying vec3 eye;
varying vec3 lightDir;


void main() {
	vec4 pos=gl_ModelViewMatrix * gl_Vertex;
	fragNormal = gl_NormalMatrix * gl_Normal;
	lightDir=vec3(gl_LightSource[0].position-pos);
	eye=vec3(-pos);

	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	
}

