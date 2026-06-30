import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Shield,
  Workflow,
  Database,
  ScanSearch,
  Github,
  Mail,
  Layers,
  GitMerge,
  Folder,
  ChevronRight,
  BookOpen,
  MonitorPlay,
  ArrowUpRight,
} from "lucide-react";
import { useSite } from "../context";

/* ─────────────────────────────────────────────────
   Shadow tokens
───────────────────────────────────────────────── */
const neu: React.CSSProperties = {
  background: "#FFFFFF",
  boxShadow:
    "6px 6px 20px rgba(31,42,68,0.07), -4px -4px 14px rgba(255,255,255,0.96)",
  borderRadius: "22px",
};

const neuInset: React.CSSProperties = {
  background: "#F2F4F9",
  boxShadow:
    "inset 3px 3px 8px rgba(31,42,68,0.07), inset -3px -3px 7px rgba(255,255,255,0.9)",
  borderRadius: "12px",
};

/* ─────────────────────────────────────────────────
   Reusables
───────────────────────────────────────────────── */
function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-xs font-medium"
      style={{ background: "#ECE9FF", color: "#4A3FA3", borderRadius: "6px" }}
    >
      {label}
    </span>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <span
      className="text-xs font-semibold uppercase tracking-widest"
      style={{ color: "#3F72FF" }}
    >
      {text}
    </span>
  );
}

/* ─────────────────────────────────────────────────
   Nav
───────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "소개", href: "#hero" },
    { label: "문제 해결 역량", href: "#problems" },
    { label: "프로젝트", href: "#projects" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: "64px",
        background: scrolled
          ? "rgba(247,248,252,0.93)"
          : "rgba(247,248,252,0.75)",
        backdropFilter: "blur(18px)",
        borderBottom: scrolled ? "1px solid rgba(31,42,68,0.08)" : "none",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <span
          className="text-sm font-bold tracking-tight select-none"
          style={{ color: "#1F2A44" }}
        >
          회계 · 데이터 · AI
        </span>

        {/* desktop */}
        <div className="hidden sm:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: "#6B7280", textDecoration: "none" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#1F2A44")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "#6B7280")
              }
            >
              {l.label}
            </a>
          ))}
          <a
            href="mailto:hello@example.com"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: "#1F2A44",
              color: "#FFFFFF",
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#2D3F62")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#1F2A44")
            }
          >
            <Mail size={13} /> 이메일 보내기
          </a>
        </div>

        {/* mobile toggle */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-0.5 transition-all"
              style={{ background: "#1F2A44" }}
            />
          ))}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="sm:hidden px-6 py-4 flex flex-col gap-4"
          style={{
            background: "rgba(247,248,252,0.97)",
            borderTop: "1px solid rgba(31,42,68,0.08)",
          }}
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium"
              style={{ color: "#1F2A44", textDecoration: "none" }}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="mailto:hello@example.com"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "#3F72FF", textDecoration: "none" }}
          >
            <Mail size={14} /> 이메일 보내기
          </a>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────────
   Hero capability card (right side)
───────────────────────────────────────────────── */
function CapabilityCard() {
  const { problems } = useSite();
  const iconMap = [Database, Workflow, ScanSearch, Shield];
  const bgMap = ["#ECE9FF", "#DFF7EA", "#FFE8DD", "#E0F2FE"];
  const icMap = ["#4A3FA3", "#059669", "#C2410C", "#0284C7"];

  return (
    <div style={{ ...neu, padding: "28px" }}>
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full" style={{ background: "#3F72FF" }} />
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#9CA3AF" }}
        >
          핵심 관심 역량
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {problems.map((p, i) => {
          const Icon = iconMap[i % iconMap.length];
          return (
            <div
              key={p.id}
              className="flex flex-col gap-2.5 p-4 rounded-xl"
              style={{ background: "#F7F8FC" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: bgMap[i % bgMap.length] }}
              >
                <Icon size={15} style={{ color: icMap[i % icMap.length] }} />
              </div>
              <span
                className="text-xs font-semibold leading-snug"
                style={{ color: "#1F2A44" }}
              >
                {p.title}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center gap-2 mt-5 pt-4"
        style={{ borderTop: "1px solid rgba(31,42,68,0.07)" }}
      >
        <GitMerge size={13} style={{ color: "#CBD5E1" }} />
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          회계 도메인 이해 → 데이터 · AI 접근
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Hero background decoration — subtle grid + arch lines
───────────────────────────────────────────────── */
function HeroBg() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none", userSelect: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* dot grid tile */}
        <pattern
          id="hero-dots"
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="rgba(31,42,68,0.065)" />
        </pattern>
        {/* fade mask — dots disappear toward top & sides */}
        <radialGradient id="hero-fade" cx="50%" cy="70%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </radialGradient>
        <mask id="hero-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill="url(#hero-fade)" />
        </mask>
      </defs>

      {/* dot grid layer */}
      <rect
        width="100%"
        height="100%"
        fill="url(#hero-dots)"
        mask="url(#hero-mask)"
      />

      {/* architecture suggestion lines — bottom-right quadrant only */}
      <g
        stroke="rgba(63,114,255,0.08)"
        strokeWidth="1"
        fill="none"
        mask="url(#hero-mask)"
      >
        {/* horizontal rule pair */}
        <line x1="55%" y1="62%" x2="90%" y2="62%" strokeDasharray="4 6" />
        <line x1="60%" y1="72%" x2="90%" y2="72%" strokeDasharray="4 6" />
        {/* vertical connector */}
        <line x1="72%" y1="58%" x2="72%" y2="76%" strokeDasharray="3 5" />
        {/* node dots */}
        <circle cx="72%" cy="62%" r="3" fill="rgba(63,114,255,0.12)" stroke="none" />
        <circle cx="72%" cy="72%" r="3" fill="rgba(63,114,255,0.12)" stroke="none" />
        <circle cx="82%" cy="62%" r="2" fill="rgba(63,114,255,0.1)" stroke="none" />
        {/* bracket-like shape */}
        <path
          d="M 78% 56% L 86% 56% L 86% 78% L 78% 78%"
          strokeDasharray="3 5"
          strokeOpacity="0.6"
        />
      </g>

      {/* second softer layer — different angle, bottom-left */}
      <g
        stroke="rgba(31,42,68,0.055)"
        strokeWidth="1"
        fill="none"
      >
        <line x1="4%" y1="78%" x2="28%" y2="78%" strokeDasharray="3 7" />
        <line x1="4%" y1="85%" x2="20%" y2="85%" strokeDasharray="3 7" />
        <circle cx="4%" cy="78%" r="2" fill="rgba(31,42,68,0.07)" stroke="none" />
        <circle cx="4%" cy="85%" r="2" fill="rgba(31,42,68,0.07)" stroke="none" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────── */
function Hero() {
  const { hero } = useSite();
  const lines = hero.headline.split("\n");

  return (
    <section
      id="hero"
      className="relative flex items-start lg:items-center overflow-hidden"
      style={{
        background: "#F7F8FC",
        paddingTop: "clamp(72px, 10vw, 96px)",
        /* 모바일: 콘텐츠 딱 맞게 / 데스크톱: 넉넉한 하단 여백 유지 */
        paddingBottom: "clamp(72px, 8vw, 112px)",
      }}
    >
      {/* decorative background */}
      <HeroBg />

      <div className="relative max-w-5xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-center">
          <div>
            {/* badge — compact text on mobile */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 lg:mb-8"
              style={{
                background: "#ECE9FF",
                border: "1px solid rgba(74,63,163,0.14)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#4A3FA3" }} />
              <span
                className="text-xs font-semibold tracking-wide"
                style={{ color: "#4A3FA3" }}
              >
                {/* mobile: 간결 레이블 / desktop: 전체 레이블 */}
                <span className="lg:hidden">문제 해결 포트폴리오</span>
                <span className="hidden lg:inline">회계 · 데이터 · AI 포트폴리오</span>
              </span>
            </div>

            {/* headline */}
            <h1
              className="font-extrabold leading-tight mb-5 lg:mb-6"
              style={{
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                color: "#1F2A44",
                letterSpacing: "-0.028em",
                lineHeight: 1.18,
              }}
            >
              {lines.map((line, i) => (
                <span key={i}>
                  {i === 1 ? (
                    <span style={{ color: "#3F72FF" }}>{line}</span>
                  ) : (
                    line
                  )}
                  {i < lines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            {/* body — higher contrast for mobile readability */}
            <p
              className="text-sm mb-8 lg:mb-10"
              style={{
                color: "#374151",       /* up from #6B7280 for AA contrast on small screens */
                maxWidth: "480px",
                lineHeight: "1.78",
              }}
            >
              {hero.sub}
            </p>

            {/* CTA */}
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 lg:px-7 py-3 lg:py-3.5 rounded-2xl text-sm font-semibold transition-all duration-150"
              style={{
                background: "#1F2A44",
                color: "#FFFFFF",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(31,42,68,0.22)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#2D3F62";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(31,42,68,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1F2A44";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(31,42,68,0.22)";
              }}
            >
              프로젝트 보기
            </a>

            {/* mobile-only decorative tags row */}
            <div className="lg:hidden flex flex-wrap gap-2 mt-10 opacity-60">
              {["데이터 표준화", "업무 자동화", "AI 결과 검증", "리스크 관리"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(31,42,68,0.05)",
                    color: "#6B7280",
                    border: "1px solid rgba(31,42,68,0.07)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* right — desktop only */}
          <div className="hidden lg:block">
            <CapabilityCard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   Problems
───────────────────────────────────────────────── */
const iconMap = [Database, Workflow, ScanSearch, Shield];
const bgMap = ["#ECE9FF", "#DFF7EA", "#FFE8DD", "#E0F2FE"];
const icMap = ["#4A3FA3", "#059669", "#C2410C", "#0284C7"];

function Problems() {
  const { problems } = useSite();

  return (
    <section
      id="problems"
      className="py-18 lg:py-24"
      style={{
        background: "#EDF1FA",
        borderTop: "1px solid rgba(63,114,255,0.08)",
        /* 상단 페이드 구분선 */
        boxShadow: "inset 0 2px 12px rgba(63,114,255,0.04)",
        paddingTop: "clamp(56px, 7vw, 96px)",
        paddingBottom: "clamp(56px, 7vw, 96px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <SectionLabel text="역량 소개" />
        <h2
          className="mt-2 text-2xl font-bold mb-3"
          style={{ color: "#1F2A44", letterSpacing: "-0.022em" }}
        >
          문제를 기술로 풀어내는 방식
        </h2>
        <p
          className="text-sm mb-12"
          style={{ color: "#6B7280", maxWidth: "420px", lineHeight: "1.7" }}
        >
          회계·재무 도메인의 맥락 안에서 데이터와 AI 기술을 연결합니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems.map((p, i) => {
            const Icon = iconMap[i % iconMap.length];
            return (
              <div
                key={p.id}
                style={neu}
                className="p-6 transition-all duration-200 cursor-default"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "8px 8px 24px rgba(31,42,68,0.1), -4px -4px 16px rgba(255,255,255,0.97)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "6px 6px 20px rgba(31,42,68,0.07), -4px -4px 14px rgba(255,255,255,0.96)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bgMap[i % bgMap.length] }}
                >
                  <Icon size={18} style={{ color: icMap[i % icMap.length] }} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "#1F2A44" }}>
                  {p.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#6B7280", lineHeight: "1.7" }}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   Projects
───────────────────────────────────────────────── */
function Projects() {
  const { projects } = useSite();
  const published = projects.filter((p) => p.status === "published");

  return (
    <section id="projects" className="py-24" style={{ background: "#E2E8F5" }}>
      <div className="max-w-5xl mx-auto px-6">
        <SectionLabel text="프로젝트" />
        <h2
          className="mt-2 text-2xl font-bold mb-3"
          style={{ color: "#1F2A44", letterSpacing: "-0.022em" }}
        >
          프로젝트 아카이브
        </h2>
        <p
          className="text-sm mb-12"
          style={{ color: "#6B7280", maxWidth: "440px", lineHeight: "1.7" }}
        >
          문제를 정의하고 해결 과정을 기록한 프로젝트를 순차적으로 공개할
          예정입니다.
        </p>

        {published.length === 0 ? (
          <div
            style={{ ...neu, padding: "64px 40px", textAlign: "center" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "#ECE9FF" }}
            >
              <Layers size={20} style={{ color: "#4A3FA3" }} />
            </div>
            <p className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
              문제를 정의하고 해결 과정을 기록한 프로젝트를
            </p>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              순차적으로 공개할 예정입니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {published.map((p) => {
              const stacks = p.stack.split(",").map((s) => s.trim()).filter(Boolean);
              return (
                <div key={p.id} style={neu} className="p-7 flex flex-col gap-4">
                  {p.thumbnailImg && (
                    <img
                      src={p.thumbnailImg}
                      alt={`${p.name} 대표 이미지`}
                      className="w-full rounded-2xl object-cover"
                      style={{ height: "180px" }}
                    />
                  )}

                  {/* 카드 헤더 */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "#ECE9FF" }}
                    >
                      <Folder size={16} style={{ color: "#4A3FA3" }} />
                    </div>
                    {p.period && (
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>
                        {p.period}
                      </span>
                    )}
                  </div>

                  {/* 제목 + 소개 */}
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: "#1F2A44" }}>
                      {p.name}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                      {p.summary}
                    </p>
                  </div>

                  {/* 아키텍처 이미지 */}
                  {p.archImg && (
                    <img
                      src={p.archImg}
                      alt="아키텍처 이미지"
                      className="w-full rounded-xl object-cover"
                      style={{ maxHeight: "200px" }}
                    />
                  )}

                  {/* 기술 스택 태그 */}
                  {stacks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {stacks.slice(0, 4).map((s) => <Tag key={s} label={s} />)}
                      {stacks.length > 4 && (
                        <span className="text-xs" style={{ color: "#9CA3AF", alignSelf: "center" }}>
                          +{stacks.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 관련 자료 — 링크가 하나라도 있을 때만 노출 */}
                  {(p.githubUrl || p.notionUrl || p.demoUrl) && (
                    <div
                      className="pt-4 mt-1 flex flex-wrap gap-2"
                      style={{ borderTop: "1px solid rgba(31,42,68,0.07)" }}
                    >
                      <span
                        className="w-full text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        관련 자료
                      </span>

                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: "#FFFFFF",
                            color: "#1F2A44",
                            border: "1.5px solid rgba(31,42,68,0.12)",
                            textDecoration: "none",
                            boxShadow: "2px 2px 8px rgba(31,42,68,0.05), -1px -1px 5px rgba(255,255,255,0.9)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(31,42,68,0.28)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 10px rgba(31,42,68,0.09), -2px -2px 6px rgba(255,255,255,0.95)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(31,42,68,0.12)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 8px rgba(31,42,68,0.05), -1px -1px 5px rgba(255,255,255,0.9)";
                          }}
                        >
                          <Github size={13} /> GitHub 코드 보기
                          <ArrowUpRight size={11} style={{ opacity: 0.45 }} />
                        </a>
                      )}

                      {p.notionUrl && (
                        <a
                          href={p.notionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: "#FFFFFF",
                            color: "#059669",
                            border: "1.5px solid rgba(5,150,105,0.18)",
                            textDecoration: "none",
                            boxShadow: "2px 2px 8px rgba(5,150,105,0.05), -1px -1px 5px rgba(255,255,255,0.9)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(5,150,105,0.38)";
                            (e.currentTarget as HTMLElement).style.background = "#F3FDF7";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(5,150,105,0.18)";
                            (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
                          }}
                        >
                          <BookOpen size={13} /> Notion 문서 보기
                          <ArrowUpRight size={11} style={{ opacity: 0.45 }} />
                        </a>
                      )}

                      {p.demoUrl && (
                        <a
                          href={p.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: "#FFFFFF",
                            color: "#3F72FF",
                            border: "1.5px solid rgba(63,114,255,0.2)",
                            textDecoration: "none",
                            boxShadow: "2px 2px 8px rgba(63,114,255,0.06), -1px -1px 5px rgba(255,255,255,0.9)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(63,114,255,0.4)";
                            (e.currentTarget as HTMLElement).style.background = "#F0F5FF";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(63,114,255,0.2)";
                            (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
                          }}
                        >
                          <MonitorPlay size={13} /> 서비스 데모 보기
                          <ArrowUpRight size={11} style={{ opacity: 0.45 }} />
                        </a>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/projects/${p.slug}`}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150"
                    style={{
                      background: "#1F2A44",
                      color: "#FFFFFF",
                      textDecoration: "none",
                      boxShadow: "0 5px 14px rgba(31,42,68,0.18)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#2D3F62";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#1F2A44";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    프로젝트 자세히 보기
                    <ChevronRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   Footer
───────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-14" style={{ background: "#1F2A44" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div
              className="text-sm font-bold mb-1.5"
              style={{ color: "#FFFFFF" }}
            >
              회계 · 데이터 · AI를 연결하는 문제 해결 포트폴리오
            </div>
            <p className="text-xs" style={{ color: "#475569" }}>
              데이터와 AI로 더 나은 업무 방식을 설계합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: Github, label: "GitHub", href: "https://github.com" },
              { icon: Mail, label: "이메일", href: "mailto:hello@example.com" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150"
                style={{
                  color: "#94A3B8",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.05)";
                }}
              >
                <l.icon size={12} /> {l.label}
              </a>
            ))}
          </div>
        </div>

        <div
          className="mt-10 pt-5 text-center text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "#334155",
          }}
        >
          © 2025 · 회계 × 데이터 × AI 포트폴리오
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────
   Page root
───────────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{ fontFamily: "Inter, 'Noto Sans KR', sans-serif", background: "#F7F8FC" }}>
      <Nav />
      <Hero />
      <Problems />
      <Projects />
      <Footer />
    </div>
  );
}
