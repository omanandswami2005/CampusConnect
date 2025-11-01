import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const Magnet = ({
  children,
  magnitude = 0.3,
  maxDistance = 100,
  damping = 20,
  stiffness = 150,
  className = "",
  ...props
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { damping, stiffness });
  const springY = useSpring(y, { damping, stiffness });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        x.set(deltaX * magnitude * force);
        y.set(deltaY * magnitude * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [x, y, magnitude, maxDistance]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Magnet;
