import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  hover = true,
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directions = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 },
  };

  const variants = {
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
        duration: 0.6,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const hoverVariants = hover
    ? {
        scale: 1.02,
        y: -8,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      }
    : {};

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={hoverVariants}
      variants={variants}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
