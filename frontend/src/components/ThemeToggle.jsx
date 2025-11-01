import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const toggleVariants = {
    light: { x: 0 },
    dark: { x: 24 },
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, ease: "backOut" },
    },
    exit: {
      scale: 0,
      rotate: 180,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-colors duration-300
        ${
          isDark
            ? "bg-gradient-to-r from-purple-600 to-blue-600"
            : "bg-gradient-to-r from-yellow-400 to-orange-400"
        }
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Toggle background glow */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30"
        animate={{
          boxShadow: isDark
            ? "0 0 20px rgba(147, 51, 234, 0.5)"
            : "0 0 20px rgba(251, 191, 36, 0.5)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Toggle circle */}
      <motion.div
        className="relative w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center"
        variants={toggleVariants}
        animate={theme}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Icons */}
        <motion.div
          key={theme}
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute"
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-purple-600" />
          ) : (
            <Sun className="w-3 h-3 text-orange-500" />
          )}
        </motion.div>
      </motion.div>

      {/* Floating particles effect */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${
            isDark ? "bg-purple-300" : "bg-yellow-300"
          }`}
          animate={{
            y: [-10, -20, -10],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          style={{
            left: `${30 + i * 15}%`,
            top: "10%",
          }}
        />
      ))}
    </motion.button>
  );
};

export default ThemeToggle;
