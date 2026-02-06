import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { createChatCompletion, type GroqMessage } from "../services/ai/groqClient.js";
import { generateGeminiText } from "../services/ai/geminiClient.js";
import { AiInsights } from "../models/AiInsights.js";

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

export async function queryAi(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = querySchema.parse(req.body);

    const systemPrompt =
      "You are an assistant that analyzes a user's resume, notes, and projects and provides concise, actionable guidance. " +
      "Always include a short explanation for your recommendations.";

    const userContent = input.context
      ? `Context:\n${input.context}\n\nUser question:\n${input.prompt}`
      : input.prompt;

    const messages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];

    const answer = await createChatCompletion({ messages });

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
      "You are an expert career coach and resume reviewer. " +
      "Analyze the provided resume and related context. " +
      "Return ONLY valid JSON with the following keys: score (0-100), summary, strengths (array), gaps (array), recommendations (array), careerPaths (array), nextSteps (array), explanation (short explanation of the score).";

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: contextParts.join("\n\n"),
      },
    ] as const;

    const raw = await createChatCompletion({ messages, temperature: 0.2 });
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
