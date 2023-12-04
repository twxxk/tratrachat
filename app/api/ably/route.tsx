// You can ignore warnings https://github.com/jaredwray/keyv/issues/45
import Ably from "ably/promises";
import { NextRequest } from "next/server";

// export const runtime = 'edge'; // It does not seem Ably work with edge functions
export const revalidate = 0;

// Should be reconnected automatically after disconnected from the server every two minutes
const client = new Ably.Realtime(process.env.ABLY_API_KEY);

const defaultClientId = 'guest'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userName = searchParams.get('userName') || defaultClientId;
  //  console.log(`userName=${userName}`)
 
  // https://ably.com/docs/auth/identified-clients
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: userName });
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
