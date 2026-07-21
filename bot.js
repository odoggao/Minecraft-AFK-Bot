const mineflayer = require('mineflayer');
const config = require('./config.json');

let bot;
let movementPhase = 0;
let movementTimeout = null; // Guarda o timer do movimento para poder limpá-lo

const STEP_INTERVAL = 1500;
const JUMP_DURATION = 500;

function startBot() {
  console.log('🔄 Iniciando bot...');

  bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    auth: 'offline',
    version: false,
    viewDistance: config.botChunk
  });

  bot.on('spawn', () => {
    // Reseta a fase de movimento ao conectar
    movementPhase = 0; 
    
    setTimeout(() => {
      bot.setControlState('sneak', true);
      bot.chat('/gamemode 3');
      console.log(`✅ ${config.botUsername} is Ready!`);
    }, 3000);
    
    // Cancela loops antigos antes de iniciar um novo
    if (movementTimeout) clearTimeout(movementTimeout);
    movementTimeout = setTimeout(movementCycle, STEP_INTERVAL);
  });

  bot.on('error', (err) => {
    console.error('⚠️ Error:', err);
  });

  bot.on('end', () => {
    console.log('⛔️ Bot Disconnected! Tentando reconectar em 5 segundos...');
    
    // Limpa o timer de movimento para o bot antigo não rodar em paralelo
    if (movementTimeout) clearTimeout(movementTimeout);
    
    // Aguarda 5 segundos e cria um novo bot
    setTimeout(startBot, 5000);
  });
}

function movementCycle() {
  // Verifica se o bot e a entidade física ainda existem
  if (!bot || !bot.entity) return;

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
    case 1:
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
      bot.setControlState('jump', false);
      break;
    case 2:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', true);
      setTimeout(() => {
        if (bot) bot.setControlState('jump', false);
      }, JUMP_DURATION);
      break;
    case 3:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
  }

  movementPhase = (movementPhase + 1) % 4;

  // Agenda o próximo ciclo guardando a referência do timer
  movementTimeout = setTimeout(movementCycle, STEP_INTERVAL);
}

// Inicia o loop principal
startBot();
