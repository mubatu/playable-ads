var THREE = window.THREE;

if (!THREE) {
    throw new Error('The global THREE namespace is missing. Make sure three.min.js loads before module imports.');
}

export var AmbientLight = THREE.AmbientLight;
export var BoxGeometry = THREE.BoxGeometry;
export var CanvasTexture = THREE.CanvasTexture;
export var CircleGeometry = THREE.CircleGeometry;
export var Clock = THREE.Clock;
export var Color = THREE.Color;
export var ConeGeometry = THREE.ConeGeometry;
export var CylinderGeometry = THREE.CylinderGeometry;
export var DirectionalLight = THREE.DirectionalLight;
export var DoubleSide = THREE.DoubleSide;
export var Fog = THREE.Fog;
export var Group = THREE.Group;
export var HemisphereLight = THREE.HemisphereLight;
export var LinearFilter = THREE.LinearFilter;
export var MathUtils = THREE.MathUtils;
export var Mesh = THREE.Mesh;
export var MeshBasicMaterial = THREE.MeshBasicMaterial;
export var MeshLambertMaterial = THREE.MeshLambertMaterial;
export var MeshStandardMaterial = THREE.MeshStandardMaterial;
export var PCFSoftShadowMap = THREE.PCFSoftShadowMap;
export var PerspectiveCamera = THREE.PerspectiveCamera;
export var PlaneGeometry = THREE.PlaneGeometry;
export var RingGeometry = THREE.RingGeometry;
export var Raycaster = THREE.Raycaster;
export var Scene = THREE.Scene;
export var SphereGeometry = THREE.SphereGeometry;
export var SRGBColorSpace = THREE.SRGBColorSpace;
export var sRGBEncoding = THREE.sRGBEncoding;
export var TextureLoader = THREE.TextureLoader;
export var Vector2 = THREE.Vector2;
export var Vector3 = THREE.Vector3;
export var WebGLRenderer = THREE.WebGLRenderer;

export default THREE;
