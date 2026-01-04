export default {
    title: "模型配置",
    description: "管理不同类型的 AI 模型，支持 Ollama 本地模型和远程 API",
    actions: {
      addModel: "添加模型",
      setDefault: "设为默认",
    },
    source: {
      remote: "Remote",
      openaiCompatible: "OpenAI兼容",
    },
    chat: {
      title: "对话模型",
      desc: "配置用于对话的大语言模型",
      empty: "暂无对话模型",
    },
    embedding: {
      title: "Embedding 模型",
      desc: "配置用于文本向量化的嵌入模型",
      empty: "暂无 Embedding 模型",
    },
    rerank: {
      title: "ReRank 模型",
      desc: "配置用于结果重排序的模型",
      empty: "暂无 ReRank 模型",
    },
    vllm: {
      title: "VLLM 视觉模型",
      desc: "配置用于视觉理解和多模态的视觉语言模型",
      empty: "暂无 VLLM 视觉模型",
    },
    toasts: {
      nameRequired: "模型名称不能为空",
      nameTooLong: "模型名称不能超过100个字符",
      baseUrlRequired: "Remote API 类型必须填写 Base URL",
      baseUrlInvalid: "Base URL 格式不正确，请输入有效的 URL",
      dimensionInvalid: "Embedding 模型必须填写有效的向量维度（128-4096）",
      updated: "模型已更新",
      added: "模型已添加",
      saveFailed: "保存模型失败",
      deleted: "模型已删除",
      deleteFailed: "删除模型失败",
      setDefault: "已设为默认模型",
      setDefaultFailed: "设置默认模型失败",
    },
    confirmDelete: "确定删除此模型吗？",
  }
