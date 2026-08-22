import { useEffect, useRef } from 'react';
import { animate, createTimeline, stagger } from 'animejs';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = createTimeline({
      defaults: { ease: 'inOutExpo' },
      onComplete,
    });

    // logo morph + scale
    if (logoRef.current) {
      tl.add(logoRef.current, {
        scale: [0.7, 1],
        rotate: [ -12, 0 ],
        opacity: [0, 1],
        duration: 420,
        ease: 'outExpo',
      });
      // breathing pulse
      animate(logoRef.current, {
        scale: [1, 1.06, 1],
        duration: 900,
        loop: true,
        ease: 'inOutSine',
        delay: 420,
      });
    }

    // dots stagger
    if (dotsRef.current) {
      const dots = dotsRef.current.querySelectorAll('.ls-dot');
      animate(dots, {
        translateY: [-8, 0],
        opacity: [0, 1],
        delay: stagger(90, { start: 200 }),
        duration: 400,
        ease: 'outExpo',
      });
      animate(dots, {
        scale: [1, 1.35, 1],
        background: ['var(--color-cora)', '#34D399', 'var(--color-cora)'],
        delay: stagger(120),
        duration: 700,
        loop: true,
        ease: 'inOutSine',
      });
    }

    // progress bar
    if (barRef.current) {
      animate(barRef.current, {
        scaleX: [0, 1],
        duration: 560,
        ease: 'inOutExpo',
      });
    }

    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--color-bg-base)] overflow-hidden">
      {/* grid shimmer */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(var(--color-cora) 1px, transparent 1px), linear-gradient(90deg, var(--color-cora) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div ref={logoRef} className="relative w-14 h-14 rounded-[16px] bg-[var(--color-cora)] flex items-center justify-center text-white font-bold text-xl shadow-[0_8px_32px_rgba(14,162,147,0.35)]">
        C
        <span className="absolute inset-0 rounded-[16px] bg-white/10 blur-xl -z-10" />
      </div>
      <p className="mt-4 text-[11px] font-mono tracking-[0.18em] text-[var(--color-text-muted)] uppercase">CORA • Resilience Engine</p>
      <div ref={dotsRef} className="flex gap-2 mt-5">
        <span className="ls-dot w-1.5 h-1.5 rounded-full bg-[var(--color-cora)] opacity-0" />
        <span className="ls-dot w-1.5 h-1.5 rounded-full bg-[var(--color-cora)] opacity-0" />
        <span className="ls-dot w-1.5 h-1.5 rounded-full bg-[var(--color-cora)] opacity-0" />
      </div>
      <div className="w-[160px] h-[2px] mt-8 rounded-full overflow-hidden bg-white/10">
        <div ref={barRef} className="h-full w-full bg-[var(--color-cora)] origin-left scale-x-0" />
      </div>
    </div>
  );
};

export default LoadingScreen;
