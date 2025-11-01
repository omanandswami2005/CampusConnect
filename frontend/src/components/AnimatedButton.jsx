import { motion } from "framer-motion";
import { useState } from "react";

const AnimatedButton = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-200",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const rippleVariants = {
    initial: { scale: 0, opacity: 0.5 },
    animate: {
      scale: 4,
      opacity: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        ${variants[variant]} 
        ${sizes[size]} 
        ${
          disabled || loading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }
        ${className}
      `}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : "initial"}
      whileTap={!disabled && !loading ? "tap" : "initial"}
      disabled={disabled || loading}
      onClick={(e) => {
        if (!disabled && !loading && onClick) {
          setIsPressed(true);
          setTimeout(() => setIsPressed(false), 600);
          onClick(e);
        }
      }}
      {...props}
    >
      {/* Ripple effect */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 bg-white rounded-lg"
          variants={rippleVariants}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}

      {/* Button content */}
      <motion.span
        className={`relative z-10 flex items-center justify-center gap-2 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

export default AnimatedButton;
