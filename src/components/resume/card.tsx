import React from "react";
import Link from "next/link";
import { Template } from "@/util/types";

type Props = {
  template: Template;
};

function Card({ template }: Props) {
  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <Link href={`/${template.slug}`} aria-label="template page link">
        <figure className="relative w-full aspect-[16/9] overflow-hidden">
          <img
            className="w-full h-full object-cover object-top rounded-2xl"
            src={`${template.slug}_demo.webp`}
            alt={`${template.name} Template`}
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">
            Resume v1
            <div className="badge badge-secondary">NEW</div>
          </h2>
          <p>{template.description}</p>
        </div>
      </Link>
    </div>
  );
}

export default Card;
