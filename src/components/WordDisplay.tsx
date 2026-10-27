type WordDisplayProps = {
  word: string;
  isValid: boolean;
};

export default function WordDisplay({ word, isValid }: WordDisplayProps) {
  return (
    <div className="flex h-10 w-full items-center justify-center font-mono">
      <span
        className={`truncate text-3xl font-semibold tracking-widest transition-colors ${
          isValid ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {word}
      </span>
    </div>
  );
}
