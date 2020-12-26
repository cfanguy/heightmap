// code modified from example at https://github.com/zhunor/threejs-dem-visualizer

import { OrbitControls } from './js/OrbitControls.js';

class Application {
  constructor(opts = {}) {
    this.width = 800;
    this.height = 600;

    console.log(window.innerWidth);

    if (opts.container) {
      this.container = opts.container;
    } else {
      this.container = document.getElementById("canvas-container");
    }

    this.init();
    this.render();
  }

  init() {
    this.scene = new THREE.Scene();
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.setupLight();
    this.setupTerrainModel();
    this.setupHelpers();

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    });
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    // when render is invoked via requestAnimationFrame(this.render) there is
    // no 'this', so either we bind it explicitly or use an es6 arrow function.
    // requestAnimationFrame(this.render.bind(this));
    requestAnimationFrame(() => this.render());
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xd3d3d3); // it's a dark gray
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    const fov = 75;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 10000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 1000, 1000);
    this.camera.lookAt(this.scene.position);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
    this.controls.maxDistance = 750;
    this.controls.minDistance = 0;
    this.controls.autoRotate = false;
  }

  setupLight() {
    this.light = new THREE.DirectionalLight(0xffffff);
    this.light.position.set(500, 1000, 250);
    this.scene.add(this.light);
    // this.scene.add(new THREE.AmbientLight(0xeeeeee));
  }

  setupTerrainModel() {
    const readGeoTif = async () => {
      const rawTiff = await GeoTIFF.fromUrl("textures/agri-small-dem.tif");
      const tifImage = await rawTiff.getImage();
      const image = {
        width: tifImage.getWidth(),
        height: tifImage.getHeight()
      };
      

      /* 
      The third and fourth parameter are image segments and we are subtracting one from each,
       otherwise our 3D model goes crazy.
       https://github.com/mrdoob/three.js/blob/master/src/geometries/PlaneGeometry.js#L57
       */
      const geometry = new THREE.PlaneGeometry(
        image.width,
        image.height,
        image.width - 1,
        image.height -1
      );
      const data = await tifImage.readRasters({ interleave: true });

      console.time("parseGeom");
      geometry.vertices.forEach((geom, index) => {
        geom.z = (data[index] / 20) * -1;
      });
      console.timeEnd("parseGeom");

      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        wireframe: true
      });

      const mountain = new THREE.Mesh(geometry, material);
      mountain.position.y = 0;
      mountain.rotation.x = Math.PI / 2;

      this.scene.add(mountain);

      const loader = document.getElementById("loader");
      loader.style.opacity = "-1";

      // After a proper animation on opacity, hide element to make canvas clickable again
      setTimeout(
        (() => {
          loader.style.display = "none";
        }),
        1500
      );
    };

    readGeoTif();
  }

  setupHelpers() {
    const gridHelper = new THREE.GridHelper(1000, 40);
    this.scene.add(gridHelper);

    console.log("The X axis is red. The Y axis is green. The Z axis is blue.");
    const axesHelper = new THREE.AxesHelper(500);
    this.scene.add(axesHelper);
  }
}

(() => {
  const app = new Application({
    container: document.getElementById("canvas-container")
  });
  console.log(app);
})();
