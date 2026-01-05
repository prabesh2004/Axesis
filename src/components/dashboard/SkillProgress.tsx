import { motion } from "framer-motion";

interface SkillProgressProps {
  skill: string;
  percentage: number;
  color?: "cyan" | "purple" | "green" | "orange";
  delay?: number;
}

const SkillProgress = ({
  skill,
  percentage,
  color = "cyan",
  delay = 0,
}: SkillProgressProps) => {
  const colors = {
    cyan: "from-primary to-primary",
    purple: "from-accent to-accent",
    green: "from-emerald-500 to-emerald-500",
    orange: "from-orange-500 to-orange-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{skill}</span>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
        />
      </div>
    </div>
  );
};

export default SkillProgress;
