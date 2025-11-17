'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, TrendingUp, TrendingDown, Plus, Wallet, PieChart, MessageSquare, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    checkUser();
    fetchTransactions();
  }, []);

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Dashboard checkUser - session:', session, 'user:', session?.user, 'error:', error);
    if (!session?.user) {
      console.log('No session/user found, redirecting to login');
      router.push('/login');
      return;
    }
    setUser(session.user);
  };

  const fetchTransactions = async () => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No session token available');
        setTransactions([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Currency conversion
  const USD_TO_PHP = 56.5;

  // Format currency with comma separators
  const formatCurrency = (amount: number): string => {
    const symbol = '₱';
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${symbol}${formatted}`;
  };

  // Calculate totals for all transactions (amounts stored in USD, convert to PHP)
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) * USD_TO_PHP;
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)) * USD_TO_PHP;
  const totalBalance = totalIncome - totalExpenses;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Wallet className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">BudgetAI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Sign Out</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out of your BudgetAI account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          </div>
        </header>

        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 py-4">
              <Button variant={pathname === '/dashboard' ? 'default' : 'outline'} asChild>
                <Link href="/dashboard">Overview</Link>
              </Button>
              <Button variant={pathname === '/dashboard/transactions' ? 'default' : 'outline'} asChild>
                <Link href="/dashboard/transactions">Transactions</Link>
              </Button>
              <Button variant={pathname === '/dashboard/reports' ? 'default' : 'outline'} asChild>
                <Link href="/dashboard/reports">Reports</Link>
              </Button>
              <Button variant={pathname === '/dashboard/insights' ? 'default' : 'outline'} asChild>
                <Link href="/dashboard/insights">AI Insights</Link>
              </Button>
              <Button variant={pathname === '/dashboard/chat' ? 'default' : 'outline'} asChild>
                <Link href="/dashboard/chat">Ask AI</Link>
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[65, 45, 75, 55, 85, 70, 90].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-indigo-600 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button onClick={() => router.push('/dashboard/transactions')} className="h-20 flex flex-col items-center justify-center space-y-2">
            <Plus className="h-6 w-6" />
            <span>Add Transaction</span>
          </Button>
          <Button onClick={() => router.push('/dashboard/reports')} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <BarChart3 className="h-6 w-6" />
            <span>View Reports</span>
          </Button>
          <Button onClick={() => router.push('/dashboard/insights')} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <Brain className="h-6 w-6" />
            <span>AI Insights</span>
          </Button>
          <Button onClick={() => router.push('/dashboard/chat')} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <MessageSquare className="h-6 w-6" />
            <span>Ask AI</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount) * USD_TO_PHP)}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
    </div>
  );
}