type PromptRendererProps = {
  promptText: string;
  typedText: string;
  onCopyAttempt?: () => void;
  onCutAttempt?: () => void;
};

export default function PromptRenderer({ promptText, typedText, onCopyAttempt, onCutAttempt }: PromptRendererProps) {
  const typedLength = typedText.length;

  return (
    <div
      className="max-h-52 overflow-y-auto rounded-lg border border-white/10 bg-[#08172C] p-4 font-mono text-sm leading-6 text-[#9CA3AF] select-none"
      onCopy={(event) => {
        event.preventDefault();
        onCopyAttempt?.();
      }}
      onCut={(event) => {
        event.preventDefault();
        onCutAttempt?.();
      }}
      aria-label="Typing prompt text"
    >
      {promptText.split("").map((character, index) => {
        const hasTypedCharacter = index < typedLength;
        const isCorrect = hasTypedCharacter && typedText[index] === character;
        const isIncorrect = hasTypedCharacter && !isCorrect;
        const isCursor = index === typedLength;

        const className = isCorrect
          ? "text-emerald-300"
          : isIncorrect
            ? "text-rose-300 underline decoration-rose-400 decoration-2"
            : isCursor
              ? "rounded-sm bg-[#1E2F45] text-[#E5E7EB]"
              : "text-[#9CA3AF]";

        return (
          <span key={`${index}-${character}`} className={className}>
            {character}
          </span>
        );
      })}
    </div>
  );
}
