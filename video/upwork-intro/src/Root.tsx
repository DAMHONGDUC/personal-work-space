import React from 'react';
import { Composition, Still } from 'remotion';
import { Editorial, EDITORIAL_FRAMES } from './Editorial';
import { Thumbnail } from './Thumbnail';

export function Root() {
  return (
    <>
      <Composition id="Editorial" component={Editorial} durationInFrames={EDITORIAL_FRAMES} fps={60} width={1920} height={1080} />
      <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
    </>
  );
}
