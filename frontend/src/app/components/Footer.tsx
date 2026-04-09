import { Shield, Github, Twitter, Linkedin, Mail, Heart, Globe, Youtube, Instagram, Send, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Thanks for subscribing! 🎉');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub", color: "hover:bg-gray-700" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:bg-[#1DA1F2]" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:bg-[#0077B5]" },
    { icon: Mail, href: "mailto:contact@safelearn.ai", label: "Email", color: "hover:bg-[#EA4335]" },
  ];

  const footerLinks = {
    product: [
      { name: "Features", href: "/#features" },
      { name: "How It Works", href: "/#how-it-works" },
      { name: "For Schools", href: "/for-schools" },
      { name: "Pricing", href: "/pricing" },
    ],
    resources: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "FAQ", href: "/faq" },
      { name: "Security Whitepaper", href: "/security" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          
          {/* Column 1 - Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-xl">SafeLearn AI</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-md">
              Cybersecurity that teaches, not just blocks. Protecting students from online threats with AI-powered explanations.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-400">Trusted by 50,000+ students</span>
            </div>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>Product</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-semibold text-white mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-400">
                Get the latest cybersecurity tips and product updates delivered to your inbox.
              </p>
            </div>
            <div>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          {/* Social Links */}
          <div className="flex gap-3 order-2 md:order-1">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a 
                  key={social.label}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

          {/* Copyright */}
          <p className="text-gray-400 order-1 md:order-2">
            © {currentYear} SafeLearn AI. Built with <Heart className="w-3 h-3 inline text-red-500" /> for students worldwide.
          </p>

          {/* Legal Links */}
          <div className="flex gap-6 order-3">
            <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-xs">
              Privacy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-xs">
              Terms
            </a>
            <a href="/cookies" className="text-gray-400 hover:text-white transition-colors text-xs">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}