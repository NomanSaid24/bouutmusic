'use client';

import { useCallback, useEffect } from 'react';
import './BorderGlow.css';

const CARD_SELECTOR = '.lp-card';
const DEFAULT_COLORS = ['#c084fc', '#f472b6', '#38bdf8'];
const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function applyGlowVars(card: HTMLElement) {
  if (card.dataset.borderGlowReady === 'true') return;

  const { h, s, l } = parseHSL('40 80 80');
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];

  card.classList.add('border-glow-card');
  card.style.setProperty('--card-bg', '#120F17');
  card.style.setProperty('--edge-sensitivity', '30');
  card.style.setProperty('--border-radius', getComputedStyle(card).borderRadius || '14px');
  card.style.setProperty('--glow-padding', '40px');
  card.style.setProperty('--cone-spread', '25');
  card.style.setProperty('--fill-opacity', '0.5');

  opacities.forEach((opacity, index) => {
    card.style.setProperty(`--glow-color${keys[index]}`, `hsl(${base} / ${opacity}%)`);
  });

  for (let i = 0; i < 7; i++) {
    const color = DEFAULT_COLORS[Math.min(COLOR_MAP[i], DEFAULT_COLORS.length - 1)];
    card.style.setProperty(GRADIENT_KEYS[i], `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${color} 0px, transparent 50%)`);
  }

  card.style.setProperty('--gradient-base', `linear-gradient(${DEFAULT_COLORS[0]} 0 100%)`);

  card.dataset.borderGlowReady = 'true';
}

function getCenterOfElement(el: HTMLElement) {
  const { width, height } = el.getBoundingClientRect();
  return [width / 2, height / 2];
}

function getEdgeProximity(el: HTMLElement, x: number, y: number) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;
  let kx = Infinity;
  let ky = Infinity;

  if (dx !== 0) kx = cx / Math.abs(dx);
  if (dy !== 0) ky = cy / Math.abs(dy);

  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(el: HTMLElement, x: number, y: number) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;

  if (dx === 0 && dy === 0) return 0;

  const radians = Math.atan2(dy, dx);
  let degrees = radians * (180 / Math.PI) + 90;
  if (degrees < 0) degrees += 360;
  return degrees;
}

export function BorderGlowEnhancer() {
  const enhanceCards = useCallback(() => {
    document.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach(applyGlowVars);
  }, []);

  useEffect(() => {
    enhanceCards();

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(CARD_SELECTOR)
        : null;

      if (!target) return;

      applyGlowVars(target);
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edge = getEdgeProximity(target, x, y);
      const angle = getCursorAngle(target, x, y);

      target.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
      target.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    };

    const observer = new MutationObserver(enhanceCards);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [enhanceCards]);

  return null;
}
