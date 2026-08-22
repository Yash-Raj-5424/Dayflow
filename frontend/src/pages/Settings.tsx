import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Workspace and account preferences." />
      <Card className="p-5">
        <EmptyState
          icon={<SettingsIcon className="h-5 w-5" />}
          title="Settings are not available yet"
          description="Workspace, notification, and account preferences will live here."
        />
      </Card>
    </div>
  );
}
