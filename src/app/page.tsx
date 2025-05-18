'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BrainIcon, 
  MessageSquareIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon
} from 'lucide-react';

const tools = [
  {
    title: 'Overthinker Simulator',
    description: 'Turn simple situations into complex overthinking scenarios with AI-powered analysis.',
    icon: BrainIcon,
    color: 'from-violet-500 to-purple-500',
    textColor: 'text-purple-500',
    ringColor: 'ring-purple-500',
    href: '/overthink',
    examples: [
      '"k" → "Does this mean they\'re mad?"',
      '"She said OK" → "But what kind of OK? 🤔"',
      '"Let\'s talk later" → "Is this the end? 😰"'
    ]
  },
  {
    title: 'Digital Alibi',
    description: 'Generate believable stories for those awkward situations when you need a quick escape.',
    icon: ShieldCheckIcon,
    color: 'from-emerald-500 to-teal-500',
    textColor: 'text-teal-500',
    ringColor: 'ring-teal-500',
    href: '/alibi',
    examples: [
      'Late to meeting',
      'Missed deadline',
      'Can\'t attend event'
    ]
  },
  {
    title: 'ReplyCraft',
    description: 'Craft the perfect response with different tones, from savage to professional.',
    icon: MessageSquareIcon,
    color: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-500',
    ringColor: 'ring-blue-500',
    href: '/replycraft',
    examples: [
      'Passive-aggressive mode',
      'Tech-savvy comebacks',
      'Professional tone'
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-6xl"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-gray-300 mb-8"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">Powered by Groq AI</span>
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Anxiety Tools for Gen Z
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your digital companion for overthinking, crafting perfect replies, and getting out of awkward situations.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <Link href={tool.href}>
                <div className="h-full p-6 rounded-2xl bg-gray-800/50 backdrop-blur border border-gray-700 hover:border-gray-600 transition-all">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.color} mb-4`}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 flex items-center group-hover:text-white">
                    {tool.title}
                    <ArrowRightIcon className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  
                  <p className="text-gray-400 mb-4">
                    {tool.description}
                  </p>

                  <div className="space-y-2">
                    {tool.examples.map((example, index) => (
                      <div 
                        key={index}
                        className="text-sm text-gray-500 bg-gray-800/50 px-3 py-2 rounded-lg"
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-gray-400"
        >
          <p>More tools coming soon... 👀</p>
        </motion.div>
      </motion.div>
    </main>
  );
} 