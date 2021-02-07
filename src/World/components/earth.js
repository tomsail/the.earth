import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js';
let EARTH_R = 6.371; // in thousand of km
let SCALE = 40;
let earthMat;
let earthMat1;
const textureLoader = new THREE.TextureLoader();

class Earth{
	constructor(params, renderer){
		this.params = params;
		this.renderer = renderer
		// textures
		const atmoShader = {
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			transparent: true,
			lights: true,
			uniforms: THREE.UniformsUtils.merge( [
	
				THREE.UniformsLib[ "common" ],
				THREE.UniformsLib[ "lights" ]
	
			] ),
			vertexShader: [
				"varying vec3 vViewPosition;",
				"varying vec3 vNormal;",
				"void main() {",
				THREE.ShaderChunk[ "beginnormal_vertex" ],
				THREE.ShaderChunk[ "defaultnormal_vertex" ],
	
				"	vNormal = normalize( transformedNormal );",
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vViewPosition = -mvPosition.xyz;",
				"gl_Position = projectionMatrix * mvPosition;",
				"}"
	
			].join( "\n" ),
	
			fragmentShader: [
	
				THREE.ShaderChunk[ "common" ],
				THREE.ShaderChunk[ "bsdfs" ],
				THREE.ShaderChunk[ "lights_pars_begin" ],
				THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
	
				"void main() {",
				"vec3 normal = normalize( -vNormal );",
				"vec3 viewPosition = normalize( vViewPosition );",
				"#if NUM_DIR_LIGHTS > 0",
	
				"vec3 dirDiffuse = vec3( 0.0 );",
	
				"for( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {",
	
				"vec4 lDirection = viewMatrix * vec4( directionalLights[i].direction, 0.0 );",
				"vec3 dirVector = normalize( lDirection.xyz );",
				"float dotProduct = dot( viewPosition, dirVector );",
				"dotProduct = 1.0 * max( dotProduct, 0.0 ) + (1.0 - max( -dot( normal, dirVector ), 0.0 ));",
				"dotProduct *= dotProduct;",
				"dirDiffuse += max( 0.5 * dotProduct, 0.0 ) * directionalLights[i].color;",
				"}",
				"#endif",
	
				//Fade out atmosphere at edge
				"float viewDot = abs(dot( normal, viewPosition ));",
				"viewDot = clamp( pow( viewDot + 0.6, 10.0 ), 0.0, 1.0);",
	
				"vec3 color = vec3( 0.05, 0.09, 0.13 ) * dirDiffuse;",
				"gl_FragColor = vec4( color, viewDot );",
	
				"}"
	
			].join( "\n" )
		};
	
		const earthAtmoMat = new THREE.ShaderMaterial( atmoShader );
	
		// NOW
		earthMat = new THREE.MeshPhongMaterial( {
			color: 0xffffff,
			shininess: 60, 
		} );
		textureLoader.load( 'textures/planets/earth_texture_hd.jpg', function ( tex ) {
			earthMat.map = tex;
			earthMat.map.encoding = THREE.sRGBEncoding;
			earthMat.needsUpdate = true;
		} );
		textureLoader.load( 'textures/planets/earth_specular_hd.jpg', function ( tex ) {
			earthMat.specularMap = tex;
			earthMat.specularMap.encoding = THREE.sRGBEncoding;
			earthMat.needsUpdate = true;
		} );

		textureLoader.load( 'textures/planets/earth_normal_hd.jpg', function( tex ) {
			earthMat.bumpMap = tex;
			earthMat.bumpScale = params.mapHeight;
		} );
		this.earthLights = textureLoader.load( 'textures/planets/earth_lights_hd.jpg' );
		this.earthLights.encoding = THREE.sRGBEncoding;

		this.earthLightsMat = new THREE.MeshBasicMaterial( {
			color: 0xffffff,
			blending: THREE.AdditiveBlending,
			// Test done here .. to be continued see the example on threeJS : 
			// https://threejs.org/examples/#webgl_materials_blending_custom
			// blending: THREE.CustomBlending,
			// blendEquation: THREE.AddEquation, //default
			// blendSrc: THREE.OneMinusDstColorFactor, 
			// blendDst: THREE.DstColorFactor, 
			opacity : params.opacityLights,
			transparent: true,
			depthTest: false,
			map: this.earthLights,

		} );

		this.earthGeo = new THREE.SphereBufferGeometry( EARTH_R * SCALE, 120, 120 );
		this.sphereMesh = new THREE.Mesh( this.earthGeo, earthMat );
		this.sphereMesh.castShadow = true;      //default is false
		this.sphereMesh.receiveShadow = true;   //default is false
		this.sphereMesh.visible = true;  	

		this.sphereLightsMesh = new THREE.Mesh( this.earthGeo, this.earthLightsMat );
		this.sphereLightsMesh.visible = true;  	

		// IN THE FUTURE 
		earthMat1 = new THREE.MeshPhongMaterial( {
			color: 0xffffff,
			shininess: 60, 
		} );
		textureLoader.load( 'textures/planets/earth_texture_hd_3000.jpg', function ( tex ) {
			earthMat1.map = tex;
			earthMat1.map.encoding = THREE.sRGBEncoding;
			earthMat1.needsUpdate = true;
		} );
		textureLoader.load( 'textures/planets/earth_specular_hd_3000.jpg', function ( tex ) {
			earthMat1.specularMap = tex;
			earthMat1.specularMap.encoding = THREE.sRGBEncoding;
			earthMat1.needsUpdate = true;
		} );

		textureLoader.load( 'textures/planets/earth_normal_hd_3000.jpg', function( tex ) {
			earthMat1.bumpMap = tex;
			earthMat1.bumpScale = params.mapHeight;
		} );
		this.earthLights1 = textureLoader.load( 'textures/planets/earth_lights_hd_3000.jpg' );
		this.earthLights1.encoding = THREE.sRGBEncoding;

		this.earthLightsMat1 = new THREE.MeshBasicMaterial( {
			color: 0xffffff,
			blending: THREE.AdditiveBlending,
			opacity : params.opacityLights,
			transparent: true,
			depthTest: false,
			map: this.earthLights1,

		} );

		this.earthGeo = new THREE.SphereBufferGeometry( EARTH_R * SCALE, 120, 120 );
		this.sphereMesh1 = new THREE.Mesh( this.earthGeo, earthMat1 );
		this.sphereMesh1.castShadow = true;      //default is false
		this.sphereMesh1.receiveShadow = true;   //default is false
		this.sphereMesh1.visible = false;  		

		this.sphereLightsMesh1 = new THREE.Mesh( this.earthGeo, this.earthLightsMat1 );
		this.sphereLightsMesh1.visible = false;  		


		const clouds = textureLoader.load( 'textures/planets/clouds_8k.png' );
		clouds.encoding = THREE.sRGBEncoding;

		const earthCloudsMat = new THREE.MeshLambertMaterial( {
			color: 0xffffff,
			blending: THREE.NormalBlending,
			transparent: true,
			depthTest: false,
			map: clouds
		} );

		this.sphereCloudsMesh = new THREE.Mesh( this.earthGeo, earthCloudsMat );
		this.sphereCloudsMesh.scale.set( 1.001, 1.001, 1.001 );

		this.sphereAtmoMesh = new THREE.Mesh( this.earthGeo, earthAtmoMat );
		// this.sphereAtmoMesh.scale.set( 1.1, 1.1, 1.1 );
	}

	addToScene(scene){
		scene.add( this.sphereMesh );
		scene.add( this.sphereMesh1 );
		scene.add( this.sphereLightsMesh );
		scene.add( this.sphereLightsMesh1 );
		scene.add( this.sphereCloudsMesh );
		scene.add( this.sphereAtmoMesh );
	}
	
	debugSceneAdd(debugScene){

		const vBGShader = [
			// "attribute vec2 uv;",
			"varying vec2 vUv;",
			"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" );

		const pBGShader = [

			"uniform sampler2D map;",
			"varying vec2 vUv;",

			"void main() {",

			"vec2 sampleUV = vUv;",
			"vec4 color = texture2D( map, sampleUV, 0.0 );",

			"gl_FragColor = vec4( color.xyz, 1.0 );",

			"}"

		].join( "\n" );

		// Skybox
		this.adaptiveLuminanceMat = new THREE.ShaderMaterial( {
			uniforms: {
				"map": { value: null }
			},
			vertexShader: vBGShader,
			fragmentShader: pBGShader,
			depthTest: false,
			// color: 0xffffff,
			blending: THREE.NoBlending
		} );

		this.currentLuminanceMat = new THREE.ShaderMaterial( {
			uniforms: {
				"map": { value: null }
			},
			vertexShader: vBGShader,
			fragmentShader: pBGShader,
			depthTest: false
			// color: 0xffffff
			// blending: THREE.NoBlending
		} );

		let quadBG = new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.1, 0.1 ), this.currentLuminanceMat );
		quadBG.position.z = - 500;
		quadBG.position.x = - window.innerWidth * 0.5 + window.innerWidth * 0.05;
		quadBG.scale.set( window.innerWidth, window.innerHeight, 1 );
		debugScene.add( quadBG );

		quadBG = new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.1, 0.1 ), this.adaptiveLuminanceMat );
		quadBG.position.z = - 500;
		quadBG.position.x = - window.innerWidth * 0.5 + window.innerWidth * 0.15;
		quadBG.scale.set( window.innerWidth, window.innerHeight, 1 );
		debugScene.add( quadBG );


	}
	updateTextures(params){
		earthMat.bumpScale = params.mapHeight;
		earthMat1.bumpScale = params.mapHeight;
		this.earthLightsMat.opacity = params.opacityLights;
	}

	updateToneTextures(adaptToneMappingPass, params){
		adaptToneMappingPass.setAdaptionRate( params.adaptionRate );
		this.adaptiveLuminanceMat.uniforms[ "map" ].value = adaptToneMappingPass.luminanceRT;
		this.currentLuminanceMat.uniforms[ "map" ].value = adaptToneMappingPass.currentLuminanceRT;
		adaptToneMappingPass.enabled = params.enabled;
		adaptToneMappingPass.setMaxLuminance( params.maxLuminance );
		adaptToneMappingPass.setMiddleGrey( params.middleGrey );
	}
}
export {Earth};