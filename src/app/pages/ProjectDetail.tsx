import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Github,
  Layers3,
  Play,
  UserRound,
  Users,
} from "lucide-react";
import { useSite } from "../context";

const surface = {
  background: "#FFFFFF",
  border: "1px solid rgba(31,42,68,0.08)",
  boxShadow:
    "8px 8px 22px rgba(31,42,68,0.06), -6px -6px 18px rgba(255,255,255,0.95)",
};

function Info({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#F7F8FC" }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: "#6B7280" }}>
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="text-sm font-medium" style={{ color: "#1F2A44" }}>
        {value || "-"}
      </p>
    </div>
  );
}

function parseHttpUrl(value?: string) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function externalUrl(value?: string) {
  return parseHttpUrl(value)?.toString() ?? "";
}

function getVideoEmbed(value?: string) {
  const url = parseHttpUrl(value);

  if (!url || url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const videoId = parts[0] ?? "";

    if (/^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
      return {
        provider: "YouTube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        sourceUrl: url.toString(),
      };
    }
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const videoId =
      url.pathname === "/watch"
        ? url.searchParams.get("v") ?? ""
        : (parts[0] === "embed" || parts[0] === "shorts")
          ? parts[1] ?? ""
          : "";

    if (/^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
      return {
        provider: "YouTube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        sourceUrl: url.toString(),
      };
    }
  }

  if (
    (host === "loom.com" || host === "app.loom.com") &&
    (parts[0] === "share" || parts[0] === "embed")
  ) {
    const videoId = parts[1] ?? "";

    if (/^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
      return {
        provider: "Loom",
        embedUrl: `https://www.loom.com/embed/${videoId}`,
        sourceUrl: url.toString(),
      };
    }
  }

  return null;
}

function getFigmaEmbedUrl(value?: string) {
  const url = parseHttpUrl(value);

  if (!url || url.protocol !== "https:") return "";

  const host = url.hostname.toLowerCase();

  if (host !== "figma.com" && !host.endsWith(".figma.com")) {
    return "";
  }

  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
    url.toString(),
  )}`;
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const { projects } = useSite();

  const project = projects.find(
    (item) => item.slug === slug && item.status === "published",
  );

  if (!project) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#F7F8FC" }}
      >
        <div className="max-w-md w-full rounded-3xl p-8 text-center" style={surface}>
          <Layers3 size={28} className="mx-auto mb-4" style={{ color: "#4A3FA3" }} />
          <h1 className="text-lg font-bold mb-2" style={{ color: "#1F2A44" }}>
            프로젝트를 찾을 수 없습니다.
          </h1>
          <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
            아직 공개되지 않았거나 주소가 올바르지 않습니다.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ background: "#3F72FF", color: "#FFFFFF", textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const stacks = project.stack
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const videoEmbed = getVideoEmbed(project.videoUrl);
  const figmaEmbedUrl = getFigmaEmbedUrl(project.figmaUrl);

  const githubUrl = externalUrl(project.githubUrl);
  const notionUrl = externalUrl(project.notionUrl);
  const demoUrl = externalUrl(project.demoUrl);
  const videoUrl = externalUrl(project.videoUrl);
  const figmaUrl = externalUrl(project.figmaUrl);
  const pdfUrl = externalUrl(project.pdfUrl);

  const hasRelatedResources = Boolean(
    githubUrl ||
      notionUrl ||
      demoUrl ||
      pdfUrl ||
      (videoUrl && !videoEmbed) ||
      (figmaUrl && !figmaEmbedUrl),
  );

  return (
    <main className="min-h-screen py-10 md:py-16" style={{ background: "#F7F8FC" }}>
      <div className="max-w-4xl mx-auto px-6">
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-10"
          style={{ color: "#4A3FA3", textDecoration: "none" }}
        >
          <ArrowLeft size={16} />
          프로젝트 아카이브로 돌아가기
        </Link>

        <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
          {project.thumbnailImg && (
            <img
              src={project.thumbnailImg}
              alt={`${project.name} 대표 이미지`}
              className="w-full rounded-2xl object-cover mb-7"
              style={{ aspectRatio: "16 / 9", maxHeight: "420px" }}
            />
          )}

          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold mb-5"
            style={{ background: "#ECE9FF", color: "#4A3FA3" }}
          >
            프로젝트 사례
          </span>

          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#1F2A44", letterSpacing: "-0.035em" }}
          >
            {project.name}
          </h1>

          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: "#6B7280", maxWidth: "680px" }}
          >
            {project.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Info icon={<CalendarDays size={15} />} label="기간" value={project.period} />
            <Info icon={<Users size={15} />} label="팀 규모" value={project.teamSize} />
            <Info icon={<UserRound size={15} />} label="담당 역할" value={project.role} />
          </div>
        </section>

        <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
          <h2 className="text-lg font-bold mb-3" style={{ color: "#1F2A44" }}>
            문제 정의
          </h2>
          <p className="text-sm leading-7" style={{ color: "#374151" }}>
            {project.problem || "프로젝트 문제 정의를 정리 중입니다."}
          </p>
        </section>

        <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
          <h2 className="text-lg font-bold mb-3" style={{ color: "#1F2A44" }}>
            해결 방식
          </h2>
          <p className="text-sm leading-7" style={{ color: "#374151" }}>
            {project.solution || "프로젝트 해결 방식을 정리 중입니다."}
          </p>
        </section>

        {stacks.length > 0 && (
          <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1F2A44" }}>
              기술 스택
            </h2>
            <div className="flex flex-wrap gap-2">
              {stacks.map((stack) => (
                <span
                  key={stack}
                  className="rounded-xl px-3 py-2 text-xs font-semibold"
                  style={{ background: "#EEF2FF", color: "#394A9A" }}
                >
                  {stack}
                </span>
              ))}
            </div>
          </section>
        )}

        {project.archImg && (
          <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1F2A44" }}>
              시스템 아키텍처
            </h2>
            <img
              src={project.archImg}
              alt={`${project.name} 아키텍처`}
              className="w-full rounded-2xl"
            />
          </section>
        )}

        {project.screenImg && (
          <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1F2A44" }}>
              화면 미리보기
            </h2>
            <img
              src={project.screenImg}
              alt={`${project.name} 화면`}
              className="w-full rounded-2xl"
            />
          </section>
        )}

        {videoEmbed && (
          <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#1F2A44" }}>
                프로젝트 시연 영상
              </h2>
              <a
                href={videoEmbed.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: "#4A3FA3", textDecoration: "none" }}
              >
                원본 열기 <ArrowUpRight size={13} />
              </a>
            </div>

            <div
              className="overflow-hidden rounded-2xl"
              style={{ background: "#EEF2FF", aspectRatio: "16 / 9" }}
            >
              <iframe
                src={videoEmbed.embedUrl}
                title={`${project.name} ${videoEmbed.provider} 시연 영상`}
                className="w-full h-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </section>
        )}

        {figmaEmbedUrl && (
          <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#1F2A44" }}>
                Figma 프로토타입
              </h2>
              {figmaUrl && (
                <a
                  href={figmaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "#4A3FA3", textDecoration: "none" }}
                >
                  전체 화면 보기 <ArrowUpRight size={13} />
                </a>
              )}
            </div>

            <div
              className="overflow-hidden rounded-2xl"
              style={{ background: "#F7F8FC", border: "1px solid rgba(31,42,68,0.08)" }}
            >
              <iframe
                src={figmaEmbedUrl}
                title={`${project.name} Figma 프로토타입`}
                className="w-full h-[460px] md:h-[620px] border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {hasRelatedResources && (
          <section className="rounded-3xl p-7 md:p-10" style={surface}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1F2A44" }}>
              관련 자료
            </h2>

            <div className="flex flex-wrap gap-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: "#FFFFFF",
                    color: "#1F2A44",
                    border: "1px solid rgba(31,42,68,0.12)",
                    textDecoration: "none",
                  }}
                >
                  <Github size={16} />
                  GitHub 코드 보기
                  <ArrowUpRight size={14} />
                </a>
              )}

              {notionUrl && (
                <a
                  href={notionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: "#FFFFFF",
                    color: "#1F2A44",
                    border: "1px solid rgba(31,42,68,0.12)",
                    textDecoration: "none",
                  }}
                >
                  <FileText size={16} />
                  Notion 문서 보기
                  <ArrowUpRight size={14} />
                </a>
              )}

              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: "#3F72FF",
                    color: "#FFFFFF",
                    textDecoration: "none",
                  }}
                >
                  <Play size={16} />
                  서비스 데모 보기
                  <ArrowUpRight size={14} />
                </a>
              )}

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: "#FEF3C7",
                    color: "#92400E",
                    textDecoration: "none",
                  }}
                >
                  <FileText size={16} />
                  PDF 발표자료 보기
                  <ArrowUpRight size={14} />
                </a>
              )}

              {videoUrl && !videoEmbed && (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: "#FEF2F2",
                    color: "#B91C1C",
                    textDecoration: "none",
                  }}
                >
                  <Play size={16} />
                  영상 보기
                  <ArrowUpRight size={14} />
                </a>
              )}

              {figmaUrl && !figmaEmbedUrl && (
                <a
                  href={figmaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: "#ECE9FF",
                    color: "#4A3FA3",
                    textDecoration: "none",
                  }}
                >
                  <Layers3 size={16} />
                  Figma 자료 보기
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
