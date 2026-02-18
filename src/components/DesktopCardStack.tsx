"use client";

import { useState } from "react";
import IdeaCard from "@/components/IdeaCard";

interface IdeaForStack {
  _id: string;
  title: string;
  summary: string;
  category: string;
  voteScore: number;
  validationScore: number;
  commentCount: number;
  userVote?: number | null;
  userId: { _id: string; name: string };
}

interface DesktopCardStackProps {
  ideas: IdeaForStack[];
}

/**
 * Desktop stack view: ideas shown as overlapping cards. Click a card to bring it to front.
 */
export default function DesktopCardStack({ ideas }: DesktopCardStackProps) {
  const [frontIndex, setFrontIndex] = useState(0);

  if (!ideas.length) return null;

  return (
    <div className="relative w-full min-h-[420px] flex items-center justify-center py-8">
      <div className="relative w-full max-w-md mx-auto" style={{ perspective: "1200px" }}>
        {ideas.map((idea, i) => {
          const offset = i - frontIndex;
          const isFront = offset === 0;
          const z = ideas.length - Math.abs(offset);
          const x = offset * 24;
          const y = Math.abs(offset) * 8;
          const scale = 1 - Math.abs(offset) * 0.06;
          const opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15;

          return (
            <div
              key={idea._id}
              className="absolute left-1/2 top-0 w-full transition-transform duration-300 ease-out"
              style={{
                transform: `translate(-50%, ${y}px) translateX(${x}px) scale(${scale})`,
                zIndex: z,
                opacity,
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <IdeaCard idea={idea} />
              {!isFront && (
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setFrontIndex(i)}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
      {ideas.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {ideas.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFrontIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === frontIndex
                  ? "bg-violet-500 scale-125"
                  : "bg-theme-muted/50 hover:bg-violet-500/50"
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
