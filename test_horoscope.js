import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import * as deepl from "deepl-node";

/* 1. 牡羊座の英文取得 */
const en = await fetch(
  "https://api.api-ninjas.com/v1/horoscope?zodiac=aries",
  { headers: { "X-Api-Key": process.env.NINJAS_API_KEY } }
).then(r => r.json()).then(j => j.horoscope);

/* 2. DeepL 日本語翻訳 */
const jp = await new deepl.Translator(process.env.DEEPL_API_KEY)
  .translateText(en, null, "JA").then(r => r.text);

/* 3. Discord へテスト送信 */
await fetch(process.env.DISCORD_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: `♈ **牡羊座の今日の占い**\n${jp}` })
});
console.log("✅ テスト送信完了");