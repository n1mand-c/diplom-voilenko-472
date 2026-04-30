import NumberFlow from "@number-flow/react"
import clsx from "clsx"
import { Minus, Plus } from "lucide-react"
import * as React from "react"

type Props = {
  value?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
}

export function Input({
  value = 0,
  min = -Infinity,
  max = Infinity,
  onChange,
}: Props) {
  const defaultValue = React.useRef(value)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [animated, setAnimated] = React.useState(true)
  // Hide the caret during transitions so you can't see it shifting around:
  const [showCaret, setShowCaret] = React.useState(true)
  const handleInput: React.FormEventHandler<HTMLInputElement> = ({
    currentTarget: el,
  }) => {
    setAnimated(false)
    if (el.value === "") {
      onChange?.(defaultValue.current)
      return
    }
    const num = parseInt(el.value)
    if (
      isNaN(num) ||
      (min != null && num < min) ||
      (max != null && num > max)
    ) {
      // Revert input's value:
      el.value = String(value)
    } else {
      // Manually update value in case they e.g. start with a "0" or end with a "."
      // which won't trigger a DOM update (because the number is the same):
      el.value = String(num)
      onChange?.(num)
    }
  }
  const handlePointerDown =
    (diff: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
      setAnimated(true)
      if (event.pointerType === "mouse") {
        event?.preventDefault()
        inputRef.current?.focus()
      }
      const newVal = Math.min(Math.max(value + diff, min), max)
      onChange?.(newVal)
    }
  return (
    <div className="group flex items-stretch rounded-xl text-xl font-semibold border border-white/10 bg-[#1a1a2e] text-white transition-colors focus-within:border-[#C8102E]/50">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="flex items-center pl-3 pr-2 text-white/50 hover:text-white disabled:opacity-30 disabled:hover:text-white/50 transition-colors"
        disabled={min != null && value <= min}
        onPointerDown={handlePointerDown(-1)}
      >
        <Minus className="size-4" absoluteStrokeWidth strokeWidth={3} />
      </button>
      <div className="relative flex-1 grid items-center justify-items-center text-center [grid-template-areas:'overlap'] *:[grid-area:overlap]">
        <input
          ref={inputRef}
          className={clsx(
            showCaret ? "caret-[#C8102E]" : "caret-transparent",
            "spin-hide w-full bg-transparent py-3 text-center font-[inherit] text-transparent outline-none",
          )}
          style={{ fontKerning: "none" }}
          type="number"
          min={min}
          step={1}
          autoComplete="off"
          inputMode="numeric"
          max={max}
          value={value}
          onInput={handleInput}
        />
        <NumberFlow
          value={value}
          format={{ useGrouping: false }}
          aria-hidden
          animated={animated}
          onAnimationsStart={() => setShowCaret(false)}
          onAnimationsFinish={() => setShowCaret(true)}
          className="pointer-events-none"
          willChange
        />
      </div>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="flex items-center pl-2 pr-3 text-[#C8102E]/70 hover:text-[#C8102E] disabled:opacity-30 disabled:hover:text-[#C8102E]/70 transition-colors"
        disabled={max != null && value >= max}
        onPointerDown={handlePointerDown(1)}
      >
        <Plus className="size-4" absoluteStrokeWidth strokeWidth={3} />
      </button>
    </div>
  )
}

export default { Input }
