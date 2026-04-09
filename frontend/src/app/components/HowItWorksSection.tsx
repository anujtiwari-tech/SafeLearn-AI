import { Chrome, Brain, Shield, ArrowRight, CheckCircle, Sparkles, Zap, Lock, Clock } from 'lucide-react';
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useState } from "react";

export function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      number: "01",
      icon: Chrome,
      title: "Install & Browse Normally",
      description: "Add SafeLearn AI to Chrome in one click, then continue browsing as usual. We work silently in the background.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      delay: 0
    },
    {
      number: "02",
      icon: Brain,
      title: "AI Scans in Real-Time",
      description: "Our Llama 3-powered AI analyzes every URL, email, and download for threats within milliseconds.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      delay: 0.1
    },
    {
      number: "03",
      icon: Shield,
      title: "Get Smart Explanations",
      description: "If a threat is detected, we explain exactly why it's dangerous—in plain English.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600 dark:text-green-400",
      delay: 0.2
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            How It{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced AI protection that's simple to use—no technical expertise required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: step.delay }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              className="relative"
            >
              <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 h-full transition-all duration-300 ${hoveredStep === index ? 'shadow-xl -translate-y-1' : ''} border border-gray-100 dark:border-slate-800`}>
                {/* Step Number */}
                <div className="absolute -top-4 left-6">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mb-4 mt-2`}>
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
            Get Started - It's Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}