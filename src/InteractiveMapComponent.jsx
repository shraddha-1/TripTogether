import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const InteractiveMapComponent = ({ 
  startPoint, 
  destination, 
  customPins, 
  onAddPin, 
  currentUser, 
  onUpdatePin,
}) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [pinData, setPinData] = useState({ lat: null, lng: null, name: '', description: '', address: '', x: null, y: null });
  const [showPinModal, setShowPinModal] = useState(false);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredRoutePin, setHoveredRoutePin] = useState(null);
  const [draggingPinIndex, setDraggingPinIndex] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getRoutePositions = () => {
    if (!canvasSize.width || !canvasSize.height) return { startX: 0, startY: 0, endX: 0, endY: 0 };
    
    const startX = canvasSize.width * 0.15;
    const startY = canvasSize.height * 0.3;
    const endX = canvasSize.width * 0.85;
    const endY = canvasSize.height * 0.7;

    return { startX, startY, endX, endY };
  };

  const getDisplayPins = () => {
    if (!customPins || !customPins.length || !canvasSize.width || !canvasSize.height) return [];

    const { startX, startY, endX, endY } = getRoutePositions();
    const totalPins = customPins.length;
    
    return customPins.map((pin, idx) => {
      // If pin has x,y coordinates, use them (from dragging)
      if (pin.x !== undefined && pin.y !== undefined) {
        return { ...pin };
      }
      
      // Calculate position along route based on order
      const progress = (idx + 1) / (totalPins + 1);
      const x = startX + (endX - startX) * progress;
      const curveOffset = Math.sin(progress * Math.PI) * 80;
      const y = startY + (endY - startY) * progress + curveOffset;

      return { ...pin, x, y };
    });
  };

  const displayPins = getDisplayPins();

  const drawSmoothRoute = (ctx, startX, startY, endX, endY, pins) => {
    if (pins.length === 0) return;
    
    if (pins.length === 1) {
      const midX1 = (startX + pins[0].x) / 2;
      const midY1 = (startY + pins[0].y) / 2;
      ctx.quadraticCurveTo(midX1, midY1 - 30, pins[0].x, pins[0].y);
      
      const midX2 = (pins[0].x + endX) / 2;
      const midY2 = (pins[0].y + endY) / 2;
      ctx.quadraticCurveTo(midX2, midY2 + 30, endX, endY);
    } else {
      for (let i = 0; i <= pins.length; i++) {
        const prevX = i === 0 ? startX : pins[i - 1].x;
        const prevY = i === 0 ? startY : pins[i - 1].y;
        const currX = i === pins.length ? endX : pins[i].x;
        const currY = i === pins.length ? endY : pins[i].y;
        
        const midX = (prevX + currX) / 2;
        const midY = (prevY + currY) / 2;
        const offset = i % 2 === 0 ? -20 : 20;
        
        ctx.quadraticCurveTo(midX, midY + offset, currX, currY);
      }
    }
  };
// const drawMap = () => {
//   const canvas = canvasRef.current;
//   if (!canvas || !canvasSize.width || !canvasSize.height) return;

//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Clean white background
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Subtle geometric pattern
//   ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
//   ctx.lineWidth = 1;
//   for (let i = -canvas.height; i < canvas.width; i += 40) {
//     ctx.beginPath();
//     ctx.moveTo(i, 0);
//     ctx.lineTo(i + canvas.height, canvas.height);
//     ctx.stroke();
//   }

//   const { startX, startY, endX, endY } = getRoutePositions();

//   // Ultra-clean route
//   if (displayPins.length > 0) {
//     // Subtle shadow
//     ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
//     ctx.lineWidth = 8;
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
//     ctx.beginPath();
//     ctx.moveTo(startX, startY + 2);
//     drawSmoothRoute(ctx, startX, startY + 2, endX, endY + 2, displayPins.map(p => ({...p, y: p.y + 2})));
//     ctx.stroke();

//     // Main route - single color
//     ctx.strokeStyle = '#000000';
//     ctx.lineWidth = 3;
//     ctx.beginPath();
//     ctx.moveTo(startX, startY);
//     drawSmoothRoute(ctx, startX, startY, endX, endY, displayPins);
//     ctx.stroke();
//   }

//   // Minimalist start marker - just a circle
//   ctx.fillStyle = '#000000';
//   ctx.beginPath();
//   ctx.arc(startX, startY, 12, 0, Math.PI * 2);
//   ctx.fill();
  
//   ctx.fillStyle = '#ffffff';
//   ctx.beginPath();
//   ctx.arc(startX, startY, 4, 0, Math.PI * 2);
//   ctx.fill();

//   // Minimalist end marker
//   ctx.fillStyle = '#000000';
//   ctx.beginPath();
//   ctx.arc(endX, endY, 12, 0, Math.PI * 2);
//   ctx.fill();
  
//   ctx.fillStyle = '#ffffff';
//   ctx.beginPath();
//   ctx.arc(endX, endY, 4, 0, Math.PI * 2);
//   ctx.fill();

//   // Clean pins
//   displayPins.forEach((pin, idx) => {
//     const isHovered = hoveredRoutePin === idx;
//     const isDraggingThis = draggingPinIndex === idx;
//     const size = isHovered || isDraggingThis ? 14 : 11;
    
//     ctx.fillStyle = isHovered || isDraggingThis ? '#666666' : '#000000';
//     ctx.beginPath();
//     ctx.arc(pin.x, pin.y, size, 0, Math.PI * 2);
//     ctx.fill();
    
//     ctx.fillStyle = '#ffffff';
//     ctx.font = `bold ${size}px Inter, Arial, sans-serif`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(idx + 1, pin.x, pin.y);
//   });

//   // Clean typography
//   ctx.fillStyle = '#000000';
//   ctx.font = '600 16px Inter, Arial, sans-serif';
//   ctx.textAlign = 'left';
//   const startCity = startPoint ? startPoint.split(',')[0].trim().toUpperCase() : 'START';
//   ctx.fillText(startCity, startX - 20, startY + 30);

//   ctx.textAlign = 'right';
//   const endCity = destination ? destination.split(',')[0].trim().toUpperCase() : 'END';
//   ctx.fillText(endCity, endX + 20, endY - 30);
// };

const drawMap = () => {
  const canvas = canvasRef.current;
  if (!canvas || !canvasSize.width || !canvasSize.height) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dark gradient background
  const bgGradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width
  );
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(0.5, '#16213e');
  bgGradient.addColorStop(1, '#0f1419');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glowing grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
  ctx.shadowBlur = 3;
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i += 80) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  const { startX, startY, endX, endY } = getRoutePositions();

  // Draw route with neon glow
  if (displayPins.length > 0) {
    // Outer glow
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
    ctx.lineWidth = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    drawSmoothRoute(ctx, startX, startY, endX, endY, displayPins);
    ctx.stroke();

    // Main neon route
    const routeGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    routeGradient.addColorStop(0, '#00f5ff');
    routeGradient.addColorStop(0.5, '#ff00ff');
    routeGradient.addColorStop(1, '#ffff00');
    
    ctx.strokeStyle = routeGradient;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    drawSmoothRoute(ctx, startX, startY, endX, endY, displayPins);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Neon start marker
  ctx.save();
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#00f5ff';
  ctx.beginPath();
  ctx.arc(startX, startY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(startX, startY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#00f5ff';
  ctx.beginPath();
  ctx.arc(startX, startY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Neon end marker
  ctx.save();
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(endX, endY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(endX, endY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(endX, endY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Glowing pins
  displayPins.forEach((pin, idx) => {
    const isHovered = hoveredRoutePin === idx;
    const isDraggingThis = draggingPinIndex === idx;
    const size = isHovered || isDraggingThis ? 18 : 15;
    
    ctx.save();
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = isHovered || isDraggingThis ? 25 : 15;
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(pin.x, pin.y, size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(pin.x, pin.y, size - 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(idx + 1, pin.x, pin.y);
    ctx.restore();
  });

  // Glowing text labels
  ctx.save();
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.textAlign = 'left';
  const startCity = startPoint ? startPoint.split(',')[0].trim() : 'Start';
  ctx.fillText(startCity, startX - 20, startY + 40);

  ctx.shadowColor = '#ffff00';
  ctx.fillStyle = '#ffff00';
  ctx.textAlign = 'right';
  const endCity = destination ? destination.split(',')[0].trim() : 'End';
  ctx.fillText(endCity, endX + 20, endY - 40);
  ctx.restore();
};

// const drawMap = () => {
//   const canvas = canvasRef.current;
//   if (!canvas || !canvasSize.width || !canvasSize.height) return;

//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Background: aged parchment with gradient
//   const bgGradient = ctx.createRadialGradient(
//     canvas.width / 2, canvas.height / 2, 0,
//     canvas.width / 2, canvas.height / 2, canvas.width * 0.7
//   );
//   bgGradient.addColorStop(0, '#faf6ed');
//   bgGradient.addColorStop(0.7, '#f4ecd8');
//   bgGradient.addColorStop(1, '#e8dcc0');
//   ctx.fillStyle = bgGradient;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Add paper texture spots
//   ctx.fillStyle = 'rgba(139, 94, 60, 0.03)';
//   for (let i = 0; i < 150; i++) {
//     const x = Math.random() * canvas.width;
//     const y = Math.random() * canvas.height;
//     const size = Math.random() * 3;
//     ctx.fillRect(x, y, size, size);
//   }

//   // Decorative ornate border
//   ctx.strokeStyle = '#a08560';
//   ctx.lineWidth = 8;
//   ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
  
//   ctx.strokeStyle = '#c2b280';
//   ctx.lineWidth = 3;
//   ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

//   // Corner decorations
//   const drawCornerDecor = (x, y, rotation) => {
//     ctx.save();
//     ctx.translate(x, y);
//     ctx.rotate(rotation);
//     ctx.strokeStyle = '#8b5e3c';
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(0, 0);
//     ctx.lineTo(15, 0);
//     ctx.moveTo(0, 0);
//     ctx.lineTo(0, 15);
//     ctx.moveTo(15, 0);
//     ctx.quadraticCurveTo(5, 5, 0, 15);
//     ctx.stroke();
//     ctx.restore();
//   };
  
//   drawCornerDecor(30, 30, 0);
//   drawCornerDecor(canvas.width - 30, 30, Math.PI / 2);
//   drawCornerDecor(canvas.width - 30, canvas.height - 30, Math.PI);
//   drawCornerDecor(30, canvas.height - 30, -Math.PI / 2);

//   // Subtle grid: explorer navigation lines
//   ctx.strokeStyle = 'rgba(194, 178, 128, 0.2)';
//   ctx.lineWidth = 1;
//   ctx.setLineDash([8, 12]);
//   for (let i = 50; i < canvas.width; i += 80) {
//     ctx.beginPath();
//     ctx.moveTo(i, 30);
//     ctx.lineTo(i, canvas.height - 30);
//     ctx.stroke();
//   }
//   for (let i = 50; i < canvas.height; i += 80) {
//     ctx.beginPath();
//     ctx.moveTo(30, i);
//     ctx.lineTo(canvas.width - 30, i);
//     ctx.stroke();
//   }
//   ctx.setLineDash([]);

//   const { startX, startY, endX, endY } = getRoutePositions();

//   // Route: layered path with shadow
//   if (displayPins.length > 0) {
//     // Shadow layer
//     ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
//     ctx.lineWidth = 6;
//     ctx.lineCap = 'round';
//     ctx.beginPath();
//     ctx.moveTo(startX + 2, startY + 2);
//     drawSmoothRoute(ctx, startX + 2, startY + 2, endX + 2, endY + 2, 
//       displayPins.map(p => ({...p, x: p.x + 2, y: p.y + 2})));
//     ctx.stroke();

//     // Main path
//     ctx.strokeStyle = '#8b5e3c';
//     ctx.lineWidth = 5;
//     ctx.setLineDash([15, 8]);
//     ctx.beginPath();
//     ctx.moveTo(startX, startY);
//     drawSmoothRoute(ctx, startX, startY, endX, endY, displayPins);
//     ctx.stroke();
//     ctx.setLineDash([]);

//     // Add small arrows along path
//     displayPins.forEach((pin, idx) => {
//       if (idx < displayPins.length - 1) {
//         const nextPin = displayPins[idx + 1];
//         const angle = Math.atan2(nextPin.y - pin.y, nextPin.x - pin.x);
//         const midX = (pin.x + nextPin.x) / 2;
//         const midY = (pin.y + nextPin.y) / 2;
        
//         ctx.save();
//         ctx.translate(midX, midY);
//         ctx.rotate(angle);
//         ctx.fillStyle = '#8b5e3c';
//         ctx.beginPath();
//         ctx.moveTo(8, 0);
//         ctx.lineTo(0, -5);
//         ctx.lineTo(0, 5);
//         ctx.closePath();
//         ctx.fill();
//         ctx.restore();
//       }
//     });
//   }

//   // Start marker: detailed compass rose
//   ctx.save();
//   ctx.translate(startX, startY);
  
//   // Compass outer ring
//   ctx.strokeStyle = '#6b4423';
//   ctx.lineWidth = 3;
//   ctx.beginPath();
//   ctx.arc(0, 0, 24, 0, Math.PI * 2);
//   ctx.stroke();
  
//   // Compass inner circle
//   const compassGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
//   compassGradient.addColorStop(0, '#d4a574');
//   compassGradient.addColorStop(1, '#8b6f47');
//   ctx.fillStyle = compassGradient;
//   ctx.beginPath();
//   ctx.arc(0, 0, 20, 0, Math.PI * 2);
//   ctx.fill();
  
//   // Compass points
//   ctx.fillStyle = '#2c1810';
//   for (let i = 0; i < 4; i++) {
//     ctx.save();
//     ctx.rotate((i * Math.PI) / 2);
//     ctx.beginPath();
//     ctx.moveTo(0, -18);
//     ctx.lineTo(-4, -8);
//     ctx.lineTo(4, -8);
//     ctx.closePath();
//     ctx.fill();
//     ctx.restore();
//   }
  
//   // Center dot
//   ctx.fillStyle = '#fff';
//   ctx.beginPath();
//   ctx.arc(0, 0, 5, 0, Math.PI * 2);
//   ctx.fill();
  
//   ctx.fillStyle = '#2c1810';
//   ctx.font = 'bold 10px serif';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
//   ctx.fillText('N', 0, -10);
//   ctx.restore();

//   // End marker: waving flag
//   ctx.save();
//   ctx.translate(endX, endY);
  
//   // Flag pole
//   ctx.strokeStyle = '#2c1810';
//   ctx.lineWidth = 3;
//   ctx.beginPath();
//   ctx.moveTo(0, -25);
//   ctx.lineTo(0, 25);
//   ctx.stroke();
  
//   // Flag with wave effect
//   ctx.fillStyle = '#c41e3a';
//   ctx.beginPath();
//   ctx.moveTo(0, -25);
//   ctx.quadraticCurveTo(15, -22, 25, -18);
//   ctx.quadraticCurveTo(15, -14, 0, -12);
//   ctx.closePath();
//   ctx.fill();
  
//   ctx.strokeStyle = '#8b0000';
//   ctx.lineWidth = 1;
//   ctx.stroke();
  
//   // Flag pole top
//   ctx.fillStyle = '#d4a574';
//   ctx.beginPath();
//   ctx.arc(0, -25, 3, 0, Math.PI * 2);
//   ctx.fill();
  
//   ctx.restore();

//   // Pins: detailed scenic markers with glow
//   displayPins.forEach((pin, idx) => {
//     const isHovered = hoveredRoutePin === idx;
//     const isDraggingThis = draggingPinIndex === idx;
//     const size = isHovered || isDraggingThis ? 20 : 16;

//     ctx.save();
    
//     // Glow effect when hovered
//     if (isHovered || isDraggingThis) {
//       ctx.shadowColor = '#d4a574';
//       ctx.shadowBlur = 15;
//     }
    
//     // Pin shadow
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
//     ctx.beginPath();
//     ctx.arc(pin.x + 2, pin.y + 2, size, 0, Math.PI * 2);
//     ctx.fill();
    
//     // Pin outer ring
//     ctx.shadowBlur = 0;
//     ctx.fillStyle = '#6b4423';
//     ctx.beginPath();
//     ctx.arc(pin.x, pin.y, size, 0, Math.PI * 2);
//     ctx.fill();
    
//     // Pin inner circle with gradient
//     const pinGradient = ctx.createRadialGradient(pin.x, pin.y, 0, pin.x, pin.y, size - 3);
//     pinGradient.addColorStop(0, '#f4d03f');
//     pinGradient.addColorStop(1, '#d4a574');
//     ctx.fillStyle = pinGradient;
//     ctx.beginPath();
//     ctx.arc(pin.x, pin.y, size - 3, 0, Math.PI * 2);
//     ctx.fill();

//     // Number
//     ctx.fillStyle = '#2c1810';
//     ctx.font = `bold ${size - 4}px serif`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(idx + 1, pin.x, pin.y);

//     ctx.restore();
//   });

//   // Labels: elegant city names with shadow
//   ctx.save();
//   ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
//   ctx.shadowBlur = 3;
//   ctx.shadowOffsetX = 1;
//   ctx.shadowOffsetY = 1;
  
//   ctx.fillStyle = '#2c1810';
//   ctx.font = 'italic bold 18px Georgia, serif';
//   ctx.textAlign = 'center';
//   const startCity = startPoint ? startPoint.split(',')[0].trim() : 'Journey Begins';
//   ctx.fillText(startCity, startX, startY + 45);

//   const endCity = destination ? destination.split(',')[0].trim() : 'Destination';
//   ctx.fillText(endCity, endX, endY - 45);
//   ctx.restore();

//   // Decorative compass in corner
//   ctx.save();
//   ctx.translate(canvas.width - 70, canvas.height - 70);
  
//   // Compass background
//   ctx.fillStyle = 'rgba(212, 165, 116, 0.3)';
//   ctx.beginPath();
//   ctx.arc(0, 0, 35, 0, Math.PI * 2);
//   ctx.fill();
  
//   ctx.strokeStyle = '#8b5e3c';
//   ctx.lineWidth = 2;
//   ctx.beginPath();
//   ctx.arc(0, 0, 30, 0, Math.PI * 2);
//   ctx.stroke();
  
//   // Compass directions
//   ctx.fillStyle = '#2c1810';
//   ctx.font = 'bold 14px serif';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
//   ctx.fillText('N', 0, -18);
//   ctx.fillText('S', 0, 18);
//   ctx.fillText('E', 18, 0);
//   ctx.fillText('W', -18, 0);
  
//   // Center
//   ctx.fillStyle = '#c41e3a';
//   ctx.beginPath();
//   ctx.arc(0, 0, 4, 0, Math.PI * 2);
//   ctx.fill();
  
//   ctx.restore();

//   // Title banner at top
//   ctx.save();
//   ctx.fillStyle = 'rgba(139, 94, 60, 0.15)';
//   ctx.fillRect(canvas.width / 2 - 150, 35, 300, 35);
  
//   ctx.strokeStyle = '#8b5e3c';
//   ctx.lineWidth = 2;
//   ctx.strokeRect(canvas.width / 2 - 150, 35, 300, 35);
  
//   ctx.fillStyle = '#2c1810';
//   ctx.font = 'italic bold 20px Georgia, serif';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
//   ctx.fillText('✦ Journey Map ✦', canvas.width / 2, 52);
//   ctx.restore();
// };

// const drawMap = () => {
//   const canvas = canvasRef.current;
//   if (!canvas || !canvasSize.width || !canvasSize.height) return;

//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Background: parchment texture
//   ctx.fillStyle = '#f4ecd8';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Decorative border
//   ctx.strokeStyle = '#c2b280';
//   ctx.lineWidth = 6;
//   ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

//   // Grid: dashed explorer lines
//   ctx.strokeStyle = '#d8caa8';
//   ctx.lineWidth = 1;
//   ctx.setLineDash([4, 6]);
//   for (let i = 0; i < canvas.width; i += 100) {
//     ctx.beginPath();
//     ctx.moveTo(i, 0);
//     ctx.lineTo(i, canvas.height);
//     ctx.stroke();
//   }
//   for (let i = 0; i < canvas.height; i += 100) {
//     ctx.beginPath();
//     ctx.moveTo(0, i);
//     ctx.lineTo(canvas.width, i);
//     ctx.stroke();
//   }
//   ctx.setLineDash([]);

//   const { startX, startY, endX, endY } = getRoutePositions();

//   // Route: dashed path with arrowheads
//   if (displayPins.length > 0) {
//     ctx.strokeStyle = '#8b5e3c';
//     ctx.lineWidth = 3;
//     ctx.setLineDash([10, 6]);
//     ctx.beginPath();
//     ctx.moveTo(startX, startY);
//     drawSmoothRoute(ctx, startX, startY, endX, endY, displayPins);
//     ctx.stroke();
//     ctx.setLineDash([]);
//   }

//   // Start marker: compass rose
//   ctx.save();
//   ctx.translate(startX, startY);
//   ctx.fillStyle = '#3e3e3e';
//   ctx.beginPath();
//   ctx.arc(0, 0, 20, 0, Math.PI * 2);
//   ctx.fill();
//   ctx.fillStyle = '#ffffff';
//   ctx.font = 'bold 14px serif';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
//   ctx.fillText('S', 0, 0);
//   ctx.restore();

//   // End marker: flag
//   ctx.save();
//   ctx.translate(endX, endY);
//   ctx.fillStyle = '#8b0000';
//   ctx.beginPath();
//   ctx.moveTo(0, -20);
//   ctx.lineTo(20, -10);
//   ctx.lineTo(0, 0);
//   ctx.closePath();
//   ctx.fill();
//   ctx.strokeStyle = '#000';
//   ctx.lineWidth = 2;
//   ctx.beginPath();
//   ctx.moveTo(0, 0);
//   ctx.lineTo(0, 20);
//   ctx.stroke();
//   ctx.restore();

//   // Pins: scenic markers
//   displayPins.forEach((pin, idx) => {
//     const isHovered = hoveredRoutePin === idx;
//     const isDraggingThis = draggingPinIndex === idx;
//     const size = isHovered || isDraggingThis ? 16 : 12;

//     ctx.save();
//     ctx.fillStyle = '#4b3f2f';
//     ctx.beginPath();
//     ctx.arc(pin.x, pin.y, size, 0, Math.PI * 2);
//     ctx.fill();

//     ctx.fillStyle = '#fff';
//     ctx.font = 'bold 10px serif';
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(idx + 1, pin.x, pin.y);

//     // Label below pin
//     if (pin.label) {
//       ctx.fillStyle = '#3e3e3e';
//       ctx.font = 'italic 12px serif';
//       ctx.textBaseline = 'top';
//       ctx.fillText(pin.label, pin.x, pin.y + size + 4);
//     }
//     ctx.restore();
//   });

//   // Labels: start and end city
//   ctx.save();
//   ctx.fillStyle = '#3e3e3e';
//   ctx.font = 'bold 16px serif';
//   ctx.textAlign = 'left';
//   const startCity = startPoint ? startPoint.split(',')[0].trim() : 'Start';
//   ctx.fillText(`Start: ${startCity}`, startX + 25, startY + 10);

//   ctx.textAlign = 'right';
//   const endCity = destination ? destination.split(',')[0].trim() : 'End';
//   ctx.fillText(`End: ${endCity}`, endX - 25, endY - 30);
//   ctx.restore();

//   // Compass in corner
//   ctx.save();
//   ctx.translate(canvas.width - 60, canvas.height - 60);
//   ctx.fillStyle = '#3e3e3e';
//   ctx.font = 'bold 14px serif';
//   ctx.textAlign = 'center';
//   ctx.fillText('🧭', 0, 0);
//   ctx.restore();
// };


  useEffect(() => {
    drawMap();
  }, [startPoint, destination, displayPins, hoveredRoutePin, canvasSize, draggingPinIndex]);

  const handleCanvasClick = (e) => {
    if (draggingPinIndex !== null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { startX, startY, endX, endY } = getRoutePositions();
    const distToStart = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
    const distToEnd = Math.sqrt((x - endX) ** 2 + (y - endY) ** 2);
    
    if (distToStart < 25 || distToEnd < 25) return;

    let clickedOnPin = false;
    displayPins.forEach((pin) => {
      const dist = Math.sqrt((pin.x - x) ** 2 + (pin.y - y) ** 2);
      if (dist < 18) clickedOnPin = true;
    });

    if (clickedOnPin) return;

    setPinData({
      lat: parseFloat((y / canvas.height).toFixed(6)),
      lng: parseFloat((x / canvas.width).toFixed(6)),
      name: '',
      description: '',
      x: x,
      y: y,
    });
    setShowPinModal(true);
  };

  const handleAddPin = () => {
    if (pinData.name.trim()) {
      const newPin = {
        id: Date.now(),
        lat: pinData.lat,
        lng: pinData.lng,
        name: pinData.name.trim(),
        description: pinData.description.trim() || 'No description',
        address: pinData.address,
        addedBy: currentUser,
        timestamp: new Date().toLocaleString(),
        x: pinData.x,
        y: pinData.y,
      };
      
      onAddPin(newPin);
      setPinData({ lat: null, lng: null, name: '', description: '', address: '', x: null, y: null });
      setShowPinModal(false);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let idx = 0; idx < displayPins.length; idx++) {
      const pin = displayPins[idx];
      const dist = Math.sqrt((pin.x - x) ** 2 + (pin.y - y) ** 2);
      if (dist < 18) {
        setDraggingPinIndex(idx);
        e.preventDefault();
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    if (draggingPinIndex !== null) {
      onUpdatePin(draggingPinIndex, { x, y });
      return;
    }

    let foundRouteHover = null;
    for (let idx = 0; idx < displayPins.length; idx++) {
      const pin = displayPins[idx];
      const dist = Math.sqrt((pin.x - x) ** 2 + (pin.y - y) ** 2);
      if (dist < 22) {
        foundRouteHover = idx;
        break;
      }
    }
    setHoveredRoutePin(foundRouteHover);
  };

  const handleMouseUp = () => {
    setDraggingPinIndex(null);
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredPin(null);
          setHoveredRoutePin(null);
          handleMouseUp();
        }}
        className="w-full h-full rounded-xl bg-white border-2 border-indigo-200 shadow-2xl"
        style={{ cursor: draggingPinIndex !== null ? 'grabbing' : hoveredRoutePin !== null ? 'grab' : 'crosshair' }}
      />

      {hoveredRoutePin !== null && displayPins[hoveredRoutePin] && draggingPinIndex === null && (
        <div 
          className="fixed bg-white rounded-xl shadow-2xl p-4 border-2 border-purple-400 max-w-sm z-50 pointer-events-none"
          style={{
            left: `${Math.min(mousePos.x + 20, window.innerWidth - 300)}px`,
            top: `${Math.max(mousePos.y - 140, 10)}px`,
          }}
        >
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">📍</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-900 mb-1">
                {displayPins[hoveredRoutePin].name}
              </div>
              <div className="text-xs text-gray-600">
                {displayPins[hoveredRoutePin].description}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Added by:</span> {displayPins[hoveredRoutePin].addedBy}
            </p>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>📍</span>
                Add Place on Route
              </h3>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinData({ lat: null, lng: null, name: '', description: '', address: '', x: null, y: null });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Place Name *</label>
                <input
                  type="text"
                  placeholder="Enter place name"
                  value={pinData.name}
                  onChange={(e) => setPinData({ ...pinData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter description (optional)"
                  value={pinData.description}
                  onChange={(e) => setPinData({ ...pinData, description: e.target.value })}
                  rows="3"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
                <p className="text-gray-700"><strong>Created by:</strong> {currentUser}</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddPin}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Add Place
                </button>
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPinData({ lat: null, lng: null, name: '', description: '', address: '', x: null, y: null });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};