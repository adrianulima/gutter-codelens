export const debounce = (callback: () => void, delay: number) => {
  let timeoutId: NodeJS.Timeout | undefined;
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(callback, delay);
  };
};
