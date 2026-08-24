import { Silk } from './silk.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('silk-bg-container') || document.body;

  const silk = new Silk(container, {
    speed: 5,
    scale: 1,
    color: '#FF4B4B',
    noiseIntensity: 1.2,
    rotation: 0
  });

  window.silkInstance = silk;
});