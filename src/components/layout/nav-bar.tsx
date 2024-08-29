"use client";
import React from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

type Props = {};

function NavBar({}: Props) {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <nav className="navbar bg-neutral text-neutral-content sticky top-0 z-50">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          Resume Templates
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {!!user ? (
            <li>
              <details>
                <summary>
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      {user.picture !== null && (
                        <img src={user.picture} alt="profile image" />
                      )}
                    </div>
                  </div>
                </summary>
                <ul className="bg-base-100 rounded-t-none p-2">
                  <li>
                    <Link href="/profile">Profile</Link>
                  </li>
                  <li>
                    <a href="/api/auth/logout">Logout</a>
                  </li>
                </ul>
              </details>
            </li>
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
