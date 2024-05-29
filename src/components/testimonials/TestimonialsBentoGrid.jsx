import {BentoGrid, BentoGridItem} from "components/ui/bento-grid";
import {TESTIMONIALS} from "lib/constants";

export default function TestimonialsBentoGrid() {
  return (
    <BentoGrid className="mx-auto">
      {TESTIMONIALS.map((item, i) => (
        <BentoGridItem
          key={i}
          name={item.name}
          recommendationText={item.recommendationText}
          occupation={item.occupation}
          className={i === 0 || i === 6 ? "md:col-span-2" : ""}
          avatar={item.avatar}
        />
      ))}
    </BentoGrid>
  );
}
