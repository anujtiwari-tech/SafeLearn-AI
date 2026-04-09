import { Search, MessageCircle, GraduationCap } from 'lucide-react';
import { motion } from "framer-motion";

export function SolutionSection() {
  const steps = [
    {
      icon: Search,
      number: '1',
      title: 'Detects',
      description: 'Our AI scans links and emails in real-time, spotting phishing, malware, and privacy risks.',
      color: 'bg-[#4F46E5]',
      delay: 0.1,
    },
    {
      icon: MessageCircle,
      number: '2',
      title: 'Explains',
      description: 'Instead of just blocking, we explain WHY in plain English: "This link looks fake because..."',
      color: 'bg-[#F59E0B]',
      delay: 0.2,
    },
    {
      icon: GraduationCap,
      number: '3',
      title: 'Educates',
      description: 'Every alert becomes a micro-lesson, building cyber-smart habits for life.',
      color: 'bg-[#10B981]',
      delay: 0.3,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            How SafeLearn AI Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Protection that teaches. Security that empowers. Education that sticks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: step.delay }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 h-full hover:shadow-xl transition-shadow">
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-center text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {step.description}
                </p>
              </div>

              {/* Connecting Arrow (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-full -translate-y-1/2 z-10">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path d="M5 15 L20 15 M20 15 L15 10 M20 15 L15 20" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Visual Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-900 p-6 border-2 border-[#10B981] rounded-xl shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Great job spotting that phishing attempt!</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  You just avoided a fake email that was pretending to be from your bank. 
                  Here's what made it suspicious:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span>The sender's email was "support@bnk-secure.com" (not your real bank)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span>It had urgent language like "Account will be closed in 24 hours"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span>The link redirected to a different website</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-[#10B981] bg-opacity-10 border border-[#10B981] rounded-lg p-3 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-medium text-[#10B981] text-center dark:text-white text-black">
                Badge earned: Phishing Detector Level 2
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
