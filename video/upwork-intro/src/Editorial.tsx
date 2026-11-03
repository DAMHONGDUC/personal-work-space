import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Geist';

const { fontFamily: SANS } = loadFont('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const C = { stage: '#ffffff', ink: '#0e0e12', muted: '#6e6e78', rule: '#e8e8ec', accent: '#9c7434' };

type Scene = { eyebrow: string; main: string[]; sub?: string; list?: boolean; accent?: boolean; frames: number };
// Three bars each at 120 bpm (360 frames), the close four.
const SCENES: Scene[] = [
  { eyebrow: 'Introduction', main: ['Hello,', "I'm Duc."], sub: 'Senior full-stack mobile developer.', frames: 360 },
  { eyebrow: 'Experience', main: ['5+ years building', 'mobile apps,', 'end to end.'], sub: 'iOS and Android, in teams and solo.', frames: 360 },
  { eyebrow: 'Mobile', main: ['Flutter', 'React Native', 'SwiftUI', 'Jetpack Compose'], sub: 'Plus web with Next.js and React.', list: true, frames: 360 },
  { eyebrow: 'Backend', main: ['Node.js and Firebase,', 'for the whole app.'], sub: 'Firestore · Cloud Functions · FCM', frames: 360 },
  { eyebrow: 'Craft', main: ['Fast, small and secure,', 'shipped to both stores.'], sub: 'Performance · App size · CI/CD · Security', frames: 360 },
  { eyebrow: 'Where', main: ['Ho Chi Minh City,', 'GMT+7.'], sub: 'Available for remote contract work.', frames: 360 },
  { eyebrow: "Let's work together", main: ['Message me', 'on Upwork.'], sub: 'Duc — Senior Full-Stack Mobile Developer', accent: true, frames: 480 },
];
const starts = SCENES.reduce<number[]>((a, s, i) => [...a, i ? a[i - 1] + SCENES[i - 1].frames : 0], []);
export const EDITORIAL_FRAMES = starts.at(-1)! + SCENES.at(-1)!.frames;

const rise = (f: number, from: number, len = 42) =>
  interpolate(f, [from, from + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

// Typewriter: every scene types its lines from its first frame, one after another.
const PER_CHAR = 1.7, LINE_PAUSE = 8;
function typing(lines: string[], f: number) {
  let at = 0;
  const shown = lines.map((line) => {
    const n = Math.max(0, Math.min(line.length, Math.floor((f - at) / PER_CHAR)));
    at += line.length * PER_CHAR + LINE_PAUSE;
    return n;
  });
  return { shown, done: at - LINE_PAUSE };
}

function SceneView({ scene, f, index }: { scene: Scene; f: number; index: number }) {
  const last = index === SCENES.length - 1;
  const out = last ? 0 : interpolate(f, [scene.frames - 30, scene.frames - 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const size = scene.list ? 112 : 132;
  const { shown, done } = typing(scene.main, f);
  // The caret sits after the last typed character, solid while typing, blinking after.
  const caretLine = Math.max(0, shown.findLastIndex((n) => n > 0));
  const caretOn = f < done || Math.floor((f - done) / 30) % 2 === 1;
  const sub = rise(f, done + 10, 44);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 14}px)` }}>
      <div style={{ position: 'absolute', left: 220, right: 220, top: 0, bottom: 170, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: SANS }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontWeight: 600, fontSize: 22, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: C.muted, opacity: rise(f, 0, 24) }}>
          <span style={{ color: C.accent }}>{String(index + 1).padStart(2, '0')}</span>
          <span style={{ width: 90 * rise(f, 0, 50), height: 2, background: C.accent }} />
          {scene.eyebrow}
        </div>
        <div style={{ marginTop: 44 }}>
          {scene.main.map((line, i) => (
            <div key={i} style={{ fontWeight: 600, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.045em', whiteSpace: 'pre',
              color: scene.accent ? C.accent : C.ink }}>
              {line.slice(0, shown[i])}
              {i === caretLine && (
                <span style={{ display: 'inline-block', width: size * 0.07, height: size * 0.86, marginLeft: size * 0.04, verticalAlign: '-0.1em',
                  background: C.accent, opacity: caretOn ? 1 : 0 }} />
              )}
              {/* The rest of the line, unseen, so the block never reflows while it types. */}
              <span style={{ color: 'transparent' }}>{line.slice(shown[i])}</span>
            </div>
          ))}
        </div>
        {scene.sub && (
          <div style={{ marginTop: 40, fontWeight: 400, fontSize: 36, letterSpacing: '-0.01em', color: C.muted, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>
            {scene.sub}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/**
 * The portrait: rises in beside the greeting from frame 0 while it types,
 * then shrinks beside the name in the footer, and grows again for the close.
 */
const BIG = { x: 1920 - 220 - 520, y: 140, w: 520, h: 694, r: 28 };
const SMALL = { x: 220, y: 930, w: 56, h: 56, r: 28 };
function Portrait({ frame }: { frame: number }) {
  const closeAt = starts.at(-1)!;
  const toSmall = interpolate(frame, [SCENES[0].frames - 34, SCENES[0].frames + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const toBig = interpolate(frame, [closeAt, closeAt + 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const m = 1 - toSmall + toBig;
  const lerp = (k: keyof typeof BIG) => SMALL[k] + (BIG[k] - SMALL[k]) * m;
  const reveal = rise(frame, 0, 48);
  const settle = interpolate(frame, [0, 100], [1.1, 1], { extrapolateRight: 'clamp', easing: ease });
  return (
    <div style={{ position: 'absolute', left: lerp('x'), top: lerp('y'), width: lerp('w'), height: lerp('h'), borderRadius: lerp('r'),
      overflow: 'hidden', clipPath: `inset(${(1 - reveal) * 100}% 0 0 0 round ${lerp('r')}px)`,
      transform: `translateY(${(1 - reveal) * 40}px)`, boxShadow: `0 ${24 * m}px ${70 * m}px rgba(14,14,30,${0.14 * m})`, border: `1px solid ${C.rule}` }}>
      <Img src={staticFile('portrait.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 28%',
        transform: `scale(${settle})` }} />
    </div>
  );
}

export function Editorial() {
  const frame = useCurrentFrame();
  const i = Math.max(0, starts.filter((s) => s <= frame).length - 1);
  const f = frame - starts[i];
  const open = rise(frame, 0, 48);
  const end = interpolate(frame, [EDITORIAL_FRAMES - 60, EDITORIAL_FRAMES - 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.stage }}>
      <SceneView scene={SCENES[i]} f={f} index={i} />
      <div style={{ position: 'absolute', left: 220, right: 220, bottom: 110, opacity: open, fontFamily: SANS }}>
        <div style={{ height: 1, background: C.rule, transformOrigin: '0 0', transform: `scaleX(${open})` }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, fontWeight: 500, fontSize: 20, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: C.muted }}>
          <span style={{ paddingLeft: 76 }}>Duc · Senior Full-Stack Mobile Developer</span>
          <span>{String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}</span>
        </div>
      </div>
      <Portrait frame={frame} />
      <AbsoluteFill style={{ background: C.stage, opacity: end }} />
      <Audio src={staticFile('editorial-music.wav')} volume={1} />
    </AbsoluteFill>
  );
}
