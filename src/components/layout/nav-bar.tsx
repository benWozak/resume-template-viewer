import React from "react";

type Props = {};

function NavBar({}: Props) {
  return (
    <nav className="navbar bg-neutral text-neutral-content sticky top-0">
      <button className="btn btn-ghost text-xl">Resume Templates</button>
    </nav>
  );
}

export default NavBar;
