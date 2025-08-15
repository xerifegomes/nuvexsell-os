"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    theme?: {
      light?: string
      dark?: string
    }
    icon?: React.ComponentType
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<"div">["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(colorConfig)
          .map(([key, itemConfig]) => {
            const color =
              itemConfig.theme || itemConfig.color
            return color
              ? `[data-chart="${id}"] .${cn(key)} { --color-${key}: ${color}; }`
              : ""
          })
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-background p-2 shadow-sm",
      className
    )}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(
  (
    {
      active = false,
      payload = [],
      label,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      nameKey,
      labelKey,
      className,
      ...props
    },
    ref
  ) => {
    const config = useChart().config

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div ref={ref} className={cn("space-y-1", className)} {...props}>
        {!hideLabel && (
          <p className="text-sm font-medium">
            {label}
          </p>
        )}
        <div className="space-y-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = config[key]
            const value = labelKey && item.payload ? item.payload[labelKey] : item.value

            return (
              <div key={index} className="flex items-center gap-2">
                {!hideIndicator && (
                  <div
                    className={cn(
                      indicator === "line" && "h-px flex-1",
                      indicator === "dot" && "h-2.5 w-2.5 rounded-full",
                      indicator === "dashed" && "h-px flex-1 border-b border-dashed"
                    )}
                    style={{
                      backgroundColor: item.color || itemConfig?.color,
                      borderColor: item.color || itemConfig?.color,
                    }}
                  />
                )}
                <div
                  className={cn(
                    "flex flex-1 items-center justify-between gap-2",
                    !nestLabel && "text-sm"
                  )}
                >
                  <span className="text-muted-foreground">
                    {itemConfig?.label || item.name}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle }