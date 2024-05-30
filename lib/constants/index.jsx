import {
  FaAws,
  FaNodeJs,
  FaReact,
  GiInfo,
  GiSkills,
  GrProjects,
  MdArchitecture,
  MdOutlineContactEmergency,
  SiDocker,
  SiDotnet,
  SiFirebase,
  SiGraphql,
  SiTailwindcss,
  TbBrandMongodb,
  TbBrandTypescript,
  VscFeedback,
} from "components/icons";
import {Clerk, Convex} from "lib/constants/projectList";
import {FaCss3, FaHtml5} from "react-icons/fa";

export const colors = ["#002B5B", "#87e3fa", "#2962d6", "#FFFFFF", "#232323", "#9fb0d2"];

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

export const TABS = [
  // {
  //   id: "summary",
  //   title: "Who I Am",
  //   icon: <FcPortraitMode className="text-xl" />,
  // },
  {
    id: "skills",
    title: "Skills",
    icon: GiSkills,
  },
  {
    id: "aboutme",
    title: "About Me",
    icon: GiInfo,
  },
  {
    id: "projects",
    title: "Projects",
    icon: GrProjects,
  },
  {
    id: "testimonials",
    title: "Testimonials",
    icon: VscFeedback,
  },
  {
    id: "contactme",
    title: "Contact",
    icon: MdOutlineContactEmergency,
  },
];

export const SKILLS = [
  {
    title: "HTML",
    icon: FaHtml5,
    animationDelay: "0.2",
  },
  {
    title: "CSS",
    icon: FaCss3,
    animationDelay: "0.2",
  },
  {
    title: "Typescript",
    icon: TbBrandTypescript,
    animationDelay: "0.6",
  },
  {
    title: "Tailwind CSS",
    icon: SiTailwindcss,
    animationDelay: "0.8",
  },
  {
    title: "React.js",
    icon: FaReact,
    animationDelay: "0.2",
  },
  {
    title: "Node.js",
    icon: FaNodeJs,
    animationDelay: "0.4",
  },

  {
    title: "MongoDB",
    icon: TbBrandMongodb,
    animationDelay: "1",
  },

  {
    title: "Firebase",
    icon: SiFirebase,
    animationDelay: "1.2",
  },

  {
    title: "GraphQL",
    icon: SiGraphql,
    animationDelay: "1.4",
  },

  {
    title: "Dot Net",
    icon: SiDotnet,
    animationDelay: "1.6",
  },

  {
    title: "Docker",
    icon: SiDocker,
    animationDelay: "1.8",
  },

  {
    title: "AWS",
    icon: FaAws,
    animationDelay: "1.8",
  },
  {
    title: "System Design",
    icon: MdArchitecture,
    animationDelay: "1.8",
  },
  {
    title: "Convex",
    icon: Convex,
    animationDelay: "1.8",
  },
  {
    title: "Clerk",
    icon: Clerk,
    animationDelay: "1.8",
  },
];

export const TESTIMONIALS = [
  {
    name: "Ashraf Habash",
    occupation: "Senior Product Manager @ H&M | Delivering Innovative Solutions, Leading Teams",
    recommendationText:
      "I worked together with Hardik at the Swedish retailer H&M. I was his direct manager from the client side. Hardik was a great team player, he had good social skills and was always helpful in the team and gets things done. He had a down to earth approach and connected well with everyone in the team. He was a quick learner and had a great knowledge in the system flow, the programming and architecture as well as the business processes; all this made him fast in building the best solution in an effective way. Hardik was a focused person and was fast in his work but what I appreciate is the quality of his work which served us well. He was a direct and open communicator and helped us detect problems early and deal with them before they grow more. I highly recommend Hardik for software development positions specially roles where he will lead and coach other people.",
    avatar: "ashraf",
  },
  {
    name: "Siddharth Balekar",
    occupation:
      "Principal - Product Management Fidelity Investments | MBA IIMI | CSPO® | ACSPO® | SAFe® 5 POPM | ESIC Spain | ex-Accenture",
    recommendationText:
      "Hardik is one of the most valuable people I have ever met. He always puts the team before him and truly embodies the agile model of working. He is observant, proactive, and goal-oriented. It’s a pleasure working with Hardik.",
    avatar: "siddharth",
  },
  {
    name: "Maja Ginsburg Duvstedt",
    occupation: "Effektiv ekonom, coachande gruppledare, driven projekt- och förändringsledare. ",
    recommendationText:
      "I had the opportunity to have Hardik in my team at H&M. Hardik is very thorough, skilled and he has a way of understanding things quickly and therefore he delivers fast. He is also service-minded and a nice, cooperative team member!",
    avatar: "maja",
  },
  {
    name: "Fredrik Garinder",
    occupation: "Engineering Manager at H&M Group",
    recommendationText:
      "I had a wonderful time working with Hardik, both joyful and with lots of room for growth and learning opportunities. If you are in search of a solid team player with focus on the task at hand you've found it.",
    avatar: "fredrik",
  },
  {
    name: "Priyalakshumi P",
    occupation: "Software Engineer(MTS) @ Salesforce",
    recommendationText:
      "Hardik, has a great technical expertise in designing scalable solutions. He approaches each requirement with different notion to bring out the best value to the product. He is skilled in driving the project with good communication and collaboration efficiency. He is a passionate learner and incorporate his learnings in action to deliver finest results.",
    avatar: "priya",
  },
  {
    name: "Harini Renganathan",
    occupation: "Product Owner for SAFe, Scrum Teams | Business Analyst | Erstwhile Scrum Master",
    recommendationText:
      "Hardik has clarity of thoughts and a super cool brain. His approach to a technical problem at work is very logical. He is self motivated and is effective at time management and working towards a goal.",
    avatar: "harini",
  },
  {
    name: "Sanjana Ganguly",
    occupation: "Senior Software Engineer at Barclays",
    recommendationText:
      "Hardik and I have worked on several projects together, and undoubtedly, he is an extremely diligent and smart co-worker. He consistently gives his 100 percent effort to the team and plays a significant role in ensuring that we meet our deadlines on time. His ability to develop new ways to achieve the targets have always been remarkable. He has a knack for learning new technologies. I am delighted to work and learn with such professionals.",
    avatar: "sanjana",
  },
];
