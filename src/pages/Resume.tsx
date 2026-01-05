import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Download,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";

const Resume = () => {
  return (
    <DashboardLayout
      title="Resume"
      subtitle="Manage and optimize your professional resume."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Resume Preview
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-primary text-primary-foreground"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Resume Content */}
          <div className="bg-secondary rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="text-center border-b border-border pb-4">
              <h3 className="text-2xl font-bold text-foreground">
                Prabesh Khanal
              </h3>
              <p className="text-muted-foreground mt-1">
                Full Stack Developer
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                prabesh@email.com • github.com/prabesh • linkedin.com/in/prabesh
              </p>
            </div>

            {/* Experience */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Experience</h4>
              </div>
              <div className="space-y-3">
                <div className="pl-7">
                  <p className="font-medium text-foreground">
                    Software Engineering Intern
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tech Company • Jun 2023 - Aug 2023
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Developed full-stack features using React and Node.js
                  </p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Education</h4>
              </div>
              <div className="pl-7">
                <p className="font-medium text-foreground">
                  Bachelor of Science in Computer Science
                </p>
                <p className="text-sm text-muted-foreground">
                  University Name • Expected 2025
                </p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Skills</h4>
              </div>
              <div className="pl-7 flex flex-wrap gap-2">
                {[
                  "React",
                  "Node.js",
                  "TypeScript",
                  "MongoDB",
                  "PostgreSQL",
                  "AWS",
                  "Docker",
                  "Git",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resume Score & Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Score Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm text-muted-foreground mb-2">Resume Score</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary">78</span>
              <span className="text-muted-foreground mb-1">/100</span>
            </div>
            <div className="h-2 bg-secondary rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "78%" }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full progress-gradient"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Your resume is above average. Follow our suggestions to improve.
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Suggestions</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Strong project section
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your projects showcase diverse skills
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Add quantifiable achievements
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Include metrics and numbers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Expand work experience
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add more details about responsibilities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Resume;
