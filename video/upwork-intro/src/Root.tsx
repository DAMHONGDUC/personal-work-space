import React from 'react';
import { Composition } from 'remotion';
import { Editorial, EDITORIAL_FRAMES } from './Editorial';

export function Root() {
  return <Composition id="Editorial" component={Editorial} durationInFrames={EDITORIAL_FRAMES} fps={60} width={1920} height={1080} />;
}
