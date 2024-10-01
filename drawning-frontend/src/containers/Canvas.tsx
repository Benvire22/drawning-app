import React, { useEffect, useRef, useState } from 'react';
import { Pixel } from '../types';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [color, setColor] = useState<string>('#000000');

  useEffect(() => {
    try {
      ws.current = new WebSocket('ws://localhost:8000/draw');

      ws.current.onclose = () => console.log('WS disconnected!');

      ws.current.onmessage = (event: MessageEvent) => {
        const pixels = JSON.parse(event.data) as Pixel[];
        const ctx = canvasRef.current?.getContext('2d');

        if (ctx) {
          pixels.forEach((pixel) => {
            drawCircle(ctx, pixel.x, pixel.y, pixel.color);
          });
        }
      };

      return () => {
        ws.current?.close();
      };
    } catch (e) {
      console.error(e);
    }
  }, [ws, canvasRef]);

  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    try {
      const rect = canvasRef.current?.getBoundingClientRect();

      if (!rect || !ws.current) {
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const pixelData: Pixel = { x, y, color };

      ws.current.send(JSON.stringify(pixelData));

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawCircle(ctx, x, y, color);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <h1>Drawing app</h1>
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
    </>
  );
};

export default Canvas;