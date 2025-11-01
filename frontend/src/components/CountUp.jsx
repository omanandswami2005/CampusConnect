import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect } from "react";

const CountUp = ({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = "",
  className = "",
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(start);
  const rounded = useTransform(count, (latest) => {
    const value = parseFloat(latest.toFixed(decimals));
    let formatted = value.toString();

    if (separator && value >= 1000) {
      formatted = value.toLocaleString();
    }

    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, end, {
        duration: duration,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      });

      return controls.stop;
    }
  }, [isInView, count, end, duration, delay]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: "backOut",
      }}
      {...props}
    >
      <motion.span>{rounded}</motion.span>
    </motion.span>
  );
};

export default CountUp;
