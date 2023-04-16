import { useState } from "react";
import "./App.css";
import {
  AboutMe,
  ContactMe,
  NavigationBar,
  Projects,
  Skills,
  Summary,
} from "./components";

function App() {
  const [moveImg, setMoveImg] = useState(false);

  return (
    <main>
      <NavigationBar />
      <Summary moveImg={moveImg} />
      <Skills setMoveImg={setMoveImg} />
      <AboutMe />
      <Projects />
      <ContactMe />
    </main>
  );
}

export default App;
