import React from "react";
import { Link } from "react-router-dom";

export default function TextLogo() {
  return (
    <Link to={"/"}>
      <h2 className="text-normal md:text-2xl font-semibold">
        <span className="text-accent">
          OpenGIN<span className="text-primary">Xplore</span>
        </span>
      </h2>
    </Link>
  );
}
