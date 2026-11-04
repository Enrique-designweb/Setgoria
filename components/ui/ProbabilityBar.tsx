'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProbabilityBar({ percentage, label }: { percentage: number, label: string }) {
  const isFavorable = percentage >= 60;
  const gradient = isFavorable ? 'from-blue-500 to-cyan-400' : 'from-set-primary to-set-accent';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-xs">
        <span className="text-set-muted font-medium uppercase">{label}</span>
        <span className={cn("font-black px-1.5 py-0.5 rounded", isFavorable ? "text-cyan-400 bg-cyan-400/10" : "text-set-accent bg-set-accent/10")}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-[#2a2d38] rounded-full h-1.5 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          className={cn("h-full rounded-full bg-linear-to-r", gradient)}
        />
      </div>
    </div>
  );
}
