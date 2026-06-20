export function getChartTooltipStyle(isDark = false) {
  if (isDark) {
    return {
      background: "rgba(28, 24, 20, 0.98)",
      border: "1px solid rgba(201, 169, 97, 0.35)",
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
      fontFamily: "inherit",
      color: "#f5efe6",
    };
  }

  return {
    background: "rgba(255,253,247,0.98)",
    border: "1px solid rgba(201,169,97,0.45)",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(92,77,58,0.12)",
    fontFamily: "inherit",
  };
}

export function getChartAxisTick(isDark = false, fontSize = 11) {
  return {
    fill: isDark ? "#d4c4b0" : "#5c4d3a",
    fontSize,
  };
}
