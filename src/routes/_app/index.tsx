import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const Route = createFileRoute("/_app/")({
  staticData: { title: "Dashboard" },
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <PagePlaceholder
      title="Dashboard"
      description="Totals for customers, factories, products, RFQs, freight requests and orders land here once the API has a stats endpoint."
    />
  );
}
