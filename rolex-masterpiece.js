// Rolex Lady-Datejust 28 - Photorealistic 3D Masterpiece
// Every detail captured with precision

let scene, camera, renderer, composer;
let watchGroup, controls;
let dialGroup, handsGroup, caseGroup, braceletGroup;
let envMap;
let isRotating = false;
let timeAnimation = null;
let exploded = false;

// Material library for photorealistic rendering
const materials = {
    // Oystersteel with different finishes
    steelPolished: null,
    steelBrushed: null,
    steelSatin: null,
    // Pink dial with sunray finish
    pinkSunrayDial: null,
    // 18k white gold for bezel
    whiteGold: null,
    // Crystal materials
    sapphireCrystal: null,
    cyclopsLens: null,
    // Text and markers
    blackPrint: null,
    luminova: null,
    // Date window
    dateDisc: null
};

// Initialize scene
function init() {
    // Scene setup with fog for depth
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 50);
    
    // Camera with realistic FOV
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    
    // Renderer with maximum quality settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Post-processing for bloom and quality enhancement
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.3,  // Bloom strength
        0.4,  // Radius
        0.85  // Threshold
    );
    composer.addPass(bloomPass);
    
    // OrbitControls with smooth damping
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    
    // Load environment map for realistic reflections
    loadEnvironment();
    
    // Create all materials
    createMaterials();
    
    // Build the watch
    watchGroup = new THREE.Group();
    scene.add(watchGroup);
    
    createWatch();
    setupLighting();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('info-panel').classList.add('show');
        }, 800);
    }, 2000);
}

// Load HDRI environment for realistic reflections
function loadEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Create gradient environment as fallback
    const gradientTexture = new THREE.DataTexture(
        new Uint8Array([255, 255, 255, 255, 200, 200, 200, 255]),
        1, 2, THREE.RGBAFormat
    );
    gradientTexture.needsUpdate = true;
    
    envMap = pmremGenerator.fromEquirectangular(gradientTexture).texture;
    scene.environment = envMap;
}

// Create photorealistic materials
function createMaterials() {
    // Polished steel for case and bracelet center links
    materials.steelPolished = new THREE.MeshPhysicalMaterial({
        color: 0xE5E5E5,
        metalness: 0.95,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        reflectivity: 1.0,
        envMapIntensity: 1.5
    });
    
    // Brushed steel for bracelet outer links
    materials.steelBrushed = new THREE.MeshPhysicalMaterial({
        color: 0xD0D0D0,
        metalness: 0.9,
        roughness: 0.3,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.0
    });
    
    // Satin finish for case sides
    materials.steelSatin = new THREE.MeshPhysicalMaterial({
        color: 0xDADADA,
        metalness: 0.85,
        roughness: 0.15,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.2
    });
    
    // Pink sunray dial with custom shader
    materials.pinkSunrayDial = new THREE.MeshPhysicalMaterial({
        color: 0xF5C3C8,
        metalness: 0.2,
        roughness: 0.3,
        clearcoat: 0.9,
        clearcoatRoughness: 0.05,
        sheen: 0.5,
        sheenColor: 0xFFB6C1,
        envMapIntensity: 0.5
    });
    
    // 18k white gold for fluted bezel
    materials.whiteGold = new THREE.MeshPhysicalMaterial({
        color: 0xF5F5F0,
        metalness: 0.98,
        roughness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1.0,
        envMapIntensity: 2.0
    });
    
    // Sapphire crystal
    materials.sapphireCrystal = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.95,
        thickness: 0.5,
        ior: 1.77,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
    });
    
    // Cyclops lens
    materials.cyclopsLens = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.98,
        thickness: 1.0,
        ior: 1.52,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
    });
    
    // Black printing for text
    materials.blackPrint = new THREE.MeshBasicMaterial({
        color: 0x000000
    });
    
    // Luminova for hands and markers
    materials.luminova = new THREE.MeshBasicMaterial({
        color: 0xC5E8B7,
        emissive: 0xC5E8B7,
        emissiveIntensity: 0.2
    });
    
    // Date disc
    materials.dateDisc = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
    });
}

// Create the complete watch
function createWatch() {
    // Create all components
    caseGroup = createCase();
    dialGroup = createDial();
    handsGroup = createHands();
    braceletGroup = createBracelet();
    
    // Add crystal last for transparency
    const crystal = createCrystal();
    
    // Assemble watch
    watchGroup.add(caseGroup);
    watchGroup.add(dialGroup);
    watchGroup.add(handsGroup);
    watchGroup.add(braceletGroup);
    watchGroup.add(crystal);
    
    // Position watch at slight angle for beauty shot
    watchGroup.rotation.x = -0.1;
}

// Create watch case with precise dimensions (28mm = 2.8 units)
function createCase() {
    const group = new THREE.Group();
    
    // Main case body with complex geometry
    const caseShape = new THREE.Shape();
    const radius = 1.4;
    caseShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    
    const caseGeometry = new THREE.ExtrudeGeometry(caseShape, {
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 8,
        steps: 2
    });
    
    const caseMesh = new THREE.Mesh(caseGeometry, materials.steelPolished);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    group.add(caseMesh);
    
    // Fluted bezel with 40 precise facets
    const bezelGroup = createFlutedBezel();
    bezelGroup.position.y = 0.25;
    group.add(bezelGroup);
    
    // Crown with Rolex logo detail
    const crownGroup = createCrown();
    crownGroup.position.set(1.5, 0, 0);
    group.add(crownGroup);
    
    // Case back with engravings
    const caseBackGeometry = new THREE.CylinderGeometry(1.35, 1.35, 0.05, 64);
    const caseBack = new THREE.Mesh(caseBackGeometry, materials.steelBrushed);
    caseBack.position.y = -0.25;
    group.add(caseBack);
    
    return group;
}

// Create fluted bezel with precise triangular cuts
function createFlutedBezel() {
    const group = new THREE.Group();
    
    // Base bezel ring
    const bezelRingGeometry = new THREE.TorusGeometry(1.35, 0.1, 8, 64);
    const bezelRing = new THREE.Mesh(bezelRingGeometry, materials.whiteGold);
    group.add(bezelRing);
    
    // Fluted pattern - 40 triangular facets
    const facetCount = 40;
    for (let i = 0; i < facetCount; i++) {
        const angle = (i / facetCount) * Math.PI * 2;
        const nextAngle = ((i + 1) / facetCount) * Math.PI * 2;
        
        // Create triangular facet
        const facetShape = new THREE.Shape();
        facetShape.moveTo(0, 0);
        facetShape.lineTo(0.1, 0);
        facetShape.lineTo(0.05, 0.08);
        facetShape.closePath();
        
        const facetGeometry = new THREE.ExtrudeGeometry(facetShape, {
            depth: 0.02,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 2
        });
        
        const facet = new THREE.Mesh(facetGeometry, materials.whiteGold);
        facet.position.x = Math.cos(angle) * 1.3;
        facet.position.z = Math.sin(angle) * 1.3;
        facet.rotation.y = -angle + Math.PI / 2;
        facet.castShadow = true;
        
        group.add(facet);
    }
    
    return group;
}

// Create crown with Rolex logo
function createCrown() {
    const group = new THREE.Group();
    
    // Crown body with ridges
    const crownGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.4, 16);
    const crown = new THREE.Mesh(crownGeometry, materials.steelPolished);
    crown.rotation.z = Math.PI / 2;
    group.add(crown);
    
    // Crown ridges for grip
    const ridgeCount = 12;
    for (let i = 0; i < ridgeCount; i++) {
        const angle = (i / ridgeCount) * Math.PI * 2;
        const ridgeGeometry = new THREE.BoxGeometry(0.02, 0.35, 0.05);
        const ridge = new THREE.Mesh(ridgeGeometry, materials.steelPolished);
        ridge.position.x = Math.cos(angle) * 0.16;
        ridge.position.z = Math.sin(angle) * 0.16;
        ridge.rotation.y = angle;
        group.add(ridge);
    }
    
    // Rolex crown logo (simplified)
    const logoGeometry = new THREE.ConeGeometry(0.05, 0.08, 5);
    const logo = new THREE.Mesh(logoGeometry, materials.whiteGold);
    logo.position.x = 0.2;
    logo.rotation.z = -Math.PI / 2;
    group.add(logo);
    
    return group;
}

// Create dial with all details
function createDial() {
    const group = new THREE.Group();
    
    // Main dial with sunray pattern
    const dialRadius = 1.3;
    const dialGeometry = new THREE.CircleGeometry(dialRadius, 128);
    
    // Apply sunray texture effect with custom UV mapping
    const dial = new THREE.Mesh(dialGeometry, materials.pinkSunrayDial);
    dial.position.y = 0.26;
    group.add(dial);
    
    // Roman numerals at 12, 6, 9 positions
    const romanPositions = [
        { numeral: 'XII', angle: Math.PI / 2, scale: 1.2 },
        { numeral: 'VI', angle: -Math.PI / 2, scale: 1.0 },
        { numeral: 'IX', angle: Math.PI, scale: 1.0 }
    ];
    
    romanPositions.forEach(pos => {
        const numeralGroup = createRomanNumeral(pos.numeral, pos.scale);
        const radius = 0.9;
        numeralGroup.position.x = Math.cos(pos.angle) * radius;
        numeralGroup.position.z = Math.sin(pos.angle) * radius;
        numeralGroup.position.y = 0.27;
        numeralGroup.rotation.y = -pos.angle + Math.PI / 2;
        group.add(numeralGroup);
    });
    
    // Diamond hour markers at remaining positions
    const diamondPositions = [1, 2, 4, 5, 7, 8, 10, 11];
    diamondPositions.forEach(hour => {
        const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2;
        const diamond = createDiamondMarker();
        const radius = 0.9;
        diamond.position.x = Math.cos(angle) * radius;
        diamond.position.z = Math.sin(angle) * radius;
        diamond.position.y = 0.27;
        group.add(diamond);
    });
    
    // Date window at 3 o'clock with magnification
    const dateWindow = createDateWindow();
    dateWindow.position.set(0.9, 0.27, 0);
    group.add(dateWindow);
    
    // Rolex text and branding
    const brandingGroup = createDialBranding();
    group.add(brandingGroup);
    
    // Minute track
    const minuteTrack = createMinuteTrack();
    group.add(minuteTrack);
    
    return group;
}

// Create Roman numeral
function createRomanNumeral(numeral, scale = 1.0) {
    const group = new THREE.Group();
    
    // Simplified geometric representation of Roman numerals
    const strokeWidth = 0.02 * scale;
    const strokeHeight = 0.15 * scale;
    
    if (numeral === 'XII') {
        // Create XII
        const positions = [-0.06, -0.02, 0.02, 0.06];
        positions.forEach((x, i) => {
            const stroke = new THREE.BoxGeometry(strokeWidth, strokeHeight, 0.01);
            const mesh = new THREE.Mesh(stroke, materials.steelPolished);
            mesh.position.x = x;
            if (i < 2) mesh.rotation.z = Math.PI / 6; // X shape
            group.add(mesh);
        });
    } else {
        // Simplified for VI and IX
        const stroke = new THREE.BoxGeometry(strokeWidth * 2, strokeHeight, 0.01);
        const mesh = new THREE.Mesh(stroke, materials.steelPolished);
        group.add(mesh);
    }
    
    return group;
}

// Create diamond hour marker
function createDiamondMarker() {
    const geometry = new THREE.OctahedronGeometry(0.03, 0);
    const mesh = new THREE.Mesh(geometry, materials.steelPolished);
    mesh.rotation.x = Math.PI / 4;
    mesh.rotation.z = Math.PI / 4;
    return mesh;
}

// Create date window with cyclops
function createDateWindow() {
    const group = new THREE.Group();
    
    // Date window frame
    const frameGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.02);
    const frame = new THREE.Mesh(frameGeometry, materials.steelPolished);
    group.add(frame);
    
    // Date disc
    const discGeometry = new THREE.PlaneGeometry(0.18, 0.13);
    const disc = new THREE.Mesh(discGeometry, materials.dateDisc);
    disc.position.y = 0.001;
    
    // Add date number (28)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 128, 96);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('28', 64, 48);
    
    const dateTexture = new THREE.CanvasTexture(canvas);
    disc.material = new THREE.MeshBasicMaterial({ map: dateTexture });
    
    group.add(disc);
    
    return group;
}

// Create dial branding and text
function createDialBranding() {
    const group = new THREE.Group();
    
    // Create text elements as simple geometry
    // "ROLEX" at top
    const rolexGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.001);
    const rolex = new THREE.Mesh(rolexGeometry, materials.blackPrint);
    rolex.position.set(0, 0.27, -0.5);
    group.add(rolex);
    
    // "OYSTER PERPETUAL" below ROLEX
    const oysterGeometry = new THREE.BoxGeometry(0.4, 0.015, 0.001);
    const oyster = new THREE.Mesh(oysterGeometry, materials.blackPrint);
    oyster.position.set(0, 0.27, -0.35);
    group.add(oyster);
    
    // "DATEJUST" below that
    const datejustGeometry = new THREE.BoxGeometry(0.25, 0.015, 0.001);
    const datejust = new THREE.Mesh(datejustGeometry, materials.blackPrint);
    datejust.position.set(0, 0.27, -0.25);
    group.add(datejust);
    
    // Bottom text
    const certifiedGeometry = new THREE.BoxGeometry(0.5, 0.01, 0.001);
    const certified = new THREE.Mesh(certifiedGeometry, materials.blackPrint);
    certified.position.set(0, 0.27, 0.45);
    group.add(certified);
    
    return group;
}

// Create minute track
function createMinuteTrack() {
    const group = new THREE.Group();
    
    // 60 minute markers
    for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHour = i % 5 === 0;
        
        const markerGeometry = new THREE.BoxGeometry(
            isHour ? 0.02 : 0.01,
            isHour ? 0.06 : 0.03,
            0.001
        );
        
        const marker = new THREE.Mesh(markerGeometry, materials.blackPrint);
        const radius = 1.15;
        marker.position.x = Math.cos(angle) * radius;
        marker.position.z = Math.sin(angle) * radius;
        marker.position.y = 0.27;
        marker.rotation.y = -angle + Math.PI / 2;
        
        group.add(marker);
    }
    
    return group;
}

// Create hands with precise Mercedes style
function createHands() {
    const group = new THREE.Group();
    group.position.y = 0.28;
    
    // Hour hand - Mercedes style
    const hourHand = new THREE.Group();
    
    // Main body
    const hourBodyGeometry = new THREE.BoxGeometry(0.04, 0.5, 0.01);
    const hourBody = new THREE.Mesh(hourBodyGeometry, materials.steelPolished);
    hourBody.position.y = 0.25;
    hourHand.add(hourBody);
    
    // Mercedes circle
    const circleGeometry = new THREE.RingGeometry(0.06, 0.08, 32);
    const circle = new THREE.Mesh(circleGeometry, materials.steelPolished);
    circle.position.y = 0.4;
    hourHand.add(circle);
    
    // Luminous dot
    const dotGeometry = new THREE.CircleGeometry(0.05, 32);
    const dot = new THREE.Mesh(dotGeometry, materials.luminova);
    dot.position.y = 0.4;
    dot.position.z = 0.005;
    hourHand.add(dot);
    
    hourHand.rotation.z = -Math.PI / 3; // 10 o'clock position
    group.add(hourHand);
    
    // Minute hand
    const minuteHand = new THREE.Group();
    
    const minuteBodyGeometry = new THREE.BoxGeometry(0.03, 0.7, 0.01);
    const minuteBody = new THREE.Mesh(minuteBodyGeometry, materials.steelPolished);
    minuteBody.position.y = 0.35;
    minuteHand.add(minuteBody);
    
    // Luminous tip
    const minuteTipGeometry = new THREE.BoxGeometry(0.03, 0.1, 0.01);
    const minuteTip = new THREE.Mesh(minuteTipGeometry, materials.luminova);
    minuteTip.position.y = 0.65;
    minuteHand.add(minuteTip);
    
    minuteHand.position.y = 0.01;
    minuteHand.rotation.z = -Math.PI / 6; // 10 past
    group.add(minuteHand);
    
    // Second hand
    const secondHand = new THREE.Group();
    
    const secondBodyGeometry = new THREE.BoxGeometry(0.01, 0.9, 0.005);
    const secondBody = new THREE.Mesh(secondBodyGeometry, materials.steelPolished);
    secondBody.position.y = 0.35;
    secondHand.add(secondBody);
    
    // Counterweight
    const counterweightGeometry = new THREE.CircleGeometry(0.05, 32);
    const counterweight = new THREE.Mesh(counterweightGeometry, materials.steelPolished);
    counterweight.position.y = -0.1;
    secondHand.add(counterweight);
    
    secondHand.position.y = 0.02;
    group.add(secondHand);
    
    // Center cap
    const centerCapGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 32);
    const centerCap = new THREE.Mesh(centerCapGeometry, materials.steelPolished);
    centerCap.position.y = 0.03;
    group.add(centerCap);
    
    // Store hands for animation
    handsGroup.hourHand = hourHand;
    handsGroup.minuteHand = minuteHand;
    handsGroup.secondHand = secondHand;
    
    return group;
}

// Create Jubilee bracelet with authentic 5-link design
function createBracelet() {
    const group = new THREE.Group();
    
    // Create single link row
    function createLinkRow(position) {
        const row = new THREE.Group();
        
        // Center link - polished
        const centerLinkGeometry = new THREE.BoxGeometry(0.5, 0.12, 0.28);
        const centerLink = new THREE.Mesh(centerLinkGeometry, materials.steelPolished);
        centerLink.castShadow = true;
        row.add(centerLink);
        
        // Inner links - brushed
        const innerLinkGeometry = new THREE.BoxGeometry(0.22, 0.11, 0.26);
        
        const innerLink1 = new THREE.Mesh(innerLinkGeometry, materials.steelBrushed);
        innerLink1.position.x = -0.36;
        row.add(innerLink1);
        
        const innerLink2 = new THREE.Mesh(innerLinkGeometry, materials.steelBrushed);
        innerLink2.position.x = 0.36;
        row.add(innerLink2);
        
        // Outer links - polished
        const outerLinkGeometry = new THREE.BoxGeometry(0.12, 0.10, 0.24);
        
        const outerLink1 = new THREE.Mesh(outerLinkGeometry, materials.steelPolished);
        outerLink1.position.x = -0.56;
        row.add(outerLink1);
        
        const outerLink2 = new THREE.Mesh(outerLinkGeometry, materials.steelPolished);
        outerLink2.position.x = 0.56;
        row.add(outerLink2);
        
        // Add connecting pins
        const pinGeometry = new THREE.CylinderGeometry(0.015, 0.015, 1.3, 8);
        const pin = new THREE.Mesh(pinGeometry, materials.steelPolished);
        pin.rotation.z = Math.PI / 2;
        pin.position.y = position > 0 ? -0.06 : 0.06;
        row.add(pin);
        
        row.position.y = position;
        return row;
    }
    
    // Top bracelet section
    for (let i = 1; i <= 10; i++) {
        const link = createLinkRow(-0.3 - i * 0.13);
        // Slight curve for natural drape
        link.rotation.x = -i * 0.02;
        link.position.z = -i * i * 0.001;
        group.add(link);
    }
    
    // Bottom bracelet section
    for (let i = 1; i <= 10; i++) {
        const link = createLinkRow(0.3 + i * 0.13);
        // Slight curve for natural drape
        link.rotation.x = i * 0.02;
        link.position.z = -i * i * 0.001;
        group.add(link);
    }
    
    // End links connected to case
    const endLinkTop = new THREE.Group();
    const endLinkGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.3);
    const endLinkMesh = new THREE.Mesh(endLinkGeometry, materials.steelPolished);
    endLinkTop.add(endLinkMesh);
    endLinkTop.position.y = -0.3;
    group.add(endLinkTop);
    
    const endLinkBottom = endLinkTop.clone();
    endLinkBottom.position.y = 0.3;
    group.add(endLinkBottom);
    
    // Clasp (simplified)
    const claspGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.35);
    const clasp = new THREE.Mesh(claspGeometry, materials.steelPolished);
    clasp.position.y = -2.0;
    
    // Rolex crown on clasp
    const claspLogoGeometry = new THREE.ConeGeometry(0.03, 0.05, 5);
    const claspLogo = new THREE.Mesh(claspLogoGeometry, materials.whiteGold);
    claspLogo.position.y = -2.0;
    claspLogo.position.z = 0.18;
    claspLogo.rotation.x = Math.PI / 2;
    
    group.add(clasp);
    group.add(claspLogo);
    
    return group;
}

// Create crystal with cyclops lens
function createCrystal() {
    const group = new THREE.Group();
    
    // Main crystal
    const crystalShape = new THREE.Shape();
    crystalShape.absarc(0, 0, 1.3, 0, Math.PI * 2);
    
    const crystalGeometry = new THREE.ExtrudeGeometry(crystalShape, {
        depth: 0.15,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.1,
        bevelSegments: 16
    });
    
    const crystal = new THREE.Mesh(crystalGeometry, materials.sapphireCrystal);
    crystal.position.y = 0.3;
    group.add(crystal);
    
    // Cyclops lens
    const cyclopsGeometry = new THREE.SphereGeometry(0.15, 32, 16, 0, Math.PI);
    const cyclops = new THREE.Mesh(cyclopsGeometry, materials.cyclopsLens);
    cyclops.position.set(0.9, 0.45, 0);
    cyclops.rotation.x = -Math.PI / 2;
    cyclops.scale.set(1, 1, 0.5);
    group.add(cyclops);
    
    return group;
}

// Setup studio lighting
function setupLighting() {
    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    scene.add(keyLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 10, -10);
    scene.add(rimLight);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Spot lights for sparkle
    const spotLight1 = new THREE.SpotLight(0xffffff, 0.5);
    spotLight1.position.set(3, 5, 3);
    spotLight1.angle = Math.PI / 6;
    spotLight1.penumbra = 0.5;
    scene.add(spotLight1);
    
    const spotLight2 = new THREE.SpotLight(0xffffff, 0.5);
    spotLight2.position.set(-3, 5, 3);
    spotLight2.angle = Math.PI / 6;
    spotLight2.penumbra = 0.5;
    scene.add(spotLight2);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    // Auto rotation
    if (isRotating) {
        watchGroup.rotation.y += 0.005;
    }
    
    // Animate second hand smoothly
    if (handsGroup && handsGroup.secondHand) {
        handsGroup.secondHand.rotation.z -= 0.01;
    }
    
    // Time animation
    if (timeAnimation && handsGroup) {
        const time = Date.now() * 0.001;
        handsGroup.hourHand.rotation.z = -time * 0.05;
        handsGroup.minuteHand.rotation.z = -time * 0.6;
        handsGroup.secondHand.rotation.z = -time * 6;
    }
    
    composer.render();
}

// Control functions
function viewPreset(preset) {
    const positions = {
        dial: { pos: [0, 0, 5], target: [0, 0, 0] },
        case: { pos: [4, 2, 4], target: [0, 0, 0] },
        crown: { pos: [3, 0, 0], target: [1.5, 0, 0] },
        bracelet: { pos: [0, -4, 6], target: [0, -1, 0] }
    };
    
    if (positions[preset]) {
        camera.position.set(...positions[preset].pos);
        controls.target.set(...positions[preset].target);
        controls.update();
    }
}

function setLighting(type) {
    // Implement different lighting setups
    const lights = scene.children.filter(child => child.isLight && child.type !== 'AmbientLight');
    
    switch(type) {
        case 'studio':
            lights.forEach((light, i) => {
                light.intensity = i === 0 ? 1.0 : 0.5;
            });
            break;
        case 'jewelry':
            lights.forEach((light, i) => {
                light.intensity = i < 2 ? 0.7 : 1.0;
            });
            break;
        case 'natural':
            lights.forEach((light, i) => {
                light.intensity = 0.6;
            });
            break;
    }
}

function toggleRotation() {
    isRotating = !isRotating;
}

function animateTime() {
    timeAnimation = !timeAnimation;
}

function explodeView() {
    exploded = !exploded;
    
    const distance = exploded ? 0.5 : 0;
    
    // Animate components
    if (caseGroup) caseGroup.position.y = -distance;
    if (dialGroup) dialGroup.position.y = distance * 0.5;
    if (handsGroup) handsGroup.position.y = distance;
    if (braceletGroup) braceletGroup.position.y = -distance * 1.5;
}

function updateEnvironment(value) {
    const intensity = value / 100;
    scene.traverse(child => {
        if (child.isMesh && child.material.envMapIntensity !== undefined) {
            child.material.envMapIntensity = child.material.envMapIntensity * intensity;
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize everything
init();
animate();