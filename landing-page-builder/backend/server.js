const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize, Section } = require('./db');
const sectionsRouter = require('./routes/sections');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: 'http://localhost:4201' }));
app.use(express.json());

// Routes
app.use('/api', sectionsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Default seed data
const SEED_SECTIONS = [
  {
    type: 'navbar',
    title: 'Navigation Bar',
    order: 0,
    enabled: true,
    content: {
      logo: 'LaunchKit',
      logoIcon: '🚀',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
      ],
      ctaLabel: 'Get Started',
      ctaHref: '#hero',
    },
    settings: {
      sticky: true,
      transparent: false,
      darkMode: true,
    },
  },
  {
    type: 'hero',
    title: 'Hero Section',
    order: 1,
    enabled: true,
    content: {
      headline: 'Build Stunning Landing Pages',
      subheadline: 'The most powerful drag-and-drop landing page builder for modern SaaS teams. Launch faster, convert better.',
      ctaLabel: 'Start Building Free',
      ctaHref: '#pricing',
      secondaryCtaLabel: 'Watch Demo',
      secondaryCtaHref: '#how-it-works',
      badge: '🎉 Now with AI-powered copy generation',
      stats: [
        { value: '50K+', label: 'Pages Built' },
        { value: '99.9%', label: 'Uptime' },
        { value: '3x', label: 'Faster Launch' },
      ],
    },
    settings: {
      gradient: true,
      animatedBg: true,
      layout: 'centered',
    },
  },
  {
    type: 'social-proof',
    title: 'Trusted By',
    order: 2,
    enabled: true,
    content: {
      heading: 'Trusted by 50,000+ teams worldwide',
      logos: [
        { name: 'Stripe', icon: '💳' },
        { name: 'Vercel', icon: '▲' },
        { name: 'Notion', icon: '📝' },
        { name: 'Linear', icon: '◈' },
        { name: 'Figma', icon: '🎨' },
        { name: 'Loom', icon: '📹' },
      ],
    },
    settings: { marquee: true },
  },
  {
    type: 'features',
    title: 'Features Section',
    order: 3,
    enabled: true,
    content: {
      heading: 'Everything You Need to Launch',
      subheading: 'Powerful features that help you build, customize, and deploy landing pages in minutes.',
      features: [
        { icon: '🧩', title: 'Drag & Drop Builder', description: 'Intuitive visual editor — no coding required. Build beautiful pages with our component library.' },
        { icon: '⚡', title: 'Lightning Fast', description: 'Optimized for performance with 100 PageSpeed scores out of the box, every time.' },
        { icon: '🎨', title: 'Fully Customizable', description: 'Every color, font, spacing, and animation is fully adjustable to match your brand perfectly.' },
        { icon: '📱', title: 'Mobile First', description: 'Every design looks stunning on all screen sizes with our adaptive responsive system.' },
        { icon: '🔌', title: 'Integrations', description: 'Connect with Stripe, HubSpot, Mailchimp, and 200+ tools seamlessly out of the box.' },
        { icon: '📊', title: 'Analytics Built-in', description: 'Track conversions, heatmaps, and A/B tests without leaving your dashboard.' },
      ],
    },
    settings: { columns: 3, layout: 'grid' },
  },
  {
    type: 'how-it-works',
    title: 'How It Works',
    order: 4,
    enabled: true,
    content: {
      heading: 'Get Started in 3 Simple Steps',
      subheading: 'From zero to live landing page in under 10 minutes.',
      steps: [
        { step: '01', icon: '🎯', title: 'Choose a Template', description: 'Pick from 200+ professionally designed templates or start from scratch with our blank canvas.' },
        { step: '02', icon: '✏️', title: 'Customize Everything', description: 'Drag sections, edit content, swap colors, and configure every detail with our visual editor.' },
        { step: '03', icon: '🚀', title: 'Publish & Convert', description: 'Go live with one click. Your page auto-optimizes for SEO, speed, and mobile performance.' },
      ],
    },
    settings: { layout: 'horizontal' },
  },
  {
    type: 'benefits',
    title: 'Benefits Section',
    order: 5,
    enabled: true,
    content: {
      heading: 'Why Teams Choose LaunchKit',
      subheading: 'Stop wasting engineering time on marketing pages.',
      benefits: [
        { icon: '💰', title: 'Save $10K+ per year', description: 'Eliminate the need for custom dev work on every campaign page your team needs.' },
        { icon: '⏱️', title: 'Ship 10x Faster', description: 'Go from brief to live page in hours, not weeks. Your competitors won\'t know what hit them.' },
        { icon: '📈', title: 'Convert More', description: 'Our templates are conversion-optimized with proven copy structures and CTA placements.' },
        { icon: '🔒', title: 'Enterprise Security', description: 'SOC 2 certified, GDPR compliant, 99.99% uptime SLA. Your data is always safe.' },
      ],
      image: null,
    },
    settings: { layout: 'split', imagePosition: 'right' },
  },
  {
    type: 'pricing',
    title: 'Pricing Section',
    order: 6,
    enabled: true,
    content: {
      heading: 'Simple, Transparent Pricing',
      subheading: 'No hidden fees. Cancel anytime. Start free.',
      plans: [
        {
          name: 'Starter',
          price: '0',
          period: 'month',
          description: 'Perfect for individuals and small projects.',
          features: ['5 Landing Pages', '10,000 Monthly Visitors', 'Basic Templates', 'SSL Certificate', 'Community Support'],
          ctaLabel: 'Start Free',
          ctaHref: '#',
          popular: false,
        },
        {
          name: 'Pro',
          price: '49',
          period: 'month',
          description: 'For growing teams that need more power.',
          features: ['Unlimited Pages', '500K Monthly Visitors', 'All Templates', 'Custom Domain', 'A/B Testing', 'Analytics Dashboard', 'Priority Support'],
          ctaLabel: 'Start Free Trial',
          ctaHref: '#',
          popular: true,
        },
        {
          name: 'Enterprise',
          price: '149',
          period: 'month',
          description: 'For large teams with advanced needs.',
          features: ['Everything in Pro', 'Unlimited Traffic', 'White Label', 'SSO & SAML', 'Dedicated Manager', 'Custom Integrations', 'SLA Guarantee'],
          ctaLabel: 'Contact Sales',
          ctaHref: '#',
          popular: false,
        },
      ],
    },
    settings: { billingToggle: true },
  },
  {
    type: 'faq',
    title: 'FAQ Section',
    order: 7,
    enabled: true,
    content: {
      heading: 'Frequently Asked Questions',
      subheading: 'Everything you need to know about LaunchKit.',
      faqs: [
        { question: 'Do I need to know how to code?', answer: 'Not at all! LaunchKit is designed for marketers and designers. Our visual editor lets you build pages without writing a single line of code.' },
        { question: 'Can I use my own domain?', answer: 'Yes! On Pro and Enterprise plans you can connect any custom domain. We handle SSL and DNS configuration automatically.' },
        { question: 'How does the free trial work?', answer: 'You get full access to all Pro features for 14 days, no credit card required. After the trial, you can choose a plan or continue on the free Starter tier.' },
        { question: 'Can I export my pages?', answer: 'Yes, you can export clean HTML/CSS code for any page. Enterprise customers also get access to our API for full programmatic control.' },
        { question: 'What integrations do you support?', answer: 'We natively integrate with Stripe, HubSpot, Mailchimp, Zapier, Google Analytics, Meta Pixel, and 200+ other tools through our integration library.' },
      ],
    },
    settings: {},
  },
  {
    type: 'footer',
    title: 'Footer',
    order: 8,
    enabled: true,
    content: {
      logo: 'LaunchKit',
      logoIcon: '🚀',
      tagline: 'The fastest way to build high-converting landing pages.',
      columns: [
        {
          heading: 'Product',
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Templates', href: '#' },
            { label: 'Changelog', href: '#' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: 'About', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '#' },
          ],
        },
        {
          heading: 'Legal',
          links: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
          ],
        },
      ],
      socials: [
        { platform: 'Twitter', href: '#', icon: '𝕏' },
        { platform: 'GitHub', href: '#', icon: '⌘' },
        { platform: 'LinkedIn', href: '#', icon: 'in' },
      ],
      copyright: '© 2025 LaunchKit. All rights reserved.',
    },
    settings: { darkMode: true },
  },
];

// Sync and seed
async function initializeDatabase() {
  await sequelize.sync({ force: false });

  const count = await Section.count();
  if (count === 0) {
    console.log('🌱 Seeding initial landing page data...');
    for (const seed of SEED_SECTIONS) {
      await Section.create(seed);
    }
    console.log(`✅ Seeded ${SEED_SECTIONS.length} sections.`);
  }
}

// Start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Landing Page Builder API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Sections: http://localhost:${PORT}/api/sections\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });
