import { useAdminTheme } from "./AdminThemeContext";
import { getChartAxisTick, getChartTooltipStyle } from "./chartTooltipStyles";

export function useChartTooltipStyle() {
  const { isDark } = useAdminTheme();
  return {
    tooltipStyle: getChartTooltipStyle(isDark),
    axisTick: getChartAxisTick(isDark),
    axisTickSm: getChartAxisTick(isDark, 10),
  };
}
