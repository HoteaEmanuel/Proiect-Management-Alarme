import { useEffect } from "react";

const useScrollAnimation = (ref) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Small delay so the element isn't immediately in view on mount
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.remove("slide-hidden");
            element.classList.add("slide-visible");
          } else {
            // reset when leaving view so it re-animates on scroll back
            element.classList.add("slide-hidden");
            element.classList.remove("slide-visible");
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, 500);

    return () => clearTimeout(timeout);
  }, []);
};
export default useScrollAnimation;
