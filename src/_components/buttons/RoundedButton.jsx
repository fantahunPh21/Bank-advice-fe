import React from "react";

const RoundedButton = () => {
  return (
    <>
      {/* Rounded Button */}
      <div className="card bg-white">
        <div className="card-header">
          <h5 className="card-title">Rounded Button</h5>
          <p className="card-text">
            use <code>.btn-rounded</code> in class <code>.btn</code> class to
            get Rounded button
          </p>
        </div>
        <div className="card-body">
          <button type="button" className="btn btn-rounded btn-primary me-1">
            Primary
          </button>
          <button type="button" className="btn btn-rounded btn-secondary me-1">
            Secondary
          </button>
          <button type="button" className="btn btn-rounded btn-success me-1">
            Success
          </button>
          <button type="button" className="btn btn-rounded btn-danger me-1">
            Danger
          </button>
          <button type="button" className="btn btn-rounded btn-warning me-1">
            Warning
          </button>
          <button type="button" className="btn btn-rounded btn-info me-1">
            Info
          </button>
          <button type="button" className="btn btn-rounded btn-light me-1">
            Light
          </button>
          <button type="button" className="btn btn-rounded btn-dark me-1">
            Dark
          </button>
          <hr />
          <p>
            use <code>.btn-rounded</code> in class <code>.btn-outline-*</code>{" "}
            class to get Rounded Outline button
          </p>
          <button
            type="button"
            className="btn btn-rounded btn-outline-primary me-1"
          >
            Primary
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-outline-secondary me-1"
          >
            Secondary
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-outline-success me-1"
          >
            Success
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-outline-danger me-1"
          >
            Danger
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-outline-warning me-1"
          >
            Warning
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-outline-info me-1"
          >
            Info
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-outline-light me-1"
          >
            Light
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-outline-dark me-1"
          >
            Dark
          </button>
        </div>
      </div>
      {/* /Rounded Button */}
    </>
  );
};

export default RoundedButton;
