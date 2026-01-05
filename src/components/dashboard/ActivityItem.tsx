import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  time: string;
}

const ActivityItem = ({ icon: Icon, title, time }: ActivityItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <span className="text-sm text-muted-foreground">{time}</span>
    </div>
  );
};

export default ActivityItem;
