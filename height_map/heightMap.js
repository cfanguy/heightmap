function createSceneTuto(engine) {
    //Creation of the scene
    var scene = new BABYLON.Scene(engine);

    //var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 50, 10), scene);

    var spot = new BABYLON.SpotLight("spot", new BABYLON.Vector3(0, 30, 10), new BABYLON.Vector3(0, -1, 0), 17, 1, scene);
    spot.diffuse = new BABYLON.Color3(1, 1, 1);
    spot.specular = new BABYLON.Color3(0, 0, 0);
    spot.intensity = 0.3;

    //var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, new BABYLON.Vector3.Zero(), scene);
    var rightclickdown = 0, mouseX = 0, mouseY = 0;

    // ArcRotateCamera >> Camera rotating around a 3D point (here Vector zero)
    // Parameters : name, alpha, beta, radius, target, scene
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, BABYLON.Vector3.Zero(), scene);
    camera.setPosition(new BABYLON.Vector3(0, 0, 150));
    camera.target = new BABYLON.Vector3(3, 0, 0);

    canvas.addEventListener("mousemove", function (evt) {
        evt.preventDefault();

        if (rightclickdown) {
            var newX = mouseX - evt.x;
            var newY = mouseY - evt.y
            cameraX = camera.target.x + (newX * 0.01);
            cameraY = camera.target.y + (newY * 0.01);
            camera.target = new BABYLON.Vector3(cameraX, cameraY, 0);

            scene.activeCamera.alpha = alpha_save;
            scene.activeCamera.beta = beta_save;
        }
    }, false);
    canvas.addEventListener("mousedown", function (evt) {
        evt.preventDefault();

        if (evt.button == 2) // Right click
        {
            rightclickdown = 1;
            mouseX = evt.x;
            mouseY = evt.y;

            alpha_save = scene.activeCamera.alpha;
            beta_save = scene.activeCamera.beta;
        }
        else {
            rightclickdown = 0;
        }
    }, false);
    canvas.addEventListener("mouseup", function (evt) {
        if (rightclickdown == 1) {
            rightclickdown = 0;
        }
    }, false);
    canvas.addEventListener("contextmenu", function (evt) {
        evt.preventDefault();
    }, false);

    // Ground
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("Earth__land.jpg", scene);

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "worldHeightMap.jpg", 200, 200, 250, 0, 10, scene, false);
    ground.material = groundMaterial;

    //Sphere to see the light's position
    var sun = new BABYLON.Mesh.CreateSphere("sun", 10, 4, scene);
    sun.material = new BABYLON.StandardMaterial("sun", scene);
    sun.material.emissiveColor = new BABYLON.Color3(1, 1, 0);


    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 800.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;


    // Camera constraints
    var camerasBorderFunction = function () {
        
        //Angle
        if (camera.beta < 0.1)
            camera.beta = 0.1;
        else if (camera.beta > (Math.PI / 2) * 0.9)
            camera.beta = (Math.PI / 2) * 0.9;

        //Zoom
        if (camera.radius > 150)
            camera.radius = 150;

        if (camera.radius < 30)
            camera.radius = 30;
    };

    scene.registerBeforeRender(camerasBorderFunction);

    return scene;

}