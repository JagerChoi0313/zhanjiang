"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./home.module.css";

export default function AnimatedHomeTitle({
  id,
  lines,
  as: Heading = "h2",
}: {
  id: string;
  lines: string[];
  as?: "h1" | "h2";
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const heading = headingRef.current;
    if (Heading === "h1" || !heading || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(heading);
    return () => observer.disconnect();
  }, [Heading]);

  let characterIndex = 0;

  return (
    <Heading
      id={id}
      ref={headingRef}
      aria-label={lines.join("")}
      className={Heading === "h1" || inView ? styles.playTitle : undefined}
    >
      {lines.map((line, lineIndex) => (
        <span key={line} aria-hidden="true">
          {lineIndex > 0 && <br />}
          {Array.from(line, (character, index) => (
            <span
              key={index}
              className={styles.titleCharacter}
              style={{ animationDelay: `${characterIndex++ * 75}ms` } as CSSProperties}
            >
              {character}
            </span>
          ))}
        </span>
      ))}
    </Heading>
  );
}
