export default {
    title: "MCP 服务管理",
    description:
      "管理外部 MCP (Model Context Protocol) 服务，在 Agent 模式下调用外部工具和资源",
    configuredServices: "已配置的服务",
    manageAndTest: "管理和测试 MCP 服务连接",
    addService: "添加服务",
    empty: "暂无 MCP 服务",
    addFirst: "添加第一个 MCP 服务",
    actions: {
      test: "测试连接",
    },
    toasts: {
      loadFailed: "加载 MCP 服务列表失败",
      enabled: "已启用 MCP 服务",
      disabled: "已禁用 MCP 服务",
      updateStateFailed: "更新 MCP 服务状态失败",
      testing: "正在测试 {name}...",
      noResponse: "测试失败：未收到服务器响应",
      testFailed: "测试 MCP 服务失败",
      deleted: "MCP 服务已删除",
      deleteFailed: "删除 MCP 服务失败",
    },
    deleteConfirmBody: '确定要删除 MCP 服务"{name}"吗？此操作无法撤销。',
    unnamed: "未命名",
  }
