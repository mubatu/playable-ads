import {PoolFactory} from "./PoolFactory";
import * as THREE from "three";
import {ObjectPool} from "../ObjectPool/ObjectPool";


export class ObstacleFactory extends PoolFactory{
    static createPool(initialSize = 10) {
        const createFunc = () => {
            const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
            const material = new THREE.MeshStandardMaterial({ color: 0xff4d4d });
            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.boundingBox = new THREE.Box3();
            return cube;
        };
        const resetFunc = (obj) => {
            obj.position.set(0, -100, 0);
            obj.rotation.set(0, 0, 0);
            obj.scale.set(1, 1, 1);
            obj.visible = false;
        };
        return new ObjectPool(createFunc, resetFunc, initialSize);
    }
}