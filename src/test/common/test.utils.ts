// eslint-disable-next-line import/prefer-default-export
export function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds);
  });
}
