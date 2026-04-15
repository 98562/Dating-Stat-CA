import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MissingDatasetState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset unavailable</CardTitle>
        <CardDescription>
          This page loaded, but the calculator data did not.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 text-sm text-ink-600">
        <p>
          This usually means the source data are temporarily unavailable or one of the local data files is missing.
        </p>
        <Link href="/sources">
          <Button variant="secondary">View source notes</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
