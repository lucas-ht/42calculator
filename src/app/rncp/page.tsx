"use client";

import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import type { FortyTwoTitle } from "@/types/forty-two";
import { useState } from "react";
import { TitleOptions } from "./(options)/options";
import { TitleRequirements } from "./(options)/requirements";
import { TitleSelector } from "./selector";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { track } from "@vercel/analytics";

export default function Titles() {
  const { titles } = useFortyTwoStore((state) => state);
  const [activeTitle, _setActiveTitle] = useState<FortyTwoTitle | null>(
    titles[0] ?? null,
  );

  const setActiveTitle = (title: FortyTwoTitle | null) => {
    if (!title) {
      return;
    }

    _setActiveTitle(title);

    track("rncp-title-switched", {
      title: title?.title,
    });
  };

  if (!activeTitle) {
    return null;
  }

  return (
    <>
      <TitleSelector
        titles={titles}
        activeTitle={activeTitle}
        setActiveTitle={setActiveTitle}
      />

      <Separator className="my-6" />

      <div className="my-6 space-y-1.5">
        <h4 className="font-semibold text-2xl leading-none tracking-tight">
          Information
        </h4>

        <p className="text-muted-foreground text-sm">
          You must validate the 'Suite' tab, one of the option tabs, and the
          requirements.{" "}
          <Link
            className="underline underline-offset-1 transition-colors hover:text-foreground"
            prefetch={false}
            href="https://meta.intra.42.fr/articles/rncp-7-certificate"
          >
            Learn more.
          </Link>
        </p>
      </div>

      <TitleRequirements
        title={activeTitle}
        className="my-6"
      />
      <TitleOptions title={activeTitle} />
    </>
  );
}
