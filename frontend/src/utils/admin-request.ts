// 管理平台专用的请求工具
import axios from "axios";
import { generateRandomString } from "./index";

// API基础URL
const BASE_URL = import.meta.env.VITE_IS_DOCKER ? "" : "http://localhost:8080";

// 创建Axios实例
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-Request-ID": `${generateRandomString(12)}`,
  },
});

instance.interceptors.request.use(
  (config) => {
    // 使用管理平台的token
    const token = localStorage.getItem('weknora_admin_token');
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    config.headers["X-Request-ID"] = `${generateRandomString(12)}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    const { status, data } = response;
    if (status === 200 || status === 201) {
      return data;
    } else {
      return Promise.reject(data);
    }
  },
  async (error: any) => {
    if (!error.response) {
      return Promise.reject({ message: "网络错误，请检查您的网络连接" });
    }

    // 如果是401错误，清除token并跳转到登录页
    if (error.response.status === 401) {
      localStorage.removeItem('weknora_admin_token')
      localStorage.removeItem('weknora_admin_user')
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    
    const { status, data } = error.response;
    const errorMessage = typeof data === 'object' && data?.error?.message 
      ? data.error.message 
      : (typeof data === 'object' ? data?.message : data);
    return Promise.reject({ 
      status, 
      message: errorMessage,
      ...(typeof data === 'object' ? data : {}) 
    });
  }
);

export function get(url: string) {
  return instance.get(url);
}

export function post(url: string, data = {}, config?: any) {
  return instance.post(url, data, config);
}

export function put(url: string, data = {}) {
  return instance.put(url, data);
}

export function del(url: string, data?: any) {
  return instance.delete(url, { data });
}

