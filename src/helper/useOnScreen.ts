import { useCallback, useState } from "react";

interface UseOnScreenOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
}

const useOnScreen = ({
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: UseOnScreenOptions = {}) => {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  const measureRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        const obs = new IntersectionObserver(
          ([entry]) => {
            setIntersecting(entry.isIntersecting);
          },
          { root, rootMargin, threshold }
        );

        obs.observe(node);
        setObserver(obs);
      }
    },
    [root, rootMargin, threshold]
  );

  return { measureRef, isIntersecting, observer };
};

export default useOnScreen;
