import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zakxvbtulxvislwfhwlh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpha3h2YnR1bHh2aXNsd2Zod2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjgxODgsImV4cCI6MjA2NzQ0NDE4OH0.u6euNXvytN-MvV8w1oBN32UFDFV11PrqC7RBexUfq7k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);