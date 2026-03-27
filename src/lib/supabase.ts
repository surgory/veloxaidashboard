import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pkewsjitwjleaiogdbgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZXdzaml0d2psZWFpb2dkYmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzQ3OTUsImV4cCI6MjA5MDIxMDc5NX0.eGeoa-Ezs1CLGnImaKLfoLw6j3azew0Z-2gNpX827B4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
