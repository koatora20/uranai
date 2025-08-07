/******************************************************************

Horoscope (英→日 DeepL) 12星座 + 暦 → Discord Embed

PNG アイコンを削除し、タイトル先頭に絵文字を追加
******************************************************************/

import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import * as deepl from "deepl-node";

/* ---------- 1. 定数 ---------- */
const SIGN_META = {
  aries:{ e:"♈", n:"牡羊座",      c:0xE74C3C },
  taurus:{ e:"♉", n:"牡牛座",     c:0x27AE60 },
  gemini:{ e:"♊", n:"双子座",     c:0xF1C40F },
  cancer:{ e:"♋", n:"蟹座",      c:0x9B59B6 },
  leo:{ e:"♌", n:"獅子座",        c:0xE67E22 },
  virgo:{ e:"♍", n:"乙女座",      c:0x1ABC9C },
  libra:{ e:"♎", n:"天秤座",      c:0x3498DB },
  scorpio:{ e:"♏", n:"蠍座",     c:0x8E44AD },
  sagittarius:{ e:"♐", n:"射手座",c:0xD35400 },
  capricorn:{ e:"♑", n:"山羊座",  c:0x34495E },
  aquarius:{ e:"♒", n:"水瓶座",  c:0x16A085 },
  pisces:{ e:"♓", n:"魚座",       c:0x2980B9 }
};
const SIGNS = Object.keys(SIGN_META);

const COLORS = ["赤","橙","黄","緑","青","紫","桃","白","黒","金","銀","ターコイズ"];
const ITEMS  = ["コーヒー","ノート","キーホルダー","本","傘","ヘッドホン","ペン","腕時計","水筒","キャンドル","観葉植物","チョコレート"];

/* ---------- 2. API / 翻訳 ---------- */
const tr = new deepl.Translator(process.env.DEEPL_API_KEY);

async function getHoroscopeJa(sign){
  const en = await fetch(
    `https://api.api-ninjas.com/v1/horoscope?zodiac=${sign}`,
    { headers:{ "X-Api-Key":process.env.NINJAS_API_KEY } }
  ).then(r=>r.json()).then(j=>j.horoscope);
  return (await tr.translateText(en,null,"JA")).text;
}

async function getKoyomi(jst){
  const [y,m,d] = [jst.getFullYear(), jst.getMonth()+1, jst.getDate()]
    .map((v,i)=>String(v).padStart(i?2:4,"0"));
  const url = `https://koyomi.zingsystem.com/api/?mode=d&cnt=1&targetyyyy=${y}&targetmm=${m}&targetdd=${d}`;
  return (await (await fetch(url)).json()).datelist[`${y}-${m}-${d}`];
}

/* ---------- 3. Embed ---------- */
const pick = arr => arr[Math.floor(Math.random()*arr.length)];

function horoEmbeds(list){
  return SIGNS.map((s,i)=>{
    const m = SIGN_META[s];
    return {
      title: `${m.e} ${m.n} – 今日の運勢`,
      description: list[i].slice(0,1800),
      color: m.c,
      fields: [
        { name:"ラッキーカラー", value:pick(COLORS), inline:true },
        { name:"ラッキーアイテム", value:pick(ITEMS), inline:true }
      ],
      footer: { text:"提供: API Ninjas + DeepL" },
      timestamp:new Date().toISOString()
    };
  });
}

function koyomiEmbed(k){
  const f = v=>v?"✅":"❌";
  return {
    title:"📅 今日の暦",
    color:0xF1C40F,
    fields:[
      {name:"旧暦", value:`${k.inreki}${k.kyurekid}日`, inline:true},
      {name:"六曜", value:k.rokuyou, inline:true},
      {name:"節気", value:k.sekki||"－", inline:true},
      {name:"干支", value:`${k.zyusi}${k.zyunisi}`, inline:true},
      {name:"祝日", value:k.holiday||"なし", inline:false},
      {name:"一粒万倍日", value:f(k.hitotubuflg), inline:true},
      {name:"天赦日", value:f(k.tensyabiflg), inline:true},
      {name:"大明日", value:f(k.daimyoubiflg), inline:true}
    ],
    footer:{ text:k.date },
    timestamp:new Date().toISOString()
  };
}

async function send(embeds){
  const url = process.env.DISCORD_WEBHOOK_URL;
  for(let i=0;i<embeds.length;i+=10){
    await fetch(url,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ embeds: embeds.slice(i,i+10) })
    });
  }
}

/* ---------- 4. MAIN ---------- */
(async()=>{
  const now = new Date(Date.now()+9*3600*1000);     // JST 補正
  const [list,koyomi] = await Promise.all([
    Promise.all(SIGNS.map(getHoroscopeJa)),
    getKoyomi(now)
  ]);
  await send(horoEmbeds(list));        // 12 Embed (10+2)
  await send([koyomiEmbed(koyomi)]);   // 暦 Embed
})();