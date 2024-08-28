import React from "react";

type Props = {};

function Card({}: Props) {
  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <figure>
        <img
          src="generated_resume.jpg"
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
        <p>
          A concise, single-page professional resume with an efficient layout
          that balances information density with readability.
        </p>
      </div>
    </div>
  );
}

export default Card;
