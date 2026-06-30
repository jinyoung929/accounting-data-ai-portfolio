import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
  projects: Project[];
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

function loadSavedSite(): SavedSite | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

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
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch {
    return null;
  }
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
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

const Ctx = createContext<SiteCtx | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SavedSite>(
    () =>
      loadSavedSite() ?? {
        hero: defaultHero,
        problems: defaultProblems,
        projects: [],
      },
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(site));
  }, [site]);

  const setHero = (hero: HeroContent) => {
    setSite((prev) => ({ ...prev, hero }));
  };

  const setProblems = (problems: ProblemCard[]) => {
    setSite((prev) => ({ ...prev, problems }));
  };

  const setProjects = (projects: Project[]) => {
    setSite((prev) => ({ ...prev, projects }));
  };

  const addProject = (project: Project) => {
    setSite((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
    }));
  };

  const updateProject = (project: Project) => {
    setSite((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === project.id ? project : item,
      ),
    }));
  };

  const deleteProject = (id: string) => {
    setSite((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  return (
    <Ctx.Provider
      value={{
        hero: site.hero,
        setHero,
        problems: site.problems,
        setProblems,
        projects: site.projects,
        setProjects,
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
  if (!ctx) throw new Error("useSite must be inside SiteProvider");
  return ctx;
}
