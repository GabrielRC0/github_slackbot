import Slack from '@slack/bolt';
import dotenv from 'dotenv';
import express from 'express';
import { WebSocketServer } from 'ws';
 
dotenv.config();

const app = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_TOKEN,
    token: process.env.SLACK_BOT_TOKEN
});

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`VFaro app is running on port ${port}!`);
})();

const expressApp = express();
expressApp.use(express.json());


//TODO Passar userId para uma função que receba um payload.sender e retorne o userId correspondente
//TODO ver com o Rodrigo sobre a melhor arquitetura para esse projeto, talvez um serverless
expressApp.post('/receive_json', async (req, res) => {
  const payload = req.body;
  const userId = "U05PHLLVBL5";
  const customMessage = `Olá @${payload.pull_request.user.login}, <@${userId}> vejo que sua situação é ${payload.action}. Veja o link ${payload.pull_request.html_url} para regularizar com o ${payload.sender.login}.`;
  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: '#general',
    text: customMessage,
  });
  res.status(200).send();
});

const expressServer = expressApp.listen(3001, () => {
  console.log('Express server running on port 3001');
});

const wss = new WebSocketServer({ server: expressServer });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const payload = JSON.parse(message);
    const customMessage = `Olá ${payload.nome}, vejo que sua situação é ${payload.situacao}. Veja o link ${payload.link} para regularizar.`;
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: '#general',
      text: customMessage,
    });
  });
});
