import express from 'express';
import fs from 'fs/promises';
import { OAuth2Client } from 'google-auth-library';

export async function authenticate() {
  const oauthClient = new OAuth2Client({
    ...(await import('./../client.json')).default,
    redirectUri: 'http://localhost:1765/oauth-verify',
  });

  const token = await fs
    .readFile('./token.json', { encoding: 'utf-8' })
    .catch((err) => null);
  if (token) {
    oauthClient.setCredentials(JSON.parse(token));
    return oauthClient;
  }

  const authorizeUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/drive',
  });

  const app = express();
  let resolveOAuthClientPromise: (cl: OAuth2Client) => void;
  const oauthClientPromise = new Promise<OAuth2Client>(
    (res) => (resolveOAuthClientPromise = res),
  );

  app.get('/oauth-verify', async (req, res) => {
    try {
      const code = req.query.code as string;
      const resp = await oauthClient.getToken(code);
      oauthClient.setCredentials(resp.tokens);
      console.log('Successfully obtained credentials');
      res.status(200).send('All went good, you can close this tab');
      resolveOAuthClientPromise(oauthClient);
    } catch (err) {
      res.sendStatus(500);
      throw err;
    }
  });

  app.listen(1765, () => {
    console.log(`Navigate to ${authorizeUrl}`);
    console.log('Awaiting confirmation');
  });

  oauthClient.on('tokens', (tokens) => {
    console.log('Received new tokens, writing them to file');
    fs.writeFile('./token.json', JSON.stringify(tokens));
  });

  return oauthClientPromise;
}
