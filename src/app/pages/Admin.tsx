import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Settings,
  Save,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileText,
  Layers,
  Shield,
  Globe,
  Lock,
  ChevronRight,
  GripVertical,
  CheckCircle,
  Github,
  ArrowUpRight,
  BookOpen,
  MonitorPlay,
  Link2,
} from "lucide-react";
import { useSite, type Project, type ProblemCard, type HeroContent } from "../context";
import { supabase } from "../../lib/supabase";
import ContentBlocksEditor from "../components/ContentBlocksEditor";
import {
  uploadPortfolioImage,
  type PortfolioImageKind,
} from "../../lib/storage";

/* ─────────────────────────────────────────────────
   Shadow tokens
───────────────────────────────────────────────── */
const neu: React.CSSProperties = {
  background: "#FFFFFF",
  boxShadow:
    "4px 4px 14px rgba(31,42,68,0.07), -3px -3px 10px rgba(255,255,255,0.94)",
  borderRadius: "16px",
};

const neuInset: React.CSSProperties = {
  background: "#F2F4F9",
  boxShadow:
    "inset 3px 3px 8px rgba(31,42,68,0.07), inset -3px -3px 7px rgba(255,255,255,0.9)",
  borderRadius: "10px",
};

/* ─────────────────────────────────────────────────
   Form helpers
───────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  ...neuInset,
  border: "1px solid transparent",
  color: "#1F2A44",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  padding: "10px 14px",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#9CA3AF",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  marginBottom: "6px",
  display: "block",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Save toast
───────────────────────────────────────────────── */
function SaveToast({ visible }: { visible: boolean }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
      style={{
        background: "#1F2A44",
        color: "#FFFFFF",
        boxShadow: "0 6px 24px rgba(31,42,68,0.3)",
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? "0" : "8px"})`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <CheckCircle size={14} style={{ color: "#10B981" }} />
      변경사항이 저장되었습니다.
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Login screen
───────────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setErr(signInError.message);
      setLoading(false);
      return;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || isAdmin !== true) {
      await supabase.auth.signOut();
      setErr("이 계정에는 관리자 권한이 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onLogin();
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "#F7F8FC" }}
    >
      <div style={{ width: "min(400px, calc(100vw - 32px))" }}>
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-3"
            style={{ background: "#ECE9FF" }}
          >
            <Lock size={18} style={{ color: "#4A3FA3" }} />
          </div>

          <h1 className="text-base font-bold" style={{ color: "#1F2A44" }}>
            관리자 로그인
          </h1>

          <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
            포트폴리오 콘텐츠 관리 화면입니다.
          </p>
        </div>

        <div style={{ ...neu, padding: "28px" }}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr("");
                }}
                placeholder="관리자 이메일"
                autoComplete="email"
                required
                className="rounded-xl"
                style={{
                  ...inputStyle,
                  border: err ? "1px solid #F87171" : "1px solid transparent",
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>비밀번호</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErr("");
                  }}
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  required
                  className="rounded-xl"
                  style={{
                    ...inputStyle,
                    border: err ? "1px solid #F87171" : "1px solid transparent",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                  aria-label="비밀번호 표시 전환"
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {err && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: "#FEF2F2", color: "#DC2626" }}
              >
                <AlertCircle size={12} />
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{
                background: loading ? "#64748B" : "#1F2A44",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(31,42,68,0.2)",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "로그인 확인 중..." : "로그인"}
            </button>
          </form>

          <p
            className="text-xs text-center mt-4 leading-relaxed"
            style={{ color: "#9CA3AF" }}
          >
            등록된 관리자 계정만 콘텐츠를 수정할 수 있습니다.
          </p>
        </div>

        <div className="text-center mt-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "#9CA3AF", textDecoration: "none" }}
          >
            ← 공개 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Project modal (add / edit)
───────────────────────────────────────────────── */
function ProjectModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Project;
  onClose: () => void;
  onSave: (p: Project) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const blank: Omit<Project, "id"> = {
    name: "",
    summary: "",
    period: "",
    teamSize: "",
    role: "",
    problem: "",
    solution: "",
    stack: "",
    slug: "",
    githubUrl: "",
    notionUrl: "",
    demoUrl: "",
    videoUrl: "",
    figmaUrl: "",
    pdfUrl: "",
    contentBlocks: [],
    publishedAt: "",
    createdAt: today,
    updatedAt: today,
    status: "draft",
    thumbnailImg: "",
  };

  const [form, setForm] = useState<Omit<Project, "id">>(
    initial
      ? {
          ...initial,
          role: initial.role.replace(/\\n/g, "\n"),
          stack: initial.stack.replace(/\\n/g, "\n"),
        }
      : blank
  );
  type ImageField = "thumbnailImg" | "archImg" | "screenImg";

  const thumbRef = useRef<HTMLInputElement>(null);
  const archRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLInputElement>(null);
  const [uploadingKey, setUploadingKey] = useState<ImageField | null>(null);
  const [uploadError, setUploadError] = useState("");

  const imageKinds: Record<ImageField, PortfolioImageKind> = {
    thumbnailImg: "thumbnail",
    archImg: "architecture",
    screenImg: "screen",
  };

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    key: ImageField,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousUrl = form[key];
    const previewUrl = URL.createObjectURL(file);

    setUploadError("");
    setUploadingKey(key);
    setForm((f) => ({ ...f, [key]: previewUrl }));

    try {
      const publicUrl = await uploadPortfolioImage(file, imageKinds[key]);
      setForm((f) => ({ ...f, [key]: publicUrl }));
    } catch (err) {
      setForm((f) => ({ ...f, [key]: previousUrl }));
      setUploadError(
        err instanceof Error
          ? `이미지를 업로드하지 못했습니다: ${err.message}`
          : "이미지를 업로드하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingKey(null);
      e.target.value = "";
    }
  }

  function handleSave() {
    if (!form.name.trim() || uploadingKey) return;
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      ...form,
      id: initial?.id ?? Date.now().toString(),
      updatedAt: now,
      createdAt: form.createdAt || now,
    });
  }

  const isEdit = !!initial;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto py-8"
      style={{ background: "rgba(31,42,68,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{
          ...neu,
          borderRadius: "20px",
          width: "min(660px, calc(100vw - 32px))",
          padding: "36px",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h3 className="text-base font-bold" style={{ color: "#1F2A44" }}>
              {isEdit ? "프로젝트 수정" : "프로젝트 추가"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
              문제 정의 → 해결 방식 → 기술 순으로 작성하면 읽기 편합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: "#F7F8FC", color: "#9CA3AF" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* 기간 + 팀 규모 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="프로젝트 기간">
              <input
                value={form.period}
                onChange={(e) => set("period", e.target.value)}
                placeholder="예: 2024.03 – 2024.06"
                style={inputStyle}
                className="rounded-xl"
              />
            </Field>
            <Field label="팀 규모">
              <input
                value={form.teamSize}
                onChange={(e) => set("teamSize", e.target.value)}
                placeholder="예: 1인 개인 프로젝트"
                style={inputStyle}
                className="rounded-xl"
              />
            </Field>
          </div>

          {/* 기본 정보 */}
          <div className="flex flex-col gap-5">
            <Field label="프로젝트명">
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="예: 회계 데이터 표준화 엔진"
                style={inputStyle}
                className="rounded-xl"
              />
            </Field>

            <Field label="한 줄 소개">
              <input
                value={form.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="프로젝트를 한 문장으로 소개해 주세요"
                style={inputStyle}
                className="rounded-xl"
              />
            </Field>

            <Field label="나의 역할 (Enter로 줄바꿈)">
              <textarea
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder={"예: 서비스 기획 및 개발\n- 사용자 문제 정의\n- API 연동 및 테스트"}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.65" }}
                className="rounded-xl"
              />
            </Field>
          </div>

          {/* 텍스트에어리어 */}
          {(
            [
              { label: "문제 정의", key: "problem", placeholder: "어떤 문제를 해결하려 했나요?" },
              { label: "해결 방식", key: "solution", placeholder: "어떻게 접근하고 해결했나요?" },
            ] as const
          ).map((f) => (
            <Field key={f.key} label={f.label}>
              <textarea
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.65" }}
                className="rounded-xl"
              />
            </Field>
          ))}

          <ContentBlocksEditor
            blocks={form.contentBlocks}
            onChange={(contentBlocks) =>
              setForm((current) => ({ ...current, contentBlocks }))
            }
          />

          {/* 기술 스택 */}
          <Field label="기술 스택 (한 줄에 한 분류)">
            <textarea
              value={form.stack}
              onChange={(e) => set("stack", e.target.value)}
              placeholder={"프론트엔드 | React Native, Expo\n백엔드 | Firebase Firestore, Firebase Auth, Cloud Functions\nAI·음성 | Gemini 2.5 Flash, OpenAI GPT, Twilio Voice API\n인프라·협업 | ngrok, GitHub, Figma, Notion"}
              rows={5}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.65" }}
              className="rounded-xl"
            />
            <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
              분류와 기술은 | 로 구분하고, 기술끼리는 쉼표로 구분해 주세요.
            </p>
          </Field>

          {/* slug + 날짜 메타 섹션 */}
          <div>
            <div
              className="flex items-center gap-2 mb-3"
              style={{ borderBottom: "1px solid rgba(31,42,68,0.07)", paddingBottom: "10px" }}
            >
              <FileText size={12} style={{ color: "#9CA3AF" }} />
              <span style={{ ...labelStyle, marginBottom: 0 }}>URL 및 날짜 메타정보</span>
            </div>
            <div className="flex flex-col gap-4">
              {/* slug */}
              <Field label="URL 식별자 (slug)">
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none"
                    style={{ color: "#9CA3AF" }}
                  >
                    /projects/
                  </span>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      set(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="my-project-name"
                    style={{ ...inputStyle, paddingLeft: "76px" }}
                    className="rounded-xl"
                  />
                </div>
              </Field>

              {/* 날짜 3개 */}
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { label: "공개일", key: "publishedAt" as const, placeholder: "YYYY-MM-DD" },
                    { label: "작성일", key: "createdAt" as const, placeholder: "YYYY-MM-DD" },
                    { label: "수정일", key: "updatedAt" as const, placeholder: "YYYY-MM-DD" },
                  ] as const
                ).map((f) => (
                  <Field key={f.key} label={f.label}>
                    <input
                      type="date"
                      value={form[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ ...inputStyle, cursor: "pointer" }}
                      className="rounded-xl"
                    />
                  </Field>
                ))}
              </div>
            </div>
          </div>

          {/* 관련 자료 링크 */}
          <div>
            <div
              className="flex items-center gap-2 mb-3"
              style={{ borderBottom: "1px solid rgba(31,42,68,0.07)", paddingBottom: "10px" }}
            >
              <Link2 size={12} style={{ color: "#9CA3AF" }} />
              <span style={{ ...labelStyle, marginBottom: 0 }}>관련 자료 링크 (선택)</span>
            </div>
            <div className="flex flex-col gap-3">
              {(
                [
                  {
                    label: "GitHub 저장소 URL",
                    key: "githubUrl" as const,
                    placeholder: "https://github.com/...",
                    icon: Github,
                    color: "#1F2A44",
                    bg: "#F7F8FC",
                  },
                  {
                    label: "Notion 프로젝트 문서 URL",
                    key: "notionUrl" as const,
                    placeholder: "https://notion.so/...",
                    icon: BookOpen,
                    color: "#059669",
                    bg: "#DFF7EA",
                  },
                  {
                    label: "서비스 데모 URL",
                    key: "demoUrl" as const,
                    placeholder: "https://...",
                    icon: MonitorPlay,
                    color: "#3F72FF",
                    bg: "#ECE9FF",
                  },
                ] as const
              ).map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: f.bg }}
                  >
                    <f.icon size={13} style={{ color: f.color }} />
                  </div>
                  <div className="flex-1">
                    <label style={{ ...labelStyle, marginBottom: "4px" }}>{f.label}</label>
                    <input
                      value={form[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={inputStyle}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 미디어 및 자료 링크 */}
          <div>
            <div
              className="flex items-center gap-2 mb-3"
              style={{ borderBottom: "1px solid rgba(31,42,68,0.07)", paddingBottom: "10px" }}
            >
              <MonitorPlay size={12} style={{ color: "#9CA3AF" }} />
              <span style={{ ...labelStyle, marginBottom: 0 }}>미디어 및 자료 링크 (선택)</span>
            </div>

            <div className="flex flex-col gap-3">
              {(
                [
                  {
                    label: "YouTube 또는 Loom 영상 URL",
                    key: "videoUrl" as const,
                    placeholder: "https://www.youtube.com/... 또는 https://www.loom.com/...",
                    icon: MonitorPlay,
                    color: "#DC2626",
                    bg: "#FEF2F2",
                  },
                  {
                    label: "Figma 프로토타입 URL",
                    key: "figmaUrl" as const,
                    placeholder: "https://www.figma.com/...",
                    icon: Layers,
                    color: "#4A3FA3",
                    bg: "#ECE9FF",
                  },
                  {
                    label: "PDF 발표자료 URL",
                    key: "pdfUrl" as const,
                    placeholder: "https://.../presentation.pdf",
                    icon: FileText,
                    color: "#B45309",
                    bg: "#FEF3C7",
                  },
                ] as const
              ).map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: f.bg }}
                  >
                    <f.icon size={13} style={{ color: f.color }} />
                  </div>

                  <div className="flex-1">
                    <label style={{ ...labelStyle, marginBottom: "4px" }}>{f.label}</label>
                    <input
                      value={form[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={inputStyle}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(
              [
                { label: "대표 썸네일", key: "thumbnailImg" as const, ref: thumbRef },
                { label: "아키텍처 이미지", key: "archImg" as const, ref: archRef },
                { label: "화면 이미지", key: "screenImg" as const, ref: screenRef },
              ] as const
            ).map((item) => (
              <Field key={item.key} label={item.label}>
                <div
                  className="flex flex-col items-center justify-center gap-2 py-5 rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    ...neuInset,
                    border: "2px dashed rgba(63,114,255,0.2)",
                    cursor: uploadingKey ? "wait" : "pointer",
                    opacity: uploadingKey && uploadingKey !== item.key ? 0.55 : 1,
                  }}
                  onClick={() => {
                    if (!uploadingKey) item.ref.current?.click();
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(63,114,255,0.4)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(63,114,255,0.2)")
                  }
                >
                  {uploadingKey === item.key ? (
                    <>
                      <Upload size={15} className="animate-pulse" style={{ color: "#4A3FA3" }} />
                      <span className="text-xs" style={{ color: "#4A3FA3" }}>
                        업로드 중...
                      </span>
                    </>
                  ) : form[item.key] ? (
                    <img
                      src={form[item.key]}
                      alt=""
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload size={15} style={{ color: "#9CA3AF" }} />
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>
                        클릭하여 업로드
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={item.ref}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e, item.key)}
                />
              </Field>
            ))}
          </div>

          {uploadError && (
            <p className="text-xs -mt-2" style={{ color: "#DC2626" }}>
              {uploadError}
            </p>
          )}

          {/* 공개 상태 */}
          <Field label="공개 상태">
            <div className="flex gap-3">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => set("status", s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{
                    background: form.status === s ? "#1F2A44" : "#F7F8FC",
                    color: form.status === s ? "#FFFFFF" : "#6B7280",
                    border:
                      form.status === s
                        ? "1px solid #1F2A44"
                        : "1px solid rgba(31,42,68,0.1)",
                    boxShadow:
                      form.status === s
                        ? "0 4px 12px rgba(31,42,68,0.16)"
                        : "none",
                  }}
                >
                  {s === "draft" ? (
                    <><Lock size={11} /> 임시저장</>
                  ) : (
                    <><Globe size={11} /> 공개</>
                  )}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* footer */}
        <div
          className="flex items-center justify-end gap-3 mt-7 pt-6"
          style={{ borderTop: "1px solid rgba(31,42,68,0.07)" }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "#F7F8FC",
              color: "#6B7280",
              border: "1px solid rgba(31,42,68,0.1)",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={uploadingKey !== null}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: "#1F2A44",
              color: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(31,42,68,0.2)",
              opacity: uploadingKey ? 0.55 : 1,
              cursor: uploadingKey ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#2D3F62")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#1F2A44")
            }
          >
            <Save size={13} /> {uploadingKey ? "이미지 업로드 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Delete confirm modal
───────────────────────────────────────────────── */
function DeleteConfirm({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: "rgba(31,42,68,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        style={{ ...neu, width: "360px", padding: "28px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "#FEF2F2" }}
        >
          <Trash2 size={17} style={{ color: "#DC2626" }} />
        </div>
        <h3 className="text-sm font-bold mb-2" style={{ color: "#1F2A44" }}>
          프로젝트를 삭제하시겠습니까?
        </h3>
        <p className="text-xs mb-6" style={{ color: "#6B7280" }}>
          <strong>{name}</strong> 프로젝트가 영구적으로 삭제됩니다. 이 작업은
          되돌릴 수 없습니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "#F7F8FC",
              color: "#6B7280",
              border: "1px solid rgba(31,42,68,0.1)",
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "#DC2626",
              color: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(220,38,38,0.25)",
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Section: 소개 수정
───────────────────────────────────────────────── */
function HeroEditor({ onSaved }: { onSaved: () => void }) {
  const { hero, setHero } = useSite();
  const [form, setForm] = useState<HeroContent>({ ...hero });

  function save() {
    setHero(form);
    onSaved();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold" style={{ color: "#1F2A44" }}>
            소개 문구 수정
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
            공개 홈페이지 히어로 영역에 표시됩니다.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: "#ECE9FF", color: "#4A3FA3" }}
        >
          <Globe size={11} /> 공개 페이지 반영
        </div>
      </div>

      <div style={{ ...neu, padding: "28px" }} className="flex flex-col gap-5">
        <Field label="메인 문구 (줄바꿈은 \\n으로 입력)">
          <textarea
            value={form.headline}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
            className="rounded-xl"
          />
        </Field>

        <Field label="보조 문구">
          <textarea
            value={form.sub}
            onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
            className="rounded-xl"
          />
        </Field>

        {/* preview */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#F8F9FF", border: "1px solid rgba(63,114,255,0.1)" }}
        >
          <span
            className="block text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#9CA3AF" }}
          >
            미리보기
          </span>
          <p
            className="font-bold leading-tight mb-2"
            style={{ color: "#1F2A44", fontSize: "16px", letterSpacing: "-0.02em" }}
          >
            {form.headline.split("\\n").map((line, i) => (
              <span key={i}>{line}{i < form.headline.split("\\n").length - 1 && <br />}</span>
            ))}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
            {form.sub}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={save}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: "#1F2A44",
              color: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(31,42,68,0.18)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#2D3F62")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#1F2A44")
            }
          >
            <Save size={13} /> 저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Section: 역량 카드 수정
───────────────────────────────────────────────── */
function ProblemsEditor({ onSaved }: { onSaved: () => void }) {
  const { problems, setProblems } = useSite();
  const [cards, setCards] = useState<ProblemCard[]>(problems.map((p) => ({ ...p })));

  function updateCard(id: string, key: "title" | "desc", val: string) {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: val } : c))
    );
  }

  function save() {
    setProblems(cards);
    onSaved();
  }

  const bgMap = ["#ECE9FF", "#DFF7EA", "#FFE8DD", "#E0F2FE"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold" style={{ color: "#1F2A44" }}>
            문제 해결 역량 카드 수정
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
            공개 홈페이지 역량 섹션의 4개 카드를 수정합니다.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: "#ECE9FF", color: "#4A3FA3" }}
        >
          <Globe size={11} /> 공개 페이지 반영
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-5">
        {cards.map((card, i) => (
          <div key={card.id} style={neu} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1.5 h-6 rounded-full flex-shrink-0"
                style={{ background: bgMap[i % bgMap.length] }}
              />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#9CA3AF" }}
              >
                카드 {i + 1}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4">
              <Field label="제목">
                <input
                  value={card.title}
                  onChange={(e) => updateCard(card.id, "title", e.target.value)}
                  style={inputStyle}
                  className="rounded-xl"
                />
              </Field>
              <Field label="설명">
                <input
                  value={card.desc}
                  onChange={(e) => updateCard(card.id, "desc", e.target.value)}
                  style={inputStyle}
                  className="rounded-xl"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{
            background: "#1F2A44",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(31,42,68,0.18)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#2D3F62")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#1F2A44")
          }
        >
          <Save size={13} /> 저장
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Section: 프로젝트 관리
───────────────────────────────────────────────── */
function ProjectsManager({ onSaved }: { onSaved: () => void }) {
  const { projects, addProject, updateProject, deleteProject } = useSite();
  const [modal, setModal] = useState<"add" | Project | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(p: Project) {
    try {
      setSaving(true);
      setError("");

      if (modal === "add") {
        await addProject(p);
      } else if (modal && typeof modal === "object") {
        await updateProject(p);
      }

      setModal(null);
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? `저장하지 못했습니다: ${err.message}`
          : "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;

    try {
      setSaving(true);
      setError("");

      await deleteProject(toDelete.id);
      setToDelete(null);
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? `삭제하지 못했습니다: ${err.message}`
          : "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold" style={{ color: "#1F2A44" }}>
            프로젝트 관리
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
            공개 상태 프로젝트만 방문자에게 표시됩니다.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{
            background: "#1F2A44",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(31,42,68,0.18)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#2D3F62")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#1F2A44")
          }
        >
          <Plus size={14} /> 프로젝트 추가
        </button>
      </div>

      {projects.length === 0 ? (
        /* empty state */
        <div
          style={{ ...neu, padding: "56px 32px", textAlign: "center" }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#ECE9FF" }}
          >
            <Layers size={18} style={{ color: "#4A3FA3" }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "#374151" }}>
            등록된 프로젝트가 없습니다.
          </p>
          <p className="text-xs mb-6" style={{ color: "#9CA3AF" }}>
            우측 상단 버튼을 눌러 첫 번째 프로젝트를 추가하세요.
          </p>
          <button
            onClick={() => setModal("add")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "#1F2A44",
              color: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(31,42,68,0.18)",
            }}
          >
            <Plus size={14} /> 첫 프로젝트 추가
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => {
            const stacks = p.stack.split(",").map((s) => s.trim()).filter(Boolean);
            return (
              <div
                key={p.id}
                style={neu}
                className="flex items-start gap-4 p-5"
              >
                {/* drag handle (visual only) */}
                <div className="mt-1 flex-shrink-0" style={{ color: "#D1D5DB" }}>
                  <GripVertical size={16} />
                </div>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#1F2A44" }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md"
                      style={{
                        background:
                          p.status === "published" ? "#DFF7EA" : "#FEF3C7",
                        color:
                          p.status === "published" ? "#059669" : "#B45309",
                      }}
                    >
                      {p.status === "published" ? (
                        <><Globe size={9} /> 공개</>
                      ) : (
                        <><Lock size={9} /> 임시저장</>
                      )}
                    </span>
                  </div>
                  <p
                    className="text-xs mb-2 truncate"
                    style={{ color: "#6B7280" }}
                  >
                    {p.summary || "소개 없음"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stacks.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="inline-block px-2 py-0.5 text-xs font-medium rounded"
                        style={{ background: "#ECE9FF", color: "#4A3FA3" }}
                      >
                        {s}
                      </span>
                    ))}
                    {stacks.length > 3 && (
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>
                        +{stacks.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* meta */}
                <div className="flex-shrink-0 text-right" style={{ minWidth: "110px" }}>
                  {p.period && (
                    <div className="text-xs mb-1" style={{ color: "#6B7280", fontWeight: 500 }}>
                      {p.period}
                    </div>
                  )}
                  {p.slug && (
                    <div
                      className="text-xs mb-1 font-mono truncate"
                      style={{ color: "#9CA3AF", maxWidth: "130px", direction: "rtl" }}
                    >
                      /{p.slug}
                    </div>
                  )}
                  {p.updatedAt && (
                    <div className="text-xs mb-2" style={{ color: "#CBD5E1" }}>
                      수정 {p.updatedAt}
                    </div>
                  )}
                  {/* actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="GitHub"
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                        style={{ background: "#F7F8FC", color: "#9CA3AF" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.color = "#1F2A44")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.color = "#9CA3AF")
                        }
                      >
                        <Github size={12} />
                      </a>
                    )}
                    {p.notionUrl && (
                      <a
                        href={p.notionUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Notion 문서"
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                        style={{ background: "#F0FDF4", color: "#9CA3AF" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.color = "#059669")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.color = "#9CA3AF")
                        }
                      >
                        <BookOpen size={12} />
                      </a>
                    )}
                    {p.demoUrl && (
                      <a
                        href={p.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="서비스 데모"
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                        style={{ background: "#EFF6FF", color: "#9CA3AF" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.color = "#3F72FF")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.color = "#9CA3AF")
                        }
                      >
                        <MonitorPlay size={12} />
                      </a>
                    )}
                    <button
                      onClick={() => setModal(p)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                      style={{ background: "#ECE9FF", color: "#4A3FA3" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#DDD8FF")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#ECE9FF")
                      }
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setToDelete(p)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                      style={{ background: "#FEF2F2", color: "#DC2626" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#FEE2E2")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#FEF2F2")
                      }
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* add tile at bottom */}
          <button
            onClick={() => setModal("add")}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium transition-all duration-150"
            style={{
              background: "transparent",
              border: "2px dashed rgba(63,114,255,0.22)",
              color: "#9CA3AF",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(63,114,255,0.45)";
              (e.currentTarget as HTMLElement).style.color = "#3F72FF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(63,114,255,0.22)";
              (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
            }}
          >
            <Plus size={15} /> 프로젝트 추가
          </button>
        </div>
      )}

      {/* modals */}
      {modal !== null && (
        <ProjectModal
          initial={modal !== "add" ? modal : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {toDelete && (
        <DeleteConfirm
          name={toDelete.name}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Admin dashboard (after login)
───────────────────────────────────────────────── */
type Section = "hero" | "problems" | "projects";

const sideItems: Array<{ key: Section; icon: typeof FileText; label: string; sub: string }> = [
  { key: "hero", icon: FileText, label: "소개 문구", sub: "히어로 영역 편집" },
  { key: "problems", icon: Layers, label: "문제 해결 역량", sub: "역량 카드 4개 편집" },
  { key: "projects", icon: Shield, label: "프로젝트 관리", sub: "추가 · 수정 · 삭제" },
];

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<Section>("projects");
  const [toast, setToast] = useState(false);

  function showToast() {
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F2F4F9", fontFamily: "Inter, 'Noto Sans KR', sans-serif" }}
    >
      {/* ── top bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{
          height: "56px",
          background: "#1F2A44",
          boxShadow: "0 2px 16px rgba(31,42,68,0.25)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: "rgba(63,114,255,0.2)" }}
          >
            <Settings size={13} style={{ color: "#3F72FF" }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
            관리 모드
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ background: "rgba(63,114,255,0.15)", color: "#6B9FFF" }}
          >
            /admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#94A3B8",
              border: "1px solid rgba(255,255,255,0.09)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.color = "#94A3B8";
            }}
          >
            <ArrowUpRight size={11} /> 공개 페이지
          </Link>
          <button
            onClick={showToast}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{ background: "#3F72FF", color: "#FFFFFF" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#2D5FE8")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#3F72FF")
            }
          >
            <Save size={11} /> 변경사항 저장
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#94A3B8",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.color = "#94A3B8";
            }}
          >
            <LogOut size={11} /> 로그아웃
          </button>
        </div>
      </header>

      {/* ── body ── */}
      <div className="flex flex-1 pt-14">
        {/* sidebar */}
        <aside
          className="hidden md:flex flex-col"
          style={{
            width: "240px",
            background: "#FFFFFF",
            borderRight: "1px solid rgba(31,42,68,0.08)",
            position: "fixed",
            top: "56px",
            bottom: 0,
            left: 0,
            overflowY: "auto",
          }}
        >
          <div className="p-4 pt-6">
            <p
              className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
              style={{ color: "#9CA3AF" }}
            >
              콘텐츠 관리
            </p>

            {sideItems.map((item) => {
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left transition-all duration-150"
                  style={{
                    background: active ? "#ECE9FF" : "transparent",
                    border: active ? "1px solid rgba(74,63,163,0.12)" : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{
                      background: active ? "#FFFFFF" : "#F7F8FC",
                    }}
                  >
                    <item.icon
                      size={14}
                      style={{ color: active ? "#4A3FA3" : "#9CA3AF" }}
                    />
                  </div>
                  <div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: active ? "#1F2A44" : "#374151" }}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs" style={{ color: "#9CA3AF" }}>
                      {item.sub}
                    </div>
                  </div>
                  {active && (
                    <ChevronRight
                      size={12}
                      className="ml-auto"
                      style={{ color: "#4A3FA3" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* sidebar footer */}
          <div className="mt-auto p-4">
            <div
              className="rounded-xl p-3"
              style={{ background: "#F7F8FC", border: "1px solid rgba(31,42,68,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#10B981" }}
                />
                <span className="text-xs font-semibold" style={{ color: "#374151" }}>
                  관리자 로그인 중
                </span>
              </div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                방문자에게는 공개 프로젝트만 표시됩니다.
              </p>
            </div>
          </div>
        </aside>

        {/* main content */}
        <main
          className="flex-1 p-6 md:p-8 md:pl-10"
          style={{ marginLeft: "0" }}
        >
          <div
            className="max-w-3xl"
            style={{ marginLeft: "240px" }}
          >
            {/* mobile section switcher */}
            <div className="md:hidden flex gap-2 mb-6 flex-wrap">
              {sideItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: section === item.key ? "#1F2A44" : "#FFFFFF",
                    color: section === item.key ? "#FFFFFF" : "#6B7280",
                    border: "1px solid rgba(31,42,68,0.1)",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {section === "hero" && <HeroEditor onSaved={showToast} />}
            {section === "problems" && <ProblemsEditor onSaved={showToast} />}
            {section === "projects" && <ProjectsManager onSaved={showToast} />}
          </div>
        </main>
      </div>

      <SaveToast visible={toast} />
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Admin page root
───────────────────────────────────────────────── */
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (active) {
          setLoggedIn(false);
          setChecking(false);
        }
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("is_admin");

      if (!active) return;

      if (error || isAdmin !== true) {
        await supabase.auth.signOut();
        setLoggedIn(false);
      } else {
        setLoggedIn(true);
      }

      setChecking(false);
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setLoggedIn(false);
  }

  if (checking) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F7F8FC", color: "#6B7280" }}
      >
        <p className="text-sm">관리자 인증 상태를 확인하고 있습니다.</p>
      </main>
    );
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => void logout()} />;
}
