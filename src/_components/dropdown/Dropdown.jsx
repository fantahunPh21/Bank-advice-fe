import React from "react";
import { Link } from "react-router-dom";

const Dropdown = () => {
  return (
    <>
      {/* Dropdowns */}
      <section className="comp-section comp-dropdowns">
        <div className="section-header">
          <h3 className="section-title">Dropdowns</h3>
          <div className="line" />
        </div>
        <div className="card bg-white">
          <div className="card-body">
            <h5 className="card-title">Dropdowns within Text</h5>
            <div className="dropdown">
              <Link
                className="dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {" "}
                Dropdown{" "}
              </Link>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
              </div>
            </div>
            <hr />
            <h5 className="card-title">Dropdowns within Buttons</h5>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-primary dropdown-toggle me-1"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Action
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-secondary dropdown-toggle me-1"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Action
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-info dropdown-toggle me-1"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Action
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-success dropdown-toggle me-1"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Action
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-warning dropdown-toggle me-1"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Action
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-danger dropdown-toggle me-1"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Action
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <hr />
            <h5 className="card-title">Split button dropdowns</h5>
            <div className="btn-group">
              <button type="button" className="btn btn-primary ms-1">
                Action
              </button>
              <button
                type="button"
                className="btn btn-primary dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-secondary ms-1">
                Action
              </button>
              <button
                type="button"
                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-info ms-1">
                Action
              </button>
              <button
                type="button"
                className="btn btn-info dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-success ms-1">
                Action
              </button>
              <button
                type="button"
                className="btn btn-success dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-warning ms-1">
                Action
              </button>
              <button
                type="button"
                className="btn btn-warning dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-danger ms-1">
                Action
              </button>
              <button
                type="button"
                className="btn btn-danger dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="#">
                  Action
                </Link>
                <Link className="dropdown-item" to="#">
                  Another action
                </Link>
                <div className="dropdown-divider" />
                <Link className="dropdown-item" to="#">
                  Separated link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Dropdowns */}
    </>
  );
};

export default Dropdown;
