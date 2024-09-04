"use client";
import React from "react";
import { grid } from "ldrs";

grid.register();

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-100 z-50">
      <l-grid size="60" speed="1.5" color="black"></l-grid>
    </div>
  );
};
