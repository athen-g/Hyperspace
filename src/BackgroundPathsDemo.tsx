import { Component } from '@/components/ui/etheral-shadow';

export function BackgroundPathsDemo() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Component
        className="h-full w-full"
        color="rgba(128, 128, 128, 1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
      />
    </div>
  );
}
