import { useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-base)]">
      <div className="w-10 h-10 rounded-full border-2 border-[rgba(0,230,181,0.2)] border-t-[rgb(0,230,181)] animate-spin" />
    </div>
  );
};

export default LoadingScreen;
