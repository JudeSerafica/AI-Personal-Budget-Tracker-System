'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: string;
  date: string;
}

export default function InsightsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchTransactions();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
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

  const [aiInsights, setAiInsights] = useState<any>({ insights: [], recommendations: [] });
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAiInsights = async () => {
    if (transactions.length === 0) return;

    setAiLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchAiInsights();
    }
  }, [transactions]);

  const generateInsights = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));

    const foodExpenses = expenses
      .filter(t => t.category === 'Food & Dining')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const entertainmentExpenses = expenses
      .filter(t => t.category === 'Entertainment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const insights = [];

    // Food spending insight
    if (foodExpenses > totalExpenses * 0.3) {
      insights.push({
        type: 'warning',
        title: 'High Food Spending',
        message: `Your food expenses (${((foodExpenses / totalExpenses) * 100).toFixed(1)}% of total spending) are quite high. Consider meal prepping to save money.`,
        icon: AlertTriangle,
        color: 'text-yellow-600'
      });
    }

    // Check for other categories from predefined categories
    const highSpendingCategories = expenses
      .filter(t => !['Food & Dining', 'Housing', 'Transportation'].includes(t.category))
      .reduce((acc, t) => {
        const category = t.category;
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    Object.entries(highSpendingCategories).forEach(([category, amount]) => {
      if (amount > totalExpenses * 0.2) {
        insights.push({
          type: 'info',
          title: `High ${category} Spending`,
          message: `${category} represents ${((amount / totalExpenses) * 100).toFixed(1)}% of your expenses. Consider reviewing your ${category.toLowerCase()} habits.`,
          icon: Lightbulb,
          color: 'text-blue-600'
        });
      }
    });

    // Entertainment insight
    if (entertainmentExpenses > totalExpenses * 0.15) {
      insights.push({
        type: 'info',
        title: 'Entertainment Budget',
        message: 'You\'re spending more on entertainment than average. Look for free or low-cost alternatives.',
        icon: Lightbulb,
        color: 'text-blue-600'
      });
    }

    // Savings rate insight
    const savingsRate = ((income - totalExpenses) / income) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Great Savings Rate!',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`,
        icon: TrendingUp,
        color: 'text-green-600'
      });
    } else if (savingsRate < 10) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        message: `You're only saving ${savingsRate.toFixed(1)}% of your income. Consider cutting back on non-essential expenses.`,
        icon: AlertTriangle,
        color: 'text-red-600'
      });
    }

    // Recurring expenses insight
    const recurringCategories = ['Housing', 'Utilities', 'Transportation'];
    const recurringTotal = expenses
      .filter(t => recurringCategories.includes(t.category))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (recurringTotal > totalExpenses * 0.6) {
      insights.push({
        type: 'info',
        title: 'Fixed Expenses Analysis',
        message: `${((recurringTotal / totalExpenses) * 100).toFixed(1)}% of your expenses are fixed costs. Focus on optimizing variable expenses.`,
        icon: Brain,
        color: 'text-purple-600'
      });
    }

    return insights;
  };

  const insights = generateInsights();
  const allInsights = [...insights, ...aiInsights.insights];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Brain className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Spending Insights</h1>
          {aiLoading && <span className="text-sm text-gray-500">(Generating AI insights...)</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allInsights.map((insight, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {insight.icon && typeof insight.icon === 'string' ? (
                    insight.icon === 'AlertTriangle' ? <AlertTriangle className={`h-5 w-5 ${insight.color}`} /> :
                    insight.icon === 'Lightbulb' ? <Lightbulb className={`h-5 w-5 ${insight.color}`} /> :
                    insight.icon === 'TrendingUp' ? <TrendingUp className={`h-5 w-5 ${insight.color}`} /> :
                    <Brain className={`h-5 w-5 ${insight.color}`} />
                  ) : (
                    <insight.icon className={`h-5 w-5 ${insight.color}`} />
                  )}
                  <span>{insight.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{insight.message}</p>
                <Badge variant="secondary" className="mt-2">
                  {insight.type}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Spending Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Budget Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've exceeded your entertainment budget by 25% this month. Consider reducing discretionary spending.
                </AlertDescription>
              </Alert>

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Great job! Your grocery spending is 15% below your monthly average.
                </AlertDescription>
              </Alert>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  Based on your spending patterns, you could save $120/month by optimizing your transportation costs.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights.recommendations && aiInsights.recommendations.length > 0 ? (
              <div className="space-y-4">
                {aiInsights.recommendations.map((rec: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    index % 3 === 0 ? 'bg-blue-50' :
                    index % 3 === 1 ? 'bg-green-50' : 'bg-purple-50'
                  }`}>
                    <h4 className="font-semibold mb-2" style={{
                      color: index % 3 === 0 ? '#1e40af' :
                             index % 3 === 1 ? '#166534' : '#7c3aed'
                    }}>
                      {rec.title}
                    </h4>
                    <p className="text-sm" style={{
                      color: index % 3 === 0 ? '#1d4ed8' :
                             index % 3 === 1 ? '#15803d' : '#9333ea'
                    }}>
                      {rec.description}
                      {rec.potentialSavings && (
                        <span className="block mt-1 font-medium">
                          Potential savings: {rec.potentialSavings}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Meal Planning</h4>
                  <p className="text-sm text-blue-700">
                    Based on your food spending patterns, implementing a weekly meal plan could save you approximately $80 per month.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Subscription Review</h4>
                  <p className="text-sm text-green-700">
                    You have 3 active subscriptions totaling $45/month. Consider reviewing if all are essential to your lifestyle.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Savings Goal</h4>
                  <p className="text-sm text-purple-700">
                    At your current savings rate, you'll reach your $10,000 emergency fund goal in 8 months. Consider increasing contributions.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}