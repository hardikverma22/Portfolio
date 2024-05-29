import ScrollButton from "components/common/ScrollButton";
import SectionTitle from "components/common/SectionTitle";
import TestimonialsBentoGrid from "components/testimonials/TestimonialsBentoGrid";

const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="w-full min-h-screen
                flex flex-col gap-10 justify-center items-center
                md:px-14 px-5 relative
                bg-gradient-to-b from-secondary/10 to-tertiary/10 py-5"
    >
      <SectionTitle title="Testimonials" />
      <TestimonialsBentoGrid />
      <ScrollButton id="contactme" />
    </section>
  );
};

export default Testimonials;
