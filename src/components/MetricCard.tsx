import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useRef } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export function MetricCard({ title, value, icon: Icon, change, changeType = "neutral" }: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255,255,255,0.08)";
    ripple.style.transform = "scale(0)";
    ripple.style.animation = "ripple 0.6s ease-out";
    ripple.style.pointerEvents = "none";
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 relative overflow-hidden cursor-pointer btn-click"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {change && (
            <p className={`text-xs font-medium ${
              changeType === "positive" ? "text-foreground/70" :
              changeType === "negative" ? "text-foreground/50" :
              "text-muted-foreground"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
          <Icon className="h-5 w-5 text-foreground/70" />
        </div>
      </div>
    </motion.div>
  );
}
