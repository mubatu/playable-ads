import * as THREE from 'three';
import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { createGame } from './Game.js';
import { loadHandTutorialScript } from './Tutorial.js';

window.THREE = THREE;

const CONFIG_PATH = 'src/config/game-config.json';
const appRoot = document.getElementById('app') || document.body;
const errorBanner = document.getElementById('error-banner');

function showError(message) {
  if (!errorBanner) {
    console.error(message);
    return;
  }
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

loadHandTutorialScript()
  .then(function () {
    return ConfigLoader.load(CONFIG_PATH);
  })
  .then(function (config) {
    createGame(config, appRoot);
  })
  .catch(function (error) {
    console.error(error);
    showError(
      (error && error.message ? error.message : 'Failed to start') +
        ' Run from a local server (e.g. npx vite) so config and assets can load.'
    );
  });
