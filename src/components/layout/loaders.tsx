"use client";
import React from "react";
import { FlagSpinner } from "react-spinners-kit";

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col justify-center items-center">
        <FlagSpinner size={150} color="#6d0076" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
};
