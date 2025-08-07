import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import * as deepl from "deepl-node";

// API Ninjas から英語占いを取得
const en = await fetch(
  "https://api.api-ninjas.com/v1/horoscope?zodiac=aries",
  { headers: { "X-Api-Key": process.env.NINJAS_API_KEY } }
).then(r => r.json()).then(j => j.horoscope);

// DeepL で日本語へ翻訳（stdout 確認用）
const jp = await new deepl.Translator(process.env.DEEPL_API_KEY)
  .translateText(en, null, "JA");
console.log("---- 翻訳結果 ----\n" + jp.text);