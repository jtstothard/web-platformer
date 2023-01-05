import './style.css';
import { Game } from './game';

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.border = '1px solid black';
document.querySelector<HTMLDivElement>('#app')!.appendChild(canvas);

// Create 2d game class
const game = new Game(canvas);

// Start game
game.start();
