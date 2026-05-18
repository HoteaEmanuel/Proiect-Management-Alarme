import { useEffect, useRef, useState } from "react";

const useHeaderVisible = (scrollRef) => {
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const element = scrollRef?.current || window;

    const handleScroll = () => {
      const currentScrollY =
        element === window
          ? window.scrollY
          : element.scrollTop;

      if (currentScrollY <= 0) {
        setHeaderVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      } else {
        setHeaderVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    element.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [scrollRef]);

  return { headerVisible };
};

export default useHeaderVisible;