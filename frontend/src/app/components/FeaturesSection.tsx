import { MessageSquare, Tag, Trophy, ThumbsUp, BarChart3, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Plain-English Explanations',
      description: 'No tech jargon. Just clear, friendly explanations anyone can understand.',
      emoji: '💬',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50',
      iconColor: 'text-[#4F46E5] dark:text-indigo-400',
    },
    {
      icon: Tag,
      title: 'Privacy Nutrition Labels',
      description: 'See at a glance if an app respects your data—before you sign up.',
      emoji: '🏷️',
      color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn badges and level up your security skills as you browse.',
      emoji: '🏆',
      color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50',
      iconColor: 'text-[#F59E0B]',
    },
    {
      icon: ThumbsUp,
      title: 'Trust-Building Feedback',
      description: 'Report false alarms and help our AI learn—because you\'re in control.',
      emoji: '💬',
      color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50',
      iconColor: 'text-[#10B981] dark:text-emerald-400',
    },
    {
      icon: BarChart3,
      title: 'Personal Security Dashboard',
      description: 'Track your progress, review blocked threats, and celebrate wins.',
      emoji: '📊',
      color: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: Sparkles,
      title: 'Real-Time Protection',
      description: 'Stay safe across all your favorite sites with instant threat detection.',
      emoji: '✨',
      color: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800/50',
      iconColor: 'text-pink-600 dark:text-pink-400',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Key Features That Make You{' '}
            <span className="text-[#4F46E5] dark:text-indigo-400">Cyber-Smart</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            SafeLearn AI goes beyond basic protection to build lasting security awareness.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className={`${feature.color} dark:bg-slate-900 border-2 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <div className="text-3xl">{feature.emoji}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Showcase - Privacy Label Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/40 dark:to-blue-900/40 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800/50">
            <h3 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">Privacy Nutrition Label Example</h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg text-slate-900 dark:text-white">SocialApp Pro</h4>
                <div className="flex items-center gap-1">
                  <span className="text-2xl">⚠️</span>
                  <span className="font-bold text-[#F59E0B]">C</span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Data Collection</span>
                  <span className="font-medium text-red-600 dark:text-red-400">High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Third-Party Sharing</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">Medium</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User Control</span>
                  <span className="font-medium text-[#10B981]">Good</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This app collects location, contacts, and browsing history. 
                  Some data is shared with advertising partners.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
