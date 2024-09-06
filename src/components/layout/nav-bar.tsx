"use client";
import React from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { FullPageLoader } from "./loaders";
import { useViewportWidth } from "@/util/hooks";

type Props = {};

function NavBar({}: Props) {
  const viewportWidth = useViewportWidth();
  const { user, error, isLoading } = useUser();

  if (isLoading) return <FullPageLoader />;
  if (error) return <div>{error.message}</div>;

  return (
    <nav className="navbar bg-neutral text-neutral-content sticky top-0 z-50 p-0">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-2xl">
          ResumeBuilder
        </Link>{" "}
        |{" "}
        {viewportWidth >= 700 && (
          <span className="pl-4">Professional Resume Templates</span>
        )}
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal items-center px-1">
          {!!user ? (
            <>
              <li>
                <Link className="btn btn-primary btn-sm" href="/content">
                  Write Content
                </Link>
              </li>
              <li>
                <div className="dropdown dropdown-end">
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-circle avatar"
                    >
                      <div className="w-10 rounded-full">
                        {user.picture !== null && (
                          <img src={user.picture} alt="profile image" />
                        )}
                      </div>
                    </div>
                    <ul
                      tabIndex={0}
                      className="menu menu-sm dropdown-content bg-base-100 text-black rounded-box z-[1] mt-3 w-52 p-2 shadow"
                    >
                      <li>
                        <Link href="/profile">Profile</Link>
                      </li>
                      <li>
                        <a href="/api/auth/logout">Logout</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </>
          ) : (
            <li>
              <a href="/api/auth/login">Login</a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
