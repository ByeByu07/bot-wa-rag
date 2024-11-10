import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Zap,
  Brain,
  Shield,
  BarChart,
  Upload,
  Check,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../components/Button';

const Landing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <MessageSquare />,
      title: 'AI-Powered WhatsApp Bot',
      description: 'Intelligent responses based on your business documents and data',
    },
    {
      icon: <Zap />,
      title: 'Quick Setup',
      description: 'Get started in minutes with our easy-to-use platform',
    },
    {
      icon: <Brain />,
      title: 'Smart Learning',
      description: 'Our AI continuously learns from your documents to provide better responses',
    },
    {
      icon: <Shield />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security for your business data',
    },
    {
      icon: <BarChart />,
      title: 'Analytics Dashboard',
      description: 'Track and analyze customer interactions and bot performance',
    },
    {
      icon: <Upload />,
      title: 'Easy Document Upload',
      description: 'Support for multiple file formats including PDF, DOCX, and more',
    },
  ];

  const plans = [
    {
      title: 'Starter',
      price: isAnnual ? 29 : 39,
      features: [
        'Up to 1,000 messages/month',
        '5 GB document storage',
        'Basic analytics',
        'Single WhatsApp number',
        'Email support',
      ],
    },
    {
      title: 'Professional',
      price: isAnnual ? 79 : 89,
      popular: true,
      features: [
        'Up to 5,000 messages/month',
        '20 GB document storage',
        'Advanced analytics',
        'Up to 3 WhatsApp numbers',
        'Priority support',
        'Custom AI training',
      ],
    },
    {
      title: 'Enterprise',
      price: isAnnual ? 199 : 249,
      features: [
        'Unlimited messages',
        'Unlimited storage',
        'Custom analytics',
        'Unlimited WhatsApp numbers',
        '24/7 dedicated support',
        'Custom integration',
        'API access',
      ],
    },
  ];

  const testimonials = [
    {
      name: 'John Smith',
      role: 'CEO, TechCorp',
      content: 'BusinessBot AI has reduced our response time by 80% and improved customer satisfaction significantly.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director, Growth Co',
      content: "The ROI we've seen with BusinessBot AI is incredible. Our conversion rates are up 45% since implementation.",
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      name: 'Emma Davis',
      role: 'Customer Success Manager, Retail Plus',
      content: 'Implementing BusinessBot AI was a game-changer for our customer service team. Response times dropped dramatically.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    },
  ];

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can be up and running in less than 5 minutes. Our setup wizard will guide you through the process.',
    },
    {
      question: 'What types of documents can I upload?',
      answer: 'We support PDF, DOCX, TXT, and most common document formats. Our AI can process and understand the content to provide accurate responses.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use enterprise-grade encryption and security measures to protect your data. Your documents are stored securely and never shared.',
    },
    {
      question: 'Can I customize the AI responses?',
      answer: 'Absolutely! You can train the AI with your specific business knowledge and customize how it responds to different types of queries.',
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes, we offer a 14-day free trial on all our plans. No credit card required to get started.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">BusinessBot AI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-500 hover:text-gray-600"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button 
                variant="outline" 
                fullWidth 
                className="mb-2"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="primary"
                fullWidth
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative isolate pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your Business Communication with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Automate your WhatsApp responses with AI that understands your business
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to automate your business communication
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                      {feature.icon}
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that's right for your business
            </p>
            
            {/* Pricing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-x-4">
              <span className="text-gray-600">Monthly</span>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                  isAnnual ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isAnnual}
                onClick={() => setIsAnnual(!isAnnual)}
              >
                <span 
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isAnnual ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
              <span className="text-gray-600">Annual</span>
              <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                Save 20%
              </span>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.title} className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                plan.popular ? 'relative' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.title}</h3>
                  </div>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">${plan.price}</span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <Check className="h-6 w-5 flex-none text-indigo-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  fullWidth
                  className="mt-8"
                  onClick={() => navigate('/register')}
                >
                  Get started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by businesses worldwide
            </h2>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-2xl bg-gray-50 p-8">
                  <blockquote className="text-gray-600">"{testimonial.content}"</blockquote>
                  <div className="mt-6 flex items-center gap-x-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Have a different question? Contact our support team.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h3 className="text-lg font-semibold">WhatsApp AI Assistant</h3>
              <p className="mt-2 text-sm text-gray-400">Transform your business communication</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400 text-center">
              © {new Date().getFullYear()} WhatsApp AI Assistant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 