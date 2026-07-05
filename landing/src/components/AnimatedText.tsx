import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * Character-by-character scroll reveal. Each character interpolates from
 * opacity 0.2 to 1 across its slice of the paragraph's scroll progress.
 * Characters are grouped into words so lines wrap between words, never
 * inside them.
 */
export function AnimatedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const words = text.split(" ");
  const totalChars = text.length;
  let cursor = 0;

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "0 0.28em" }}
    >
      {words.map((word, wi) => {
        const chars = word.split("");
        const node = (
          <span key={wi} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
            {chars.map((char, ci) => {
              const start = cursor + ci;
              return (
                <Char
                  key={ci}
                  progress={scrollYProgress}
                  range={[start / totalChars, (start + 1) / totalChars]}
                >
                  {char}
                </Char>
              );
            })}
          </span>
        );
        cursor += word.length + 1; // +1 for the space
        return node;
      })}
    </p>
  );
}

function Char({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}
