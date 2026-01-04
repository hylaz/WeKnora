export default {
    selectTemplate: "选择模板",
    useTemplate: "使用模板",
    withKnowledgeBase: "知识库",
    withWebSearch: "网络搜索",
    systemPrompt: {
      defaultKB: {
        name: "知识库问答助手",
        desc: "基础的知识库问答模板，适用于大多数场景",
      },
      expert: {
        name: "领域专家助手",
        desc: "专业深入的解答风格，适合技术或专业领域",
      },
      customerService: {
        name: "客服助手",
        desc: "友善热情的服务风格，适合客户服务场景",
      },
      techSupport: {
        name: "技术支持",
        desc: "专业的技术问题解答，包含代码示例",
      },
      pureChat: {
        name: "通用对话",
        desc: "不依赖知识库的通用对话助手",
      },
      webSearch: {
        name: "网络搜索助手",
        desc: "结合网络搜索获取最新信息",
      },
    },
    contextTemplate: {
      default: {
        name: "标准模板",
        desc: "基础的上下文模板，清晰展示参考资料和问题",
      },
      detailed: {
        name: "详细模板",
        desc: "包含详细说明和回答要求的完整模板",
      },
      simple: {
        name: "简洁模板",
        desc: "精简的模板格式，适合简单问答场景",
      },
      qa: {
        name: "问答模板",
        desc: "针对问答场景优化的模板",
      },
    },
    rewriteSystem: {
      default: {
        name: "标准改写",
        desc: "消解指代、补全省略的标准改写规则",
      },
      strict: {
        name: "严格改写",
        desc: "更严格的改写要求，确保问题完整独立",
      },
    },
    rewriteUser: {
      default: {
        name: "标准格式",
        desc: "包含对话历史和当前问题的标准格式",
      },
      detailed: {
        name: "详细格式",
        desc: "带有任务说明的详细格式",
      },
    },
    fallback: {
      default: {
        name: "标准兜底",
        desc: "友好告知无法回答并提供建议",
      },
      polite: {
        name: "礼貌兜底",
        desc: "更加礼貌详细的无法回答提示",
      },
      brief: {
        name: "简洁兜底",
        desc: "简短的无法回答提示",
      },
      model: {
        name: "模型兜底提示",
        desc: "引导模型基于通用知识回答的提示词",
      },
    },
  }
