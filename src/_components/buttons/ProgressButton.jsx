import React from "react";

const ProgressButton = () => {
  return (
    <>
      {/* Progress Button */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title">Progress Button</h5>
        </div>
        <div className="card-body bg-white">
          <button type="button" className="btn btn-primary me-1">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Primary
          </button>
          <button type="button" className="btn btn-secondary me-1">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Secondary
          </button>
          <button type="button" className="btn btn-success me-1">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Success
          </button>
          <button type="button" className="btn btn-danger me-1">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Danger
          </button>
          <button type="button" className="btn btn-warning me-1">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Warning
          </button>
          <button type="button" className="btn btn-info me-1">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Info
          </button>
          <button type="button" className="btn btn-dark me-1">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />{" "}
            Dark
          </button>
        </div>
      </div>
      {/* /Progress Button */}
    </>
  );
};

export default ProgressButton;
