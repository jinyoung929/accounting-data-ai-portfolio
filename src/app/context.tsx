import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

/* ─────────────────────────────────────────────────
   Shared data types
───────────────────────────────────────────────── */
export interface Project {
  id: string;
  name: string;
  summary: string;
  period: string;
  teamSize: string;
  role: string;
  problem: string;
  solution: string;
  stack: string;
  slug: string;
  githubUrl: string;
  notionUrl: string;
  demoUrl: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published";
  thumbnailImg?: string;
  archImg?: string;
  screenImg?: string;
}

export interface ProblemCard {
  id: string;
  title: string;
  desc: string;
}

export interface HeroContent {
  headline: string;
  sub: string;
}

interface SavedSite {
  hero: HeroContent;
  problems: ProblemCard[];
}

interface DbProjectRow {
  id: string;
  name: string;
  summary: string;
  period: string;
  team_size: string;
  role: string;
  problem: string;
  solution: string;
  stack: string;
  slug: string;
  github_url: string;
  notion_url: string;
  demo_url: string;
  status: "draft" | "published";
  thumbnail_img: string | null;
  arch_img: string | null;
  screen_img: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ─────────────────────────────────────────────────
   Default content
───────────────────────────────────────────────── */
const defaultHero: HeroContent = {
  headline:
    "회계와 데이터, AI를 연결해\n복잡한 업무 문제를\n구조화하고 개선합니다.",
  sub: "회계·재무 도메인에 대한 이해를 바탕으로 데이터 표준화, 업무 자동화, AI 결과 검증과 리스크 관리 관점의 프로젝트를 설계합니다.",
};

const defaultProblems: ProblemCard[] = [
  {
    id: "p1",
    title: "데이터 표준화",
    desc: "서로 다른 형식의 정보를 비교하고 활용할 수 있는 구조로 정리합니다.",
  },
  {
    id: "p2",
    title: "업무 자동화",
    desc: "반복적인 업무를 줄이고 중요한 판단에 집중할 수 있는 흐름을 설계합니다.",
  },
  {
    id: "p3",
    title: "AI 결과 검증",
    desc: "AI가 만든 결과를 그대로 사용하지 않고, 근거와 오류 가능성을 확인하는 구조를 고민합니다.",
  },
  {
    id: "p4",
    title: "리스크 관리",
    desc: "데이터와 업무 흐름에서 발생할 수 있는 오류와 위험을 식별하고 관리합니다.",
  },
];

const STORAGE_KEY = "accounting-data-ai-portfolio-v1";

function loadSavedSite(): SavedSite {
  if (typeof window === "undefined") {
    return { hero: defaultHero, problems: defaultProblems };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hero: defaultHero, problems: defaultProblems };

    const parsed = JSON.parse(raw);

    return {
      hero:
        parsed.hero &&
        typeof parsed.hero.headline === "string" &&
        typeof parsed.hero.sub === "string"
          ? parsed.hero
          : defaultHero,
      problems: Array.isArray(parsed.problems)
        ? parsed.problems
        : defaultProblems,
    };
  } catch {
    return { hero: defaultHero, problems: defaultProblems };
  }
}

function dateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function fromDbProject(row: DbProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    period: row.period,
    teamSize: row.team_size,
    role: row.role,
    problem: row.problem,
    solution: row.solution,
    stack: row.stack,
    slug: row.slug,
    githubUrl: row.github_url,
    notionUrl: row.notion_url,
    demoUrl: row.demo_url,
    status: row.status,
    thumbnailImg: row.thumbnail_img ?? "",
    archImg: row.arch_img ?? "",
    screenImg: row.screen_img ?? "",
    publishedAt: dateOnly(row.published_at),
    createdAt: dateOnly(row.created_at),
    updatedAt: dateOnly(row.updated_at),
  };
}

function toDbProject(project: Project) {
  const imageUrl = (value?: string) =>
    value && !value.startsWith("blob:") ? value : null;

  return {
    name: project.name.trim(),
    summary: project.summary.trim(),
    period: project.period.trim(),
    team_size: project.teamSize.trim(),
    role: project.role.trim(),
    problem: project.problem.trim(),
    solution: project.solution.trim(),
    stack: project.stack.trim(),
    slug: project.slug.trim(),
    github_url: project.githubUrl.trim(),
    notion_url: project.notionUrl.trim(),
    demo_url: project.demoUrl.trim(),
    status: project.status,
    thumbnail_img: imageUrl(project.thumbnailImg),
    arch_img: imageUrl(project.archImg),
    screen_img: imageUrl(project.screenImg),
    published_at:
      project.status === "published"
        ? project.publishedAt
          ? `${project.publishedAt}T00:00:00.000Z`
          : new Date().toISOString()
        : null,
  };
}

/* ─────────────────────────────────────────────────
   Context shape
───────────────────────────────────────────────── */
interface SiteCtx {
  hero: HeroContent;
  setHero: (hero: HeroContent) => void;
  problems: ProblemCard[];
  setProblems: (problems: ProblemCard[]) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  refreshProjects: () => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const Ctx = createContext<SiteCtx | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const saved = loadSavedSite();

  const [hero, setHeroState] = useState<HeroContent>(saved.hero);
  const [problems, setProblemsState] = useState<ProblemCard[]>(saved.problems);
  const [projects, setProjectsState] = useState<Project[]>([]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ hero, problems }),
    );
  }, [hero, problems]);

  async function refreshProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("프로젝트 목록을 불러오지 못했습니다:", error.message);
      return;
    }

    setProjectsState((data as DbProjectRow[]).map(fromDbProject));
  }

  useEffect(() => {
    void refreshProjects();
  }, []);

  const setHero = (nextHero: HeroContent) => {
    setHeroState(nextHero);
  };

  const setProblems = (nextProblems: ProblemCard[]) => {
    setProblemsState(nextProblems);
  };

  const setProjects = (nextProjects: Project[]) => {
    setProjectsState(nextProjects);
  };

  async function addProject(project: Project) {
    const { data, error } = await supabase
      .from("projects")
      .insert(toDbProject(project))
      .select()
      .single();

    if (error) throw new Error(error.message);

    setProjectsState((prev) => [
      fromDbProject(data as DbProjectRow),
      ...prev,
    ]);
  }

  async function updateProject(project: Project) {
    const { data, error } = await supabase
      .from("projects")
      .update(toDbProject(project))
      .eq("id", project.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const updated = fromDbProject(data as DbProjectRow);

    setProjectsState((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  async function deleteProject(id: string) {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    setProjectsState((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <Ctx.Provider
      value={{
        hero,
        setHero,
        problems,
        setProblems,
        projects,
        setProjects,
        refreshProjects,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSite() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error("useSite must be inside SiteProvider");
  }

  return ctx;
}
