interface ExerciseInstructionsProps {
  instructions: string[];
  className?: string;
}

export function ExerciseInstructions({
  instructions,
  className = "",
}: ExerciseInstructionsProps) {
  if (!instructions.length) return null;

  return (
    <ol className={`space-y-3 ${className}`}>
      {instructions.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            {i + 1}
          </span>
          <p className="text-sm leading-relaxed text-slate-600">{step}</p>
        </li>
      ))}
    </ol>
  );
}
