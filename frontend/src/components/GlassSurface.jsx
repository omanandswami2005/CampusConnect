import { motion } from "framer-motion";

const GlassSurface = ({
  children,
  width = "100%",
  height = "auto",
  borderRadius = 20,
  blur = 16,
  opacity = 0.1,
  border = true,
  className = "",
  ...props
}) => {
  const glassStyles = {
    backdropFilter: `blur(${blur}px) saturate(180%)`,
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    border: border ? "1px solid rgba(255, 255, 255, 0.125)" : "none",
    borderRadius: `${borderRadius}px`,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={glassStyles}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      {...props}
    >
      {/* Dark mode glass effect */}
      <div className="absolute inset-0 bg-gray-900/10 dark:bg-white/5 rounded-inherit" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/10 rounded-inherit pointer-events-none" />
    </motion.div>
  );
};

export default GlassSurface;
