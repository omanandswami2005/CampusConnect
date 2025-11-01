import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Heart,
  Trophy,
  Globe,
  Shield,
  ChevronDown,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedButton from "../components/AnimatedButton";
import BlurText from "../components/BlurText";
import CountUp from "../components/CountUp";
import Particles from "../components/Particles";
import Magnet from "../components/Magnet";
import GlassSurface from "../components/GlassSurface";
import { useRef } from "react";

// Floating Particles Component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-60"
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

// Animated Chip Component
const AnimatedChip = ({
  children,
  variant = "primary",
  delay = 0,
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400",
    secondary:
      "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-600 dark:text-green-400",
    accent:
      "bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-600 dark:text-pink-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "backOut" }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`
        inline-flex items-center px-4 py-2 rounded-full border backdrop-blur-sm
        font-medium text-sm transition-all duration-300
        ${variants[variant]}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
  gradient,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        y: -10,
        rotateX: -5,
        transition: { duration: 0.3 },
      }}
      className="group relative"
    >
      <div className="card h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 overflow-hidden">
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`}
        />

        {/* Icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
          whileHover={{ rotate: 5 }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>

        {/* Hover effect */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ number, label, suffix = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: "backOut" }}
      className="text-center"
    >
      <div className="relative">
        <CountUp
          end={number}
          suffix={suffix}
          className="text-4xl md:text-5xl font-bold gradient-text block"
          duration={2}
          delay={delay}
        />
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
        {label}
      </p>
    </motion.div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ name, role, content, avatar, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: 15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay, ease: "backOut" }}
      whileHover={{ y: -5, rotateY: -2 }}
      className="card bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 h-full"
    >
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + i * 0.1, duration: 0.3 }}
          >
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </motion.div>
        ))}
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
        "{content}"
      </p>

      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const features = [
    {
      icon: Calendar,
      title: "Smart Event Discovery",
      description:
        "Find events that match your interests with our AI-powered recommendation system.",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Community Building",
      description:
        "Connect with like-minded students and build lasting relationships through shared experiences.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Instant Registration",
      description:
        "Register for events with just one click and get instant confirmation and reminders.",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Your data is protected with enterprise-grade security and 99.9% uptime guarantee.",
      gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
      icon: Globe,
      title: "Campus-Wide Reach",
      description:
        "Discover events from all clubs and organizations across your entire campus ecosystem.",
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-500",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description:
        "Earn badges and rewards for attending events and being an active community member.",
      gradient: "bg-gradient-to-br from-yellow-500 to-orange-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content:
        "CampusConnect helped me discover amazing tech events I never knew existed. I've made so many connections!",
      avatar: "SC",
    },
    {
      name: "Marcus Johnson",
      role: "Student Council President",
      content:
        "Managing events has never been easier. The platform streamlined our entire event organization process.",
      avatar: "MJ",
    },
    {
      name: "Emily Rodriguez",
      role: "Art Club Member",
      content:
        "I love how easy it is to find creative workshops and art exhibitions happening around campus.",
      avatar: "ER",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20" />

        {/* ReactBits Particles Background */}
        <Particles
          particleCount={80}
          particleColors={["#3B82F6", "#8B5CF6", "#EC4899", "#10B981"]}
          speed={0.8}
          size={3}
          className="opacity-60"
        />

        <FloatingParticles />

        {/* Animated Background Shapes */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="relative z-10 text-center max-w-6xl mx-auto px-4"
          style={{ y, opacity }}
        >
          {/* Chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <AnimatedChip variant="primary" delay={0.1}>
              <Sparkles className="w-4 h-4 mr-2" />
              New Platform
            </AnimatedChip>
            <AnimatedChip variant="secondary" delay={0.2}>
              <Heart className="w-4 h-4 mr-2" />
              Student Favorite
            </AnimatedChip>
            <AnimatedChip variant="accent" delay={0.3}>
              <Trophy className="w-4 h-4 mr-2" />
              Award Winning
            </AnimatedChip>
          </div>

          {/* Main Heading */}
          {/* Main Heading with Magnetic Effect */}
          <Magnet magnitude={0.15} maxDistance={150} className="block">
            <BlurText
              text="Connect. Discover. Experience."
              className="text-5xl md:text-7xl lg:text-8xl font-black gradient-text mb-6 cursor-pointer"
              animateBy="words"
              stagger={0.2}
            />
          </Magnet>

          {/* Subheading */}
          <BlurText
            text="The ultimate platform for campus event discovery and community building. Join thousands of students creating unforgettable memories."
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            delay={0.6}
            animateBy="words"
            stagger={0.03}
          />

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Magnet magnitude={0.2} maxDistance={100}>
              <Link to="/events">
                <AnimatedButton
                  size="lg"
                  className="flex items-center space-x-3 px-8 py-4 text-lg"
                >
                  <Calendar className="w-6 h-6" />
                  <span>Explore Events</span>
                  <ArrowRight className="w-5 h-5" />
                </AnimatedButton>
              </Link>
            </Magnet>

            <Magnet magnitude={0.2} maxDistance={100}>
              <Link to="/club">
                <AnimatedButton
                  variant="secondary"
                  size="lg"
                  className="flex items-center space-x-3 px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Get Started</span>
                </AnimatedButton>
              </Link>
            </Magnet>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center text-gray-400"
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <GlassSurface
            borderRadius={24}
            blur={20}
            opacity={0.15}
            className="p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Magnet magnitude={0.1} maxDistance={80}>
                <StatsCard
                  number={1200}
                  label="Active Students"
                  suffix="+"
                  delay={0.1}
                />
              </Magnet>
              <Magnet magnitude={0.1} maxDistance={80}>
                <StatsCard
                  number={150}
                  label="Campus Events"
                  suffix="+"
                  delay={0.2}
                />
              </Magnet>
              <Magnet magnitude={0.1} maxDistance={80}>
                <StatsCard
                  number={50}
                  label="Student Clubs"
                  suffix="+"
                  delay={0.3}
                />
              </Magnet>
              <Magnet magnitude={0.1} maxDistance={80}>
                <StatsCard
                  number={98}
                  label="Satisfaction Rate"
                  suffix="%"
                  delay={0.4}
                />
              </Magnet>
            </div>
          </GlassSurface>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <BlurText
              text="Why Students Love CampusConnect"
              className="text-4xl md:text-5xl font-bold gradient-text mb-6"
              animateBy="words"
            />
            <BlurText
              text="Discover the features that make campus life more connected and engaging"
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              delay={0.3}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Magnet key={index} magnitude={0.12} maxDistance={120}>
                <FeatureCard {...feature} delay={index * 0.1} />
              </Magnet>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <BlurText
              text="What Students Are Saying"
              className="text-4xl md:text-5xl font-bold gradient-text mb-6"
              animateBy="words"
            />
            <BlurText
              text="Real stories from students who've transformed their campus experience"
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              delay={0.3}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Magnet key={index} magnitude={0.08} maxDistance={100}>
                <TestimonialCard {...testimonial} delay={index * 0.2} />
              </Magnet>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedCard className="glass bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <BlurText
              text="Ready to Transform Your Campus Experience?"
              className="text-3xl md:text-4xl font-bold gradient-text mb-6"
              animateBy="words"
            />
            <BlurText
              text="Join thousands of students who are already discovering amazing events and building meaningful connections."
              className="text-lg text-gray-600 dark:text-gray-400 mb-8"
              delay={0.3}
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Magnet magnitude={0.15} maxDistance={90}>
                <Link to="/club">
                  <AnimatedButton
                    size="lg"
                    className="flex items-center space-x-3 px-8 py-4"
                  >
                    <Users className="w-6 h-6" />
                    <span>Join as Student</span>
                  </AnimatedButton>
                </Link>
              </Magnet>
              <Magnet magnitude={0.15} maxDistance={90}>
                <Link to="/club">
                  <AnimatedButton
                    variant="secondary"
                    size="lg"
                    className="flex items-center space-x-3 px-8 py-4"
                  >
                    <Calendar className="w-6 h-6" />
                    <span>Create Events</span>
                  </AnimatedButton>
                </Link>
              </Magnet>
            </div>
          </AnimatedCard>
        </div>
      </section>
    </div>
  );
}
