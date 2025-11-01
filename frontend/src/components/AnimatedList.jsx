import { motion, AnimatePresence } from "framer-motion";

const AnimatedList = ({
  children,
  className = "",
  stagger = 0.1,
  duration = 0.5,
  direction = "up",
  ...props
}) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      ...directions[direction],
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      ...directions[direction],
      scale: 0.95,
      transition: {
        duration: duration * 0.7,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      <AnimatePresence mode="popLayout">
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <motion.div
              key={child.key || index}
              variants={itemVariants}
              layout
              className="w-full"
            >
              {child}
            </motion.div>
          ))
        ) : (
          <motion.div variants={itemVariants} layout>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedList;
