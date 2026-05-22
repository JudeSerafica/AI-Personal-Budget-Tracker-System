# Supabase Setup Guide - AI Personal Budget Tracker System

## Overview
This guide will help you set up your Supabase database for the AI Personal Budget Tracker System.

## Prerequisites
- A Supabase account (https://supabase.com)
- A Supabase project created
- Access to your project's SQL editor

## Step-by-Step Setup Instructions

### 1. Access Supabase SQL Editor
1. Log in to your Supabase dashboard
2. Select your project
3. Navigate to **SQL Editor** from the left sidebar
4. Click **+ New Query** to create a new SQL query

### 2. Copy and Execute the SQL Script
1. Open the `supabase_setup.sql` file from this project
2. Copy all the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

The script will automatically:
- Create all necessary tables
- Set up foreign keys and relationships
- Configure Row Level Security (RLS) policies
- Create indexes for performance
- Insert default transaction categories
- Set up storage buckets
- Create utility functions and views

### 3. Verify the Setup
Run these verification queries in the SQL Editor:

```sql
-- Check if all tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check default categories
SELECT * FROM public.categories LIMIT 10;

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database (if using Prisma)
DATABASE_URL=postgresql://postgres:your_password@your-project.supabase.co:5432/postgres
```

### Getting Your Keys
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copy the **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copy the **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - keep this secret!

## Database Tables Overview

### users
- Stores user account information
- Fields: id, email, name, image, created_at, updated_at, last_login

### transactions
- Stores all financial transactions (income/expenses)
- Fields: id, user_id, amount, description, category, type, date, created_at, updated_at
- Types: 'income' or 'expense'

### email_verifications
- Temporary storage for email verification codes during signup
- Fields: id, email, code, password, expires_at, created_at, verified
- Auto-deleted after expiry (5 minutes)

### categories
- Predefined transaction categories
- Includes 12 default expense categories and 6 default income categories
- Fields: id, name, description, icon, color, type, is_default, created_at

### accounts
- OAuth account integrations (Google, GitHub, etc.)
- Fields: id, user_id, type, provider, provider_account_id, tokens, etc.

### sessions
- User session management
- Fields: id, session_token, user_id, expires, created_at

### user_profiles
- Extended user profile information
- Fields: id, user_id, bio, currency, timezone, theme, notifications_enabled, created_at, updated_at

### verification_tokens
- Password reset and email verification tokens
- Fields: identifier, token, expires, created_at

## Key Features

### Row Level Security (RLS)
All tables have RLS policies enabled:
- Users can only access their own data
- Anonymous users can insert verification records during signup
- Categories are publicly readable

### Indexes for Performance
Multiple indexes created for fast queries:
- User lookups by email
- Transaction queries by user and date
- Category searches
- Session and token lookups

### Utility Functions
- `cleanup_expired_verifications()` - Removes expired verification codes
- `cleanup_expired_sessions()` - Removes expired sessions
- `cleanup_expired_tokens()` - Removes expired tokens
- `get_user_transaction_summary()` - Gets transaction totals
- `get_category_breakdown()` - Gets spending by category

### Database Views
- `user_transactions_view` - Transactions with category details
- `user_financial_summary` - User financial overview

## Setting Up Cleanup Jobs

To automatically clean up expired records, set up a cron job in Supabase:

1. Go to **Database** → **Cron Jobs** in your project settings
2. Create three new cron jobs:

**Job 1: Clean up expired verifications**
```
Function: cleanup_expired_verifications
Schedule: Every 1 hour (0 */1 * * *)
```

**Job 2: Clean up expired sessions**
```
Function: cleanup_expired_sessions
Schedule: Every 1 hour (0 */1 * * *)
```

**Job 3: Clean up expired tokens**
```
Function: cleanup_expired_tokens
Schedule: Every 1 hour (0 */1 * * *)
```

## Security Best Practices

1. **Service Role Key**: Never expose your service role key in client-side code. Use it only in backend API routes with proper authentication.

2. **RLS Policies**: Verify that RLS policies are working correctly by testing unauthorized access attempts.

3. **Email Verification**: Always verify email addresses before creating accounts to prevent spam.

4. **Password Hashing**: Hash passwords before storing (currently stored plain-text in email_verifications - consider using bcrypt in production).

5. **Rate Limiting**: Implement rate limiting on API endpoints to prevent abuse.

## Default Transaction Categories

### Expense Categories
1. Food & Dining - 🟨 Amber
2. Transportation - 🔴 Red
3. Shopping - 💗 Pink
4. Entertainment - 🟣 Purple
5. Healthcare - 🔵 Cyan
6. Utilities - 🟢 Teal
7. Housing - 🔷 Indigo
8. Education - 🔵 Blue
9. Insurance - 🟠 Orange
10. Personal Care - 🟣 Purple
11. Gifts & Donations - 💚 Green
12. Other - ⚫ Gray

### Income Categories
1. Salary - 💚 Green
2. Freelance - 🔵 Cyan
3. Investments - 🟣 Purple
4. Business - 🟨 Amber
5. Bonus - 🔷 Indigo
6. Other Income - 🟢 Teal

## Testing the Setup

After completing the SQL setup, test the system:

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Test signup flow
# Navigate to http://localhost:3000/signup
# Sign up with an email address
# Check if verification code is stored in email_verifications table
# Verify the email with the code sent

# Test transaction creation
# Go to dashboard and add a transaction
# Check if it appears in the transactions table

# Test insights
# View the Chat/Insights page for AI-generated insights
```

## Troubleshooting

### "Permission denied" errors
- Check RLS policies are correctly set up
- Verify user is authenticated (auth.uid() is not null)
- Ensure user_id matches the authenticated user

### Email verification not working
- Check email_verifications table for records
- Verify expires_at timestamp is correctly set
- Check email service configuration in lib/email.ts

### Transactions not saving
- Check if user_id is correctly set
- Verify amount and category values are valid
- Check foreign key constraint to users table

### Storage bucket issues
- Ensure avatars bucket is created
- Check storage RLS policies are enabled
- Verify file paths use correct format

## Next Steps

1. ✅ Run the SQL setup script
2. ✅ Configure environment variables
3. ✅ Set up cleanup cron jobs
4. ✅ Enable SMTP/email service for verification emails
5. ✅ Test signup and transaction flows
6. ✅ Deploy to production

## Support

For more information:
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/

## Change Log

### Version 1.0 (Current)
- Initial database setup with all required tables
- RLS policies for security
- Default categories for Philippines (₱)
- Utility functions for common queries
- Performance indexes
