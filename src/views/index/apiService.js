import { END_PROMPT_TEMPLATE, MEMORY_FORMAT, ERROR_MESSAGES, DEFAULT_VALUES } from '@/configs/end_prompt.js';
export default {
  methods: {
    async callChatAPI(prompt, model) {
      const params = { prompt, model };
      return new Promise((resolve, reject) => {
        this.$post('/game/api/chat', params, res => {
          if (!res?.choices?.[0]?.message?.content) {
            reject(new Error('API返回数据格式错误：缺少choices或message字段'));
            return;
          }
          resolve(res);
        }, error => {
          reject(error);
        });
      });
    },

    async generateAdventure(prompt, model) {
      try {
        const res = await this.callChatAPI(prompt, model);
        return this.parseAIResponse(res.choices[0].message.content);
      } catch (error) {
        console.error("冒险生成失败:", error);
        throw error;
      }
    },

    async generateLongTermMemory(prompt, model) {
      try {
        const res = await this.callChatAPI(prompt, model);
        return this.parseAIResponse(res.choices[0].message.content);
      } catch (error) {
        console.error("长时记忆生成失败:", error);
        throw error;
      }
    },

    parseAIResponse(contentString) {
      // 尝试提取JSON代码块
      const match = contentString.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = match ? match[1] : contentString;

      try {
        return JSON.parse(jsonStr);
      } catch (firstError) {
        console.log("首次JSON解析失败，尝试修复:", firstError.message);
        const fixedJsonString = this.tryFixIncompleteJson(jsonStr);
        return JSON.parse(fixedJsonString);
      }
    },
      generateImage(prompt) {
      if (!this.enableImageRendering) {
        console.log('图片渲染未开启，跳过图片生成。');
        this.currentSceneImg = '';  // 可选清空图像
        this.aiLoading = false;
        return;
      }
      try {
          
          // 检查是否是本地文件访问
          const isLocalFile = window.location.protocol === 'file:';
          let imageUrl;
          
          if (isLocalFile) {
              // 本地文件访问时直接使用pollinations API
              imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=800&height=600&model=flux`;
          } else {
              // 通过后端API生成图片
              this.$sPost('/game/api/image', { prompt: prompt, width: 800, height: 600, nologo: true, model: 'flux' }, res => {
                const data = res || {};
                if (!data.success || !data.imageUrl) {
                    throw new Error('图片生成失败');
                }
                
                this.currentSceneImg = data.imageUrl;
                console.log('图片生成成功:', data);
              });
              
          }
          
      } catch (error) {
          console.error('图片生成错误:', error);
          // 使用备用图片
          const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRlY2RjNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS/ruS7meS4lueVjO+8muS6kea4uuS7meWcnzwvdGV4dD4KPC9zdmc+';
          this.currentSceneImg = fallbackUrl;
          this.aiLoading = false;
      }
    },

    // 尝试修复不完整的JSON
    tryFixIncompleteJson(jsonStr) {
      jsonStr = jsonStr.replace(/undefined/g, 'null')
              .replace(/<!--[\s\S]*?-->/g, '');
      jsonStr = jsonStr.trim();
      
      // 尝试找到最后一个有效的JSON字符（'}' 或 ']' 或 '"'）
      const lastBrace = jsonStr.lastIndexOf('}');
      const lastBracket = jsonStr.lastIndexOf(']');
      const lastQuote = jsonStr.lastIndexOf('"');
      const lastNumber = jsonStr.search(/[0-9]\s*$/);

      const lastValidCharIndex = Math.max(lastBrace, lastBracket, lastQuote, lastNumber);

      // 如果字符串在最后一个有效字符后还有内容，说明可能被截断了
      if (lastValidCharIndex !== -1 && lastValidCharIndex < jsonStr.length - 1) {
          // 截断到最后一个有效字符
          jsonStr = jsonStr.substring(0, lastValidCharIndex + 1);
      }
      
      // 重新计算括号和花括号的配平
      let openBraces = (jsonStr.match(/{/g) || []).length;
      let closeBraces = (jsonStr.match(/}/g) || []).length;
      let openBrackets = (jsonStr.match(/\[/g) || []).length;
      let closeBrackets = (jsonStr.match(/\]/g) || []).length;

      // 闭合未闭合的括号
      while (openBrackets > closeBrackets) {
          jsonStr += ']';
          closeBrackets++;
      }
      
      // 闭合未闭合的花括号
      while (openBraces > closeBraces) {
          jsonStr += '}';
          closeBraces++;
      }

      return jsonStr;
  },
}


}