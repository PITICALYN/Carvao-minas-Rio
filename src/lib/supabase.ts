import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock for simulation if credentials are missing or placeholders
const isPlaceholder = !supabaseUrl || supabaseUrl.includes('INSIRA_AQUI');

const mockSupabase = new Proxy({}, {
    get: (_target, prop) => {
        if (prop === 'from') {
            return (table: string) => {
                const chain: any = {
                    select: () => chain,
                    insert: () => chain,
                    update: () => chain,
                    upsert: () => chain,
                    delete: () => chain,
                    eq: () => chain,
                    single: () => chain,
                    order: () => chain,
                    limit: () => chain,
                    // Handle as Promise
                    then: (onfulfilled: any) => {
                        let data: any = [];
                        if (table === 'users_table') {
                            data = [{ id: 'admin', name: 'Administrador', username: 'admin', password: '123', role: 'Admin', can_print: true }];
                        }
                        return Promise.resolve(onfulfilled({ data, error: null }));
                    }
                };
                return chain;
            };
        }
        return () => Promise.resolve({ data: null, error: null });
    }
});

export const supabase = isPlaceholder
    ? (mockSupabase as any)
    : createClient(supabaseUrl || '', supabaseAnonKey || '');
