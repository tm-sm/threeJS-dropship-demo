
  
        var $window=$(window);    
        var $container = $('#container3D');

        var renderer,camera,scene,controls;   

        var spotlightAngle=0;

        var spotLightHelper,directionalLightHelper;

        var ambientLight,directionalLight,spotLight,pointLight,hemiLight; 

        var clock = new THREE.Clock();

        const speed = {
            time: 1,
            pendulo: 3
        }

        const global_depth = 0.2;
        const aguja_depth = 0.05;
        const pendulo_width = 1;
        const pendulo_height = 4;

        const relojero_radius = 2;

        const aguja_h_height = relojero_radius * 0.6;
        const aguja_m_height = relojero_radius * 0.7;
        const aguja_s_height = relojero_radius * 0.2;

        const geometry = new THREE.BoxGeometry( 2, 2, 2 );
        //const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const black_material = new THREE.MeshBasicMaterial({color: 0x00000});
        const white_material = new THREE.MeshBasicMaterial({color: 0xffffff});
        
        const pendulo = new THREE.Mesh( new THREE.BoxGeometry(aguja_depth, pendulo_height, pendulo_width), black_material );
        const aguja_h = new THREE.Mesh( new THREE.BoxGeometry(aguja_depth, aguja_h_height, 0.1), white_material );
        const aguja_m = new THREE.Mesh( new THREE.BoxGeometry(aguja_depth, aguja_m_height, 0.05), white_material );
        const aguja_s = new THREE.Mesh( new THREE.BoxGeometry(aguja_depth, aguja_s_height, 0.02), white_material );
        const relojero = new THREE.Mesh( new THREE.CylinderGeometry( relojero_radius, relojero_radius, global_depth, 32 ), black_material);


        const aguja_h_anchor = new THREE.Group();
        const aguja_m_anchor = new THREE.Group();
        const aguja_s_anchor = new THREE.Group();

        const reloj = new THREE.Group();

        const pendulo_reloj = new THREE.Group();

        
        const PI = 3.1415927;

        function start(){

			// Crear renderer
            renderer = new THREE.WebGLRenderer({antialias:true});
            renderer.setSize($window.width(), $window.height()-5); // Area de render: tamaño completo del canvas, en este caso $window

			// Crear y configurar la cámara  fov,aspect,near,far			
            var aspect=$window.width()/$window.height();
            camera = new THREE.PerspectiveCamera(55,aspect,0.1,100000);
            camera.position.set(50,50,50);
            camera.lookAt(new THREE.Vector3(0,0,0));

			// Crear escena
            scene = new THREE.Scene();

            // Vincular Three.js con HTML, anexa un objeto canvas al container3D
			$container.append(renderer.domElement);

			// Vincular handler onResize para el evento resize
            $window.resize(onResize);

            controls = new THREE.OrbitControls(camera,renderer.domElement); // Orbitador
            controls.screenSpacePanning=true;

            gridHelper = new THREE.GridHelper( 100,10 ); // Grilla del piso			
            scene.add( gridHelper );

            axesHelper = new THREE.AxesHelper( 8 ); // Ejes coordenados en el origen
            scene.add( axesHelper );

            
        }

        function setLights(){

	        // Luz ambiente
			ambientLight = new THREE.AmbientLight( 0x444466 ); // soft white light
			scene.add( ambientLight );

			// Luz direccional
			directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
			directionalLight.position.set( 1, 1, 1 );
			scene.add( directionalLight );

			// Luz hemisferica			
			hemiLight = new THREE.HemisphereLight( 0x554466, 0x332211, 2 );
			scene.add( hemiLight );

			// Luz Puntual
			pointLight = new THREE.PointLight( 0xffffff, 1, 200 ); // definimos una fuente de Luz puntual de color blanco
			pointLight.position.set( 0, 40, 0 ); // definimos su posicion en x,y,z=10,10,10
			scene.add( pointLight ); // agregamos la luz a la escena
			
            // Luz Spot	
            // SpotLight( color : Integer, intensity : Float, distance : Float, angle : Radians, penumbra : Float, decay : Float )		
			spotLight = new THREE.SpotLight( 0xffffff,2,200,0.5,0.5,1);
			spotLight.position.set( 30, 50, 30 );
            scene.add( spotLight ); // agregamos la luz a la escena

            // Helpers
            pointLightHelper = new THREE.PointLightHelper( pointLight, 1 );
			scene.add( pointLightHelper );

            spotLightHelper = new THREE.SpotLightHelper( spotLight );
            scene.add( spotLightHelper );

/*
			var directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 80 );
			scene.add( directionalLightHelper );
*/            

			// Estado inicial de las luces
            ambientLight.visible=false;
            hemiLight.visible=false;
            pointLight.visible=false;
            spotLight.visible=false;
            directionalLight.visible=true;
        }
        

        function createScene(){
            	// Carga de archivo GLTF
				var loader = new THREE.GLTFLoader();
           
                loader.load(
               
                'modelos/luces.gltf',
               
                function ( gltf ) {

                    gltf.animations; // Array<THREE.AnimationClip>
                    gltf.scene; // THREE.Scene
                    gltf.scenes; // Array<THREE.Scene>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object

                    scene.add( gltf.scene 
					);                    

                },
                // called while loading is progressing
                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( 'An error happened' );
               }
           );
       
    

            relojero.rotation.z += PI / 2.0;
            aguja_h.position.y += aguja_h_height / 2;
            aguja_m.position.y += aguja_m_height / 2;
            aguja_s.position.y += aguja_s_height / 2;
            aguja_h.position.x += global_depth;
            aguja_m.position.x += global_depth;
            aguja_s.position.x += global_depth;

            aguja_h_anchor.add( aguja_h );
            aguja_m_anchor.add( aguja_m );
            aguja_s_anchor.add( aguja_s );

            aguja_s_anchor.position.y -= relojero_radius / 2;

            reloj.add( relojero );
            reloj.add( aguja_h_anchor );
            reloj.add( aguja_m_anchor );

            reloj.add( aguja_s_anchor );

            reloj.position.set( 0, -3, 0 );

            pendulo.position.y -= pendulo_height / 2;
            reloj.position.y -= pendulo_height / 2;
            pendulo_reloj.add( pendulo );
            pendulo_reloj.add( reloj );

        
            scene.add(pendulo_reloj);

            pendulo_reloj.position.y = 10;
        }

        function createMenu(){
            var gui = new dat.GUI( );
	        gui.domElement.id = 'gui';

	        var f3 = gui.addFolder('otros');
	        f3.add(window,"toggleHelpers").name("helpers");	        
			f3.open();

            var f1 = gui.addFolder('reloj');
            f1.add(speed, "time", 0, 1000).step(1);
            f1.add(speed, "pendulo", 0, 10).step(1);
            f1.open();

        }

        function toggleHelpers(){
		// Invierte el estado de los Helpers
				//directionalLightHelper.visible=!directionalLightHelper.visible;
				spotLightHelper.visible=!spotLightHelper.visible;
				pointLightHelper.visible=!pointLightHelper.visible;
				axesHelper.visible=!axesHelper.visible;
				gridHelper.visible=!gridHelper.visible;
		}

        function onResize(){
            
            renderer.setSize($window.width(), $window.height()-5);
                    
            camera.aspect=$window.width()/$window.height();
            camera.updateProjectionMatrix();

        }

        function render() {
            requestAnimationFrame(render);

            var x=Math.cos(spotlightAngle*2*Math.PI/180)*100;
            var z=Math.sin(spotlightAngle*2*Math.PI/180)*100;
            spotLight.position.x=x;
            spotLight.position.z=z;
            
            spotLightHelper.update();

            var elapsedTime = clock.elapsedTime;
            var delta = clock.getDelta();

            pendulo_reloj.rotation.x = Math.sin(elapsedTime * speed.pendulo);

            aguja_s_anchor.rotation.x -= (360.0 * ((delta / 100) / (60.0))) * speed.time;
            aguja_m_anchor.rotation.x -= (360.0 * ((delta / 100) / (60.0 * 60.0))) * speed.time;
            aguja_h_anchor.rotation.x -= (360.0 * ((delta / 100) / (12.0 * 60.0 * 60.0))) * speed.time;

            renderer.render(scene, camera,false,false);   
            
        }


        start();
        setLights();
        createScene();
        createMenu();
        render();
    
    