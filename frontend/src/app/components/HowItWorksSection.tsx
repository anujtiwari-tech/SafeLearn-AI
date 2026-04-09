import { Globe, Brain, CheckCircle, Code } from 'lucide-react';
import { motion } from "framer-motion";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            How It Works Behind the Scenes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced AI protection that's simple to use.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 border-l-4 border-[#4F46E5]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                    1. You browse normally
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    SafeLearn AI runs quietly in the background, monitoring your activity without slowing you down.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 border-l-4 border-[#F59E0B]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F59E0B] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                    2. AI analyzes in real-time
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our Llama 3-powered engine scans URLs, emails, and downloads for phishing patterns, malware signatures, and privacy red flags.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 border-l-4 border-[#10B981]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                    3. You get an explanation, not just a warning
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    If something's risky, we explain what we found and why it matters—helping you learn to spot threats yourself.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Technical Details (Expandable) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <details className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
              <summary className="cursor-pointer font-semibold text-lg flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                <Code className="w-5 h-5 text-[#4F46E5]" />
                For the Tech Curious
              </summary>
              <div className="space-y-3 text-gray-700 dark:text-gray-300 pl-7">
                <p className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span><strong>Built with:</strong> React + Python + Llama 3 AI</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span><strong>Zero-knowledge privacy architecture:</strong> Your data never leaves your device</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span><strong>Open-source explanation engine:</strong> See exactly how we determine threats</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span><strong>Continuous learning:</strong> AI improves with community feedback</span>
                </p>
              </div>
            </details>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
