import React from "react";

export const StatCard = ({ title, value, subtitle, icon, badge, type = "primary" }) => {
  return (
    <div className={`card shadow-sm border-0 border-start border-4 border-${type} h-100`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-uppercase text-muted fw-bold small">{title}</span>
          {icon && <span className="fs-4">{icon}</span>}
        </div>
        <div className={`display-6 fw-bold text-${type} mb-1`}>{value}</div>
        {subtitle && <div className="text-secondary small">{subtitle}</div>}
        {badge && <span className={`badge bg-${type} mt-2`}>{badge}</span>}
      </div>
    </div>
  );
};
