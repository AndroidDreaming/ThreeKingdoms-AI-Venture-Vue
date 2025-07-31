/* eslint-disable eqeqeq */
import Vue from 'vue'
import axios from 'axios'
import {axiosConfig} from '../config.js'

// 请求接口封装
// -------
// 获取vue实例
let app = Vue.prototype
// 请求队列长度，出入栈后队列长度为0时隐藏loading
let questQuery = 0
let shortQuestQueue = [];  //短期操作过的队列
let shortQuestQueueTimeDuration = 200;  //ms，短期操作过的队列的判定间隔，在间隔里面只能存在一个相同的请求

const instance = axios.create(axiosConfig)

// 请求前的拦截，处理各种验证，显示loading
instance.interceptors.request.use(config => {
  let existSameQuest = validQuestQueue(config); //是否存在同样的请求
  if(existSameQuest) {
    app.$message.warning('请勿频繁操作');
    questQuery += 1 //即使是reject，也要+1，下面是会走到respond板块的
    return Promise.reject(`操作频繁`);
  }

  config.data = JSON.stringify(config.data)
  questQuery += 1
  app.$loading()
  return config
}, error => {
  app.$message.error('未能通过服务器验证')
  return Promise.reject(error)
})

/**
 * 检查是否短期内存在同样的请求，如果是的话就不让请求了
 * @param {Object} config 
 */
const validQuestQueue = config => {
  let currentTime = (new Date()).getTime();  //请求的时间节点
  let existSameQuest = false;  //是否存在同样的请求
  let questBaseInfo = {
    requestLog: `${config.url};${JSON.stringify(config.params || '{}')};${JSON.stringify(config.data || '{}')}`,  //请求体拼接
    time: currentTime  //请求的时间节点
  }
  for(let i = shortQuestQueue.length - 1; i >= 0; i--) {
    let item = shortQuestQueue[i];
    if(currentTime - item.time > shortQuestQueueTimeDuration) {
      // 已经超过了判定时间的，给清理掉
      shortQuestQueue.splice(i, 1);
    }
  }
  for(let i = 0; i < shortQuestQueue.length; i++) {
    let item = shortQuestQueue[i];
    if(item.requestLog == questBaseInfo.requestLog) {
      // 短期内存在同样的请求，并且时间没有超过允许的判定间隔
      existSameQuest = true;
      break;
    }
  }
  if(!existSameQuest) shortQuestQueue.push(questBaseInfo);  //不存在的请求记录，记录起来
  return existSameQuest;

}

// 请求后的拦截，隐藏loading
instance.interceptors.response.use(res => {
  questQuery -= 1
  // 队列长度为0，所有请求执行完毕，隐藏loading
  // eslint-disable-next-line
  if (questQuery <= 0) {
    app.$loading().close();
    questQuery = 0;
  }

  // 需要return响应值回去，不然后面无法拿到值
  return res
}, error => {
  questQuery -= 1
  // 队列长度为0，所有请求执行完毕，隐藏loading
  if (questQuery <= 0) {
    app.$loading().close();
    questQuery = 0;
  }
  
  if(error != '操作频繁') app.$message.error('请求出错'); //多一步判定，操作频繁不用弹错
  // return异常信息,为下面的方法能catch到错误信息
  return Promise.reject(error)
})

const get = (url, data, handler, errorHandler) => {
  instance.get(url, {
    params: data
  }).then(respond => {
    handlerResponse(respond, handler, errorHandler)
  }).catch(err => {
    if (errorHandler && typeof errorHandler === 'function') errorHandler()
    if(err != '操作频繁') console.log('err', err)
  })
}

const post = (url, data, handler, errorHandler) => {
  instance.post(url, data).then(respond => {
    handlerResponse(respond, handler, errorHandler)
  }).catch(err => {
    if (errorHandler && typeof errorHandler === 'function') errorHandler()
    if(err != '操作频繁') console.log('err', err)
  })
}

// -------
// 请求接口到此结束


const slientInstance = axios.create(axiosConfig)

// 请求前的拦截，处理各种验证，显示loading
slientInstance.interceptors.request.use(config => {
  let existSameQuest = validQuestQueue(config); //是否存在同样的请求
  if(existSameQuest) {
    app.$message.warning('请勿频繁操作');
    return Promise.reject(`操作频繁`);
  }

  // 在这里传token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = token
  }
  config.headers.randStr = (new Date()).getTime() + Math.floor(1000 * Math.random())
  config.data = JSON.stringify(config.data)
  return config
}, error => {
  app.$message.error('未能通过服务器验证')
  return Promise.reject(error)
})

// 请求后的拦截，隐藏loading
slientInstance.interceptors.response.use(res => {
  return res
}, error => {
  if(error != '操作频繁') app.$message.error('请求出错'); //多一步判定，操作频繁不用弹错
  // return异常信息,为下面的方法能catch到错误信息
  return Promise.reject(error)
})

const sGet = (url, data, handler, errorHandler) => {
  slientInstance.get(url, {
    params: data
  }).then(respond => {
    handlerResponse(respond, handler, errorHandler)
  }).catch(err => {
    if (errorHandler && typeof errorHandler === 'function') errorHandler()
    if(err != '操作频繁') console.log('err', err)
  })
}

const sPost = (url, data, handler, errorHandler) => {
  slientInstance.post(url, data).then(respond => {
    handlerResponse(respond, handler, errorHandler)
  }).catch(err => {
    if (errorHandler && typeof errorHandler === 'function') errorHandler()
    if(err != '操作频繁') console.log('err', err)
  })
}


// 错误处理
const handlerResponse = (respond, handler, errorHandler) => {
  console.log('respond', respond)
  let res = respond.data
  if (respond.statusText == 'OK') {
    if (handler && typeof handler === 'function') handler(res)
  } else {
    console.error('请求错误', `API 请求失败: ${respond}`)
    app.$message.error(res.msg)
    if (errorHandler && typeof errorHandler === 'function') errorHandler(res)
  }
}

export default {
  get,
  post,
  sGet,
  sPost
}
