'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { motion, type Transition } from 'framer-motion';

import './RotatingText.css';

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

type StaggerFrom = 'first' | 'last' | 'center' | 'random' | number;
type SplitWord = { characters: string[]; needsSpace: boolean };

export interface RotatingTextHandle {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps {
  texts: string[];
  transition?: Transition;
  initial?: Record<string, string | number>;
  animate?: Record<string, string | number>;
  exit?: Record<string, string | number>;
  animatePresenceMode?: 'sync' | 'popLayout' | 'wait';
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  loop?: boolean;
  auto?: boolean;
  splitBy?: 'characters' | 'words' | 'lines' | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  className?: string;
  style?: CSSProperties;
}

function splitIntoCharacters(text: string) {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new (Intl as typeof Intl & {
      Segmenter: new (locale: string, options: { granularity: 'grapheme' }) => {
        segment: (input: string) => Iterable<{ segment: string }>;
      };
    }).Segmenter('en', { granularity: 'grapheme' });

    return Array.from(segmenter.segment(text), segment => segment.segment);
  }

  return Array.from(text);
}

function buildSplitWords(text: string, splitBy: RotatingTextProps['splitBy']): SplitWord[] {
  if (splitBy === 'characters') {
    const words = text.split(' ');
    return words.map((word, index) => ({
      characters: splitIntoCharacters(word),
      needsSpace: index !== words.length - 1,
    }));
  }

  if (splitBy === 'words') {
    const words = text.split(' ');
    return words.map((word, index) => ({
      characters: [word],
      needsSpace: index !== words.length - 1,
    }));
  }

  if (splitBy === 'lines') {
    const lines = text.split('\n');
    return lines.map((line, index) => ({
      characters: [line],
      needsSpace: index !== lines.length - 1,
    }));
  }

  const parts = text.split(splitBy || '');
  return parts.map((part, index) => ({
    characters: [part],
    needsSpace: index !== parts.length - 1,
  }));
}

const RotatingText = forwardRef<RotatingTextHandle, RotatingTextProps>((props, ref) => {
  const {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit: _exit,
    animatePresenceMode: _animatePresenceMode,
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    className,
    style,
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const currentText = texts[currentTextIndex] || '';

  const splitTexts = useMemo(
    () => texts.map(text => buildSplitWords(text, splitBy)),
    [texts, splitBy]
  );

  const longestText = useMemo(
    () => texts.reduce((longest, text) => (text.length > longest.length ? text : longest), ''),
    [texts]
  );

  const getStaggerDelay = useCallback(
    (index: number, totalChars: number) => {
      if (staggerFrom === 'first') return index * staggerDuration;
      if (staggerFrom === 'last') return (totalChars - 1 - index) * staggerDuration;
      if (staggerFrom === 'center') {
        const center = Math.floor(totalChars / 2);
        return Math.abs(center - index) * staggerDuration;
      }
      if (staggerFrom === 'random') {
        const randomIndex = Math.floor(Math.random() * totalChars);
        return Math.abs(randomIndex - index) * staggerDuration;
      }

      return Math.abs(staggerFrom - index) * staggerDuration;
    },
    [staggerFrom, staggerDuration]
  );

  const handleIndexChange = useCallback(
    (newIndex: number) => {
      setCurrentTextIndex(newIndex);
      onNext?.(newIndex);
    },
    [onNext]
  );

  const next = useCallback(() => {
    const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) {
      handleIndexChange(nextIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const previous = useCallback(() => {
    const previousIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
    if (previousIndex !== currentTextIndex) {
      handleIndexChange(previousIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const jumpTo = useCallback(
    (index: number) => {
      const validIndex = Math.max(0, Math.min(index, texts.length - 1));
      if (validIndex !== currentTextIndex) {
        handleIndexChange(validIndex);
      }
    },
    [texts.length, currentTextIndex, handleIndexChange]
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(ref, () => ({
    next,
    previous,
    jumpTo,
    reset,
  }), [next, previous, jumpTo, reset]);

  useEffect(() => {
    if (!auto || texts.length <= 1) return;

    const intervalId = window.setInterval(next, rotationInterval);
    return () => window.clearInterval(intervalId);
  }, [next, rotationInterval, auto, texts.length]);

  return (
    <motion.span className={cn('text-rotate', mainClassName, className)} style={style} transition={transition}>
      <span className="text-rotate-sr-only">{currentText}</span>
      <span className="text-rotate-measure" aria-hidden="true">{longestText}</span>
      <span className="text-rotate-stack" aria-hidden="true">
        {splitTexts.map((words, textIndex) => {
          const isActive = textIndex === currentTextIndex;

          return (
            <motion.span
              key={`${texts[textIndex]}-${textIndex}`}
              className={cn(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate-layer')}
              animate={isActive ? { opacity: 1 } : { opacity: 0 }}
              initial={animatePresenceInitial ? undefined : false}
              transition={{ duration: 0.12, ease: 'linear' }}
            >
              {words.map((wordObj, wordIndex, array) => {
                const previousCharsCount = array
                  .slice(0, wordIndex)
                  .reduce((sum, word) => sum + word.characters.length, 0);
                const totalChars = array.reduce((sum, word) => sum + word.characters.length, 0);

                return (
                  <span key={wordIndex} className={cn('text-rotate-word', splitLevelClassName)}>
                    {wordObj.characters.map((char, charIndex) => (
                      <motion.span
                        key={`${char}-${charIndex}`}
                        initial={animatePresenceInitial ? initial : false}
                        animate={isActive ? animate : initial}
                        transition={{
                          ...transition,
                          delay: isActive ? getStaggerDelay(previousCharsCount + charIndex, totalChars) : 0,
                        }}
                        className={cn('text-rotate-element', elementLevelClassName)}
                      >
                        {char}
                      </motion.span>
                    ))}
                    {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
                  </span>
                );
              })}
            </motion.span>
          );
        })}
      </span>
    </motion.span>
  );
});

RotatingText.displayName = 'RotatingText';

export default RotatingText;
