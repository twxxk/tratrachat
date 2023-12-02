// You can ignore warnings https://github.com/jaredwray/keyv/issues/45
import Ably from "ably/promises";

// export const runtime = 'edge'; // It does not seem Ably work with edge functions
export const revalidate = 0;

// Should be reconnected automatically after disconnected from the server every two minutes
const client = new Ably.Realtime(process.env.ABLY_API_KEY);

export async function GET(request) {
  // https://ably.com/docs/auth/identified-clients
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'tratrachat-client' });
  // console.log(`Request: ${JSON.stringify(tokenRequestData)}`)
  
  // https://blog.kimizuka.org/entry/2023/07/28/235041
  return Response.json(tokenRequestData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
  });
}
