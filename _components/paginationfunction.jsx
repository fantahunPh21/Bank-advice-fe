import React from "react";
import { Link } from "react-router-dom";

export function itemRender(type, originalElement) {
  if (type === "prev") {
    return <Link to="#">Previous</Link>;
  }
  if (type === "next") {
    return <Link to="#">Next</Link>;
  }
  return originalElement;
}

export function onShowSizeChange() {
  // console.log(current, pageSize);
}
