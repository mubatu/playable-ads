import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

console.log('🚀 Starting Playable Ad Pipeline...\n');

const assetsDir = path.join(process.cwd(), 'src', 'assets');
const rawModelPath = path.join(assetsDir, 'raw_model.glb');
const tinyModelPath = path.join(assetsDir, 'model_tiny.glb');
const finalModelPath = path.join(assetsDir, 'model_draco.glb');
const distPath = path.join(process.cwd(), 'dist');

try {
    if (!fs.existsSync(rawModelPath)) {
        console.error(`❌ Error: "raw_model.glb" not found in src/assets/`);
        process.exit(1);
    }

    console.log('📦 STEP 1: Resizing textures to 512x512...');
    execSync(`npx @gltf-transform/cli resize "${rawModelPath}" "${tinyModelPath}" --width 512 --height 512`, { stdio: 'inherit' });

    console.log('\n🗜️ STEP 2: Applying Draco compression...');
    execSync(`npx gltf-pipeline -i "${tinyModelPath}" -o "${finalModelPath}" -d`, { stdio: 'inherit' });

    if (fs.existsSync(tinyModelPath)) fs.unlinkSync(tinyModelPath);

    console.log('\n🏗️ STEP 3: Building Single-File MRAID HTML...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('\n🤐 STEP 4: Zipping the final output...');
    const htmlFile = path.join(distPath, 'index.html');
    const zipFile = path.join(distPath, 'playable-ad.zip');

    if (fs.existsSync(htmlFile)) {
        const zip = new AdmZip();
        zip.addLocalFile(htmlFile);
        zip.writeZip(zipFile);
    } else {
        throw new Error("dist/index.html not found!");
    }

    console.log('\n🎉 DONE! "dist/playable-ad.zip" is ready for ad networks (Under 5MB).');
} catch (error) {
    console.error('\n❌ Pipeline failed:', error.message);
    process.exit(1);
}