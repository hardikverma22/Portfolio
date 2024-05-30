import {useRef, useEffect} from "react";
import {useInView} from "framer-motion";
import {useActiveIndex} from "src/contexts/ActiveIndexContextProvider";
import {inView} from "framer-motion";

const SectionWrapper = (Component) => {
  return ({index, ...props}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, {amount: 0.3});
    const {activeIndex, setActiveIndex} = useActiveIndex();

    useEffect(() => {
      if (!inView) return;
      if (activeIndex !== index && isInView) {
        setActiveIndex(index);
      }
    }, [isInView]);

    return <Component ref={ref} isInView={isInView} index={index} {...props} />;
  };
};

export default SectionWrapper;
