import { motion } from 'framer-motion';
import { useMemo } from 'react';

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: string;
  stepDuration?: number;
};

// AQUI ESTÁ A CORREÇÃO: "export const" (Exportação Nomeada)
export const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'top',
  animationFrom,
  animationTo,
  easing = "easeOut",
  stepDuration = 1.0
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -20 }
        : { filter: 'blur(10px)', opacity: 0, y: 20 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  );

  const initialVariant = animationFrom || defaultFrom;
  const targetVariant = animationTo || defaultTo;

  const getKeyframes = (prop: string) => {
    const fromVal = initialVariant[prop];
    const toVals = targetVariant.map((t) => t[prop]);
    return [fromVal, ...toVals];
  };

  const animateProps = {
    filter: getKeyframes('filter'),
    opacity: getKeyframes('opacity'),
    transform: getKeyframes('y').map((y) => `translateY(${y}px)`),
    y: getKeyframes('y'), 
  };

  return (
    <p className={`flex flex-wrap ${className}`} style={{ margin: 0 }}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={initialVariant}
          animate={animateProps}
          transition={{
            duration: stepDuration,
            delay: (index * delay) / 1000,
            ease: easing,
            times: [0, 0.4, 1],
          }}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            willChange: 'transform, filter, opacity',
            color: 'inherit' 
          }}
          className="text-inherit"
        >
          {segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </p>
  );
};
// NÃO ADICIONE "export default" NO FINAL