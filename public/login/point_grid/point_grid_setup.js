import { DotField } from './point_grid.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dot-field-wrapper');

  const dotField = new DotField(container, {
    dotRadius: 1.5,
    dotSpacing: 12,
    bulgeStrength: 67,
    glowRadius: 0,
    sparkle: false,
    waveAmplitude: 0,
    cursorRadius: 300,
    cursorForce: 0.1,
    bulgeOnly: true,
    gradientFrom: '#8c8c8c',
    gradientTo: '#ffffff',
    glowColor: ''
  });

  window.dotFieldInstance = dotField;
});