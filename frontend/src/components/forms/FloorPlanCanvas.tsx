'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Square, 
  Trash2, 
  Undo2, 
  Download, 
  Type, 
  Layers, 
  Layout, 
  ChevronRight, 
  MousePointer,
  HelpCircle
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Wall {
  start: Point;
  end: Point;
}

interface Door {
  x: number;
  y: number;
  angle: number;
}

interface WindowItem {
  x: number;
  y: number;
  angle: number;
}

interface Label {
  x: number;
  y: number;
  text: string;
}

interface FloorPlanCanvasProps {
  onExportImage: (dataUrl: string) => void;
}

export default function FloorPlanCanvas({ onExportImage }: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Toolbar tool state: 'wall' | 'door' | 'window' | 'label' | 'select'
  const [activeTool, setActiveTool] = useState<'wall' | 'door' | 'window' | 'label' | 'select'>('wall');
  
  // Vector geometry states
  const [walls, setWalls] = useState<Wall[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  
  // Drawing temporary states
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.offsetWidth;
        canvas.height = 420;
        draw();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [walls, doors, windows, labels, lastPoint, mousePos, activeTool]);

  // Main Canvas Rendering Engine
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw grid background (Blueprint style)
    ctx.fillStyle = '#0f172a'; // slate-900 dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Blueprint Grid Lines
    ctx.strokeStyle = '#33415555'; // slate-700 translucent
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw existing walls
    ctx.strokeStyle = '#ffffff'; // white walls
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    walls.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(w.start.x, w.start.y);
      ctx.lineTo(w.end.x, w.end.y);
      ctx.stroke();
    });

    // Draw preview wall from last point to current mouse position
    if (activeTool === 'wall' && lastPoint && mousePos) {
      ctx.strokeStyle = '#a855f7bb'; // purple preview wall
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      
      // Node point at cursor
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw wall vertices/nodes
    ctx.fillStyle = '#a855f7'; // Purple wall junctions
    const nodes = new Set<string>();
    walls.forEach(w => {
      nodes.add(`${w.start.x},${w.start.y}`);
      nodes.add(`${w.end.x},${w.end.y}`);
    });
    nodes.forEach(nodeStr => {
      const [x, y] = nodeStr.split(',').map(Number);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw doors (arc opening)
    doors.forEach(d => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.angle);
      
      // Draw door frame
      ctx.strokeStyle = '#38bdf8'; // sky-400 door
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -25); // door leaf
      ctx.stroke();
      
      // Draw door opening arc
      ctx.strokeStyle = '#38bdf888';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(0, 0, 25, -Math.PI / 2, 0);
      ctx.stroke();
      
      ctx.restore();
    });

    // Draw windows
    windows.forEach(w => {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.angle);
      
      // Draw window double line
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-15, -4, 30, 8);
      ctx.strokeStyle = '#22c55e'; // green-500 window
      ctx.lineWidth = 3;
      ctx.strokeRect(-15, -4, 30, 8);
      ctx.strokeStyle = '#22c55e88';
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();
      
      ctx.restore();
    });

    // Draw labels
    ctx.fillStyle = '#f8fafc'; // light text
    ctx.font = 'bold 11px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    labels.forEach(l => {
      // Draw label background pill
      const textWidth = ctx.measureText(l.text).width;
      ctx.fillStyle = '#1e293b'; // slate-800 pill
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(l.x - textWidth / 2 - 8, l.y - 10, textWidth + 16, 20, 6);
      ctx.fill();
      ctx.stroke();

      // Render Label Text
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(l.text, l.x, l.y);
    });

    // Draw hovering tool preview at mouse position
    if (mousePos && isHovering) {
      if (activeTool === 'door') {
        ctx.save();
        ctx.translate(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#38bdf8bb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -25);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 25, -Math.PI / 2, 0);
        ctx.stroke();
        ctx.restore();
      } else if (activeTool === 'window') {
        ctx.save();
        ctx.translate(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#22c55ebb';
        ctx.lineWidth = 2;
        ctx.strokeRect(-15, -4, 30, 8);
        ctx.restore();
      }
    }
  };

  // Redraw whenever geometry changes
  useEffect(() => {
    draw();
  }, [walls, doors, windows, labels, lastPoint, mousePos]);

  // Handle canvas mouse click actions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / 12.5) * 12.5; // Snap to 12.5px subgrid
    const y = Math.round((e.clientY - rect.top) / 12.5) * 12.5;
    
    const clickPoint = { x, y };

    if (activeTool === 'wall') {
      if (!lastPoint) {
        setLastPoint(clickPoint);
      } else {
        // Prevent 0-length walls
        if (lastPoint.x === clickPoint.x && lastPoint.y === clickPoint.y) return;
        setWalls(prev => [...prev, { start: lastPoint, end: clickPoint }]);
        setLastPoint(clickPoint); // Link next wall chain segment
      }
    } else if (activeTool === 'door') {
      setDoors(prev => [...prev, { x, y, angle: 0 }]);
      setActiveTool('select');
    } else if (activeTool === 'window') {
      setWindows(prev => [...prev, { x, y, angle: 0 }]);
      setActiveTool('select');
    } else if (activeTool === 'label') {
      const roomName = prompt('Enter Room Label name (e.g. Living Room, Bedroom 1):');
      if (roomName && roomName.trim()) {
        setLabels(prev => [...prev, { x, y, text: roomName.trim() }]);
      }
      setActiveTool('select');
    }
  };

  // Escape to stop drawing wall chain
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLastPoint(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / 12.5) * 12.5;
    const y = Math.round((e.clientY - rect.top) / 12.5) * 12.5;
    setMousePos({ x, y });
  };

  // Undo last action
  const handleUndo = () => {
    if (lastPoint) {
      setLastPoint(null);
      return;
    }
    if (labels.length > 0) {
      setLabels(prev => prev.slice(0, -1));
    } else if (windows.length > 0) {
      setWindows(prev => prev.slice(0, -1));
    } else if (doors.length > 0) {
      setDoors(prev => prev.slice(0, -1));
    } else if (walls.length > 0) {
      setWalls(prev => prev.slice(0, -1));
    }
  };

  // Clear drawing canvas completely
  const handleClear = () => {
    setWalls([]);
    setDoors([]);
    setWindows([]);
    setLabels([]);
    setLastPoint(null);
  };

  // Export HTML5 Canvas sketch to parent generate/page state
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export drawing dataUrl
    const dataUrl = canvas.toDataURL('image/png');
    onExportImage(dataUrl);
  };

  return (
    <div className="flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 shadow-md">
      
      {/* HEADER CONTROL BAR */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-slate-200">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-black uppercase tracking-wider font-heading">
            Interactive Layout Sketcher (Vector Mode)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            className="p-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Undo Last Action (or stop current wall path)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-2xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
            title="Clear Workspace"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm shadow-purple-500/10 font-heading"
          >
            <span>Export layout to studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div 
        ref={containerRef} 
        className="relative bg-slate-950 w-full"
        style={{ height: '420px' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setMousePos(null);
          }}
          className="block cursor-crosshair"
        />

        {/* FLOATING ACTION TOOLBAR */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 rounded-2xl p-1.5 shadow-lg flex items-center gap-1 backdrop-blur-md">
          {[
            { id: 'wall', label: 'Draw Walls', icon: Square, color: 'text-purple-400' },
            { id: 'door', label: 'Place Doors', icon: Layers, color: 'text-sky-400' },
            { id: 'window', label: 'Place Windows', icon: Square, color: 'text-green-400' },
            { id: 'label', label: 'Room Label', icon: Type, color: 'text-slate-200' },
            { id: 'select', label: 'Pointer Tool', icon: MousePointer, color: 'text-slate-400' }
          ].map(tool => {
            const ToolIcon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setActiveTool(tool.id as any);
                  if (tool.id !== 'wall') setLastPoint(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-extrabold scale-105' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <ToolIcon className={`w-3.5 h-3.5 ${isActive ? tool.color : 'text-slate-500'}`} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* CORNER TIPS TOOLTIP */}
        <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-2 text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 backdrop-blur-xs">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>
            {activeTool === 'wall' && 'Click nodes to draw wall path. Tap Escape to end path.'}
            {activeTool === 'door' && 'Click anywhere to place a Door opening symbol.'}
            {activeTool === 'window' && 'Click anywhere to place a double-line Window.'}
            {activeTool === 'label' && 'Click on a room partition to enter custom label.'}
            {activeTool === 'select' && 'Select tools from toolbar below to start sketching.'}
          </span>
        </div>
      </div>
    </div>
  );
}
