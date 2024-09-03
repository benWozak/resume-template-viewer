import React from "react";
import Link from "next/link";

type Props = {
  template: any;
};

function Card({ template }: Props) {
  console.log(template);
  return (
    <Link href={`/${template.name}`}>
      <div className="card bg-base-100 w-96 shadow-xl">
        <figure className="relative w-full aspect-[16/9] overflow-hidden">
          <img
            className="w-full h-full object-cover object-top"
            src={`${template.name}_demo.jpg`}
            alt="Resume Template"
            height="200"
            width="200"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">
            Resume v1
            <div className="badge badge-secondary">NEW</div>
          </h2>
          <p>{template.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default Card;
