var THREE = window.THREE;

if (!THREE) {
    throw new Error('The global THREE namespace is missing. Make sure three.min.js loads before module imports.');
}

export var AmbientLight = THREE.AmbientLight;
export var BackSide = THREE.BackSide;
export var BoxGeometry = THREE.BoxGeometry;
export var CanvasTexture = THREE.CanvasTexture;
export var CircleGeometry = THREE.CircleGeometry;
export var Clock = THREE.Clock;
export var Color = THREE.Color;
export var CylinderGeometry = THREE.CylinderGeometry;
export var DirectionalLight = THREE.DirectionalLight;
export var Euler = THREE.Euler;
export var Group = THREE.Group;
export var HemisphereLight = THREE.HemisphereLight;
export var LinearFilter = THREE.LinearFilter;
export var Math = THREE.Math;
export var MathUtils = THREE.MathUtils;
export var Mesh = THREE.Mesh;
export var MeshBasicMaterial = THREE.MeshBasicMaterial;
export var MeshLambertMaterial = THREE.MeshLambertMaterial;
export var MeshPhongMaterial = THREE.MeshPhongMaterial;
export var NearestFilter = THREE.NearestFilter;
export var OrthographicCamera = THREE.OrthographicCamera;
export var PCFSoftShadowShadowMap = THREE.PCFSoftShadowShadowMap;
export var PerspectiveCamera = THREE.PerspectiveCamera;
export var PlaneGeometry = THREE.PlaneGeometry;
export var Raycaster = THREE.Raycaster;
export var Scene = THREE.Scene;
export var SphereGeometry = THREE.SphereGeometry;
export var Vector2 = THREE.Vector2;
export var Vector3 = THREE.Vector3;
export var WebGLRenderer = THREE.WebGLRenderer;

export default THREE;
