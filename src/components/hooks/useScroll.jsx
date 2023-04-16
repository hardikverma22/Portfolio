import React from "react";

const useScroll = () => {
  const scrollTo = (pageNo = 1) => {
    window.scrollTo({
      top: pageNo * window.innerHeight,
      left: 0,
      behavior: "smooth",
    });
  };

  return [scrollTo];
};

export default useScroll;
