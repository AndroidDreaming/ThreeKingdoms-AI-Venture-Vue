const gameVision = '1.0.1';
const gameTitle = '三国模拟人生';
const gameSubtitle = '大模型文字大冒险';

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