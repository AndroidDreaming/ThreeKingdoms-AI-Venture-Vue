// src/services/memoryService.js
export default {
  methods: {
    async generateLongTermMemory() {
      const logsToSummarize = this.gameState.adventureLog.slice(-this.lsummaryInterval);
      if (logsToSummarize.length === 0) return;
      
      const logText = logsToSummarize.map(log => `回合 ${log.turn}: ${log.entry}`).join('\n');
      const summaryPrompt = `请总结以下游戏事件日志...\n\n${logText}`;
      
      try {
        const summary = await this.$api.generateLongTermMemory(summaryPrompt, this.model);
        this.longTermMemory.unshift(summary);
        
        if (this.longTermMemory.length > this.ltmMaxSize) {
          this.longTermMemory.pop();
        }
      } catch (error) {
        console.error("生成长时记忆时发生错误:", error);
      }
    }
  }
};