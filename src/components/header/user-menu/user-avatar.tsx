"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

function UserAvatarSkeleton() {
  return <Skeleton className="size-10 rounded-full" />;
}

function UserAvatarError() {
  return <span className="size-10 rounded-full bg-muted" />;
}

export interface UserAvatarProps {
  imageUrl: string;
}

export function UserAvatar({ imageUrl }: UserAvatarProps) {
  const [UserAvatarFallback, setUserAvatarFallback] = useState(
    () => UserAvatarSkeleton,
  );

  return (
    <Avatar
      className="size-10 cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      // biome-ignore lint: The role attribute is fine
      role="button"
      tabIndex={0}
    >
      <span className="sr-only">Toggle user settings</span>
      <AvatarImage
        src={imageUrl}
        alt="User's avatar"
        onLoadingStatusChange={(status: string) => {
          if (status === "error") {
            setUserAvatarFallback(() => UserAvatarError);
          }
        }}
      />
      <AvatarFallback asChild>
        <UserAvatarFallback />
      </AvatarFallback>
    </Avatar>
  );
}
