export default {
    create: "新建知识库",
    createFAQ: "新建 FAQ 知识库",
    subtitle: "管理和组织您的知识库，支持文档型和问答型知识库",
    uninitializedBanner:
      "部分知识库尚未初始化，需要先在设置中配置模型信息才能添加知识文档",
    empty: {
      title: "暂无知识库",
      description: '点击左侧快捷操作"新建知识库"按钮创建第一个知识库',
    },
    delete: {
      confirmTitle: "删除确认",
      confirmMessage: '确认要删除知识库"{name}"？删除后不可恢复',
      confirmButton: "确认删除",
    },
    messages: {
      deleted: "已删除",
      deleteFailed: "删除失败",
      file: "文件",
      knowledgeBase: "知识库",
      noResult: "无结果",
    },
    features: {
      knowledgeGraph: "已启用知识图谱",
      multimodal: "已启用多模态",
      questionGeneration: "已启用问题生成",
    },
    processing: "正在处理导入任务",
    processingDocuments: "正在处理 {count} 个文档",
    stats: {
      documents: "文档数量",
      faqEntries: "问答条目",
      chunks: "分块数量",
    },
    uploadProgress: {
      uploadingTitle: "正在向「{name}」上传文件夹中的文档",
      detail: "已完成 {completed}/{total} 个文件",
      keepPageOpen: "请保持页面打开，上传完成后会自动刷新解析状态。",
      completedTitle: "「{name}」的上传已完成",
      completedDetail: "共上传 {total} 个文件，正在刷新列表查看解析状态...",
      refreshing: "正在刷新列表并获取最新解析状态...",
      errorTip: "部分文件上传失败，请查看右上角通知详情。",
      unknownKb: "知识库 {id}",
    },
  }
