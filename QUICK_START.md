# Quick Start Guide - AI Personal Budget Tracker System

## 🚀 Get Your System Running in 5 Steps

### Prerequisites
- Node.js 18+ and Bun package manager
- Supabase account (free at https://supabase.com)
- Gmail or other email service for verification emails

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project
1. Go to https://supabase.com and sign up
2. Create a new project
3. Wait for your database to initialize

### 1.2 Run the SQL Setup Script
1. In Supabase dashboard, go to **SQL Editor**
2. Click **+ New Query**
3. Open the `supabase_setup.sql` file from this project
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **Run**

**Expected Result**: All tables created successfully with no errors

### 1.3 Verify the Setup
Run this query in SQL Editor to confirm:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

You should see these tables:
- accounts
- categories
- email_verifications
- sessions
- user_profiles
- users
- verification_tokens
- transactions

---

## Step 2: Get Your Supabase Keys

### 2.1 Get API Keys
1. Go to **Settings** → **API** in your Supabase project
2. Note down the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - KEEP THIS SECRET!

### 2.2 Get Database Connection String
1. Go to **Settings** → **Database**
2. Copy the **URI** (looks like `postgresql://postgres:...`)

---

## Step 3: Configure Environment Variables

### 3.1 Create .env.local File
1. In the project root, create a new file called `.env.local`
2. Copy the content from `.env.example`
3. Fill in these required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:password@your-project.supabase.co:5432/postgres
```

### 3.2 Configure Email Service

**Option A: Gmail (Recommended for testing)**
1. Go to your Google Account at https://myaccount.google.com
2. Select **Security** in the left menu
3. Enable **2-Step Verification** if not already enabled
4. Search for "App passwords" 
5. Select Gmail and your device to generate an app password
6. Copy the app password and add to .env.local:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=AI Budget Tracker
```

**Option B: SendGrid**
1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key
3. Add to .env.local:

```env
SENDGRID_API_KEY=SG.your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com
```

### 3.3 (Optional) Configure AI Features

For financial insights powered by AI, add your API key:

```env
# Using OpenAI
OPENAI_API_KEY=sk-your-key-here
AI_MODEL=gpt-4-turbo

# OR using Claude
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_MODEL=claude-3-opus-20240229
```

---

## Step 4: Install Dependencies and Run

### 4.1 Install Dependencies
```bash
# Using Bun (recommended for this project)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 4.2 Run Development Server
```bash
bun run dev
# or
npm run dev
```

The application will start at `http://localhost:3000`

### 4.3 Build for Production
```bash
bun run build
bun run start
```

---

## Step 5: Test Your System

### 5.1 Test Signup Flow
1. Go to http://localhost:3000/signup
2. Enter an email and password
3. Check your email for the verification code
4. Enter the code on the verification page
5. You should be redirected to the dashboard

### 5.2 Test Transaction Creation
1. Go to Dashboard → Transactions
2. Click "Add Transaction"
3. Fill in the details:
   - Amount: 1000 (or any number)
   - Category: Food & Dining
   - Type: Expense
   - Description: Test transaction
4. Click "Add"
5. You should see it appear in the transactions list

### 5.3 Test Insights
1. Go to Dashboard → Chat/Insights
2. You should see AI-generated insights based on your transactions
3. Try asking questions about your spending

---

## 🔧 Troubleshooting

### "Connection refused" or "Cannot connect to database"
**Solution**:
- Check if NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct
- Verify database is running in Supabase (go to Settings → Database)
- Check if your IP is allowed in Supabase firewall settings

### "Permission denied" on email_verifications table
**Solution**:
- Run the SQL script again (it may not have executed completely)
- Check RLS policies are properly configured
- In SQL Editor, verify: `SELECT * FROM pg_policies WHERE tablename = 'email_verifications';`

### "Verification email not received"
**Solution**:
- Check SMTP_USER and SMTP_PASSWORD are correct
- For Gmail: ensure you used "App Password", not your regular password
- Check spam/promotions folder
- Look for errors in server logs (terminal)

### "Transactions not saving"
**Solution**:
- Check if user is logged in (auth.uid() should not be null)
- Verify transactions table has the user_id foreign key
- Check RLS policy allows INSERT: `SELECT * FROM pg_policies WHERE tablename = 'transactions';`

### "404 on /api/transactions"
**Solution**:
- Ensure API routes are properly created in app/api/
- Check if middleware is allowing the request
- Verify SUPABASE_SERVICE_ROLE_KEY is set for API calls

---

## 📊 Useful Database Queries

### Get all users
```sql
SELECT * FROM public.users;
```

### Get all transactions for a user
```sql
SELECT * FROM public.transactions 
WHERE user_id = 'user-uuid'
ORDER BY date DESC;
```

### Get spending summary
```sql
SELECT * FROM get_user_transaction_summary('user-uuid'::uuid);
```

### Get category breakdown
```sql
SELECT * FROM get_category_breakdown('user-uuid'::uuid, 30);
```

### Delete all test data
```sql
DELETE FROM public.transactions WHERE user_id = 'test-uuid';
DELETE FROM public.users WHERE id = 'test-uuid';
```

---

## 📁 Project Structure

```
AI-Personal-Budget-Tracker-System/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── chat/                 # Chat/AI endpoint
│   │   ├── insights/             # Financial insights
│   │   ├── transactions/         # Transaction CRUD
│   │   └── signup/verify/        # Auth endpoints
│   ├── dashboard/                # User dashboard
│   ├── login/signup/             # Auth pages
│   └── layout.tsx                # App layout
├── components/                   # React components
│   └── ui/                       # UI components (shadcn)
├── lib/                          # Utilities
│   ├── supabase.ts              # Supabase client
│   ├── email.ts                 # Email service
│   └── db.ts                    # Database utilities
├── prisma/                       # Prisma schema
├── supabase_setup.sql           # Database setup script
├── .env.example                 # Environment template
├── SUPABASE_SETUP_GUIDE.md      # Detailed setup guide
└── DATABASE_SCHEMA_REFERENCE.md # Database documentation
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Use strong passwords for Supabase
- [ ] Keep SUPABASE_SERVICE_ROLE_KEY secret
- [ ] Enable 2FA on Supabase account
- [ ] Set up proper CORS policies
- [ ] Use HTTPS in production
- [ ] Regular database backups
- [ ] Monitor for suspicious activity
- [ ] Hash passwords before storing (currently plain-text in demo)
- [ ] Implement rate limiting on API endpoints

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui Components**: https://ui.shadcn.com
- **OpenAI API**: https://platform.openai.com/docs

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**:
   - Browser console (F12 → Console tab)
   - Terminal/Server output
   - Supabase logs (Dashboard → Logs)

2. **Search GitHub Issues**:
   - Supabase: https://github.com/supabase/supabase/issues
   - Next.js: https://github.com/vercel/next.js/issues

3. **Check Database**:
   - SQL Editor in Supabase to verify data
   - Check RLS policies are correct

4. **Review Configuration**:
   - Double-check all environment variables
   - Verify API keys and URLs are correct
   - Ensure email service is working

---

## 🎉 Next Steps

Once your system is running:

1. ✅ Test with dummy transactions
2. ✅ Customize categories if needed
3. ✅ Set up backup schedules
4. ✅ Configure email templates
5. ✅ Deploy to production
6. ✅ Set up monitoring and alerts

---

## 💡 Tips for Success

1. **Start Simple**: Add a few test transactions before showing others
2. **Backup First**: Always enable automatic backups in Supabase
3. **Monitor Logs**: Check logs regularly for errors
4. **Test Email**: Send a test email after configuring SMTP
5. **Document Your Setup**: Keep notes about your configuration
6. **Keep Secrets Safe**: Use a password manager for API keys
7. **Version Control**: Don't commit `.env.local` but do commit `.env.example`

---

**Version**: 1.0  
**Last Updated**: May 2026  
**Status**: ✅ Ready for Development
