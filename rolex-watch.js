// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.5);
spotLight.position.set(-5, 10, -5);
scene.add(spotLight);

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 10;

// Watch group
const watchGroup = new THREE.Group();
scene.add(watchGroup);

// Materials
const steelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd4d4d4,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
});

const pinkDialMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffc0cb,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 0.8,
});

const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.2,
});

// Watch case
function createWatchCase() {
    const caseGroup = new THREE.Group();
    
    // Main case body
    const caseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 64);
    const caseMesh = new THREE.Mesh(caseGeometry, steelMaterial);
    caseMesh.castShadow = true;
    caseGroup.add(caseMesh);
    
    // Fluted bezel
    const bezelGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const ridgeGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.3);
        const ridge = new THREE.Mesh(ridgeGeometry, steelMaterial);
        ridge.position.x = Math.cos(angle) * 1.15;
        ridge.position.z = Math.sin(angle) * 1.15;
        ridge.position.y = 0.2;
        ridge.rotation.y = angle;
        bezelGroup.add(ridge);
    }
    caseGroup.add(bezelGroup);
    
    // Crown
    const crownGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
    const crown = new THREE.Mesh(crownGeometry, goldMaterial);
    crown.position.x = 1.3;
    crown.rotation.z = Math.PI / 2;
    caseGroup.add(crown);
    
    return caseGroup;
}

// Watch dial
function createDial() {
    const dialGroup = new THREE.Group();
    
    // Dial face
    const dialGeometry = new THREE.CircleGeometry(1.1, 64);
    const dial = new THREE.Mesh(dialGeometry, pinkDialMaterial);
    dial.position.y = 0.21;
    dialGroup.add(dial);
    
    // Roman numerals
    const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    const loader = new THREE.FontLoader();
    
    // Hour markers (simplified as geometric shapes)
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const markerGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.2);
        const marker = new THREE.Mesh(markerGeometry, steelMaterial);
        marker.position.x = Math.cos(angle) * 0.85;
        marker.position.z = Math.sin(angle) * 0.85;
        marker.position.y = 0.22;
        marker.rotation.y = -angle + Math.PI / 2;
        dialGroup.add(marker);
    }
    
    // Date window
    const dateWindowGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.2);
    const dateWindow = new THREE.Mesh(dateWindowGeometry, new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.1,
    }));
    dateWindow.position.x = 0.85;
    dateWindow.position.y = 0.22;
    dialGroup.add(dateWindow);
    
    // Hands
    const hourHandGeometry = new THREE.BoxGeometry(0.03, 0.01, 0.6);
    const hourHand = new THREE.Mesh(hourHandGeometry, steelMaterial);
    hourHand.position.y = 0.23;
    hourHand.rotation.y = Math.PI / 4;
    dialGroup.add(hourHand);
    
    const minuteHandGeometry = new THREE.BoxGeometry(0.02, 0.01, 0.8);
    const minuteHand = new THREE.Mesh(minuteHandGeometry, steelMaterial);
    minuteHand.position.y = 0.24;
    minuteHand.rotation.y = -Math.PI / 6;
    dialGroup.add(minuteHand);
    
    const secondHandGeometry = new THREE.BoxGeometry(0.01, 0.01, 0.9);
    const secondHand = new THREE.Mesh(secondHandGeometry, new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        metalness: 0.5,
        roughness: 0.3,
    }));
    secondHand.position.y = 0.25;
    dialGroup.add(secondHand);
    
    // Center cap
    const centerCapGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16);
    const centerCap = new THREE.Mesh(centerCapGeometry, steelMaterial);
    centerCap.position.y = 0.25;
    dialGroup.add(centerCap);
    
    return dialGroup;
}

// Jubilee bracelet
function createBracelet() {
    const braceletGroup = new THREE.Group();
    
    // Create bracelet links
    function createLink(width, height) {
        const linkGeometry = new THREE.BoxGeometry(width, 0.1, height);
        return new THREE.Mesh(linkGeometry, steelMaterial);
    }
    
    // Top bracelet
    for (let i = 0; i < 8; i++) {
        const linkRow = new THREE.Group();
        
        // Five-link pattern (jubilee style)
        const centerLink = createLink(0.4, 0.3);
        centerLink.position.y = -0.3 - i * 0.32;
        linkRow.add(centerLink);
        
        const innerLink1 = createLink(0.2, 0.28);
        innerLink1.position.x = -0.3;
        innerLink1.position.y = -0.3 - i * 0.32;
        linkRow.add(innerLink1);
        
        const innerLink2 = createLink(0.2, 0.28);
        innerLink2.position.x = 0.3;
        innerLink2.position.y = -0.3 - i * 0.32;
        linkRow.add(innerLink2);
        
        const outerLink1 = createLink(0.15, 0.26);
        outerLink1.position.x = -0.5;
        outerLink1.position.y = -0.3 - i * 0.32;
        linkRow.add(outerLink1);
        
        const outerLink2 = createLink(0.15, 0.26);
        outerLink2.position.x = 0.5;
        outerLink2.position.y = -0.3 - i * 0.32;
        linkRow.add(outerLink2);
        
        braceletGroup.add(linkRow);
    }
    
    // Bottom bracelet
    for (let i = 0; i < 8; i++) {
        const linkRow = new THREE.Group();
        
        const centerLink = createLink(0.4, 0.3);
        centerLink.position.y = 0.3 + i * 0.32;
        linkRow.add(centerLink);
        
        const innerLink1 = createLink(0.2, 0.28);
        innerLink1.position.x = -0.3;
        innerLink1.position.y = 0.3 + i * 0.32;
        linkRow.add(innerLink1);
        
        const innerLink2 = createLink(0.2, 0.28);
        innerLink2.position.x = 0.3;
        innerLink2.position.y = 0.3 + i * 0.32;
        linkRow.add(innerLink2);
        
        const outerLink1 = createLink(0.15, 0.26);
        outerLink1.position.x = -0.5;
        outerLink1.position.y = 0.3 + i * 0.32;
        linkRow.add(outerLink1);
        
        const outerLink2 = createLink(0.15, 0.26);
        outerLink2.position.x = 0.5;
        outerLink2.position.y = 0.3 + i * 0.32;
        linkRow.add(outerLink2);
        
        braceletGroup.add(linkRow);
    }
    
    return braceletGroup;
}

// Assemble watch
const watchCase = createWatchCase();
const dial = createDial();
const bracelet = createBracelet();

watchGroup.add(watchCase);
watchGroup.add(dial);
watchGroup.add(bracelet);

// Animation functions
let rotationAnimation = null;

function rotateWatch() {
    if (rotationAnimation) {
        cancelAnimationFrame(rotationAnimation);
        rotationAnimation = null;
    } else {
        function rotate() {
            watchGroup.rotation.y += 0.01;
            rotationAnimation = requestAnimationFrame(rotate);
        }
        rotate();
    }
}

function focusOnDial() {
    camera.position.set(0, 0, 3);
    controls.target.set(0, 0, 0);
    controls.update();
}

function focusOnBracelet() {
    camera.position.set(0, -3, 3);
    controls.target.set(0, -1, 0);
    controls.update();
}

function resetView() {
    camera.position.set(0, 0, 5);
    controls.target.set(0, 0, 0);
    watchGroup.rotation.set(0, 0, 0);
    if (rotationAnimation) {
        cancelAnimationFrame(rotationAnimation);
        rotationAnimation = null;
    }
    controls.update();
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Animate second hand
    const secondHand = dial.children.find(child => child.material.color && child.material.color.r === 1);
    if (secondHand) {
        secondHand.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});