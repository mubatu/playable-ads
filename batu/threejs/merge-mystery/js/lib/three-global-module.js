const THREE = window.THREE;

if (!THREE) {
    throw new Error('The global THREE namespace is missing. Make sure three.min.js loads before module imports.');
}

export const AmbientLight = THREE.AmbientLight;
export const Box3 = THREE.Box3;
export const BoxGeometry = THREE.BoxGeometry;
export const Clock = THREE.Clock;
export const Color = THREE.Color;
export const DirectionalLight = THREE.DirectionalLight;
export const Group = THREE.Group;
export const LinearFilter = THREE.LinearFilter;
export const Mesh = THREE.Mesh;
export const MeshBasicMaterial = THREE.MeshBasicMaterial;
export const MeshStandardMaterial = THREE.MeshStandardMaterial;
export const OrthographicCamera = THREE.OrthographicCamera;
export const Plane = THREE.Plane;
export const PlaneGeometry = THREE.PlaneGeometry;
export const PointLight = THREE.PointLight;
export const Raycaster = THREE.Raycaster;
export const Scene = THREE.Scene;
export const SphereGeometry = THREE.SphereGeometry;
export const SRGBColorSpace = THREE.SRGBColorSpace;
export const sRGBEncoding = THREE.sRGBEncoding;
export const TextureLoader = THREE.TextureLoader;
export const Vector2 = THREE.Vector2;
export const Vector3 = THREE.Vector3;
export const WebGLRenderer = THREE.WebGLRenderer;

export default THREE;
