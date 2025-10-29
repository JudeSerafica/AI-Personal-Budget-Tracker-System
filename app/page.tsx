'use client';

import { ArrowRight, BarChart3, Brain, MessageSquare, PieChart, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Wallet className={styles.logoIcon} />
            <span className={styles.logoText}>BudgetAI</span>
          </div>
          <div className={styles.navLinks}>
            <button className={styles.navButton}>Features</button>
            <button className={styles.navButton}>Pricing</button>
            <button className={styles.primaryButton}>Get Started</button>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles className={styles.badgeIcon} />
          <span>AI-Powered Financial Intelligence</span>
        </div>
        <h1 className={styles.heroTitle}>
          Master Your Finances<br />with <span className={styles.gradient}>AI Intelligence</span>
        </h1>
        <p className={styles.heroDescription}>
          Track expenses, gain insights, and make smarter financial decisions with AI-powered budgeting that understands your spending patterns.
        </p>
        <div className={styles.heroButtons}>
          <button className={`${styles.largeButton} ${styles.primaryLarge}`}>
            Start Free Trial
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>
          <button className={`${styles.largeButton} ${styles.secondaryLarge}`}>
            Watch Demo
          </button>
        </div>

        <div className={styles.dashboardPreview}>
          <div className={styles.fadeOverlay} />
          <div className={styles.card}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Balance</div>
                <div className={styles.statValue}>$12,458</div>
                <div className={styles.statChange}>
                  <TrendingUp style={{ width: '16px', height: '16px' }} />
                  +12.5% this month
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Income</div>
                <div className={styles.statValue}>$8,250</div>
                <div className={styles.statSubtext}>Last 30 days</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Expenses</div>
                <div className={styles.statValue}>$3,792</div>
                <div className={styles.statSubtext}>Last 30 days</div>
              </div>
            </div>
            <div className={styles.chart}>
              {[65, 45, 75, 55, 85, 70, 90].map((height, i) => (
                <div key={i} className={styles.chartBar}>
                  <div
                    className={styles.bar}
                    style={{ height: `${height}%` }}
                  />
                  <span className={styles.chartLabel}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>Powerful Features for Smart Budgeting</h2>
          <p className={styles.featuresSubtitle}>Everything you need to take control of your financial future</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BarChart3 style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 className={styles.featureTitle}>Dashboard Overview</h3>
            <p className={styles.featureDescription}>
              See your total income, expenses, and balance at a glance with intuitive monthly charts and real-time updates.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Wallet style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 className={styles.featureTitle}>Expense & Income Tracking</h3>
            <p className={styles.featureDescription}>
              Effortlessly add, edit, and delete transactions with predefined categories for accurate financial tracking.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Brain style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 className={styles.featureTitle}>AI Spending Insights</h3>
            <p className={styles.featureDescription}>
              Get personalized AI-generated spending tips and proactive alerts to help you budget smarter and save more.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Sparkles style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 className={styles.featureTitle}>Smart Categorization</h3>
            <p className={styles.featureDescription}>
              AI automatically detects and assigns categories to your transactions, saving you time and ensuring accuracy.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <PieChart style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 className={styles.featureTitle}>Monthly Summary</h3>
            <p className={styles.featureDescription}>
              Review your income vs. expenses through beautiful visual charts that make financial insights easy to understand.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <MessageSquare style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 className={styles.featureTitle}>Natural Language Query</h3>
            <p className={styles.featureDescription}>
              Ask questions in plain English and get instant AI-generated answers about your finances and spending patterns.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.aiSection}>
        <div className={styles.aiContent}>
          <div>
            <h2 className={styles.aiTitle}>
              AI That Understands Your Financial Goals
            </h2>
            <p className={styles.aiDescription}>
              Our advanced AI engine learns your spending habits, identifies patterns, and provides actionable insights to help you achieve your financial goals faster.
            </p>
            <ul className={styles.aiFeatures}>
              {[
                'Intelligent expense categorization',
                'Personalized spending recommendations',
                'Proactive budget alerts',
                'Natural language financial queries'
              ].map((feature, i) => (
                <li key={i} className={styles.aiFeatureItem}>
                  <div className={styles.aiFeatureIcon}>
                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </div>
                  <span className={styles.aiFeatureText}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.aiExample}>
            <div className={styles.exampleItem}>
              <Brain className={styles.exampleIcon} />
              <div>
                <div className={styles.exampleTitle}>AI Insight</div>
                <p className={styles.exampleText}>
                  You've spent 23% more on dining out this month compared to last month. Consider meal prepping to save $180/month.
                </p>
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.exampleItem}>
              <MessageSquare className={styles.exampleIcon} />
              <div>
                <div className={styles.exampleTitle}>Quick Answer</div>
                <p className={styles.exampleQuery}>"How much did I spend on groceries last month?"</p>
                <p className={styles.exampleAnswer}>
                  You spent $487 on groceries in January, which is 15% below your average.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to Take Control?</h2>
        <p className={styles.ctaDescription}>
          Join thousands of users who are already managing their finances smarter with AI-powered insights.
        </p>
        <button className={`${styles.largeButton} ${styles.primaryLarge}`}>
          Get Started Free
          <ArrowRight style={{ width: '20px', height: '20px' }} />
        </button>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <ul>
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <ul>
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <ul>
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Community</li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <ul>
                <li>Privacy</li>
                <li>Terms</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerLogo}>
              <Wallet style={{ width: '24px', height: '24px' }} />
              <span>BudgetAI</span>
            </div>
            <p className={styles.footerText}>
              2025 BudgetAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
