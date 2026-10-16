'use strict';
// ============ Supabase: the project (accounts, coins, the shop: account.js; the admin page: admin/admin.js) ============
// Fill in SB.url and SB.key from the Supabase dashboard: the project's Connect button (or Project Settings → API Keys) shows the
// Project URL (https://<ref>.supabase.co) and the publishable key (sb_publishable_…; the legacy "anon public" eyJ… key works too).
// Both are meant to be public: the tables are guarded by row level security and every coin change happens inside the database
// functions in supabase/schema.sql. Never put the secret / service_role key here. Left empty, accounts are off and every gun
// stays open as before.
// SB.oauth: the social sign-in buttons the game may show, e.g. ['google','kakao']. v6.66: a button shows only while that provider
// is switched on in the project (Authentication → Sign In / Providers): the game asks the project's public auth settings
// (/auth/v1/settings) once, so listing a provider here before it is set up shows nothing.
const SB={url:'https://qoavmnovajakmfwqixiu.supabase.co',key:'sb_publishable_Pn-fNd9t03i6cOOGxoBbtQ_dRMChz_a',oauth:['google']};
if(typeof window!=='undefined'&&window.QZ_SB)Object.assign(SB,window.QZ_SB);// (the test harness points this at a mock)
