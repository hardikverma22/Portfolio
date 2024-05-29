"use client";
import React, {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion, LayoutGroup} from "framer-motion";
import {cn} from "lib/utils/cn";

export const FlipWords = ({words, duration = 3000, className}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (words.length === 0) return;

    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      i++;
      if (i === words.length) {
        i = 0;
      }
      const word = words[i];
      setCurrentWord(word);
    }, duration);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [words, duration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          filter: "blur(8px)",
          scale: 2,
          position: "absolute",
        }}
        className={cn(
          "z-10 inline-block relative text-left text-primary/70 dark:text-neutral-400 px-2",
          className
        )}
        key={currentWord}
      >
        {currentWord.split("").map((char, index) => (
          <motion.span
            key={currentWord + index}
            initial={{opacity: 0, y: 10, filter: "blur(8px)"}}
            animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
            }}
            className={cn("inline-block", {"whitespace-pre": char === " "})}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
