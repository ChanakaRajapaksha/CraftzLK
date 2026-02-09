import React from "react";

export default function AdminPlaceholder({ title = "Admin" }) {
  return (
    <div className="p-4">
      <h3 className="hd">{title}</h3>
      <p className="text-muted">This page can be wired up with components from the admin folder when needed.</p>
    </div>
  );
}
