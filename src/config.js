const gameVision = '1.0.1';
const gameTitle = '汉末·往昔之影';
const gameSubtitle = '三国文字冒险游戏';

import prompt from "./configs/prompt";


const axiosConfig = {
  headers: {
    'Content-type': 'application/json'
  },
  timeout: 59000
}


export {
  gameVision,
  
  gameTitle,
  gameSubtitle,

  prompt,
  axiosConfig
}