//
// TODO: Implement texture mapping. This should add on to the spotlight shader: spotlight_shading.vert/frag
//

varying vec3 fragNormal;
varying vec3 eye;
varying vec3 lightDir;

void main() {

	vec4 color= gl_LightSource[0].ambient;
	vec4 spec = vec4(0.0);
	vec3 N = normalize(fragNormal);
	vec3 L = normalize(lightDir);
	vec3 E = normalize(eye);
    float intensity = max(dot(N,L), 0.0);
	if (intensity > 0.0) {
       vec3 H = normalize(L + E);
        float intSpec = max(dot(H,N), 0.0);
		spec = gl_FrontMaterial.specular*pow(intSpec,gl_FrontMaterial.shininess);
		color += gl_FrontMaterial.specular * 
					gl_LightSource[0].specular * 
					pow(intSpec, gl_FrontMaterial.shininess);

	}
	
	gl_FragColor = max(intensity*gl_FrontMaterial.diffuse+spec,gl_LightSource[0].ambient);
}

  