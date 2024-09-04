"use client";
import React from "react";
//@ts-ignore
import { Loader2 } from "lucide-react";

// grid.register();

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
};
