import { BarChart3 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";

export default function Reports() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Workforce and payroll reporting." />
      <Card className="p-5">
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          title="Reports are not available yet"
          description="This area is reserved for headcount, attendance, and payroll reporting."
        />
      </Card>
    </div>
  );
}
