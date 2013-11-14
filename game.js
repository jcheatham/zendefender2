(function(){
  if (!Detector.webgl) Detector.addGetWebGLMessage();
  function $(id) { return document.getElementById(id); }

  var currentScene, startScene, mainScene, startUI, gameUI, moneyDisplay, healthDisplay, gameoverDisplay;
  var stats, renderer, renderContainer;
  var projector = new THREE.Projector();
  var clock = new THREE.Clock();
  var input = new THREE.Vector3();
  var groundTexture, heartMaterial;

  THREE.DefaultLoadingManager.onProgress = function(item, loaded, total){ console.log(item, loaded, total); };

  init();
  animate();

  function animate() {
    requestAnimationFrame(animate);
    currentScene.render();
    stats.update();
  }

  function init() {
    startUI = $("startUI");
    startUI.style.display = "block";
    gameUI = $("gameUI");
    gameUI.style.display = "none";
    moneyDisplay = $("money-display");
    healthDisplay = $("health-display");
    gameoverDisplay = $("gameover-display");

    renderContainer = $("canvas-align");
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: $("webgl-canvas")});
    renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    $("canvas-container").appendChild(stats.domElement);

    $("start").addEventListener('click', onStartClick, false);
    gameoverDisplay.addEventListener('click', function(){ mainScene.onExit(); }, false);

    startScene = createStartScene();
    currentScene = startScene;

    groundTexture = {color: THREE.ImageUtils.loadTexture("data/stoneblocks_COLOR.png"),
      //displacement: THREE.ImageUtils.loadTexture("data/stoneblocks_DISP.png"),
      normals: THREE.ImageUtils.loadTexture("data/stoneblocks_NRM.png"),
      //occlusion: THREE.ImageUtils.loadTexture("data/stoneblocks_OCC.png"),
      specularity: THREE.ImageUtils.loadTexture("data/stoneblocks_SPEC.png")};
    heartMaterial = new THREE.SpriteMaterial({map: THREE.ImageUtils.loadTexture("data/heart.png"), useScreenCoordinates: false, color: 0xffffff});
    var loader = new THREE.SceneLoader();
    //loader.addGeometryHandler( "binary", THREE.BinaryLoader );
    //loader.addGeometryHandler( "ctm", THREE.CTMLoader );
    //loader.addGeometryHandler( "vtk", THREE.VTKLoader );
    //loader.addGeometryHandler( "stl", THREE.STLLoader );
    //loader.addHierarchyHandler( "obj", THREE.OBJLoader );
    //loader.addHierarchyHandler( "dae", THREE.ColladaLoader );
    //loader.addHierarchyHandler( "utf8", THREE.UTF8Loader );
    loader.callbackProgress = function(progress, result){
      var bar = 250,
          total = progress.totalModels + progress.totalTextures,
          loaded = progress.loadedModels + progress.loadedTextures;

      if (total) bar = Math.floor(bar * loaded / total);
      $("bar").style.width = bar + "px";
      //count = 0;
      //for (var m in result.materials) count++;
      //handle_update(result, Math.floor(count/total));
    };
    loader.load("data/defender2_scene.js", function(loaded){
      mainScene = loaded;
      var heartShot = new THREE.Sprite(heartMaterial);
      heartShot.scale.set(0.5, 0.5, 1);
      mainScene.objects["heart"] = heartShot;
      for (var i in mainScene.objects) { mainScene.objects[i].position.set(-10000,-10000,-10000); }
      $("message").style.display = "none";
      $("progressbar").style.display = "none";
      $("start").style.display = "block";
      $("start").className = "enabled";
      //onStartClick();
      });

    renderContainer.addEventListener('mousewheel', onMouseWheel, false);
    renderContainer.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
    renderContainer.addEventListener('mousedown', onMouseDown, false);
    renderContainer.addEventListener('mousemove', onMouseMove, false);
    renderContainer.addEventListener('mouseup', onMouseUp, false);
    renderContainer.addEventListener('touchstart', onTouchStart, false);
    renderContainer.addEventListener('touchmove', onTouchMove, false);
    renderContainer.addEventListener('touchend', onTouchEnd, false);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
    window.addEventListener('resize', function(){ currentScene.updateCamera(); }, false);
  }

  function onMouseWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    input.delta = (event.wheelDelta) ? (event.wheelDelta/40) : ((event.delta) ? (-event.delta/3) : 0);
    currentScene.onScroll(input);
  }

  function onMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
    var rect = renderContainer.getBoundingClientRect();
    input.set(2*((event.clientX-rect.left)/rect.width) - 1, -2*((event.clientY-rect.top)/rect.height) + 1, 0);
    currentScene.onInputDown(input);
  }

  function onMouseMove(event) {
    event.preventDefault();
    event.stopPropagation();
    var rect = renderContainer.getBoundingClientRect();
    input.set(2*((event.clientX-rect.left)/rect.width) - 1, -2*((event.clientY-rect.top)/rect.height) + 1, 0);
    currentScene.onInputMove(input);
  }

  function onMouseUp(event) {
    event.preventDefault();
    event.stopPropagation();
    var rect = renderContainer.getBoundingClientRect();
    input.set(2*((event.clientX-rect.left)/rect.width) - 1, -2*((event.clientY-rect.top)/rect.height) + 1, 0);
    currentScene.onInputUp(input);
  }

  function onTouchStart(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.touches.length < 1) return;
    input.set(2*(event.touches[0].pageX/renderContainer.clientWidth) - 1, -2*(event.touches[0].pageY/renderContainer.clientHeight) + 1, 0);
    currentScene.onInputDown(input);
  }

  function onTouchMove(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.touches.length < 1) return;
    input.set(2*(event.touches[0].pageX/renderContainer.clientWidth) - 1, -2*(event.touches[0].pageY/renderContainer.clientHeight) + 1, 0);
    currentScene.onInputMove(input);
  }

  function onTouchEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.touches.length < 1) return;
    input.set(2*(event.touches[0].pageX/renderContainer.clientWidth) - 1, -2*(event.touches[0].pageY/renderContainer.clientHeight) + 1, 0);
    currentScene.onInputUp(input);
  }

  function onKeyDown(event) {
    //event.preventDefault();
    //event.stopPropagation();
    //event.keyCode
  }

  function onKeyUp(event) {
    //event.preventDefault();
    //event.stopPropagation();
  }

  function onStartClick() {
    startUI.style.display = "none";
    gameUI.style.display = "block";
    gameoverDisplay.style.display = "none";
    initMainScene();
    currentScene = mainScene;
    currentScene.updateCamera();
  }


  function createStartScene() {
    var startScene = new THREE.Scene();
    var currentCamera = new THREE.PerspectiveCamera( 65, renderContainer.clientWidth / renderContainer.clientHeight, 1, 1000 );
    currentCamera.position.z = 100;
    startScene.add(currentCamera);

    var material = new THREE.MeshLambertMaterial({ color:0xffffff });
    var geometry = new THREE.TorusGeometry(5,1);
    var rotators = [];
    var obj;

    for(var i=0; i < 100; i++) {
      obj = new THREE.Mesh(geometry, material);

      obj.position.x = (Math.random() - 0.5) * 200;
      obj.position.y = (Math.random() - 0.5) * 200;
      obj.position.z = (Math.random() - 0.5) * 200;

      obj.rotation.x = Math.random() * 6;
      obj.rotation.y = Math.random() * 6;
      obj.rotation.z = Math.random() * 6;

      obj.matrixAutoUpdate = false;
      obj.updateMatrix();

      startScene.add(obj);
      rotators.push(obj);
    }

    startScene.matrixAutoUpdate = false;

    var light = new THREE.PointLight(0xffffff);
    startScene.add(light);

    light = new THREE.DirectionalLight(0x111111);
    light.position.x = 1;
    startScene.add(light);

    startScene.render = function(){
      var delta = clock.getDelta();
      currentCamera.position.x = input.x * 100;
      currentCamera.position.y = input.y * 100;
      currentCamera.lookAt(startScene.position);
      THREE.AnimationHandler.update(delta * 0.75);
      for (var i=0; i < rotators.length; i++) {
        rotators[i].rotation.y += 0.5 * delta;
        rotators[i].updateMatrix();
      }
      renderer.render(startScene, currentCamera);
    };
    startScene.updateCamera = function() {
      currentCamera.aspect = renderContainer.clientWidth / renderContainer.clientHeight;
      currentCamera.updateProjectionMatrix();
    };
    startScene.onInputDown = function(input){ };
    startScene.onInputUp = function(input){ };
    startScene.onInputMove = function(input){ };
    startScene.onScroll = function(input){ };

    return startScene;
  }


  function initMainScene(){
    while (mainScene.scene.children.length > 0) { mainScene.scene.remove(mainScene.scene.children[0]); }
    mainScene.currentCamera = new THREE.PerspectiveCamera( 65, renderContainer.clientWidth / renderContainer.clientHeight, 1, 1000 );
    mainScene.currentCamera.position.y = 15;
    mainScene.currentCamera.position.z = 10;
    mainScene.scene.add(mainScene.currentCamera);

    // LIGHTS
    var falloff = 100;
    var light = new THREE.PointLight(0xffffff, 1.5, falloff); light.position.set(0, 4, -10); mainScene.scene.add(light);
    //var light = new THREE.PointLight(0xffffff, 1, falloff); light.position.set( 8, 1, -8); mainScene.scene.add(light);
    //var light = new THREE.PointLight(0xffffff, 1, falloff); light.position.set(-8, 1,  8); mainScene.scene.add(light);
    //var light = new THREE.PointLight(0xffffff, 1, falloff); light.position.set( 8, 1,  8); mainScene.scene.add(light);
    var light = new THREE.DirectionalLight(0xbb4444, 0.9);
    light.position.set(0,1,8);
    light.rotation.set(Math.PI/2.1, 0, 0);
    mainScene.scene.add(light);
    // LIGHTS

    // GENERATE GROUND
    var groundGeo = new THREE.Geometry();
    var faceOffset = 0;
    var step = 0.5
    for (var z=-8; z < 8; z += step) {
      for (var x=-8; x < 8; x += step) {
        groundGeo.vertices.push(new THREE.Vector3(x, 0, z));
        groundGeo.vertices.push(new THREE.Vector3(x+step, 0, z));
        groundGeo.vertices.push(new THREE.Vector3(x+step, 0, z+step));
        groundGeo.vertices.push(new THREE.Vector3(x, 0, z+step));
        var uvBase = Math.floor(Math.random()*8) * 0.125;
        var uvs = [new THREE.Vector2(uvBase,1), new THREE.Vector2(uvBase+0.125,1), new THREE.Vector2(uvBase+0.125,0), new THREE.Vector2(uvBase,0)];
        //flipX
        if (Math.random() > 0.5) { var swap = uvs[0]; uvs[0] = uvs[1]; uvs[1] = swap; swap = uvs[2]; uvs[2] = uvs[3]; uvs[3] = swap; }
        //flipY
        if (Math.random() > 0.5) { var swap = uvs[0]; uvs[0] = uvs[3]; uvs[3] = swap; swap = uvs[1]; uvs[1] = uvs[2]; uvs[2] = swap; }
        var face = new THREE.Face3(faceOffset, faceOffset+2, faceOffset+1);
        face.normal.set(0,1,0);
        groundGeo.faces.push(face);
        groundGeo.faceVertexUvs[0].push([uvs[0], uvs[2], uvs[1]]);
        face = new THREE.Face3(faceOffset, faceOffset+3, faceOffset+2);
        face.normal.set(0,1,0);
        groundGeo.faces.push(face);
        groundGeo.faceVertexUvs[0].push([uvs[0], uvs[3], uvs[2]]);
        faceOffset += 4;
      }
    }
    groundGeo.mergeVertices();
    groundGeo.computeBoundingBox();
    var groundMat = new THREE.MeshPhongMaterial({map: groundTexture.color, specularMap: groundTexture.specularity, normalMap: groundTexture.normals});
    var groundMesh = new THREE.Mesh(groundGeo, groundMat);
    mainScene.scene.add(groundMesh);
    // GENERATE GROUND

    // BUDDHY
    var buddhyImage = THREE.ImageUtils.loadTexture("data/buddhy.png");
    var buddhyMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({map: buddhyImage, alphaTest: 0.5, side: THREE.DoubleSide}));
    buddhyMesh.position.set(0,2,-10);
    mainScene.scene.add(buddhyMesh);
    // BUDDHY

    // PURCHASEPLACER
    var purchasePlacerGeo = new THREE.Geometry();
    purchasePlacerGeo.vertices.push(new THREE.Vector3(0,0,0));
    purchasePlacerGeo.vertices.push(new THREE.Vector3(0.5,0,0));
    purchasePlacerGeo.vertices.push(new THREE.Vector3(0.5,0,0.5));
    purchasePlacerGeo.vertices.push(new THREE.Vector3(0,0,0.5));
    purchasePlacerGeo.faces.push(new THREE.Face3(0,2,1));
    purchasePlacerGeo.faces.push(new THREE.Face3(0,3,2));
    purchasePlacerGeo.computeFaceNormals();
    var purchasePlacerValid = new THREE.MeshLambertMaterial({color: 0x10FF10, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending});
    var purchasePlacerInvalid = new THREE.MeshLambertMaterial({color: 0xFF1010, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending});
    var purchasePlacer = new THREE.Mesh(purchasePlacerGeo, purchasePlacerInvalid);
    purchasePlacer.position.y = 1;
    purchasePlacer.visible = false;
    mainScene.scene.add(purchasePlacer);
    // PURCHASEPLACER

    var instantiateObject = function(name){
      var o = mainScene.objects[name].clone();
      mainScene.scene.add(o);
      return o;
    };

    var gs = new GameState(instantiateObject);
    //moneyDisplay.addEventListener('click', function(){ gs.money += 100; }, false); // DEBUG
    //healthDisplay.addEventListener('click', function(){ gs.health -= 100; }, false); // DEBUG

    var purchaseItem = -1;
    var purchaseFuncs = [];
    for (var j=0; j < gs.towers.length; j++) { (function(i){ purchaseFuncs.push(function(){
      // if (!canPurchase(i)) return;
      console.log("start purchase "+i);
      purchaseItem = i;
      purchasePlacer.scale.set(gs.towers[i].width, 1, gs.towers[i].height);
      purchasePlacer.visible = true;
    }); }(j)); }
    for (var i=0; i < gs.towers.length; i++) { $("purchase-item"+i).addEventListener("mousedown", purchaseFuncs[i], false); }

    mainScene.onExit = function(){
      for (var i=0; i < gs.towers.length; i++) { $("purchase-item"+i).removeEventListener('mousedown', purchaseFuncs[i], false); }
      gameUI.style.display = "none";
      startUI.style.display = "block";
      currentScene = startScene;
      currentScene.updateCamera();
    };

    mainScene.render = function(){
      var delta = clock.getDelta();

      if (!gs.update(delta)) {
        gameoverDisplay.style.display = "block";
      }
      moneyDisplay.innerHTML = "$"+gs.money;
      healthDisplay.innerHTML = "Karma "+gs.health;
      buddhyMesh.lookAt(this.currentCamera.position);

      this.currentCamera.lookAt(new THREE.Vector3(0,0,0));
      THREE.AnimationHandler.update(delta * 0.75);
      renderer.render(this.scene, this.currentCamera);
    };

    mainScene.updateCamera = function(){
      this.currentCamera.aspect = renderContainer.clientWidth / renderContainer.clientHeight;
      this.currentCamera.updateProjectionMatrix();
    };

    mainScene.onInputDown = function(input){
      var r = projector.pickingRay(input.clone(), this.currentCamera);
      var intersects = r.intersectObjects(this.scene.children, true);
      if (intersects.length > 0) {
          //controls.enabled = false;
          //SELECTED = intersects[ 0 ].object;
          //var intersects = raycaster.intersectObject( plane );
          //offset.copy( intersects[ 0 ].point ).sub( plane.position );
          //container.style.cursor = 'move';
      }
    };

    mainScene.onInputUp = function(input){
      if (purchaseItem >= 0) {
        var intersects = projector.pickingRay(input.clone(), this.currentCamera).intersectObject(groundMesh, true);
        if (intersects.length > 0) {
          var gameCoords = gs.coordsWorldToGame(intersects[0].point);
          var snappedCoords = gs.coordsGameToWorld(gameCoords);
          snappedCoords.setY(0.01);
          purchasePlacer.position.copy(snappedCoords);
          var msg = gs.BuyTower(purchaseItem, gameCoords.x, gameCoords.y);
          console.log("TODO: float to player '"+msg+"'.");
        }
        purchaseItem = -1;
        purchasePlacer.visible = false;
      }
    };

    mainScene.onInputMove = function(input){
      if (purchaseItem >= 0) {
        var intersects = projector.pickingRay(input.clone(), this.currentCamera).intersectObject(groundMesh, true);
        if (intersects.length > 0) {
          var gameCoords = gs.coordsWorldToGame(intersects[0].point);
          var snappedCoords = gs.coordsGameToWorld(gameCoords);
          snappedCoords.setY(0.01);
          purchasePlacer.position.copy(snappedCoords);
          var x = gameCoords.x, y = gameCoords.y, w = gs.towers[purchaseItem].width, h = gs.towers[purchaseItem].height;
          if (gs.gameMap.Available(x,y,w,h) && (gs.gameMap.Clone().SetWeight(Infinity,x,y,w,h).Settle().At(gs.spawnPoint.x,gs.spawnPoint.y) < 9999)) {
            purchasePlacer.material = purchasePlacerValid;
          } else {
            purchasePlacer.material = purchasePlacerInvalid;
          }
        }
      }
    };
    mainScene.onScroll = function(input){
      var newY = this.currentCamera.position.y + input.delta * 0.1;
      this.currentCamera.position.y = (newY < -15) ? -15 : ((newY > 15) ? 15 : newY);
    };
  }


  function GameState(spawnCallback){
    var _this = this;
    _this.money = 100;
    _this.health = 20;
    _this.timescale = 1;
    _this.waveSpawn = 0;
    _this.totalSpawn = 0;
    _this.waveTime = 0;
    _this.totalTime = 0;
    _this.currentWaveIndex = 0;
    _this.spawnPoint = new THREE.Vector3(0, 31);
    _this.goalPoint = new THREE.Vector3(15, 0);
    _this.towers = [{width:2,height:2,cost:40,atkStr:5,atkSpd:2,atkCooldown:0.5}];
    _this.towersPlaced = [];
    _this.shots = [];
    _this.spawnCallback = spawnCallback;
    _this.spawned = [];
    _this.spawnables = {
        "Suzanne": { health: 10, maxHealth: 10, speed: 1, bounty: 10 }
      };
    _this.waves = [
        {"exit":[">=","waveTime",1]}
      , {"spawn": "Suzanne"}
      , {"exit":["==","spawnCount",0]}
      , {"spawn": ["Suzanne","thug"]}
      , {"spawn": [[0.8,"Suzanne"],[0.2,"thug"]]}
      , {"spawn": "Suzanne", "loop": 5, "exit":[">","waveSpawn",4]}
      , {"spawn": "Suzanne", "loop": 2.5, "exit":[">","waveSpawn",4]}
      , {"spawn": "Suzanne", "loop": 1, "exit":[">","waveSpawn",4]}
      , {"spawn": "Suzanne", "loop": 0.5, "exit":[]}
      ];
    _this.currentWave = _this.waves[0];
    _this.gameMap = new Map(32, 32).SetWeight(1024,0,0,32,32).SetWeight(0, _this.goalPoint.x, _this.goalPoint.y).Settle();

    _this.coordsGameToWorld = function(v) { return new THREE.Vector3(v.x*0.5-8, 0, v.y*0.5-8); };
    _this.coordsWorldToGame = function(v) { return new THREE.Vector3(Math.floor((v.x+8)*2), Math.floor((v.y+8)*2), 0); };
    var getNumber = function(v){
      if (typeof(v) === 'number') return v;
      if (v == "spawnCount") return _this.spawned.length;
      return (_this[v] || 0);
    }


    _this.update = function(delta){
      if (!_this.currentWave) return false; // move to winning state
      if (_this.health <= 0) return false; // move to losing state
      if (delta > 0.05) delta = 0.05;
      var scaledDelta = _this.timescale * delta;
      _this.waveTime += scaledDelta;
      _this.totalTime += scaledDelta;
      if (_this.waveTime > _this.currentWave["loopTime"]) {
        _this.SpawnNew();
        _this.currentWave["loopTime"] += _this.currentWave["loop"];
      }

      _this.towersPlaced.forEach(function(tower){ tower.behavior(scaledDelta); });
      _this.shots.forEach(function(shot){ shot.behavior(scaledDelta); });
      _this.spawned.forEach(function(e){ e.behavior(scaledDelta); });

      if (_this.readyForNextWave())
        _this.nextWave();
      return true;
    };

    _this.BuyTower = function(t,x,y) {
      if (_this.money < _this.towers[t].cost) return "Insufficient funds";
      var w = _this.towers[t].width, h = _this.towers[t].height;
      if (!_this.gameMap.Available(x,y,w,h)) return "Bad placement";
      var newMap = _this.gameMap.Clone().SetWeight(Infinity,x,y,w,h).Settle();
      if (newMap.At(_this.spawnPoint.x, _this.spawnPoint.y) >= 9999) return "Would block karmic flow";
      _this.gameMap = newMap;
      _this.money -= _this.towers[t].cost;
      var tower = {mesh: _this.spawnCallback("Ninja"), behavior: TowerBehavior};
      tower.mesh.position.copy(_this.coordsGameToWorld(new THREE.Vector2(x,y)));
      for (var p in _this.towers[t]) tower[p] = _this.towers[t][p];
      _this.towersPlaced.push(tower);
      return "Tower acquired";
    };

    function TowerBehavior(delta) {
      this.atkTimer = (this.atkTimer||0) - delta;
      if (this.atkTimer <= 0) {
        var tower = this;
        var closest = _this.spawned.reduce(function(p,c){ var d = tower.mesh.position.distanceToSquared(c.mesh.position); return d < p[1] ? [c,d] : p; }, [null,Infinity]);
        if (Math.sqrt(closest[1]) < 2) {
          var shot = {mesh: _this.spawnCallback("heart"), behavior: ShotBehavior, speed: this.atkSpd, power: this.atkStr, target: closest[0]};
          shot.mesh.position.set(this.mesh.position.x, this.mesh.position.y+1, this.mesh.position.z);
          _this.shots.push(shot);
          this.atkTimer = this.atkCooldown;
        }
      }
    }

    function ShotBehavior(delta) {
      //if (!this.target.mesh.parent) destruct = true;
      this.mesh.position.add(this.target.mesh.position.clone().sub(this.mesh.position).normalize().multiplyScalar(delta * this.speed));
      if (this.mesh.position.distanceTo(this.target.mesh.position) < 0.5) {
        //console.log("hit! ToDo: create tiny particle effect or float message");
        this.target.health -= this.power;
        var thisShot = this;
        _this.shots = _this.shots.filter(function(e){ return e != thisShot; });
        this.mesh.parent.remove(this.mesh);
      }
    }

    _this.SpawnNew = function(){
      //console.log("spawn new enemy");
      _this.totalSpawn++;
      _this.waveSpawn++;
      var s = {position: _this.spawnPoint.clone(), mesh: _this.spawnCallback("Suzanne"), behavior: CreepBehavior};
      for (var i in _this.spawnables["Suzanne"]) s[i] = _this.spawnables["Suzanne"][i];
      return _this.spawned.push(s);
    };

    function CreepBehavior(delta) {
      if ((this.state || "SEEKING") == "SEEKING") {
        // find min neighbor
        this.moveStart = _this.coordsGameToWorld(this.position);
        var n = _this.gameMap.FindMinNeighbor(this.position.x, this.position.y);
        this.position.x = n.x;
        this.position.y = n.y;
        this.moveEnd = _this.coordsGameToWorld(this.position);
        this.moveAt = 0;
        if (_this.gameMap.At(n.x, n.y) == 0) { console.log("OH SNAP"); _this.health--; this.health = 0; this.bounty = 0; }
        this.state = "MOVING";
      }
      if (this.state == "MOVING") {
        this.moveAt += delta * this.speed;
        if (this.moveAt >= 1) { this.moveAt = 1; this.state = "SEEKING"; }
        this.mesh.position.copy(this.moveStart.clone().lerp(this.moveEnd, this.moveAt));
      }
      if (this.health <= 0) this.state = "DYING";
      if (this.state == "DYING") {
        _this.money += this.bounty;
        this.mesh.parent.remove(this.mesh);
        var thisCreep = this;
        _this.spawned = _this.spawned.filter(function(e){ return e != thisCreep; });
      }

      //this.mesh.lookAt(new THREE.Vector3(target.x*0.5-8, target.y*0.5-8, 0));
    }

    _this.readyForNextWave = function() {
      var exitConditions = _this.currentWave["exit"];
      if (!exitConditions) return true;
      for (var i=0; i < exitConditions.length; i++) {
        switch (exitConditions[i]) {
          case "==":
            var a = getNumber(exitConditions[++i]);
            var b = getNumber(exitConditions[++i]);
            if (a == b) return true;
            break;
          case ">":
            var a = getNumber(exitConditions[++i]);
            var b = getNumber(exitConditions[++i]);
            if (a > b) return true;
            break;
          case ">=":
            var a = getNumber(exitConditions[++i]);
            var b = getNumber(exitConditions[++i]);
            if (a >= b) return true;
            break;
          case "<":
            var a = getNumber(exitConditions[++i]);
            var b = getNumber(exitConditions[++i]);
            if (a < b) return true;
            break;
          case "<=":
            var a = getNumber(exitConditions[++i]);
            var b = getNumber(exitConditions[++i]);
            if (a <= b) return true;
            break;
        }
      }
      return false;
    };

    _this.nextWave = function(){
      _this.currentWave = _this.waves[++_this.currentWaveIndex];
      if (!_this.currentWave) return;
      _this.currentWave["loopTime"] = _this.currentWave["loop"];
      _this.waveTime = 0;
      _this.waveSpawn = 0;
      // normalize spawn data
      _this.SpawnNew();
    };


    function Map(mapWidth,mapHeight,mapData) {
      var _this = this;
      var width = mapWidth;
      var height = mapHeight;
      var map;
      if (mapData) {
        map = mapData.slice();
      } else {
        map = [];
        for (var i=0; i < width*height; i++) map[i] = Infinity;
      }
      _this.Clone = function() {
        return new Map(width, height, map);
      };
      _this.Available = function(x,y,w,h){
        w = w||1; h = h||1;
        for (var j=y; j < (y+h); j++) {
          if (j < 0 || j >= height) return false;
          for (var i=x; i < (x+w); i++) {
            if (i < 0 || i >= width) return false;
            var weight = map[j*width+i];
            if (weight === Infinity || weight === 0) return false;
          }
        }
        return true;
      };
      _this.At = function(x,y) { return map[y*width+x]; }
      _this.FindMinNeighbor = function(x,y,f){
        var min = {x:x,y:y,w:Infinity};
        for (var j=(y-1); j <= (y+1); j++) {
          if (j < 0 || j >= height) continue;
          for (var i=(x-1); i <= (x+1); i++) {
            if (i < 0 || i >= width || (x==i && y==j)) continue;
            var w = (typeof(f) === "function") ? f(map[j*width+i],i,j) : map[j*width+i];
            if (w < min.w) { min.x = i; min.y = j; min.w = w; }
          }
        }
        return min;
      };
      _this.SetWeight = function(weight,x,y,w,h){
        w = w||1; h = h||1;
        for (var j=y; j < (y+h); j++) {
          if (j < 0 || j >= height) continue;
          for (var i=x; i < (x+w); i++) {
            if (i < 0 || i >= width) continue;
            map[j*width+i] = weight;
          }
        }
        return _this;
      };
      _this.Settle = function(){
        var cells = [];
        for (var i=0; i < width*height; i++) {
          if (map[i] < Infinity) {
            if (map[i] > 0) map[i] = 9999;
            cells.push(i);
          }
        }
        while (cells.length > 0) {
          var cell = cells.shift();
          if (map[cell] == Infinity) continue;
          var neighbors = [];
          var segment = Math.floor(cell/width);
          if (segment == Math.floor((cell-1)/width)) neighbors.push(cell-1);
          if (segment == Math.floor((cell+1)/width)) neighbors.push(cell+1);
          if (cell-width >= 0) neighbors.push(cell-width);
          if (cell+width < width*height) neighbors.push(cell+width);
          var minNeighbor = neighbors.reduce(function(p,c){ return map[c] < map[p] ? c : p; });
          if (map[minNeighbor] < (map[cell]-1)) {
            map[cell] = map[minNeighbor] + 1;
            for (var i in neighbors) cells.push(neighbors[i]);
          }
        }
        return _this;
      };
      _this.toString = function(){
        var s = "";
        for (var j=0; j<height; j++) {
          for (var i=0; i<width; i++) {
            var n = map[j*width+i].toString();
            if (n == "Infinity") n = "∞";
            s += "     ".substr(0,5-n.length) + n;
          }
          s += "\n";
        }
        return s;
      };
    }
  }

}());
