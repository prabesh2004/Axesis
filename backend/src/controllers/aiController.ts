import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createHash } from "node:crypto";

import { createChatCompletion, type GroqMessage } from "../services/ai/groqClient.js";
import { createOpenRouterChatCompletion } from "../services/ai/openrouterClient.js";
import { generateGeminiText } from "../services/ai/geminiClient.js";
import { AiInsights } from "../models/AiInsights.js";
import { Resume } from "../models/Resume.js";
import { Goal } from "../models/Goal.js";
import { Project } from "../models/Project.js";
import { SkillProgress } from "../models/SkillProgress.js";

const querySchema = z.object({
  prompt: z.string().min(1),
  context: z.string().optional(),
});

const analyzeSchema = z.object({
  resumeText: z.string().min(1),
  notes: z.string().optional(),
  projects: z.string().optional(),
  goals: z
    .object({
      targetRoles: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
    })
    .optional(),
});

const analysisResultSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  careerPaths: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  explanation: z.string().min(1),
});

const insightsSchema = z.object({
  resumeText: z.string().min(1),
  notes: z.string().optional(),
  projects: z.string().optional(),
  goals: z
    .object({
      targetRoles: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
    })
    .optional(),
});

const insightsResultSchema = z.object({
  generatedAt: z.string().min(1).optional(),
  quickStats: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.number(),
      }),
    )
    .default([]),
  insights: z
    .array(
      z.object({
        kind: z.enum(["skill_gap", "career_path", "learning"]),
        title: z.string().min(1),
        description: z.string().min(1),
        action: z.string().min(1),
        type: z.enum(["recommendation", "insight"]),
      }),
    )
    .default([]),
  skillGapAnalysis: z
    .object({
      targetRoles: z.array(z.string()).default([]),
      strengths: z.array(z.string()).default([]),
      gaps: z
        .array(
          z.object({
            skill: z.string().min(1),
            priority: z.enum(["high", "medium", "low"]),
            reason: z.string().min(1),
            evidence: z.string().optional(),
          }),
        )
        .default([]),
    })
    .default({ targetRoles: [], strengths: [], gaps: [] }),
  learningRecommendations: z
    .array(
      z.object({
        title: z.string().min(1),
        why: z.string().min(1),
        steps: z.array(z.string()).default([]),
        timeframeWeeks: z.number().int().positive().optional(),
      }),
    )
    .default([]),
  careerPathSuggestions: z
    .array(
      z.object({
        title: z.string().min(1),
        why: z.string().min(1),
        nextSteps: z.array(z.string()).default([]),
      }),
    )
    .default([]),
});

const skillProgressResultSchema = z.object({
  generatedAt: z.string().min(1).optional(),
  skills: z
    .array(
      z.object({
        skill: z.string().min(1),
        percentage: z.number().int().min(0).max(100),
      }),
    )
    .min(1)
    .max(12),
});

const SKILL_PROGRESS_PROMPT_VERSION = "v2-elaborate";

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function sha256Text(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function normalizeSkill(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/g, "");
}

function sortSkills(skills: Array<{ skill: string; percentage: number }>): Array<{ skill: string; percentage: number }> {
  return [...skills].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return a.skill.localeCompare(b.skill);
  });
}

function computeHeuristicSkillProgress(input: {
  technologies: string[];
  resumeText: string;
  goalsText: string;
}): Array<{ skill: string; percentage: number }> {
  const technologies = input.technologies.map((t) => normalizeSkill(t)).filter(Boolean);
  const text = `${input.resumeText}\n\n${input.goalsText}`.toLowerCase();

  const hasAny = (values: string[]) => values.some((v) => text.includes(v));
  const countMatches = (needles: string[]) => {
    const n = needles.map((x) => x.toLowerCase());
    return technologies.reduce((acc, t) => (n.includes(t.toLowerCase()) ? acc + 1 : acc), 0);
  };

  // Broad categories that feel closer to the earlier hard-coded style.
  const categories: Array<{ skill: string; base: number; techNeedles: string[]; boostIfText?: string[] }> = [
    {
      skill: "Frontend Development (React/UI)",
      base: 45,
      techNeedles: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind", "CSS", "HTML", "Framer Motion"],
    },
    {
      skill: "Backend Development (APIs)",
      base: 45,
      techNeedles: ["Node.js", "Node", "Express", "NestJS", "Java", "Spring", "Python", "Django", "FastAPI"],
      boostIfText: ["api", "rest", "backend"],
    },
    {
      skill: "Databases (Design & Queries)",
      base: 40,
      techNeedles: ["MongoDB", "PostgreSQL", "Postgres", "MySQL", "SQL", "Redis"],
      boostIfText: ["database", "schema", "aggregation", "index"],
    },
    {
      skill: "Cloud & DevOps (Deployments)",
      base: 35,
      techNeedles: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "GitHub Actions"],
      boostIfText: ["deploy", "cloud", "devops"],
    },
    {
      skill: "System Design & Architecture",
      base: 35,
      techNeedles: ["Microservices", "Kafka", "RabbitMQ"],
      boostIfText: ["system design", "architecture", "scalable", "distributed"],
    },
    {
      skill: "Problem Solving (DSA)",
      base: 30,
      techNeedles: [],
      boostIfText: ["leetcode", "dsa", "data structures", "algorithms", "competitive programming"],
    },
    {
      skill: "Communication & Collaboration",
      base: 35,
      techNeedles: [],
      boostIfText: ["collaborat", "stakeholder", "cross-functional", "team"],
    },
  ];

  const scored = categories
    .map((c) => {
      const techHits = countMatches(c.techNeedles);
      const textBoost = c.boostIfText && hasAny(c.boostIfText) ? 10 : 0;
      const techBoost = Math.min(30, techHits * 8);
      const percentage = Math.max(10, Math.min(95, Math.round(c.base + techBoost + textBoost)));
      return { skill: c.skill, percentage };
    })
    // Avoid showing too many low-signal skills.
    .filter((s) => s.percentage >= 30);

  // If we have no resume and very few technologies, keep output minimal.
  const top = sortSkills(scored).slice(0, 6);
  return top.length ? top : [{ skill: "General Software Development", percentage: 40 }];
}

export async function getSkillProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [resume, goals, projects] = await Promise.all([
      Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
      Goal.findOne({ user: userId }),
      Project.find({ user: userId }).sort({ updatedAt: -1, createdAt: -1 }),
    ]);

    const resumeText = resume?.text?.trim() ? resume.text.trim().slice(0, 60_000) : "";
    const resumeHash = resume?.textHash?.trim() ? resume.textHash.trim() : (resumeText ? sha256Text(resumeText) : "");
    const goalsStamp = goals?.updatedAt ? goals.updatedAt.toISOString() : "";

    const techs: string[] = [];
    let projectsStamp = "";
    for (const p of projects) {
      if (!projectsStamp && p.updatedAt) projectsStamp = p.updatedAt.toISOString();
      for (const t of p.technologies ?? []) techs.push(t);
    }

    const uniqueTechs = Array.from(
      new Set(techs.map((t) => normalizeSkill(t)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    const cacheKey = sha256Text([
      SKILL_PROGRESS_PROMPT_VERSION,
      resumeHash || "no-resume",
      goalsStamp || "no-goals",
      projectsStamp || "no-projects",
      uniqueTechs.join("|"),
    ].join("::"));

    const cached = await SkillProgress.findOne({ user: userId, key: cacheKey });
    if (cached) {
      return res.json({
        generatedAt: cached.generatedAt.toISOString(),
        skills: cached.skills,
      });
    }

    // If there is no resume text and no project technologies, we can't generate useful skill progress.
    if (!resumeText && uniqueTechs.length === 0) {
      return res.status(404).json({ message: "No resume or project technologies found to generate skill progress" });
    }

    const goalsText = goals
      ? `Target roles: ${goals.targetRoles.join(", ") || "N/A"}. Interests: ${goals.interests.join(", ") || "N/A"}.`
      : "Target roles: N/A. Interests: N/A.";

    const projectContext = projects.length
      ? projects
          .slice(0, 10)
          .map((p) => `Project: ${p.title}\nStatus: ${p.status}\nTech: ${(p.technologies ?? []).join(", ")}`)
          .join("\n\n")
      : "(No projects.)";

    const jsonShape = {
      generatedAt: "2026-02-12T00:00:00.000Z",
      skills: [
        { skill: "Frontend Development (React/UI)", percentage: 80 },
        { skill: "Backend Development (APIs)", percentage: 70 },
        { skill: "Databases (Design & Queries)", percentage: 60 },
        { skill: "System Design & Architecture", percentage: 45 },
      ],
    };

    const system =
      "You are an expert technical recruiter and career coach. " +
      "You will estimate a user's skill progress based ONLY on evidence in their resume and projects (and goals). " +
      "Return ONLY valid JSON. No markdown. No extra keys.";

    const prompt =
      `User resume:\n${resumeText || "(No resume uploaded.)"}\n\n` +
      `User goals:\n${goalsText}\n\n` +
      `User projects:\n${projectContext}\n\n` +
      `Candidate skill list (from projects): ${uniqueTechs.length ? uniqueTechs.join(", ") : "(none)"}\n\n` +
      "Task:\n" +
      "- Pick 6 to 10 skills that best represent the user today.\n" +
      "- Mix skill types: technical areas (frontend/backend/databases/cloud), engineering practices (testing, system design), and at least 1 career/soft skill (communication, collaboration, leadership).\n" +
      "- Skill names must be descriptive categories (e.g., 'Backend Development (APIs)' not just 'Node.js').\n" +
      "- For each skill, output an integer percentage 0-100 based on evidence.\n" +
      "- Keep the percentages stable and conservative (avoid huge swings).\n" +
      "- If evidence is weak, set a lower percentage and keep the skill name, but do not hallucinate experience.\n\n" +
      `Return JSON with EXACTLY this shape:\n${JSON.stringify(jsonShape)}`;

    const raw = await generateGeminiText({ system, prompt, temperature: 0 });
    const parsed = extractJson(raw);
    const result = skillProgressResultSchema.safeParse(parsed ?? {});

    const generatedAt = new Date().toISOString();

    if (!result.success) {
      const fallback = {
        generatedAt,
        skills: computeHeuristicSkillProgress({ technologies: uniqueTechs, resumeText, goalsText }),
        raw,
      } as const;

      await SkillProgress.create({
        user: userId,
        key: cacheKey,
        generatedAt: new Date(generatedAt),
        skills: fallback.skills,
      });

      return res.json({ generatedAt, skills: sortSkills(fallback.skills) });
    }

    const data = {
      generatedAt,
      skills: sortSkills(
        result.data.skills
        .map((s) => ({ skill: normalizeSkill(s.skill), percentage: s.percentage }))
        .filter((s) => s.skill && Number.isFinite(s.percentage)),
      ),
    };

    await SkillProgress.create({
      user: userId,
      key: cacheKey,
      generatedAt: new Date(generatedAt),
      skills: data.skills,
    });

    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function queryAi(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = querySchema.parse(req.body);

    const [resume, goals] = await Promise.all([
      Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
      Goal.findOne({ user: userId }),
    ]);

    const resumeText = resume?.text?.trim() ? resume.text.trim().slice(0, 60_000) : "(No resume uploaded.)";
    const goalsText = goals
      ? `Target roles: ${goals.targetRoles.join(", ") || "N/A"}. Interests: ${goals.interests.join(", ") || "N/A"}.`
      : "Target roles: N/A. Interests: N/A.";

    const context = [
      `User resume:\n${resumeText}`,
      `User goals:\n${goalsText}`,
      input.context ? `Additional context:\n${input.context}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const systemPrompt =
      "You are an AI career assistant. Answer using ONLY the user's resume + goals context provided. " +
      "Be precise and practical. If the resume doesn't contain enough evidence, say what is missing. " +
      "Output MUST be plain text only: no markdown, no headings (no '#'), no bold markers (no '**'), no code fences. " +
      "Prefer short sections and simple '-' bullets. Keep it concise.";

    const userPrompt = `${context}\n\nUser question:\n${input.prompt}`;

    const messages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const raw = await createChatCompletion({ messages, temperature: 0.1 });

    const answer = raw
      // Headings
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      // Bold/italics/code markers
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/__+/g, "")
      // Bullet normalization
      .replace(/^\s*[•]\s+/gm, "- ")
      .replace(/^\s*[-–—]\s+/gm, "- ")
      .replace(/^\s*\d+\)\s+/gm, "- ")
      // Collapse excessive blank lines
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return res.json({ answer });
  } catch (err) {
    return next(err);
  }
}

export async function analyzeResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = analyzeSchema.parse(req.body);

    const normalizedResumeText = input.resumeText.trim();
    const textHash = sha256Text(normalizedResumeText);

    const storedResume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });

    if (
      storedResume &&
      typeof storedResume.textHash === "string" &&
      storedResume.textHash === textHash &&
      storedResume.analysis &&
      typeof storedResume.analysis === "object"
    ) {
      return res.json(storedResume.analysis);
    }

    const goalsText = input.goals
      ? `Target roles: ${(input.goals.targetRoles ?? []).join(", ") || "N/A"}. Interests: ${(input.goals.interests ?? []).join(", ") || "N/A"}.`
      : "Target roles: N/A. Interests: N/A.";

    const contextParts = [
      `Resume:\n${normalizedResumeText}`,
      input.projects ? `Projects:\n${input.projects}` : null,
      input.notes ? `Notes:\n${input.notes}` : null,
      `Goals:\n${goalsText}`,
    ].filter(Boolean);

    const systemPrompt =
      "You are an expert career coach and resume reviewer. " +
      "Analyze the provided resume and related context. " +
      "Return ONLY valid JSON with the following keys: score (0-100), summary, strengths (array), gaps (array), recommendations (array), careerPaths (array), nextSteps (array), explanation (short explanation of the score). " +
      "Important: Use a consistent rubric and avoid random variation. The same resume should receive the same score.";

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: contextParts.join("\n\n"),
      },
    ] as const;

    const raw = await createOpenRouterChatCompletion({
      messages,
      temperature: 0,
      enableReasoning: true,
    });
    const parsed = extractJson(raw);
    const result = analysisResultSchema.safeParse(parsed ?? {});

    if (!result.success) {
      return res.json({
        score: 0,
        summary: "Unable to parse structured analysis.",
        strengths: [],
        gaps: [],
        recommendations: [],
        careerPaths: [],
        nextSteps: [],
        explanation: "The AI response was not in the expected format.",
        raw,
      });
    }

    // Best-effort persistence: attach analysis to the latest uploaded resume for this user.
    if (storedResume) {
      await Resume.updateOne(
        { _id: storedResume._id, user: userId },
        {
          $set: {
            textHash,
            analysis: result.data,
            analyzedAt: new Date(),
          },
        },
      );
    }

    return res.json(result.data);
  } catch (err) {
    return next(err);
  }
}

export async function getInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = insightsSchema.parse(req.body);

    const goalsText = input.goals
      ? `Target roles: ${(input.goals.targetRoles ?? []).join(", ") || "N/A"}. Interests: ${(input.goals.interests ?? []).join(", ") || "N/A"}.`
      : "Target roles: N/A. Interests: N/A.";

    const contextParts = [
      `Resume:\n${input.resumeText}`,
      input.projects ? `Projects:\n${input.projects}` : null,
      input.notes ? `Notes:\n${input.notes}` : null,
      `Goals:\n${goalsText}`,
    ].filter(Boolean);

    const systemPrompt =
      "You are an expert career coach and learning path designer. " +
      "You will produce a skill gap analysis, learning recommendations, and career path suggestions. " +
      "Use ONLY the user's resume/notes/projects/goals as evidence; if something is missing, say so. " +
      "Return ONLY valid JSON. Do not include markdown or code fences.";

    const jsonShape = {
      quickStats: [{ label: "Skills Analyzed", value: 0 }],
      insights: [
        {
          kind: "skill_gap",
          title: "Skill Gap Analysis",
          description: "...",
          action: "View detailed analysis",
          type: "recommendation",
        },
      ],
      skillGapAnalysis: {
        targetRoles: ["..."],
        strengths: ["..."],
        gaps: [
          {
            skill: "...",
            priority: "high",
            reason: "...",
            evidence: "(optional) short evidence from resume/projects/notes",
          },
        ],
      },
      learningRecommendations: [
        {
          title: "...",
          why: "...",
          steps: ["..."],
          timeframeWeeks: 6,
        },
      ],
      careerPathSuggestions: [
        {
          title: "...",
          why: "...",
          nextSteps: ["..."],
        },
      ],
    };

    const prompt =
      contextParts.join("\n\n") +
      "\n\n" +
      "Task:\n" +
      "1) Do skill gap analysis relative to target roles (if provided).\n" +
      "2) Provide a learning roadmap (practical, project-based).\n" +
      "3) Suggest 2-3 career paths with concrete next steps.\n\n" +
      `Return JSON with EXACTLY this shape (keys + types):\n${JSON.stringify(jsonShape)}`;

    const raw = await generateGeminiText({
      system: systemPrompt,
      prompt,
      temperature: 0.2,
    });

    const generatedAt = new Date().toISOString();
    const parsed = extractJson(raw);
    const result = insightsResultSchema.safeParse(parsed ?? {});

    if (!result.success) {
      const fallback = {
        generatedAt,
        quickStats: [],
        insights: [],
        skillGapAnalysis: { targetRoles: [], strengths: [], gaps: [] },
        learningRecommendations: [],
        careerPathSuggestions: [],
        raw,
      };

      await AiInsights.create({ user: userId, generatedAt: new Date(generatedAt), report: fallback });
      return res.json(fallback);
    }

    const data = { ...result.data, generatedAt };
    await AiInsights.create({ user: userId, generatedAt: new Date(generatedAt), report: data });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getLatestInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const latest = await AiInsights.findOne({ user: userId }).sort({ generatedAt: -1, createdAt: -1 });
    if (!latest) return res.status(404).json({ message: "No insights found" });

    const report = latest.report as Record<string, unknown> | null;
    if (!report || typeof report !== "object") {
      return res.status(500).json({ message: "Stored insights are invalid" });
    }

    // Ensure generatedAt is always present and correct.
    const generatedAt =
      typeof report.generatedAt === "string" && report.generatedAt.trim()
        ? (report.generatedAt as string)
        : latest.generatedAt.toISOString();

    return res.json({ ...report, generatedAt });
  } catch (err) {
    return next(err);
  }
}
