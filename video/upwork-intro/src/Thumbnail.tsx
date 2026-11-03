import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Geist';

const { fontFamily: SANS } = loadFont('normal', { weights: ['500', '600', '700'], subsets: ['latin'] });

// The film's own palette, so the thumbnail reads as its first frame.
const C = { stage: '#ffffff', ink: '#0e0e12', muted: '#6e6e78', rule: '#e8e8ec', accent: '#9c7434' };

/** The YouTube thumbnail, 1280 x 720: the video's title beside the portrait. */
export function Thumbnail() {
  return (
    <AbsoluteFill style={{ background: C.stage, fontFamily: SANS }}>
      <div style={{ position: 'absolute', left: 84, top: 0, bottom: 0, width: 680, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontWeight: 600, fontSize: 22, letterSpacing: '0.22em', color: C.muted }}>
          <span style={{ width: 56, height: 3, background: C.accent }} />
          5+ YEARS · iOS &amp; ANDROID
        </div>
        <div style={{ marginTop: 26, fontWeight: 700, fontSize: 168, lineHeight: 0.98, letterSpacing: '-0.055em', color: C.ink }}>
          <div>Meet</div>
          <div style={{ display: 'flex', alignItems: 'center', color: C.accent }}>
            Duc.
            {/* The film's typing caret, resting after the name. */}
            <div style={{ flex: '0 0 16px', height: 136, marginLeft: 14, background: C.accent }} />
          </div>
        </div>
        <div style={{ marginTop: 30, fontWeight: 600, fontSize: 38, letterSpacing: '-0.02em', color: C.ink }}>Senior Full-Stack Mobile Developer</div>
        <div style={{ marginTop: 12, fontWeight: 500, fontSize: 27, color: C.muted }}>Flutter · React Native · SwiftUI · Node.js</div>
      </div>
      <div style={{ position: 'absolute', right: 72, top: 64, width: 444, height: 592, borderRadius: 26, overflow: 'hidden',
        border: `1px solid ${C.rule}`, boxShadow: '0 24px 70px rgba(14,14,30,.16)' }}>
        <Img src={staticFile('portrait.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 28%' }} />
      </div>
    </AbsoluteFill>
  );
}
