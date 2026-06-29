import { createContext, useContext, useState, type ReactNode } from "react";

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

/* ─────────────────────────────────────────────────
   Context shape
───────────────────────────────────────────────── */
interface SiteCtx {
  hero: HeroContent;
  setHero: (h: HeroContent) => void;
  problems: ProblemCard[];
  setProblems: (p: ProblemCard[]) => void;
  projects: Project[];
  setProjects: (p: Project[]) => void;
  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;
}

const Ctx = createContext<SiteCtx | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [hero, setHero] = useState<HeroContent>(defaultHero);
  const [problems, setProblems] = useState<ProblemCard[]>(defaultProblems);
  const [projects, setProjects] = useState<Project[]>([]);

  function addProject(p: Project) {
    setProjects((prev) => [p, ...prev]);
  }

  function updateProject(p: Project) {
    setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((x) => x.id !== id));
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
