// export const runtime = 'edge';

import * as deepl from 'deepl-node';
import { NextRequest } from 'next/server';

const authKey = process.env.DEEPL_AUTH_KEY;

/**
 * API for Web app
 * 
 * @param req 
 * @returns {text: string, detectedSourceLang}
 */
export async function GET(req: NextRequest) {
  // https://github.com/vercel/next.js/discussions/51119#discussioncomment-6144881
  const { searchParams } = new URL(req.url);
  const textToTranslate = searchParams.get('text');
  if (textToTranslate.length === 0)
    return Response.json({});

  const japaneseRegex = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}一-龠]/u;
  const includesJapanese = japaneseRegex.test(textToTranslate);
  const targetLang:deepl.TargetLanguageCode = includesJapanese ? 'en-US' : 'ja';
  // const sourceLange:deepl.SourceLanguageCode = includesJapanese ? 'ja' : 'en';
  
  const translater = new deepl.Translator(authKey);
  const responseData = await translater.translateText(textToTranslate, null, targetLang);
  // console.log(responseData);

  return Response.json(responseData);
}
