import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transactions } = await request.json();

    // Prepare transaction data for context
    const expenses = transactions.filter((t: any) => t.type === 'expense');
    const income = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum: number, t: any) => sum + t.amount, 0));

    const categoryBreakdown = expenses.reduce((acc: Record<string, number>, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${(amt as number).toFixed(2)}`)
      .join(', ');

    const context = `
      User transaction data:
      - Total income: $${income.toFixed(2)}
      - Total expenses: $${totalExpenses.toFixed(2)}
      - Number of expense transactions: ${expenses.length}
      - Top categories: ${topCategories}
      - All transactions: ${JSON.stringify(transactions.slice(0, 20))} // Limit to first 20 for context
    `;

    // System prompt for AI insights
    const systemPrompt = `
      You are an AI financial analyst for BudgetAI. Analyze the user's transaction data and provide 3-5 personalized financial insights and recommendations.
      Focus on spending patterns, savings opportunities, budget optimization, and financial health.
      Return insights in JSON format with this structure:
      {
        "insights": [
          {
            "type": "warning|info|success",
            "title": "Brief title",
            "message": "Detailed explanation with specific numbers",
            "icon": "AlertTriangle|Lightbulb|TrendingUp|Brain",
            "color": "text-red-600|text-blue-600|text-green-600|text-purple-600"
          }
        ],
        "recommendations": [
          {
            "title": "Recommendation title",
            "description": "Detailed recommendation",
            "potentialSavings": "Estimated monthly savings if applicable"
          }
        ]
      }
      Always include a disclaimer that this is not professional financial advice.
      Make insights specific to the user's actual data, not generic.
    `;

    // Use Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Current Groq model for financial analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze my financial data and provide insights: ${context}` }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const response = groqData.choices?.[0]?.message?.content || '{"insights": [], "recommendations": []}';

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to basic insights if parsing fails
      parsedResponse = {
        insights: [
          {
            type: 'info',
            title: 'Analysis Complete',
            message: 'Your financial data has been analyzed. Check back for detailed insights.',
            icon: 'Brain',
            color: 'text-blue-600'
          }
        ],
        recommendations: [
          {
            title: 'Review Your Budget',
            description: 'Consider reviewing your spending patterns for optimization opportunities.',
            potentialSavings: 'TBD'
          }
        ]
      };
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json({
      insights: [
        {
          type: 'warning',
          title: 'Analysis Error',
          message: 'Unable to generate AI insights at this time. Please try again later.',
          icon: 'AlertTriangle',
          color: 'text-red-600'
        }
      ],
      recommendations: []
    }, { status: 500 });
  }
}