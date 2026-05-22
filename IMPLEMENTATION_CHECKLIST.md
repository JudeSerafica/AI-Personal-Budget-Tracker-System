# Implementation Checklist - Supabase Setup

Use this checklist to track your progress through the setup process.

## 📋 Phase 1: Pre-Setup (Before You Begin)
- [ ] Create Supabase account at https://supabase.com
- [ ] Create a new Supabase project
- [ ] Wait for database to initialize
- [ ] Have email account ready (Gmail or SendGrid)
- [ ] Have OpenAI/Claude API key (optional, for AI features)
- [ ] Read QUICK_START.md to understand the process

## 🗄️ Phase 2: Database Setup

### Database Execution
- [ ] Open Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Create a new SQL query
- [ ] Copy entire content from supabase_setup.sql
- [ ] Paste into SQL Editor
- [ ] Execute the query
- [ ] Verify execution completed without errors
- [ ] Check that no error messages appear in response

### Verification Queries
- [ ] Run: `SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';`
  - Expected: Should show 8 or more tables
- [ ] Run: `SELECT COUNT(*) FROM categories;`
  - Expected: Should show 18 (12 expense + 6 income categories)
- [ ] Run: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
  - Expected tables:
    - [ ] accounts
    - [ ] categories
    - [ ] email_verifications
    - [ ] sessions
    - [ ] user_profiles
    - [ ] users
    - [ ] verification_tokens
    - [ ] transactions

### Security Verification
- [ ] Run: `SELECT count(*) FROM pg_policies;`
  - Expected: Should show many policies (20+)
- [ ] Run: `SELECT tablename FROM pg_tables WHERE rowsecurity = true;`
  - Expected: All 8 tables should have RLS enabled

## 🔑 Phase 3: Get Your API Keys

### From Supabase Dashboard
- [ ] Go to Settings → API
- [ ] Copy and save: **Project URL**
  - Value: `https://[your-project].supabase.co`
- [ ] Copy and save: **anon public key**
  - Value starts with `eyJ...`
- [ ] Copy and save: **service_role key**
  - ⚠️ KEEP THIS SECRET! Don't share or commit to git

### From Supabase Database Settings
- [ ] Go to Settings → Database
- [ ] Copy and save: **URI**
  - Format: `postgresql://postgres:password@[host]:5432/postgres`

## 📝 Phase 4: Environment Variables

### Create .env.local File
- [ ] Create new file named `.env.local` in project root
- [ ] Copy content from `.env.example`
- [ ] DO NOT commit this file to git (should be in .gitignore)

### Fill in Required Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your service_role key
- [ ] `DATABASE_URL` = Your PostgreSQL URI

### Fill in Email Configuration

**Option A: Gmail Setup**
- [ ] Go to https://myaccount.google.com
- [ ] Select Security in left menu
- [ ] Enable 2-Step Verification (if not already)
- [ ] Search for "App passwords"
- [ ] Select Mail and your device
- [ ] Generate app password
- [ ] Copy app password
- [ ] Add to .env.local:
  - [ ] `SMTP_HOST=smtp.gmail.com`
  - [ ] `SMTP_PORT=587`
  - [ ] `SMTP_USER=your-email@gmail.com`
  - [ ] `SMTP_PASSWORD=your-app-password` (16 character password)
  - [ ] `EMAIL_FROM=your-email@gmail.com`
  - [ ] `EMAIL_FROM_NAME=AI Budget Tracker`

**Option B: SendGrid Setup** (if not using Gmail)
- [ ] Create SendGrid account at https://sendgrid.com
- [ ] Generate API key
- [ ] Add to .env.local:
  - [ ] `SENDGRID_API_KEY=SG.your-key`
  - [ ] `EMAIL_FROM=noreply@yourdomain.com`

### (Optional) AI Features
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
  - [ ] Add `OPENAI_API_KEY=sk-...`
  - [ ] Add `AI_MODEL=gpt-4-turbo`
- OR
- [ ] Get Claude API key from https://console.anthropic.com/
  - [ ] Add `ANTHROPIC_API_KEY=sk-ant-...`
  - [ ] Add `AI_MODEL=claude-3-opus-20240229`

### Verify .env.local
- [ ] Verify file is in project root
- [ ] Verify all required variables are set
- [ ] Verify .env.local is in .gitignore
- [ ] Save the file

## 💾 Phase 5: Install Dependencies

### Install Node Modules
- [ ] Open terminal in project root
- [ ] Run: `bun install` (or `npm install` / `yarn install`)
- [ ] Wait for installation to complete
- [ ] Check for any error messages

### Verify Installation
- [ ] Run: `bun list` or `npm list` to verify key packages installed:
  - [ ] @supabase/supabase-js
  - [ ] @prisma/client
  - [ ] next
  - [ ] react

## 🚀 Phase 6: Start Development Server

### Launch Server
- [ ] Run: `bun run dev` (or `npm run dev`)
- [ ] Wait for compilation to complete
- [ ] Look for message: "ready - started server on ... url: http://localhost:3000"
- [ ] No errors should appear in terminal

### Verify Server is Running
- [ ] Open browser
- [ ] Navigate to http://localhost:3000
- [ ] Page should load without errors
- [ ] Check browser console (F12 → Console) for errors

## ✅ Phase 7: Test Signup Flow

### Test Email Verification
- [ ] Click "Sign Up" or navigate to http://localhost:3000/signup
- [ ] Enter test email (e.g., test@example.com)
- [ ] Enter test password (8+ characters)
- [ ] Click "Sign Up"
- [ ] Check email inbox for verification code
  - [ ] Email received within 1 minute
  - [ ] Email contains 6-digit code
  - [ ] Email is from configured sender
- [ ] Copy verification code
- [ ] Enter code on verification page
- [ ] Click "Verify"
- [ ] Should redirect to login or dashboard

### Verify in Database
- [ ] Go to Supabase SQL Editor
- [ ] Run: `SELECT * FROM public.email_verifications;`
  - [ ] Should see your test email record
- [ ] Run: `SELECT * FROM public.users;`
  - [ ] Should see your test user record
- [ ] Run: `SELECT * FROM public.sessions WHERE user_id = '[your-user-id]';`
  - [ ] Should see session record

## 💰 Phase 8: Test Transaction Creation

### Add Sample Transactions
- [ ] Log in to dashboard (if not already)
- [ ] Navigate to Transactions page
- [ ] Click "Add Transaction" or "New Transaction"
- [ ] Fill in transaction details:
  - [ ] Amount: 500 (for expense) or 5000 (for income)
  - [ ] Category: Food & Dining
  - [ ] Type: Expense
  - [ ] Description: "Test transaction"
  - [ ] Date: Today
- [ ] Click "Save" or "Add"
- [ ] Transaction should appear in list

### Add Multiple Transactions
- [ ] Add 5-10 transactions with different:
  - [ ] Categories (Food, Transport, Shopping, etc.)
  - [ ] Amounts (various values)
  - [ ] Types (mix of income and expenses)
  - [ ] Dates (spread over last 30 days)

### Verify in Database
- [ ] Go to Supabase SQL Editor
- [ ] Run: `SELECT COUNT(*) FROM public.transactions WHERE user_id = '[your-user-id]';`
  - [ ] Should show count of your transactions
- [ ] Run: `SELECT * FROM public.transactions WHERE user_id = '[your-user-id]' LIMIT 5;`
  - [ ] Should see your transaction records
- [ ] Run: `SELECT * FROM get_user_transaction_summary('[your-user-id]'::uuid);`
  - [ ] Should show totals, counts, etc.

## 📊 Phase 9: Test Analytics Features

### Category Breakdown
- [ ] Go to SQL Editor
- [ ] Run: `SELECT * FROM get_category_breakdown('[your-user-id]'::uuid, 30);`
  - [ ] Should see categories and spending amounts
  - [ ] Percentages should add up to ~100%

### Spending Trends
- [ ] Check Insights page (if available)
- [ ] Should see charts/graphs of spending
- [ ] Category breakdown should be visible
- [ ] Income vs Expense summary should show

### AI Insights (Optional)
- [ ] Go to Chat/Insights page
- [ ] Should see AI-generated recommendations
- [ ] Ask a question about spending
- [ ] Should get AI response with insights

## 🔐 Phase 10: Security Verification

### Row Level Security (RLS)
- [ ] Create second test user account
- [ ] Log in as second user
- [ ] User should NOT see first user's transactions
- [ ] Run: `SELECT * FROM public.transactions;` in SQL Editor as second user
  - Should only see own transactions

### Email Security
- [ ] Verify passwords are not exposed in API responses
- [ ] Check that SUPABASE_SERVICE_ROLE_KEY is not in client-side code
- [ ] Verify .env.local is not committed to git
- [ ] Run: `git status` to confirm .env.local is ignored

### Policy Verification
- [ ] Run: `SELECT * FROM pg_policies WHERE tablename = 'transactions';`
  - [ ] Should see RLS policies defined
- [ ] Check each table has multiple policies

## 📦 Phase 11: Cleanup and Production Ready

### Clean Up Test Data
- [ ] Delete test transactions (optional, for clean start)
- [ ] Delete test users (optional)
- [ ] Clear verification tokens if needed

### Set Up Cron Jobs (Optional but Recommended)
- [ ] Go to Supabase Database Webhooks or cron settings
- [ ] Set up daily cleanup of expired records:
  - [ ] `cleanup_expired_verifications()`
  - [ ] `cleanup_expired_sessions()`
  - [ ] `cleanup_expired_tokens()`

### Enable Backups
- [ ] Go to Supabase Settings → Backups
- [ ] Enable daily backups
- [ ] Verify backup retention policy

## 📚 Phase 12: Documentation Review

- [ ] Review QUICK_START.md for key steps
- [ ] Review SUPABASE_SETUP_GUIDE.md for detailed instructions
- [ ] Review DATABASE_SCHEMA_REFERENCE.md for database details
- [ ] Bookmark DATABASE_SCHEMA_REFERENCE.md for future reference

## 🎯 Phase 13: Ready for Development

- [ ] All phases 1-12 completed
- [ ] System is running locally
- [ ] Database is set up and verified
- [ ] Authentication flow works
- [ ] Transactions can be created and viewed
- [ ] Email verification works
- [ ] RLS policies are enforced
- [ ] No errors in console or terminal

## 🚢 Phase 14: Pre-Production (Before Deployment)

- [ ] Security checklist completed
- [ ] All features tested
- [ ] Performance tested with 100+ transactions
- [ ] Email templates customized
- [ ] Analytics verified
- [ ] Backup schedule enabled
- [ ] Monitoring set up (optional)
- [ ] Production .env variables prepared

---

## ⚠️ Common Issues Checklist

If you encounter problems:

### Database Connection Issues
- [ ] Verify NEXT_PUBLIC_SUPABASE_URL is correct (not including protocol)
- [ ] Verify SUPABASE_SERVICE_ROLE_KEY is set
- [ ] Check Supabase database is running (check status page)
- [ ] Verify your IP is not blocked by firewall

### Email Not Sending
- [ ] Verify SMTP_USER and SMTP_PASSWORD are correct
- [ ] For Gmail: Verify you used "App Password" not regular password
- [ ] Check spam/promotions folder
- [ ] Verify email service configuration in lib/email.ts
- [ ] Check server logs for error messages

### Transactions Not Saving
- [ ] Verify user is authenticated (check auth token)
- [ ] Check transactions table exists: `SELECT * FROM public.transactions LIMIT 1;`
- [ ] Verify user_id in transaction matches authenticated user
- [ ] Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'transactions';`

### Permission Denied Errors
- [ ] Check RLS policies are correctly configured
- [ ] Verify auth.uid() is not null (user is authenticated)
- [ ] Check user_id matches authenticated user ID
- [ ] Verify foreign key relationships

## 📞 Getting Help

If stuck on any step:
1. Check the relevant markdown file (QUICK_START.md, DATABASE_SCHEMA_REFERENCE.md, etc.)
2. Search for error message in Supabase documentation
3. Check browser console (F12 → Console) for client-side errors
4. Check terminal for server-side errors
5. Review Supabase logs (Dashboard → Logs)

---

## ✨ Success Indicators

You know everything is working when:
- ✅ Signup flow completes with email verification
- ✅ User accounts are created in database
- ✅ Transactions are saved and retrieved correctly
- ✅ Users can only see their own data (RLS working)
- ✅ Category filtering works
- ✅ Analytics show correct calculations
- ✅ No errors in console or terminal
- ✅ All transactions appear in correct order
- ✅ Email verification codes expire after 5 minutes

---

**Last Updated**: May 2026  
**Status**: ✅ Ready to Deploy
