export function createAnimationFrameScheduler(callback: () => void) {
  let frameId: number | undefined;

  const schedule = () => {
    if (frameId !== undefined) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = undefined;
      callback();
    });
  };

  const cancel = () => {
    if (frameId === undefined) return;
    window.cancelAnimationFrame(frameId);
    frameId = undefined;
  };

  return { schedule, cancel };
}
