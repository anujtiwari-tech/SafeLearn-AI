import { Shield, Play, Eye, Chrome, Star, Sparkles, ArrowRight, Brain, Lock, Zap } from 'lucide-react';
import { motion } from "framer-motion";
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 md:py-32">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6 border border-gray-100 dark:border-slate-700"
            >
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trusted by Students Worldwide</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white"
            >
              Cybersecurity that{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                teaches
              </span>
              ,<br />
              not just blocks.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              SafeLearn AI protects students from phishing, malware, and data misuse—while 
              explaining threats in plain English.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <a href="https://chromewebstore.google.com/detail/safelearn-ai/pnpdplnkgdndlckfhmhngjddhnbkmdnk" target="_blank" rel="noopener noreferrer">
                  <Chrome className="w-5 h-5" />
                  Add to Chrome - Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="gap-2 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
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
            </motion.div>

            {/* Demo Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                variant="ghost" 
                className="gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group"
              >
                <Eye className="w-4 h-4" />
                View Live Dashboard Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Trust Badges - Simplified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-6 justify-center lg:justify-start mt-10 pt-6 border-t border-gray-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 rounded-full">
                <span className="text-xl">🔒</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Privacy-First</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 rounded-full">
                <span className="text-xl">🎓</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Built for Students</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 rounded-full">
                <span className="text-xl">🤖</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Explainable AI</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              {/* Fake Browser Bar */}
              <div className="bg-gray-100 dark:bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white dark:bg-slate-900 rounded-lg px-3 py-1.5 text-sm text-gray-500 font-mono flex items-center gap-2 shadow-inner border border-gray-200 dark:border-slate-700">
                    <Lock className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="truncate text-gray-700 dark:text-gray-300">paypa1.com/verify-account</span>
                    <span className="text-red-500 text-xs ml-auto font-bold">⚠️ Suspicious</span>
                  </div>
                </div>
              </div>

              {/* Alert Content */}
              <div className="p-6">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        Heads up! This looks suspicious.
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        This link looks fake because the domain is trying to mimic "paypal.com" 
                        but uses <span className="font-mono bg-gray-200 dark:bg-slate-700 px-1 rounded">paypa1.com</span> 
                        (with a number 1 instead of letter L).
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                      Got it, thanks!
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg">
                      Learn more
                    </Button>
                  </div>
                </div>

                {/* AI Explanation Tag */}
                <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>AI-Powered Detection</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Real-time Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 text-white dark:text-slate-950">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
}