// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ihvryytvamxzaejcdlyg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodnJ5eXR2YW14emFlamNkbHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDk4OTUsImV4cCI6MjA2NTk4NTg5NX0.kzyvYmDFdymC7xDJ-QTh8pFm9JDm4rNypYGP-Rre_Bk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);