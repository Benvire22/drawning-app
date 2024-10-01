import React, { useEffect, useRef, useState } from 'react';
import { Pixel } from '../types';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/draw');
    setSocket(ws);

    ws.onclose = () => console.log('WS disconnected!');

    ws.onmessage = (event: MessageEvent) => {
      const pixels = JSON.parse(event.data) as Pixel[];
      const ctx = canvasRef.current?.getContext('2d');

      if (ctx) {
        pixels.forEach((pixel) => {
          drawCircle(ctx, pixel.x, pixel.y, pixel.color);
        });
      } else {

      }
    };

    return () => ws.close();
  }, []);

  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && socket) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const pixelData: Pixel = { x, y, color };

      socket.send(JSON.stringify(pixelData));

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawCircle(ctx, x, y, color);
      }
    }
  };

  return (
    <div className="Canvas-container">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
      ></canvas>
    </div>
  );
};

export default Canvas;