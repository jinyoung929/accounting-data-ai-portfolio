import type { ContentBlock } from "../context";

export default function ProjectContentBlocks({
  blocks,
}: {
  blocks: ContentBlock[];
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mb-6">
      {blocks.map((block) => {
        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
          const size =
            block.level === 1
              ? "text-2xl md:text-3xl"
              : block.level === 2
                ? "text-xl md:text-2xl"
                : "text-lg";

          if (!block.text.trim()) return null;

          return (
            <Tag
              key={block.id}
              className={`${size} font-bold`}
              style={{
                color: "#1F2A44",
                letterSpacing: "-0.025em",
              }}
            >
              {block.text}
            </Tag>
          );
        }

        if (block.type === "text") {
          if (!block.text.trim()) return null;

          return (
            <p
              key={block.id}
              className="text-sm leading-7"
              style={{ color: "#374151", whiteSpace: "pre-line" }}
            >
              {block.text}
            </p>
          );
        }

        return (
          <div
            key={block.id}
            className={
              block.columns === 1
                ? "grid grid-cols-1 gap-4"
                : block.columns === 2
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "grid grid-cols-1 md:grid-cols-3 gap-4"
            }
          >
            {block.images
              .filter((image) => image.url)
              .map((image) => (
                <figure key={image.id}>
                  <img
                    src={image.url}
                    alt={image.alt || "프로젝트 추가 이미지"}
                    className="w-full rounded-2xl object-cover"
                    style={{
                      border: "1px solid rgba(31,42,68,0.08)",
                      background: "#FFFFFF",
                    }}
                  />
                  {image.caption && (
                    <figcaption
                      className="text-xs leading-5 mt-2 px-1"
                      style={{ color: "#6B7280", whiteSpace: "pre-line" }}
                    >
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
          </div>
        );
      })}
    </div>
  );
}
