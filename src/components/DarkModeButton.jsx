import { useEffect, useState } from "react";
import { BsFillSunFill, BsMoonFill } from "react-icons/bs";

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

const DarkModeButton = () => {
  const [theme, setTheme] = useState(THEMES.LIGHT);

  const toggleTheme = (isDark) => {
    const theme = isDark ? THEMES.LIGHT : THEMES.DARK;
    setTheme(theme);
    localStorage.setItem("hdk-portfolio-theme", theme);
  };

  useEffect(() => {
    const localTheme = localStorage.getItem("hdk-portfolio-theme");
    if (localTheme) {
      document.body.className = localTheme;
      setTheme(localTheme);
    } else {
      document.body.className = theme;
    }
  }, [theme]);

  const IsDark = theme == THEMES.DARK;

  return (
    <label
      htmlFor="customCheckbox"
      className={`flex ${
        IsDark ? "bg-gray-600" : "bg-gray-300"
      } w-20 h-10 relative rounded-full cursor-pointer`}
    >
      <input
        checked={IsDark}
        type="checkbox"
        id="customCheckbox"
        className="peer sr-only"
        onChange={() => toggleTheme(IsDark)}
      />
      <span className="w-2/5 h-4/5 bg-white absolute rounded-full left-1 top-1 peer-checked:bg-black peer-checked:left-11 duration-300 transition-all flex justify-center items-center">
        {IsDark ? (
          <BsMoonFill className="text-white text-xl" />
        ) : (
          <BsFillSunFill className="text-black text-xl" />
        )}
      </span>
    </label>
  );
};

export default DarkModeButton;
