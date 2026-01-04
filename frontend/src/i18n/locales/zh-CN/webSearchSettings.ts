export default {
    title: "网络搜索配置",
    description:
      "配置网络搜索功能，在回答问题时可以从互联网获取实时信息补充知识库内容",
    providerLabel: "搜索引擎提供商",
    providerDescription: "选择用于网络搜索的搜索引擎服务",
    providerPlaceholder: "选择搜索引擎...",
    apiKeyLabel: "API 密钥",
    apiKeyDescription: "输入所选搜索引擎的 API 密钥",
    apiKeyPlaceholder: "请输入 API 密钥",
    maxResultsLabel: "最大结果数",
    maxResultsDescription: "每次搜索返回的最大结果数量（1-50）",
    includeDateLabel: "包含发布日期",
    includeDateDescription: "在搜索结果中包含内容的发布日期信息",
    compressionLabel: "压缩方法",
    compressionDescription: "对搜索结果内容的压缩处理方法",
    compressionNone: "无压缩",
    compressionSummary: "LLM 摘要",
    blacklistLabel: "URL 黑名单",
    blacklistDescription:
      "排除特定域名或 URL 的搜索结果，每行一个。支持通配符（*）和正则表达式（以/开头和结尾）",
    blacklistPlaceholder: "例如：\n*://*.example.com/*\n/example\\.(net|org)/",
    errors: {
      unknown: "未知错误",
    },
    toasts: {
      loadProvidersFailed: "加载搜索引擎列表失败: {message}",
      saveSuccess: "网络搜索配置已保存",
      saveFailed: "保存配置失败: {message}",
    },
  }
