import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (request: VercelRequest, response: VercelResponse) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method === 'POST') {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return response.status(400).json({ 
          error: 'OpenAI API Key nicht konfiguriert!' 
        });
      }

      const sessionConfig = {
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
          audio: {
            output: {
              voice: 'marin',
            },
          },
        },
      };

      const openaiResponse = await fetch(
        'https://api.openai.com/v1/realtime/client_secrets',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionConfig),
        }
      );

      const data = await openaiResponse.json();

      if (!openaiResponse.ok) {
        return response.status(openaiResponse.status).json({
          error: data.error?.message || 'Fehler bei OpenAI API',
        });
      }

      response.status(200).json({
        clientSecret: data.client_secret?.value || data.value,
      });
    } catch (error) {
      console.error('Server Error:', error);
      response.status(500).json({ 
        error: 'Fehler beim Erstellen der Session'
      });
    }
  } else {
    response.status(405).json({ error: 'Methode nicht erlaubt' });
  }
};