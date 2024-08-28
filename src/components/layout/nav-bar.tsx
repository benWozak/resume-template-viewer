import React from "react";
import Link from "next/link";

type Props = {};

function NavBar({}: Props) {
  return (
    <nav className="navbar bg-neutral text-neutral-content sticky top-0">
      <Link href="/" className="btn btn-ghost text-xl">
        Resume Templates
      </Link>
    </nav>
  );
}

export default NavBar;
