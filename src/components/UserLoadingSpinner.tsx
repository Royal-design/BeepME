export const UserLoadingSpinner = () => {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <span className="typing-dot size-1.5 rounded-full bg-current" />
      <span className="typing-dot size-1.5 rounded-full bg-current" />
      <span className="typing-dot size-1.5 rounded-full bg-current" />
    </span>
  );
};
