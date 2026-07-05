import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll-triggered fade + rise. Fires once when 50px into view.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  y = 30,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
