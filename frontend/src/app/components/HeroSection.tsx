import { Shield, Play, Eye } from 'lucide-react';
import { motion } from "framer-motion";
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white dark:from-slate-950 dark:to-slate-900 py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
              Cybersecurity that{' '}
              <span className="text-[#4F46E5] dark:text-indigo-400">teaches</span>, not just blocks.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              SafeLearn AI protects students from phishing, malware, and data misuse—while 
              explaining threats in plain English.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                asChild
                size="lg" 
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2"
              >
                <a href="https://chromewebstore.google.com/detail/safelearn-ai/pnpdplnkgdndlckfhmhngjddhnbkmdnk" target="_blank" rel="noopener noreferrer">
                  <Shield className="w-5 h-5" />
                  Add to Chrome - Free
                </a>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Watch 60-Second Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] p-0 border-none bg-transparent">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-2xl relative">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="/SafeLearnAIDemo.mp4" 
                      title="SafeLearn AI Demo" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0"
                    ></iframe>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Button 
              variant="ghost" 
              className="gap-2 text-[#4F46E5]"
            >
              <Eye className="w-4 h-4" />
              View Live Dashboard Demo
            </Button>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-12 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span className="font-medium">Privacy-First</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="font-medium">Built for Students</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <span className="font-medium">Explainable AI</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 p-6 border border-gray-200 dark:border-slate-800">
              {/* Mock Extension Popup */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-[#F59E0B] rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Heads up! This looks suspicious.
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      This link looks fake because the domain is trying to mimic "paypal.com" 
                      but uses "paypa1.com" (with a number 1 instead of letter L).
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#10B981] hover:bg-[#059669]">
                    Got it, thanks!
                  </Button>
                  <Button size="sm" variant="outline">
                    Learn more
                  </Button>
                </div>
              </div>
              
              {/* Decorative Browser Elements */}
              <div className="mt-4 space-y-2">
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-[#10B981] text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
            >
              +127 threats blocked today
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
