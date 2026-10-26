"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshData() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      className="size-full justify-start"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RotateCw className={cn("mr-2 size-4", isPending && "animate-spin")} />
      Refresh data
    </Button>
  );
}
