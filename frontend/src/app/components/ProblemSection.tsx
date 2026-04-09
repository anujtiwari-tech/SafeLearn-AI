import { AlertCircle, HelpCircle, ShieldX } from 'lucide-react';
import { motion } from "framer-motion";
export function ProblemSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
            Security warnings are{' '}
            <span className="text-[#F59E0B]">scary and confusing</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Most students see a security alert and think: "What did I do wrong?" 
            They ignore warnings, click through errors, and never learn why it mattered.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <ShieldX className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Just Blocks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Traditional security tools say "NO" but never explain why—leaving students 
                frustrated and vulnerable.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-[#F59E0B]" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">No Context</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "ERR_SSL_VERSION_OR_CIPHER_MISMATCH" — what does that even mean? 
                Tech jargon doesn't teach.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Learned Helplessness</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When every warning is unclear, students learn to ignore them all—making 
                them easier targets.
              </p>
            </motion.div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <p className="text-gray-700 dark:text-gray-300 italic mb-2">
              "I know I should be careful online, but I don't understand what I'm 
              supposed to watch out for."
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">— Sarah, College Sophomore</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
