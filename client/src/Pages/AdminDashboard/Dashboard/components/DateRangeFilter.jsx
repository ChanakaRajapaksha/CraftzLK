import DateRangeFilter from "../../../../Components/AdminDashboard/DateRangeFilter";
import { DATE_PRESETS } from "../dashboardAnalytics";

export default function DashboardDateRangeFilter(props) {
  return <DateRangeFilter presets={DATE_PRESETS} {...props} />;
}
