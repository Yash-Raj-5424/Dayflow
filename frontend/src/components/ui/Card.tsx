import type { ReactNode, MouseEventHandler } from "react";
import { motion } from "framer-motion";

interface CardProps {
  className?: string;
  children: ReactNode;
  delay?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ className = "", children, delay = 0, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`glass rounded-2xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}
