import { useHeaderStore } from "@store/headerStore";
import { useEffect, useRef } from "react";
import { BsCheckLg } from "react-icons/bs";

const useHeaderVisibility = (scrollRef) => {
  const setHeaderVisible = useHeaderStore((state) => state.setHeaderVisible);
  const lastScrollY = useRef();
  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    const handleScroll = () => {
      const currentScrollY = element.scrollTop;

      if (currentScrollY <= 0 || currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      } else {
        setHeaderVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [scrollRef.current,setHeaderVisible]);
};

export default useHeaderVisibility;
