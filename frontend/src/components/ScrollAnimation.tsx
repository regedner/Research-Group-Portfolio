import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react'; // ReactNode'u type-only olarak import edin

// Bileşen için TypeScript arayüzünü tanımlayın
interface ScrollAnimationProps {
  children: ReactNode;
  animationType?: 'fade-up' | 'fade-in';
  delay?: number;
}

// Bileşeni ScrollAnimationProps ile tanımlayın
function ScrollAnimation({ children, animationType = 'fade-up', delay = 0 }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.2,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const transitionClass = 'transition-all duration-1000 ease-out';
  let animationClasses = '';

  if (animationType === 'fade-up') {
    animationClasses = isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-12';
  } else if (animationType === 'fade-in') {
    animationClasses = isVisible ? 'opacity-100' : 'opacity-0';
  }

  const style = {
    transitionDelay: `${delay}ms`,
  };

  return (
    // ref'i div'e eklerken generic type'ı kullanın
    <div ref={ref} className={`${transitionClass} ${animationClasses}`} style={style}>
      {children}
    </div>
  );
}

export default ScrollAnimation;