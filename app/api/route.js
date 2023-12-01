import Ably from "ably/promises";

// export const runtime = 'edge';
export const revalidate = 0;

export async function GET(request) {
    const client = new Ably.Realtime(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'ably-nextjs-demo' });

    console.log(`Request: ${JSON.stringify(tokenRequestData)}`)
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
