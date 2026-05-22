# Supabase Database Schema and SQL Reference

## Complete Database Schema Documentation

This document provides a complete reference for the Supabase database schema used in the AI Personal Budget Tracker System.

---

## 1. USERS TABLE

**Purpose**: Stores user account information and authentication data.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier (auto-generated) |
| email | TEXT | Yes | User's email address (unique) |
| name | TEXT | No | User's display name |
| image | TEXT | No | URL to user's profile image |
| created_at | TIMESTAMP | Yes | Account creation timestamp |
| updated_at | TIMESTAMP | Yes | Last update timestamp |
| last_login | TIMESTAMP | No | Last login timestamp |

**Indexes**:
- `idx_users_email` - Email lookup for quick user searches

**RLS Policies**:
- `users_select_own` - Users can view their own profile
- `users_update_own` - Users can update their own profile
- `users_insert_own` - Users can create their profile

---

## 2. EMAIL_VERIFICATIONS TABLE

**Purpose**: Temporarily stores email verification codes during the signup process.

```sql
CREATE TABLE public.email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  password TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| email | TEXT | Yes | Email address to verify (unique) |
| code | TEXT | Yes | 6-digit verification code |
| password | TEXT | Yes | Temporary password storage (hash in production) |
| expires_at | TIMESTAMP | Yes | Code expiration time (5 minutes) |
| created_at | TIMESTAMP | Yes | Record creation timestamp |
| verified | BOOLEAN | No | Whether the code has been verified |

**Indexes**:
- `idx_email_verifications_email` - Email lookup
- `idx_email_verifications_expires_at` - Expiration cleanup

**RLS Policies**:
- `email_verifications_insert_anonymous` - Anonymous users can create records
- `email_verifications_select_own` - Users can check their verification status

**Lifecycle**:
- Records are automatically deleted after 5 minutes expiration
- Cleanup function: `cleanup_expired_verifications()`

---

## 3. TRANSACTIONS TABLE

**Purpose**: Stores all financial transactions (income and expenses).

```sql
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_transactions_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| user_id | UUID | Yes | Reference to user |
| amount | DECIMAL | Yes | Transaction amount (can be negative for expenses) |
| description | TEXT | No | Transaction description/notes |
| category | TEXT | Yes | Spending category name |
| type | TEXT | Yes | 'income' or 'expense' |
| date | TIMESTAMP | Yes | Transaction date |
| created_at | TIMESTAMP | Yes | Record creation timestamp |
| updated_at | TIMESTAMP | Yes | Last update timestamp |

**Indexes**:
- `idx_transactions_user_id` - User lookup
- `idx_transactions_date` - Date range queries
- `idx_transactions_category` - Category filtering
- `idx_transactions_type` - Income vs expense filtering
- `idx_transactions_user_date` - Composite index for most common queries
- `idx_transactions_user_type_date` - User's income/expense by date
- `idx_transactions_user_category_date` - Category breakdown

**RLS Policies**:
- `transactions_select_own` - Users can view their transactions
- `transactions_insert_own` - Users can create transactions
- `transactions_update_own` - Users can update their transactions
- `transactions_delete_own` - Users can delete their transactions

---

## 4. ACCOUNTS TABLE

**Purpose**: Stores OAuth account integrations for third-party authentication.

```sql
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_accounts_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE,
  CONSTRAINT unique_provider_account 
    UNIQUE (provider, provider_account_id)
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| user_id | UUID | Yes | Reference to user |
| type | TEXT | Yes | Account type (e.g., 'oauth') |
| provider | TEXT | Yes | OAuth provider (google, github, etc) |
| provider_account_id | TEXT | Yes | Provider's user ID |
| refresh_token | TEXT | No | OAuth refresh token |
| access_token | TEXT | No | OAuth access token |
| expires_at | BIGINT | No | Token expiration timestamp |
| token_type | TEXT | No | Token type (e.g., 'Bearer') |
| scope | TEXT | No | OAuth scopes granted |
| id_token | TEXT | No | OpenID Connect token |
| session_state | TEXT | No | OIDC session state |
| created_at | TIMESTAMP | Yes | Record creation timestamp |
| updated_at | TIMESTAMP | Yes | Last update timestamp |

**Indexes**:
- `idx_accounts_user_id` - User lookup
- `idx_accounts_provider` - Provider filtering

**RLS Policies**:
- Standard CRUD policies for users to manage their own accounts

---

## 5. SESSIONS TABLE

**Purpose**: Manages user sessions for authentication and login tracking.

```sql
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_sessions_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| session_token | TEXT | Yes | Unique session token |
| user_id | UUID | Yes | Reference to user |
| expires | TIMESTAMP | Yes | Session expiration time |
| created_at | TIMESTAMP | Yes | Session creation timestamp |

**Indexes**:
- `idx_sessions_user_id` - User lookup
- `idx_sessions_session_token` - Token lookup
- `idx_sessions_expires` - Expiration cleanup

**RLS Policies**:
- Users can view, create, and delete their own sessions

**Cleanup**:
- Function: `cleanup_expired_sessions()` - removes expired sessions

---

## 6. VERIFICATION_TOKENS TABLE

**Purpose**: Stores verification tokens for password resets and email verification.

```sql
CREATE TABLE public.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_identifier_token 
    UNIQUE (identifier, token)
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| identifier | TEXT | Yes | User identifier (email) |
| token | TEXT | Yes | Random verification token |
| expires | TIMESTAMP | Yes | Token expiration time |
| created_at | TIMESTAMP | Yes | Token creation timestamp |

**Indexes**:
- `idx_verification_tokens_expires` - Expiration cleanup
- `idx_verification_tokens_identifier` - Identifier lookup

**Cleanup**:
- Function: `cleanup_expired_tokens()` - removes expired tokens

---

## 7. CATEGORIES TABLE

**Purpose**: Predefined transaction categories for organizing expenses and income.

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | TEXT | Yes | Category name (unique) |
| description | TEXT | No | Category description |
| icon | TEXT | No | Icon identifier (emoji or icon name) |
| color | TEXT | No | Hex color code |
| type | TEXT | Yes | 'income' or 'expense' |
| is_default | BOOLEAN | No | Whether it's a default category |
| created_at | TIMESTAMP | Yes | Creation timestamp |

**Default Expense Categories**:
1. Food & Dining - #F59E0B (Amber)
2. Transportation - #EF4444 (Red)
3. Shopping - #EC4899 (Pink)
4. Entertainment - #8B5CF6 (Purple)
5. Healthcare - #06B6D4 (Cyan)
6. Utilities - #14B8A6 (Teal)
7. Housing - #6366F1 (Indigo)
8. Education - #3B82F6 (Blue)
9. Insurance - #F97316 (Orange)
10. Personal Care - #D946EF (Fuchsia)
11. Gifts & Donations - #10B981 (Emerald)
12. Other - #6B7280 (Gray)

**Default Income Categories**:
1. Salary - #10B981 (Emerald)
2. Freelance - #06B6D4 (Cyan)
3. Investments - #8B5CF6 (Purple)
4. Business - #F59E0B (Amber)
5. Bonus - #6366F1 (Indigo)
6. Other Income - #14B8A6 (Teal)

**Indexes**:
- `idx_categories_type` - Type filtering
- `idx_categories_name` - Name lookup

**RLS Policies**:
- `categories_select_public` - Everyone can read categories (no write access)

---

## 8. USER_PROFILES TABLE

**Purpose**: Extended user profile information and preferences.

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  bio TEXT,
  currency TEXT DEFAULT 'PHP',
  timezone TEXT DEFAULT 'Asia/Manila',
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_profiles_users 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| user_id | UUID | Yes | Reference to user (unique) |
| bio | TEXT | No | User biography |
| currency | TEXT | No | Preferred currency (default: PHP) |
| timezone | TEXT | No | User's timezone (default: Asia/Manila) |
| theme | TEXT | No | UI theme preference (light/dark) |
| notifications_enabled | BOOLEAN | No | Email notifications enabled |
| created_at | TIMESTAMP | Yes | Creation timestamp |
| updated_at | TIMESTAMP | Yes | Last update timestamp |

**Indexes**:
- `idx_user_profiles_user_id` - User lookup

**RLS Policies**:
- Users can view and update their own profile

---

## Utility Functions

### 1. get_user_transaction_summary(user_uuid UUID)

**Purpose**: Get comprehensive transaction statistics for a user.

**Returns**:
| Column | Type | Description |
|--------|------|-------------|
| total_income | DECIMAL | Total income |
| total_expenses | DECIMAL | Total expenses |
| net_balance | DECIMAL | Income minus expenses |
| transaction_count | BIGINT | Total number of transactions |
| expense_count | BIGINT | Number of expenses |
| income_count | BIGINT | Number of income entries |

**Example Usage**:
```sql
SELECT * FROM get_user_transaction_summary('12345-uuid-here'::uuid);
```

### 2. get_category_breakdown(user_uuid UUID, period_days INT DEFAULT 30)

**Purpose**: Get spending breakdown by category for a specified period.

**Parameters**:
- `user_uuid` - User's UUID
- `period_days` - Number of days to analyze (default: 30)

**Returns**:
| Column | Type | Description |
|--------|------|-------------|
| category | TEXT | Category name |
| amount | DECIMAL | Total spending in category |
| transaction_count | BIGINT | Number of transactions |
| percentage | DECIMAL | Percentage of total spending |

**Example Usage**:
```sql
-- Last 30 days
SELECT * FROM get_category_breakdown('user-uuid'::uuid, 30);

-- Last 90 days
SELECT * FROM get_category_breakdown('user-uuid'::uuid, 90);
```

### 3. cleanup_expired_verifications()

**Purpose**: Remove expired email verification records.

**Example Usage**:
```sql
SELECT cleanup_expired_verifications();
```

### 4. cleanup_expired_sessions()

**Purpose**: Remove expired session records.

**Example Usage**:
```sql
SELECT cleanup_expired_sessions();
```

### 5. cleanup_expired_tokens()

**Purpose**: Remove expired verification tokens.

**Example Usage**:
```sql
SELECT cleanup_expired_tokens();
```

---

## Database Views

### 1. user_transactions_view

**Purpose**: View transactions with associated category metadata.

**Columns**:
- id, user_id, amount, description, category
- icon, color (from categories table)
- type, date, created_at, updated_at

**Example Usage**:
```sql
SELECT * FROM user_transactions_view 
WHERE user_id = 'user-uuid'::uuid 
AND type = 'expense'
ORDER BY date DESC;
```

### 2. user_financial_summary

**Purpose**: Financial summary for all users.

**Columns**:
- id, email, name
- total_transactions, total_income, total_expenses
- net_balance, active_days

**Example Usage**:
```sql
SELECT * FROM user_financial_summary 
WHERE email = 'user@example.com';
```

---

## Common Queries

### Get user's transactions for last 30 days
```sql
SELECT * FROM public.transactions
WHERE user_id = 'user-uuid'::uuid
  AND date > NOW() - INTERVAL '30 days'
ORDER BY date DESC;
```

### Get spending by category (last 30 days)
```sql
SELECT * FROM get_category_breakdown('user-uuid'::uuid, 30);
```

### Get monthly income vs expenses
```sql
SELECT 
  DATE_TRUNC('month', date) as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses
FROM public.transactions
WHERE user_id = 'user-uuid'::uuid
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

### Get top spending categories
```sql
SELECT 
  category,
  COUNT(*) as transaction_count,
  SUM(ABS(amount)) as total_amount
FROM public.transactions
WHERE user_id = 'user-uuid'::uuid
  AND type = 'expense'
  AND date > NOW() - INTERVAL '30 days'
GROUP BY category
ORDER BY total_amount DESC
LIMIT 10;
```

### Get daily spending
```sql
SELECT 
  DATE(date) as day,
  SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as daily_spending,
  COUNT(*) as transaction_count
FROM public.transactions
WHERE user_id = 'user-uuid'::uuid
GROUP BY DATE(date)
ORDER BY day DESC
LIMIT 30;
```

---

## Performance Tips

1. **Always use indexed columns in WHERE clauses**
   - user_id, date, category, type

2. **Use composite indexes for multi-column queries**
   - `idx_transactions_user_date` for user + date queries
   - `idx_transactions_user_category_date` for category queries

3. **Limit result sets**
   - Always use `LIMIT` clause to reduce data transfer
   - Use pagination for large datasets

4. **Use views for complex queries**
   - Pre-defined views are optimized for common queries
   - Reduces query complexity in application code

5. **Archive old transactions**
   - Consider archiving transactions older than 2 years
   - Improves query performance for current data

---

## Backup and Recovery

**Backup your database regularly**:
```bash
# Via Supabase dashboard:
1. Go to Settings → Backups
2. Enable daily backups
3. Download backups as needed
```

**Restore from backup**:
1. Go to Settings → Backups in Supabase dashboard
2. Select backup to restore
3. Click "Restore"
4. Confirm the operation

---

## Monitoring and Maintenance

**Regular maintenance tasks**:

1. **Clean up expired records** - Run cleanup functions daily
   ```sql
   SELECT cleanup_expired_verifications();
   SELECT cleanup_expired_sessions();
   SELECT cleanup_expired_tokens();
   ```

2. **Monitor database size**
   ```sql
   SELECT pg_size_pretty(pg_database_size(current_database()));
   ```

3. **Check active connections**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

4. **Analyze query performance**
   - Use Supabase dashboard → Logs → Database
   - Look for slow queries

5. **Update statistics**
   ```sql
   ANALYZE public.transactions;
   ANALYZE public.users;
   ```

---

## Migration Guide

If migrating from another database:

1. Export data from old database
2. Transform data to match new schema
3. Disable foreign key constraints temporarily
4. Bulk insert data using COPY or INSERT
5. Re-enable foreign key constraints
6. Verify data integrity

Example migration:
```sql
-- Disable triggers temporarily
ALTER TABLE public.transactions DISABLE TRIGGER ALL;

-- Bulk import data
COPY public.transactions(id, user_id, amount, description, category, type, date)
FROM '/path/to/data.csv' WITH (FORMAT csv, DELIMITER ',', HEADER);

-- Re-enable triggers
ALTER TABLE public.transactions ENABLE TRIGGER ALL;

-- Verify data
SELECT COUNT(*) FROM public.transactions;
```

---

## Support and Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Forum](https://github.com/supabase/supabase/discussions)
