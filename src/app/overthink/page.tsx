'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleBottomCenterTextIcon, LightBulbIcon, SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import Groq from 'groq-sdk';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

type Mode = 'humor' | 'serious' | 'ai';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const PROMPTS = {
  humor: "You are a GenZ overthinking expert with a great sense of humor. Given this situation: '{situation}', generate 10 funny, overthought interpretations. Make them witty and include emojis. Format as a JSON array of strings.",
  serious: "You are a thoughtful analyst. Given this situation: '{situation}', generate 10 serious, psychological interpretations of what it might mean. Consider social dynamics, mental states, and communication patterns. Format as a JSON array of strings.",
  ai: "You are an AI analyzer using technical language. Given this situation: '{situation}', generate 10 data-driven, technical analyses with made-up statistics and ML terminology. Include confidence scores and technical jargon. Format as a JSON array of strings."
};

const modeDetails = {
  humor: {
    title: 'Humor Mode',
    icon: LightBulbIcon,
    gradient: 'from-pink-500 to-rose-500',
    shadow: 'shadow-rose-500/20',
    description: 'Get witty and funny overthinking scenarios 😂'
  },
  serious: {
    title: 'Serious Mode',
    icon: ChatBubbleBottomCenterTextIcon,
    gradient: 'from-violet-500 to-purple-500',
    shadow: 'shadow-purple-500/20',
    description: 'Deep psychological analysis of the situation 🧠'
  },
  ai: {
    title: 'AI Mode',
    icon: SparklesIcon,
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    description: 'Technical analysis with AI jargon 🤖'
  }
};

export default function OverthinkerPage() {
  const [situation, setSituation] = useState('');
  const [mode, setMode] = useState<Mode>('humor');
  const [isThinking, setIsThinking] = useState(false);
  const [interpretations, setInterpretations] = useState<string[]>([]);
  const [error, setError] = useState('');

  const generateInterpretations = async () => {
    try {
      setError('');
      setIsThinking(true);
      setInterpretations([]); // Clear previous results
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: PROMPTS[mode].replace('{situation}', situation)
          }
        ],
        model: 'gemma2-9b-it',
        temperature: 0.9,
        max_tokens: 1024,
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) throw new Error('No response from Groq');

      // Extract JSON content from code block if present
      const jsonContent = result.includes('```json')
        ? result.split('```json\n')[1].split('```')[0]
        : result;

      // Clean up the JSON string
      const cleanJson = jsonContent
        .replace(/\n/g, '')  // Remove newlines
        .replace(/\\/g, '')  // Remove escape characters
        .trim();

      // Parse the JSON array from the response
      const parsedInterpretations = JSON.parse(cleanJson);
      setInterpretations(parsedInterpretations);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate interpretations. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) return;
    await generateInterpretations();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-30"></div>
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex justify-between items-center">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Tools</span>
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-sm">Powered by Groq</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 text-transparent bg-clip-text">
              Overthinker Simulator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Transform your simple messages into a spiral of endless possibilities! 🤔✨
            </p>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-purple-500/10 dark:from-rose-500/5 dark:to-purple-500/5 blur-3xl -z-10"></div>
            <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 mb-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <input
                    type="text"
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Enter any situation to overthink... (e.g., 'They left me on read')"
                    className="w-full px-6 py-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {(Object.keys(modeDetails) as Mode[]).map((modeKey) => {
                    const details = modeDetails[modeKey];
                    const Icon = details.icon;
                    return (
                      <button
                        key={modeKey}
                        type="button"
                        onClick={() => setMode(modeKey)}
                        className={`relative group p-4 rounded-xl transition-all duration-300 ${
                          mode === modeKey
                            ? `bg-gradient-to-r ${details.gradient} ${details.shadow} shadow-lg`
                            : 'bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/80'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Icon className={`w-8 h-8 ${mode === modeKey ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                          <h3 className={`font-medium ${mode === modeKey ? 'text-white' : 'text-gray-900 dark:text-gray-300'}`}>
                            {details.title}
                          </h3>
                          <p className={`text-sm ${mode === modeKey ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                            {details.description}
                          </p>
                        </div>
                        {mode === modeKey && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-50 -z-10"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                    isThinking || !situation.trim()
                      ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-fuchsia-500/20 hover:scale-[1.02]'
                  }`}
                  disabled={isThinking || !situation.trim()}
                >
                  {isThinking ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>Overthinking in progress</span>
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-current"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-current"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-current"
                        />
                      </div>
                    </div>
                  ) : (
                    'Generate Interpretations'
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 dark:text-red-400 text-center mb-8 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4"
              >
                {error}
              </motion.div>
            )}

            {!isThinking && interpretations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {interpretations.map((interpretation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-fuchsia-500/5 dark:from-rose-500/10 dark:to-fuchsia-500/10 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                    <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 hover:border-fuchsia-500/30 dark:hover:border-fuchsia-500/30 transition-all duration-300">
                      <p className="text-gray-700 dark:text-gray-300 text-lg">{interpretation}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
} 