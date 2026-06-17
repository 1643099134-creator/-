import { STAGES } from "@/lib/auroraData";

interface StageLineProps {
  stage: number;
}

export function StageLine({ stage }: StageLineProps) {
  return (
    <div className="stage-line">
      {STAGES.map((s, i) => {
        const isDone = i + 1 < stage;
        const isActive = i + 1 === stage;
        return (
          <div
            key={s}
            className={`stage ${isDone ? "stage-done" : ""} ${isActive ? "stage-active" : ""}`}
          >
            <div className="stage-dot" />
            <div className="stage-label">{s}</div>
          </div>
        );
      })}
    </div>
  );
}
