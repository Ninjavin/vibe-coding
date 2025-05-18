'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentCheckIcon, 
  ArrowLeftIcon,
  SparklesIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import Groq from 'groq-sdk';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const ALIBI_PROMPT = `You are a creative alibi generator that helps people explain awkward situations. Given the situation: '{situation}', generate:
1. A detailed, believable story (2-3 paragraphs)
2. 3-4 specific details to make it more convincing
3. A list of potential "evidence" that could support the story (like screenshots, receipts, etc.)
4. A short one-liner excuse for quick responses

Format the response as a JSON object with keys:
{
  "story": "detailed story here",
  "details": ["detail1", "detail2", "detail3"],
  "evidence": ["evidence1", "evidence2", "evidence3"],
  "quickExcuse": "short excuse here"
}

Make the story modern, relatable, and include realistic tech-related elements when appropriate.`;

export default function AlibiGenerator() {
  const [situation, setSituation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [alibi, setAlibi] = useState<{
    story: string;
    details: string[];
    evidence: string[];
    quickExcuse: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [copiedExcuse, setCopiedExcuse] = useState(false);

  const generateAlibi = async () => {
    try {
      setError('');
      setIsGenerating(true);
      setAlibi(null);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: ALIBI_PROMPT.replace('{situation}', situation)
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
        .replace(/\n/g, '')
        .replace(/\\/g, '')
        .trim();

      const parsedAlibi = JSON.parse(cleanJson);
      setAlibi(parsedAlibi);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate alibi. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) return;
    await generateAlibi();
  };

  const handleCopyExcuse = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExcuse(true);
    setTimeout(() => setCopiedExcuse(false), 2000);
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
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-transparent bg-clip-text">
              Digital Alibi Generator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Turn your awkward situations into believable stories! 🕵️‍♂️✨
            </p>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 blur-3xl -z-10"></div>
            <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 mb-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Describe the situation you need an alibi for... (e.g., 'Missed a deadline for an important project' or 'Need to get out of a social event')"
                    className="w-full px-6 py-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg min-h-[120px] resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                    isGenerating || !situation.trim()
                      ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02]'
                  }`}
                  disabled={isGenerating || !situation.trim()}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>Crafting your alibi</span>
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
                    'Generate Alibi'
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

            {!isGenerating && alibi && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Quick Excuse */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                  <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">
                        Quick Excuse
                      </h3>
                      <button
                        onClick={() => handleCopyExcuse(alibi.quickExcuse)}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm group/copy"
                      >
                        {copiedExcuse ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardIcon className="w-4 h-4" />
                            <span className="opacity-0 group-hover/copy:opacity-100 transition-opacity">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">"{alibi.quickExcuse}"</p>
                  </div>
                </motion.div>

                {/* Detailed Story */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                  <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">
                      Detailed Story
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg whitespace-pre-wrap">
                      {alibi.story}
                    </p>
                  </div>
                </motion.div>

                {/* Supporting Details */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                  <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">
                      Supporting Details
                    </h3>
                    <ul className="space-y-3">
                      {alibi.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <DocumentCheckIcon className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Evidence */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                  <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">
                      Potential Evidence
                    </h3>
                    <ul className="space-y-3">
                      {alibi.evidence.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <DocumentCheckIcon className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
} 