import { Shield, Lock, Eye, Database, FileCheck } from 'lucide-react';
import { motion } from "framer-motion";
export function TrustSection() {
  const trustItems = [
    {
      icon: Lock,
      title: 'Zero data collection',
      description: 'We don\'t collect, store, or sell your browsing history. Ever.',
    },
    {
      icon: Eye,
      title: 'Local-first processing',
      description: 'All threat detection happens on your device. Your data stays yours.',
    },
    
    {
      icon: FileCheck,
      title: 'Open source',
      description: 'Our code is public. Security researchers can verify our claims.',
    },
  ];

  return (
    <section id="trust" className="py-20 bg-gradient-to-br from-indigo-700 to-purple-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Shield className="w-10 h-10 text-[#10B981]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Privacy Is Our Promise
          </h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            We built SafeLearn AI on a foundation of trust. Here's our commitment to you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-indigo-200 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              Privacy-First Architecture
            </h3>
            <ul className="space-y-3 text-indigo-100">
              <li className="flex items-start gap-3">
                <span className="text-[#10B981] font-bold text-xl">✓</span>
                <span>All threat analysis runs locally in your browser</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#10B981] font-bold text-xl">✓</span>
                <span>We can't see what sites you visit or what you do online</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#10B981] font-bold text-xl">✓</span>
                <span>Optional anonymized threat reports help improve detection (you control this)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#10B981] font-bold text-xl">✓</span>
                <span>Independently audited by security researchers</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-indigo-200 text-sm mb-6 max-w-2xl mx-auto leading-relaxed">
            We operate with radical transparency. Our mission is to empower students and educators with 
            <span className="text-white font-medium"> Explainable Security (XSec)</span>—turning every detected threat into a valuable learning opportunity while keeping your data private.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <a href="#" className="text-indigo-100 hover:text-white transition-colors flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Privacy Policy
            </a>
            <a href="#" className="text-indigo-100 hover:text-white transition-colors flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Whitepaper
            </a>
            <a href="#" className="text-indigo-100 hover:text-white transition-colors flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Compliance
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
