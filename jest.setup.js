require("@testing-library/jest-dom");

// Mock canvas
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => ({
    fillRect: () => {},
    clearRect: () => {},
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  }),
});

// Mock Worker
global.Worker = class {
  constructor() {}
  postMessage() {}
  terminate() {}
};
