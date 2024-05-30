import SectionTitle from "components/common/SectionTitle";
import TestimonialsBentoGrid from "components/testimonials/TestimonialsBentoGrid";

import {forwardRef} from "react";
import SectionWrapper from "src/hoc/SectionWrapper";

const Testimonials = forwardRef((_, ref) => {
  return (
    <section
      ref={ref}
      id="testimonials"
      className="w-full min-h-screen
                flex flex-col gap-10 justify-center items-center
                md:px-14 px-5
                bg-gradient-to-b from-secondary/10 to-tertiary/10 py-5"
    >
      <SectionTitle title="Testimonials" />
      <TestimonialsBentoGrid />
    </section>
  );
});

export default SectionWrapper(Testimonials);
