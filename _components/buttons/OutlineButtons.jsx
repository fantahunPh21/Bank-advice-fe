import React from "react";

const OutlineButtons = () => {
  return (
    <>
      <div className="card bg-white">
        <div className="card-header">
          <h5 className="card-title">Outline Buttons</h5>
          <p className="card-text">
            Use <code>.btn-outline-*</code> class for outline buttons.
          </p>
        </div>
        <div className="card-body">
          <div className="row row-sm align-items-center">
            <div className="col-12 col-xl mb-3 mb-xl-0">Normal</div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-primary"
              >
                Primary
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-secondary"
              >
                Secondary
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-success"
              >
                Success
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-warning"
              >
                Warning
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-danger"
              >
                Danger
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-info"
              >
                Info
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-light"
              >
                Light
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-dark"
              >
                Dark
              </button>
            </div>
          </div>
          <div className="row row-sm align-items-center mt-3">
            <div className="col-12 col-xl mb-3 mb-xl-0">Active</div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-primary active"
              >
                Primary
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-secondary active"
              >
                Secondary
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-success active"
              >
                Success
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-warning active"
              >
                Warning
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-danger active"
              >
                Danger
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-info active"
              >
                Info
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-light active"
              >
                Light
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                type="button"
                className="btn btn-block w-100 btn-outline-dark active"
              >
                Dark
              </button>
            </div>
          </div>
          <div className="row row-sm align-items-center mt-3">
            <div className="col-12 col-xl mb-3 mb-xl-0">Disabled</div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-primary"
              >
                Primary
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-secondary"
              >
                Secondary
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-success"
              >
                Success
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-warning"
              >
                Warning
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-danger"
              >
                Danger
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-info"
              >
                Info
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-light"
              >
                Light
              </button>
            </div>
            <div className="col-6 col-sm-4 col-md-2 col-xl mb-3 mb-xl-0">
              <button
                disabled
                type="button"
                className="btn btn-block w-100 btn-outline-dark"
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OutlineButtons;
