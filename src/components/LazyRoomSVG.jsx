// 🚀 Lazy-loadable RoomSVG components
// Separates RoomSVG.jsx (1129 lines) into its own chunk
// Only loaded when profile tab is first opened
import { useState, useEffect, memo } from 'react';

// Module-level cache for the loaded module
let _roomSVGModule = null;
let _roomSVGPromise = null;

function loadRoomSVG() {
  if (!_roomSVGPromise) {
    _roomSVGPromise = import('./RoomSVG').then(mod => {
      _roomSVGModule = mod;
      return mod;
    });
  }
  return _roomSVGPromise;
}

// Generic wrapper that lazy-loads and renders the right component
function LazyRoomComponent({ componentName, ...props }) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!_roomSVGModule) {
      loadRoomSVG().then(() => forceRender(n => n + 1));
    }
  }, []);

  if (_roomSVGModule) {
    const Component = _roomSVGModule[componentName];
    return Component ? <Component {...props} /> : null;
  }

  // Minimal placeholder while loading (first time only)
  return <div style={{ width: props.size || 60, height: props.size || 60 }} className="bg-gray-100 rounded animate-pulse" />;
}

// Preload function - call when profile tab is about to open
export function preloadRoomSVG() {
  loadRoomSVG();
}

// Named exports matching the original RoomSVG API
export const FurnitureSVG = memo((props) => <LazyRoomComponent componentName="FurnitureSVG" {...props} />);
export const ElectronicsSVG = memo((props) => <LazyRoomComponent componentName="ElectronicsSVG" {...props} />);
export const VehicleSVG = memo((props) => <LazyRoomComponent componentName="VehicleSVG" {...props} />);
export const PetSVG = memo((props) => <LazyRoomComponent componentName="PetSVG" {...props} />);
export const DecorationSVG = memo((props) => <LazyRoomComponent componentName="DecorationSVG" {...props} />);
