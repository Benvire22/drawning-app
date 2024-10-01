import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import { WebSocket } from 'ws';
import { Pixel } from './types';

const app = express();
expressWs(app);
app.use(cors());

const port = 8000;

const router = express.Router();

const connectedClients: WebSocket[] = [];
let pixels: Pixel[] = [];

router.ws('/draw', (ws, _req) => {
  connectedClients.push(ws);
  console.log('Client connected! Total clients', connectedClients.length);
  ws.send(JSON.stringify(pixels));

  ws.on('message', (message) => {
    try {
      const pixelData = JSON.parse(message.toString()) as Pixel;
      pixels.push(pixelData);

      connectedClients.forEach((clientWs) => {
        if (clientWs !== ws) {
          clientWs.send(JSON.stringify(pixels));
        }
      });


    } catch (e) {
      ws.send(JSON.stringify({ error: 'Invalid message!' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected!');
    const index = connectedClients.indexOf(ws);
    connectedClients.splice(index, 1);
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});