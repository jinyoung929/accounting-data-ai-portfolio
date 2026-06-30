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

function normalizeLineBreaks(value: string) {
  return value.replace(/\\n/g, "\n");
}

function parseStackGroups(value: string) {
  const lines = normalizeLineBreaks(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line, index) => {
      const separator = line.includes("|")
        ? line.indexOf("|")
        : line.indexOf(":");

      const label =
        separator >= 0 ? line.slice(0, separator).trim() : `기술 ${index + 1}`;

      const itemsText = separator >= 0 ? line.slice(separator + 1) : line;

      const items = itemsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      return { label, items };
    })
    .filter((group) => group.items.length > 0);
}

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
      <p
        className="text-sm font-medium"
        style={{ color: "#1F2A44", whiteSpace: "pre-line", lineHeight: 1.65 }}
      >
        {normalizeLineBreaks(value) || "-"}
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

  const stackGroups = parseStackGroups(project.stack);

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Info icon={<CalendarDays size={15} />} label="기간" value={project.period} />
            <Info icon={<Users size={15} />} label="팀 규모" value={project.teamSize} />
            <div className="sm:col-span-2">
              <Info icon={<UserRound size={15} />} label="담당 역할" value={project.role} />
            </div>
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

        {stackGroups.length > 0 && (
          <section className="rounded-3xl p-7 md:p-10 mb-6" style={surface}>
            <h2 className="text-lg font-bold mb-5" style={{ color: "#1F2A44" }}>
              기술 스택
            </h2>

            <div className="flex flex-col gap-4">
              {stackGroups.map((group) => (
                <div
                  key={group.label}
                  className="rounded-2xl p-4"
                  style={{ background: "#F7F8FC" }}
                >
                  <p
                    className="text-xs font-bold mb-3"
                    style={{ color: "#6B7280", letterSpacing: "0.02em" }}
                  >
                    {group.label}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-xl px-3 py-2 text-xs font-semibold"
                        style={{ background: "#EEF2FF", color: "#394A9A" }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
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
            <h2 className="text-lg font-bold mb-5" style={{ color: "#1F2A44" }}>
              관련 자료
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "#F7F8FC",
                    border: "1px solid rgba(31,42,68,0.10)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#1F2A44", color: "#FFFFFF" }}
                  >
                    <Github size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#1F2A44" }}>
                      GitHub
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      코드와 커밋 기록 보기
                    </p>
                  </div>
                  <ArrowUpRight
                    size={17}
                    style={{ color: "#6B7280" }}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>
              )}

              {notionUrl && (
                <a
                  href={notionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(31,42,68,0.14)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "#FFFFFF",
                      color: "#1F2A44",
                      border: "2px solid #1F2A44",
                    }}
                  >
                    <span className="text-lg font-black">N</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#1F2A44" }}>
                      Notion
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      기획·설계 문서 보기
                    </p>
                  </div>
                  <ArrowUpRight
                    size={17}
                    style={{ color: "#6B7280" }}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>
              )}

              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "#EEF4FF",
                    border: "1px solid rgba(63,114,255,0.16)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#3F72FF", color: "#FFFFFF" }}
                  >
                    <Play size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#1F2A44" }}>
                      서비스 데모
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      실행 화면 직접 보기
                    </p>
                  </div>
                  <ArrowUpRight
                    size={17}
                    style={{ color: "#3F72FF" }}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>
              )}

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid rgba(180,83,9,0.16)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FEF3C7", color: "#B45309" }}
                  >
                    <FileText size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#1F2A44" }}>
                      PDF 발표자료
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      발표자료 새 탭에서 보기
                    </p>
                  </div>
                  <ArrowUpRight
                    size={17}
                    style={{ color: "#B45309" }}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>
              )}

              {videoUrl && !videoEmbed && (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid rgba(220,38,38,0.14)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FEE2E2", color: "#DC2626" }}
                  >
                    <Play size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#1F2A44" }}>
                      프로젝트 영상
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      시연 영상 새 탭에서 보기
                    </p>
                  </div>
                  <ArrowUpRight
                    size={17}
                    style={{ color: "#DC2626" }}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>
              )}

              {figmaUrl && !figmaEmbedUrl && (
                <a
                  href={figmaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "#F5F3FF",
                    border: "1px solid rgba(74,63,163,0.14)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ECE9FF", color: "#4A3FA3" }}
                  >
                    <Layers3 size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#1F2A44" }}>
                      Figma
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      프로토타입 새 탭에서 보기
                    </p>
                  </div>
                  <ArrowUpRight
                    size={17}
                    style={{ color: "#4A3FA3" }}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>
              )}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
