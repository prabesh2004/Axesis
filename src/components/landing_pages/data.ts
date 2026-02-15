import {
  FileUser,
  FileText,
  FolderKanban,
  Target,
  Sparkles,
  ListChecks,
} from "lucide-react";

export type LandingFeature = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type LandingStep = {
  title: string;
  description: string;
};

export const landingFeatures: LandingFeature[] = [
  {
    title: "Keep your resume in one place",
    description: "Upload it once and refer back anytime.",
    icon: FileUser,
  },
  {
    title: "Write notes you can find later",
    description: "Capture what you learn and keep it organized.",
    icon: FileText,
  },
  {
    title: "Track projects that matter",
    description: "Build a simple record of what you’ve done.",
    icon: FolderKanban,
  },
  {
    title: "Set clear goals",
    description: "Choose roles and interests to stay focused.",
    icon: Target,
  },
  {
    title: "Get guidance shaped to you",
    description: "Ask questions and get direction based on your background.",
    icon: Sparkles,
  },
  {
    title: "See your next steps",
    description: "Turn everything into a short, actionable plan.",
    icon: ListChecks,
  },
];

export const landingSteps: LandingStep[] = [
  {
    title: "Create your account",
    description: "Sign up and open your dashboard.",
  },
  {
    title: "Add your resume and goals",
    description: "Give Axesis the basics of what you’re aiming for.",
  },
  {
    title: "Capture notes and projects",
    description: "Keep your work and learning in one place.",
  },
  {
    title: "Get direction",
    description: "Review guidance and move to the next step.",
  },
];
