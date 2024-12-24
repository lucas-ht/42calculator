"use client";

import { fortyTwoStore } from "@/providers/forty-two-store-provider";
import type { FortyTwoTitle } from "@/types/forty-two";
import { useState } from "react";
import { TitleOptions } from "./options";
import { TitleRequirements } from "./requirements";
import { TitleSelector } from "./selector";

export default function Titles() {
  const { titles } = fortyTwoStore.getState();
  const [activeTitle, setActiveTitle] = useState<FortyTwoTitle | null>(
    titles[0] ?? null,
  );

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

      <TitleRequirements
        title={activeTitle}
        className="my-6"
      />
      <TitleOptions title={activeTitle} />
    </>
  );
}
