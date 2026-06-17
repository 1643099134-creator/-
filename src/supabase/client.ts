/**
 * NOTE: 原文件由 Meoo Cloud 生成。为支持本地化部署，已修改为优先使用 Vite 环境变量。
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function getSupabaseUrl(): string {
  const viteUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const meooUrl = (window as any).MEOO_CONFIG?.meoo_app_access_url || '';

  if (viteUrl) {
    return viteUrl.includes('/sb-api') ? viteUrl : `${viteUrl.replace(/\/$/, '')}/sb-api`;
  }

  if (meooUrl) {
    return meooUrl.includes('/sb-api') ? meooUrl : `${meooUrl.replace(/\/$/, '')}/sb-api`;
  }

  return `${window.location.origin}/sb-api`;
}

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
// 如果未提供 anon key，则返回一个本地 Mock supabase，避免运行时对外请求
function createMockSupabase() {
  class MockQuery {
    order() { return this; }
    select() { return this; }
    insert() { return this; }
    update() { return this; }
    delete() { return this; }
    eq() { return this; }
    maybeSingle() { return this; }
    then(resolve: any) {
      // 默认返回空数据
      resolve({ data: [], error: null });
    }
  }

  return {
    auth: {
      async getSession() { return { data: { session: null } }; },
      async signUp() { return { data: null, error: null }; },
      async signInWithPassword() { return { data: null, error: null }; },
      async signOut() { return { error: null }; },
      async getUser() { return { data: { user: null }, error: null }; },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    from() {
      return new MockQuery();
    },
    channel() {
      return {
        on() { return this; },
        subscribe() { return { unsubscribe: () => {} }; },
        unsubscribe() {},
      };
    },
  } as any;
}

export const supabase = supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : createMockSupabase();
