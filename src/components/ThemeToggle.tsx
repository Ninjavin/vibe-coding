import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

// Custom SVG icons for better appearance
const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 stroke-current"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-full transition-colors duration-200
        ${theme === 'light'
          ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700'
        }
      `}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{
            opacity: theme === 'dark' ? 1 : 0,
            scale: theme === 'dark' ? 1 : 0.5,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <MoonIcon />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            opacity: theme === 'light' ? 1 : 0,
            scale: theme === 'light' ? 1 : 0.5,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <SunIcon />
        </motion.div>
      </div>
    </button>
  );
} 