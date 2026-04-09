import { MessageSquare, Tag, Trophy, ThumbsUp, BarChart3, Sparkles, Shield, Brain, Zap, Lock, GraduationCap, Mail, Globe, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useState } from "react";

export function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: MessageSquare,
      title: 'Plain-English Explanations',
      description: 'No tech jargon. Just clear, friendly explanations anyone can understand.',
      emoji: '💬',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      delay: 0
    },
    {
      icon: Tag,
      title: 'Privacy Nutrition Labels',
      description: 'See at a glance if an app respects your data—before you sign up.',
      emoji: '🏷️',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      delay: 0.1
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn badges and level up your security skills as you browse.',
      emoji: '🏆',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      delay: 0.2
    },
    {
      icon: ThumbsUp,
      title: 'Trust-Building Feedback',
      description: 'Report false alarms and help our AI learn—because you\'re in control.',
      emoji: '👍',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      delay: 0.3
    },
    {
      icon: BarChart3,
      title: 'Personal Security Dashboard',
      description: 'Track your progress, review blocked threats, and celebrate wins.',
      emoji: '📊',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      delay: 0.4
    },
    {
      icon: Sparkles,
      title: 'Real-Time Protection',
      description: 'Stay safe across all your favorite sites with instant threat detection.',
      emoji: '✨',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      delay: 0.5
    },
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
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
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Why Choose SafeLearn AI</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Key Features That Make You{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Cyber-Smart
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            SafeLearn AI goes beyond basic protection to build lasting security awareness.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="group"
            >
              <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-800 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon & Emoji */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <div className="text-3xl">{feature.emoji}</div>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
            Try SafeLearn AI Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}