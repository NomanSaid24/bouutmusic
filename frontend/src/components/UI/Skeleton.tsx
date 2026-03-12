'use client';
import { motion } from 'framer-motion';

export function Skeleton({ width, height, borderRadius = 4, className = '' }: { width?: number | string, height?: number | string, borderRadius?: number | string, className?: string }) {
  return (
    <motion.div
      className={className}
      style={{
        width: width || '100%',
        height: height || '100%',
        borderRadius,
        background: '#e5e7eb',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </motion.div>
  );
}

export function SongCardSkeleton() {
  return (
    <div className="card song-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height={200} borderRadius={8} />
      <div>
        <Skeleton height={16} width="80%" borderRadius={4} />
        <div style={{ marginTop: 8 }}>
          <Skeleton height={12} width="50%" borderRadius={4} />
        </div>
      </div>
    </div>
  );
}
