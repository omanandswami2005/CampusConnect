import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const BlurText = ({
  text,
  className = "",
  delay = 0,
  duration = 0.8,
  animateBy = "words", // 'words' or 'characters'
  stagger = 0.05,
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const splitText = (text, type) => {
    if (type === "characters") {
      return text.split("").map((char, i) => ({ char, key: i }));
    }
    return text.split(" ").map((word, i) => ({ char: word, key: i }));
  };

  const textArray = splitText(text, animateBy);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      {...props}
    >
      {textArray.map(({ char, key }) => (
        <motion.span
          key={key}
          variants={itemVariants}
          className="inline-block"
          style={{
            marginRight: animateBy === "words" ? "0.25em" : "0",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText;
