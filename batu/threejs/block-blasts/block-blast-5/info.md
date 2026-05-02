#### Antigravity > Gemini 3.1 Pro (high)
- 5 saatlik kotanın %20'sini kullandı.
- Yaklaşık 15 dk sürdü.
- İlk prompt sonrası oyun çalışmadı, 2 prompt daha yazıp hataları fixletmem gerekti.

#### Kullandığı modüller:
- TextureUtils
- ConfigLoader
- SceneSetup
- Background
- ObjectPool
- HandTutorial
- UIScene: buttons

#### Promptlar:
```
Your task is to implement a playable ad under folder @playable-ads/games/block-blast-4

The gdd is there @playable-ads/games/block-blast-4/GDD.md

You must use components and UI scene modules that we created before in @playable-ads/reusables.

Use @playable-ads/games/merge-mystery game as a reference for reusable usages, folder structure, and everything.

Ignore other block blast folders. You are only responsible for @playable-ads/games/block-blast-4 
```

```
Great implementation!

Fix these:
ConfigLoader.js:1  Failed to load resource: the server responded with a status of 404 (Not Found)
TextureUtils.js:1  Failed to load resource: the server responded with a status of 404 (Not Found)
SceneSetup.js:1  Failed to load resource: the server responded with a status of 404 (Not Found)
Background.js:1  Failed to load resource: the server responded with a status of 404 (Not Found)
```

```
Fix this:
three.min.js:7 THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values. vr {isBufferGeometry: true, uuid: 'e5a359df-9a49-4007-ab72-2ba2721491d8', name: '', type: 'PlaneGeometry', index: Mi, …}
computeBoundingSphere @ three.min.js:7
intersectsObject @ three.min.js:7
Zt @ three.min.js:7
Zt @ three.min.js:7
render @ three.min.js:7
render @ SceneManager.js:30
frame @ main.js:72
startLoop @ main.js:76
createGame @ main.js:159
(anonymous) @ main.js:163
Promise.then
(anonymous) @ main.js:162
```