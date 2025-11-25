import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qckutlnfxdkubghsjlwc.supabase.co';
// The anon key is safe to be exposed in the browser as long as Row Level Security (RLS) is enabled.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja3V0bG5meGRrdWJnaHNqbHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDk1MzcsImV4cCI6MjA3OTUyNTUzN30.Qcwtz0KKLIX2pD-RVkoh7fGBDziz-6xUwE6lm_4l9jo';

export const supabase = createClient(supabaseUrl, supabaseKey);