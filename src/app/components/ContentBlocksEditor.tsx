import {
  Fragment,
  useState,
  type CSSProperties,
} from "react";
import type { ContentBlock, ContentImage } from "../context";
import { uploadPortfolioImage } from "../../lib/storage";

type BlockKind = "heading1" | "heading2" | "heading3" | "text" | "image";

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(31,42,68,0.12)",
  background: "#F7F8FC",
  color: "#1F2A44",
  fontSize: "13px",
  outline: "none",
};

function makeId() {
  return crypto.randomUUID();
}

function makeImage(): ContentImage {
  return {
    id: makeId(),
    url: "",
    alt: "",
    caption: "",
  };
}

function makeBlock(kind: BlockKind): ContentBlock {
  if (kind === "heading1") {
    return { id: makeId(), type: "heading", level: 1, text: "" };
  }

  if (kind === "heading2") {
    return { id: makeId(), type: "heading", level: 2, text: "" };
  }

  if (kind === "heading3") {
    return { id: makeId(), type: "heading", level: 3, text: "" };
  }

  if (kind === "text") {
    return { id: makeId(), type: "text", text: "" };
  }

  return {
    id: makeId(),
    type: "image-row",
    columns: 1,
    images: [makeImage()],
  };
}

export default function ContentBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [draggingImage, setDraggingImage] = useState<{
    blockId: string;
    imageId: string;
  } | null>(null);
  const [uploadingKey, setUploadingKey] = useState("");
  const [error, setError] = useState("");

  function insertBlock(kind: BlockKind, index: number) {
    const next = [...blocks];
    next.splice(index, 0, makeBlock(kind));
    onChange(next);
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function dropBlock(targetIndex: number) {
    if (!draggingBlockId) return;

    const fromIndex = blocks.findIndex((block) => block.id === draggingBlockId);
    if (fromIndex < 0 || fromIndex === targetIndex) return;

    const next = [...blocks];
    const [moved] = next.splice(fromIndex, 1);
    const insertAt = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
    next.splice(insertAt, 0, moved);

    onChange(next);
    setDraggingBlockId(null);
  }

  function deleteBlock(id: string) {
    onChange(blocks.filter((block) => block.id !== id));
  }

  function updateBlock(
    id: string,
    updater: (block: ContentBlock) => ContentBlock,
  ) {
    onChange(
      blocks.map((block) => (block.id === id ? updater(block) : block)),
    );
  }

  function updateImage(
    blockId: string,
    imageId: string,
    patch: Partial<ContentImage>,
  ) {
    updateBlock(blockId, (block) => {
      if (block.type !== "image-row") return block;

      return {
        ...block,
        images: block.images.map((image) =>
          image.id === imageId ? { ...image, ...patch } : image,
        ),
      };
    });
  }

  function addImage(blockId: string) {
    updateBlock(blockId, (block) => {
      if (block.type !== "image-row") return block;

      return {
        ...block,
        images: [...block.images, makeImage()],
      };
    });
  }

  function removeImage(blockId: string, imageId: string) {
    updateBlock(blockId, (block) => {
      if (block.type !== "image-row") return block;

      const nextImages = block.images.filter((image) => image.id !== imageId);

      return {
        ...block,
        images: nextImages.length > 0 ? nextImages : [makeImage()],
      };
    });
  }

  function moveImage(blockId: string, index: number, direction: -1 | 1) {
    updateBlock(blockId, (block) => {
      if (block.type !== "image-row") return block;

      const target = index + direction;
      if (target < 0 || target >= block.images.length) return block;

      const images = [...block.images];
      [images[index], images[target]] = [images[target], images[index]];

      return { ...block, images };
    });
  }

  function dropImage(targetBlockId: string, targetImageId: string) {
    if (!draggingImage || draggingImage.blockId !== targetBlockId) return;

    updateBlock(targetBlockId, (block) => {
      if (block.type !== "image-row") return block;

      const fromIndex = block.images.findIndex(
        (image) => image.id === draggingImage.imageId,
      );
      const targetIndex = block.images.findIndex(
        (image) => image.id === targetImageId,
      );

      if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) {
        return block;
      }

      const images = [...block.images];
      const [moved] = images.splice(fromIndex, 1);
      const insertAt = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
      images.splice(insertAt, 0, moved);

      return { ...block, images };
    });

    setDraggingImage(null);
  }

  async function uploadImage(
    blockId: string,
    imageId: string,
    file: File,
  ) {
    const key = `${blockId}:${imageId}`;

    try {
      setUploadingKey(key);
      setError("");

      const url = await uploadPortfolioImage(file, "content");
      updateImage(blockId, imageId, { url });
    } catch (err) {
      setError(
        err instanceof Error
          ? `이미지를 업로드하지 못했습니다: ${err.message}`
          : "이미지를 업로드하지 못했습니다.",
      );
    } finally {
      setUploadingKey("");
    }
  }

  function AddBlockBar({ index }: { index: number }) {
    return (
      <div className="flex flex-wrap gap-2 py-2">
        <button
          type="button"
          onClick={() => insertBlock("heading1", index)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "#ECE9FF", color: "#4A3FA3" }}
        >
          + 큰 제목
        </button>
        <button
          type="button"
          onClick={() => insertBlock("heading2", index)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "#ECE9FF", color: "#4A3FA3" }}
        >
          + 소제목
        </button>
        <button
          type="button"
          onClick={() => insertBlock("text", index)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "#F7F8FC", color: "#374151" }}
        >
          + 본문
        </button>
        <button
          type="button"
          onClick={() => insertBlock("image", index)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "#EEF4FF", color: "#3F72FF" }}
        >
          + 이미지
        </button>
      </div>
    );
  }

  return (
    <div
      className="pt-5"
      style={{ borderTop: "1px solid rgba(31,42,68,0.08)" }}
    >
      <div className="mb-3">
        <h4 className="text-sm font-bold" style={{ color: "#1F2A44" }}>
          자유 문서 블록
        </h4>
        <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
          원하는 위치에 블록을 추가하고, 블록 또는 이미지를 끌어 순서를 바꿀 수 있습니다.
        </p>
      </div>

      {error && (
        <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}

      <AddBlockBar index={0} />

      <div className="flex flex-col gap-3">
        {blocks.map((block, blockIndex) => (
          <Fragment key={block.id}>
            <div
              draggable
              onDragStart={() => setDraggingBlockId(block.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropBlock(blockIndex)}
              className="rounded-2xl p-5"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(31,42,68,0.10)",
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <span
                  className="text-xs font-bold"
                  style={{ color: "#4A3FA3", cursor: "grab" }}
                >
                  ⋮⋮{" "}
                  {block.type === "heading"
                    ? "제목"
                    : block.type === "text"
                      ? "본문"
                      : "이미지 묶음"}
                </span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveBlock(blockIndex, -1)}
                    disabled={blockIndex === 0}
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{
                      background: "#F7F8FC",
                      color: "#4A3FA3",
                      opacity: blockIndex === 0 ? 0.4 : 1,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(blockIndex, 1)}
                    disabled={blockIndex === blocks.length - 1}
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{
                      background: "#F7F8FC",
                      color: "#4A3FA3",
                      opacity: blockIndex === blocks.length - 1 ? 0.4 : 1,
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBlock(block.id)}
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{ background: "#FEF2F2", color: "#DC2626" }}
                  >
                    삭제
                  </button>
                </div>
              </div>

              {block.type === "heading" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={block.level}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "heading"
                          ? {
                              ...current,
                              level: Number(event.target.value) as 1 | 2 | 3,
                            }
                          : current,
                      )
                    }
                    style={{ ...fieldStyle, width: "150px" }}
                  >
                    <option value={1}>큰 제목</option>
                    <option value={2}>소제목</option>
                    <option value={3}>작은 제목</option>
                  </select>

                  <input
                    value={block.text}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "heading"
                          ? { ...current, text: event.target.value }
                          : current,
                      )
                    }
                    placeholder="제목을 입력해 주세요"
                    style={fieldStyle}
                  />
                </div>
              )}

              {block.type === "text" && (
                <textarea
                  value={block.text}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "text"
                        ? { ...current, text: event.target.value }
                        : current,
                    )
                  }
                  placeholder="본문을 입력해 주세요. Enter로 줄바꿈할 수 있습니다."
                  rows={5}
                  style={{
                    ...fieldStyle,
                    resize: "vertical",
                    lineHeight: "1.7",
                  }}
                />
              )}

              {block.type === "image-row" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: "#6B7280" }}>
                        정렬
                      </span>
                      <select
                        value={block.columns}
                        onChange={(event) =>
                          updateBlock(block.id, (current) =>
                            current.type === "image-row"
                              ? {
                                  ...current,
                                  columns: Number(event.target.value) as 1 | 2 | 3,
                                }
                              : current,
                          )
                        }
                        style={{ ...fieldStyle, width: "120px", padding: "7px 10px" }}
                      >
                        <option value={1}>세로 1열</option>
                        <option value={2}>가로 2열</option>
                        <option value={3}>가로 3열</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => addImage(block.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#EEF4FF", color: "#3F72FF" }}
                    >
                      + 이미지 추가
                    </button>
                  </div>

                  <div
                    className={
                      block.columns === 1
                        ? "grid grid-cols-1 gap-3"
                        : block.columns === 2
                          ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                          : "grid grid-cols-1 sm:grid-cols-3 gap-3"
                    }
                  >
                    {block.images.map((image, imageIndex) => {
                      const key = `${block.id}:${image.id}`;
                      const isUploading = uploadingKey === key;
                      const inputId = `content-image-${block.id}-${image.id}`;

                      return (
                        <div
                          key={image.id}
                          draggable
                          onDragStart={(event) => {
                            event.stopPropagation();
                            setDraggingImage({
                              blockId: block.id,
                              imageId: image.id,
                            });
                          }}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            dropImage(block.id, image.id);
                          }}
                          className="rounded-xl p-3"
                          style={{
                            background: "#F7F8FC",
                            border: "1px solid rgba(31,42,68,0.08)",
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-semibold" style={{ color: "#6B7280" }}>
                              ⋮⋮ 이미지 {imageIndex + 1}
                            </span>

                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => moveImage(block.id, imageIndex, -1)}
                                disabled={imageIndex === 0}
                                className="px-1.5 py-1 rounded-md text-xs"
                                style={{
                                  background: "#FFFFFF",
                                  color: "#4A3FA3",
                                  opacity: imageIndex === 0 ? 0.4 : 1,
                                }}
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(block.id, imageIndex, 1)}
                                disabled={imageIndex === block.images.length - 1}
                                className="px-1.5 py-1 rounded-md text-xs"
                                style={{
                                  background: "#FFFFFF",
                                  color: "#4A3FA3",
                                  opacity:
                                    imageIndex === block.images.length - 1 ? 0.4 : 1,
                                }}
                              >
                                →
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(block.id, image.id)}
                                className="px-1.5 py-1 rounded-md text-xs"
                                style={{ background: "#FEF2F2", color: "#DC2626" }}
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          <label
                            htmlFor={inputId}
                            className="group relative block rounded-xl overflow-hidden cursor-pointer mb-3"
                            style={{
                              background: "#FFFFFF",
                              border: "1px dashed rgba(63,114,255,0.38)",
                              minHeight: "152px",
                            }}
                          >
                            <input
                              id={inputId}
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (file) {
                                  void uploadImage(block.id, image.id, file);
                                }

                                event.currentTarget.value = "";
                              }}
                            />

                            {isUploading ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                <span
                                  className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                                  style={{
                                    borderColor: "#4A3FA3",
                                    borderTopColor: "transparent",
                                  }}
                                />
                                <span className="text-xs font-semibold" style={{ color: "#4A3FA3" }}>
                                  Supabase Storage에 업로드 중...
                                </span>
                              </div>
                            ) : image.url ? (
                              <>
                                <img
                                  src={image.url}
                                  alt={image.alt || "프로젝트 이미지"}
                                  className="w-full h-40 object-cover"
                                />
                                <div
                                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ background: "rgba(31,42,68,0.56)" }}
                                >
                                  <span
                                    className="px-3 py-2 rounded-lg text-xs font-semibold"
                                    style={{ background: "#FFFFFF", color: "#1F2A44" }}
                                  >
                                    이미지 교체
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                <span
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                  style={{ background: "#EEF4FF", color: "#3F72FF" }}
                                >
                                  ↑
                                </span>
                                <span className="text-sm font-semibold" style={{ color: "#1F2A44" }}>
                                  클릭해서 이미지 업로드
                                </span>
                                <span className="text-xs" style={{ color: "#9CA3AF" }}>
                                  PNG, JPG, WEBP, GIF · 최대 5MB
                                </span>
                              </div>
                            )}
                          </label>

                          <input
                            value={image.alt}
                            onChange={(event) =>
                              updateImage(block.id, image.id, {
                                alt: event.target.value,
                              })
                            }
                            placeholder="이미지 설명용 제목"
                            style={{ ...fieldStyle, marginBottom: "8px" }}
                          />

                          <textarea
                            value={image.caption}
                            onChange={(event) =>
                              updateImage(block.id, image.id, {
                                caption: event.target.value,
                              })
                            }
                            placeholder="이미지 아래 설명"
                            rows={2}
                            style={{
                              ...fieldStyle,
                              resize: "vertical",
                              lineHeight: "1.55",
                            }}
                          />

                          {isUploading && (
                            <p className="text-xs mt-2" style={{ color: "#4A3FA3" }}>
                              업로드 중...
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <AddBlockBar index={blockIndex + 1} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
