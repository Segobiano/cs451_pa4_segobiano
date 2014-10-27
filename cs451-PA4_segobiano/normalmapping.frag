/* -------------------------------------------------------

This shader implements a spotlight per pixel using  the 
diffuse, specular, and ambient terms acoording to "Mathematics of Lighthing" 
as found in the book "OpenGL Programming Guide" (aka the Red Book)

Antonio Ramires Fernandes


bump mapping refeence
http://www.gamasutra.com/blogs/RobertBasler/20131122/205462/Three_Normal_Mapping_Techniques_Explained_For_the_Mathematically_Uninclined.php?print=1
--------------------------------------------------------- */

varying vec4 diffuse,ambientGlobal, ambient;
varying vec3 normal,lightDir,halfVector;
varying float dist;
varying vec2 TexCoord;
varying vec4 fragpos;

uniform sampler2D color_texture;
uniform sampler2D norml_map;



mat3 calcTBN(vec3 pos, vec2 texcoord, vec3 normal) {
	 // compute derivations of the world position
	 vec3 p_dx = dFdx(pos);
	 vec3 p_dy = dFdy(pos);
	 // compute derivations of the texture coordinate
	 vec2 tc_dx = dFdx(texcoord);
	 vec2 tc_dy = dFdy(texcoord);
	 // compute initial tangent and bi-tangent
	 vec3 t = normalize( tc_dy.y * p_dx - tc_dx.y * p_dy );
	 vec3 b = normalize( tc_dy.x * p_dx - tc_dx.x * p_dy ); // sign inversion
	 // get new tangent from a given mesh normal
	 vec3 n = normalize(normal);
	 vec3 x = cross(n, t);
	 t = cross(x, n);
	 t = normalize(t);
	 // get updated bi-tangent
	 x = cross(b, n);
	 b = cross(n, x);
	 b = normalize(b);
	 return mat3(t, b, n);
}
void main()
{
	vec3 n,halfV;
	float NdotL,NdotHV;
	vec4 color = vec4(0); //ambientGlobal;
	float att,spotEffect;
	int get_light=0;
	vec4 texColor = texture2D(color_texture,gl_TexCoord[0].st);
	/* a fragment shader can't write a verying variable, hence we need
	a new variable to store the normalized interpolated normal */

	vec3 normalSample = texture2D(norml_map,gl_TexCoord[0].st).rgb*2.0-1.0;
	normalSample.xy *= 1.5;
	normalSample = normalize(normalSample);

	mat3 tanspace = calcTBN(fragpos.xyz, gl_TexCoord[0].st, normalize(normal));
	n = normalize(tanspace*normalSample);
	
	/* compute the dot product between normal and ldir */
	NdotL = max(dot(n,normalize(lightDir)),0.0);
	vec4 spec = vec4(0.0);

	if (NdotL > 0.0) 
	{
		spotEffect = dot(normalize(gl_LightSource[0].spotDirection), normalize(-lightDir));
		
		float threshold = cos(gl_LightSource[0].spotCosCutoff); //spotCosCutoff is in radian

		if (spotEffect >threshold ) 
		{
			spotEffect = pow(spotEffect, gl_LightSource[0].spotExponent);
			att = spotEffect / (gl_LightSource[0].constantAttenuation +
			                    gl_LightSource[0].linearAttenuation * dist +
		                        gl_LightSource[0].quadraticAttenuation * dist * dist);


			color += att * texColor*(diffuse *NdotL/* + ambient*/);

			halfV = normalize(halfVector);
			NdotHV = max(dot(n,halfV),0.0);
			color += att * gl_FrontMaterial.specular * gl_LightSource[0].specular * pow(NdotHV,gl_FrontMaterial.shininess);
			get_light=1;
			spec = gl_FrontMaterial.specular*gl_LightSource[0].specular * pow(NdotHV,gl_FrontMaterial.shininess);
		}
	}

	if(get_light==0)
	{		
		att = 0.2 / (gl_LightSource[0].constantAttenuation +
			         gl_LightSource[0].linearAttenuation * dist +
		             gl_LightSource[0].quadraticAttenuation * dist * dist);		
		color = att*(texColor* ambient);
	}
	
 
   
	gl_FragColor =  color;
}

