 
import React from "react";
import { Table } from "antd";
// import "./antd.css";

const DatatablesDatatables = ({ columns, dataSource }) => {
  return (
    <Table
      // className="table table-center table-hover datatable"
      columns={columns}
      dataSource={dataSource}
      pagination={true}
      // rowKey={(record) => record.id}
    />
  );
};

export default Datatables;
