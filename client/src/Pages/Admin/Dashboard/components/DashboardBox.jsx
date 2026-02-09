import React from "react";
import Button from "@mui/material/Button";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export default function DashboardBox(props) {
  return (
    <Button
      className="dashboardBox"
      style={{
        backgroundImage: `linear-gradient(to right, ${props.color?.[0]}, ${props.color?.[1]})`,
      }}
    >
      {props.grow === true ? (
        <span className="chart"><TrendingUpIcon /></span>
      ) : (
        <span className="chart"><TrendingDownIcon /></span>
      )}
      <div className="d-flex w-100">
        <div className="col1">
          <h4 className="text-white mb-0">{props.title}</h4>
          <span className="text-white">{props.count > 0 ? props.count : 0}</span>
        </div>
        <div className="ml-auto">
          {props.icon ? <span className="icon">{props.icon}</span> : null}
        </div>
      </div>
    </Button>
  );
}
