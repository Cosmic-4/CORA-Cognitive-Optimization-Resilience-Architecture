import { memo, ReactNode, useEffect, useRef, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ==================== Input (mouse radial glow, no motion dep) ====================
const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hover, setHover] = useState(false);
    return (
      <div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
        style={{
          background: hover
            ? `radial-gradient(100px circle at ${pos.x}px ${pos.y}px, #3b82f6, transparent 80%)`
            : 'transparent',
        }}
      >
        <input
          type={type}
          className={cn(
            `shadow-input flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  })
);
Input.displayName = 'Input';

// ==================== BoxReveal (CSS only, no motion) ====================
type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};
const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return (
    <div
      ref={ref as any}
      style={{ position: position as any, width, overflow } as any}
      className={className}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity ${duration ?? 0.5}s ease 0.25s, transform ${duration ?? 0.5}s ease 0.25s`,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 4, bottom: 4, left: 0, right: 0, zIndex: 20,
          background: boxColor ?? '#5046e6',
          borderRadius: 4,
          transform: visible ? 'translateX(100%)' : 'translateX(0)',
          transition: `transform ${duration ?? 0.5}s ease-in`,
        }}
      />
    </div>
  );
});

// ==================== Ripple ====================
type RippleProps = { mainCircleSize?: number; mainCircleOpacity?: number; numCircles?: number; className?: string };
const Ripple = memo(function Ripple({ mainCircleSize = 210, mainCircleOpacity = 0.24, numCircles = 11, className = '' }: RippleProps) {
  return (
    <div className={`max-w-[50%] absolute inset-0 flex items-center justify-center dark:bg-white/5 bg-neutral-50 [mask-image:linear-gradient(to_bottom,black,transparent)] dark:[mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}>
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full bg-foreground/15 border"
            style={{
              width: `${size}px`, height: `${size}px`, opacity,
              animationDelay: `${i * 0.06}s`,
              borderStyle: i === numCircles - 1 ? 'dashed' : 'solid',
              borderWidth: '1px',
              borderColor: `var(--foreground)`,
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
});

// ==================== OrbitingCircles ====================
type OrbitingCirclesProps = { className?: string; children: ReactNode; reverse?: boolean; duration?: number; delay?: number; radius?: number; path?: boolean };
const OrbitingCircles = memo(function OrbitingCircles({ className, children, reverse = false, duration = 20, delay = 10, radius = 50, path = true }: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="pointer-events-none absolute inset-0 size-full">
          <circle className="stroke-black/10 stroke-1 dark:stroke-white/10" cx="50%" cy="50%" r={radius} fill="none" />
        </svg>
      )}
      <div
        style={{ '--duration': duration, '--radius': radius, '--delay': -delay } as React.CSSProperties}
        className={cn('absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10', { '[animation-direction:reverse]': reverse }, className)}
      >
        {children}
      </div>
    </>
  );
});

// ==================== TechOrbitDisplay ====================
type IconConfig = { className?: string; duration?: number; delay?: number; radius?: number; path?: boolean; reverse?: boolean; component: () => React.ReactNode };
type TechnologyOrbitDisplayProps = { iconsArray: IconConfig[]; text?: string };
const TechOrbitDisplay = memo(function TechOrbitDisplay({ iconsArray, text = 'Animated Login' }: TechnologyOrbitDisplayProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-7xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        {text}
      </span>
      {iconsArray.map((icon, index) => (
        <OrbitingCircles key={index} className={icon.className} duration={icon.duration} delay={icon.delay} radius={icon.radius} path={icon.path} reverse={icon.reverse}>
          {icon.component()}
        </OrbitingCircles>
      ))}
    </div>
  );
});

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { htmlFor?: string }
const Label = memo(function Label({ className, ...props }: LabelProps) {
  return <label className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />;
});

export { Input, BoxReveal, Ripple, OrbitingCircles, TechOrbitDisplay, Label, BottomGradient };
