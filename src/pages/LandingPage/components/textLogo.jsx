import React from "react";
import { Link } from "react-router-dom";
import { useThemeContext } from "../../../context/themeContext";

export default function TextLogo({ isExpanded }) {
  const { isDark } = useThemeContext();

  return (
    <Link to={"/"}>
      <h2 className="text-normal md:text-2xl py-6 font-semibold">
        {isExpanded ? (
          <span className="text-accent">
            OpenGIN<span className="text-primary">Xplore</span>
          </span>
        ) : isDark ? (
          <img width={35} height={35} src={"/openginexplore.ico"} />
        ) : (
          <img width={35} height={35} src={"/openginexplorelight.ico"} />
        )}
      </h2>
    </Link>
  );
}
