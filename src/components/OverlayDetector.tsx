'use client';

import { useEffect } from 'react';

/**
 * Development helper — logs the exact DOM element sitting on top of the
 * screen center on mount. Open DevTools Console to see the result.
 * Remove this component once the blocking element is identified.
 */
export function OverlayDetector() {
    useEffect(() => {
        // Wait for full paint then sample 5 points across the screen
        const timer = setTimeout(() => {
            const points = [
                { x: window.innerWidth / 2, y: window.innerHeight / 2 },
                { x: 200, y: 200 },
                { x: window.innerWidth - 200, y: 200 },
                { x: 200, y: window.innerHeight - 200 },
                { x: window.innerWidth / 2, y: 100 },
            ];

            console.group('🔍 OverlayDetector — top elements at key screen points');
            points.forEach(({ x, y }) => {
                const el = document.elementFromPoint(x, y);
                if (el) {
                    const cs = window.getComputedStyle(el);
                    console.log(
                        `(${x.toFixed(0)}, ${y.toFixed(0)}) →`,
                        el.tagName,
                        el.className || '[no class]',
                        `| z-index: ${cs.zIndex}`,
                        `| pointer-events: ${cs.pointerEvents}`,
                        `| position: ${cs.position}`,
                        el,
                    );
                }
            });

            // Also log everything with position:fixed
            const fixed = Array.from(document.querySelectorAll('*')).filter(el => {
                return window.getComputedStyle(el).position === 'fixed';
            });
            console.log(`\n📌 All position:fixed elements (${fixed.length} total):`);
            fixed.forEach(el => {
                const cs = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                console.log(
                    ' →', el.tagName,
                    (el as HTMLElement).className?.slice(0, 60) || '[no class]',
                    `z:${cs.zIndex} pe:${cs.pointerEvents}`,
                    `rect: ${JSON.stringify({ w: rect.width | 0, h: rect.height | 0, t: rect.top | 0, l: rect.left | 0 })}`,
                );
            });
            console.groupEnd();
        }, 1500); // after first paint

        return () => clearTimeout(timer);
    }, []);

    return null; // renders nothing
}
