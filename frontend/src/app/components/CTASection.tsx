import { Shield, Play, ArrowRight } from 'lucide-react';
// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Button } from './ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#4F4653] to-indigo-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to browse smarter?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students who are building cyber-smart habits while staying protected online.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-[#4F46E5] hover:bg-gray-100 gap-2 text-lg px-8 py-6"
              
            > <Shield className="w-6 h-6" />
              <a href="https://chromewebstore.google.com/detail/safelearn-ai/pnpdplnkgdndlckfhmhngjddhnbkmdnk" target="_blank">
              
              Install SafeLearn AI 
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white bg-blue-500 hover:bg-white/10 gap-2 text-lg px-8 py-6"
            >
              <Play className="w-6 h-6" />
              <a href="SafeLearnAIDemo.mp4" target="_blank">
              Watch Demo Video
              </a>
            </Button>
          </div>

          {/* Reassurance */}
          <div className="flex flex-wrap gap-6 justify-center text-sm text-indigo-100 mb-12">
            <div className="flex items-center gap-2">
              <span className="text-[#10B981] text-xl">✓</span>
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#10B981] text-xl">✓</span>
              <span>1-click install</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#10B981] text-xl">✓</span>
              <span>Works in 30 seconds</span>
            </div>
          </div>

          {/* For Schools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="border-t border-white/20 pt-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-3 flex items-center justify-center gap-2">
                <span className="text-2xl">🏫</span>
                Are you an educator?
              </h3>
              <p className="text-indigo-100 mb-4">
                Get SafeLearn AI for your entire school with centralized management, 
                analytics, and custom lessons.
              </p>
              <Button 
                variant="outline" 
                className="border-white text-white bg-blue-500 hover:bg-white/10 gap-2"
              >
                Request a School License
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
