import dynamic from "next/dynamic";

// Dynamically import ChartContainer
const ChartContainer = dynamic(
  () => import("./chart-components").then((mod) => mod.ChartContainer),
  { ssr: false } // Disable server-side rendering for this component
);

// Re-export other components directly from chart-components
export {
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from "./chart-components";

export { ChartContainer };
