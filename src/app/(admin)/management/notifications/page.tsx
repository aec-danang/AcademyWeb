import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Notifications</h2>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">You have no new notifications.</p>
        </CardContent>
      </Card>
    </div>
  );
}
