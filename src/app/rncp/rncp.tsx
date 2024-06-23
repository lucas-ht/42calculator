'use client'

import { Button } from '@/components/ui/button'
import { fortyTwoStore } from '@/providers/forty-two-store-provider'
import { FortyTwoTitle } from '@/types/forty-two'
import { useState } from 'react'
import { TitleOptions } from './options'
import { TitleRequirements } from './requirements'

interface TitleSelectorProps {
  titles: FortyTwoTitle[]
  activeTitle: FortyTwoTitle
  setActiveTitle: (title: FortyTwoTitle) => void
}

function TitleSelector({
  titles,
  activeTitle,
  setActiveTitle
}: TitleSelectorProps) {
  return (
    <div className="grid w-full grid-cols-4 space-x-4">
      {titles.map((title) => (
        <Button
          key={title.title}
          value={title.title}
          variant={activeTitle.title === title.title ? 'default' : 'secondary'}
          className="h-[80px]"
          data-state={activeTitle.title === title.title ? 'active' : 'inactive'}
          onClick={() => setActiveTitle(title)}
        >
          <h2 className="text-balance">{title.title}</h2>
        </Button>
      ))}
    </div>
  )
}

export function Titles() {
  const { titles } = fortyTwoStore.getState()
  const [activeTitle, setActiveTitle] = useState<FortyTwoTitle | null>(
    titles[0] ?? null
  )

  if (!activeTitle) {
    return null
  }

  return (
    <>
      <TitleSelector
        titles={titles}
        activeTitle={activeTitle}
        setActiveTitle={setActiveTitle}
      />

      <TitleRequirements title={activeTitle} className="my-6" />
      <TitleOptions title={activeTitle} />
    </>
  )
}
