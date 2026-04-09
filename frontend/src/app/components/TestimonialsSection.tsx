import { Star, Quote } from 'lucide-react';
import { motion } from "framer-motion";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Computer Science Major',
      image: 'https://images.unsplash.com/photo-1758874384930-6e1452bb9c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBjb21wdXRlciUyMHN1Y2Nlc3N8ZW58MXx8fHwxNzc0NTQzNTE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      quote: 'Finally, a security tool that doesn\'t treat me like I\'m clueless. I\'ve learned more about cybersecurity in two weeks than I did in a whole semester.',
      rating: 5,
    },
    {
      name: 'Maria Rodriguez',
      role: 'Business Student',
      image: 'https://images.unsplash.com/photo-1762330917056-e69b34329ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbiUyMHRlY2h8ZW58MXx8fHwxNzc0NTQzNTE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      quote: 'The explanations are so clear! I used to just click through warnings, but now I actually understand what I\'m looking at.',
      rating: 5,
    },
    {
      name: 'Jordan Taylor',
      role: 'Graduate Student',
      image: 'https://images.unsplash.com/photo-1758270705172-07b53627dfcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc0NDgxMzY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      quote: 'The gamification is brilliant. I never thought I\'d be excited about security badges, but here we are!',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Students Love Learning While Staying Safe
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real feedback from students using SafeLearn AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-indigo-200" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { number: '10K+', label: 'Active Students' },
            { number: '500K+', label: 'Threats Blocked' },
            { number: '95%', label: 'Feel Safer Online' },
            { number: '4.9/5', label: 'User Rating' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#4F46E5] dark:text-indigo-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
