"use client";

import React, {
  useMemo,
  useState,
} from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

import type {
  Ticket,
  MetricType,
} from "@/lib/types";

import {
  formatMinutes,
  median,
} from "@/lib/workingHours";

import {
  isResolved,
  filterByPeriod,
  filterByDateRange,
  getPeriodKeys,
  getTicketKey,
} from "@/lib/utils";

import PeriodToggle, {
  type Period,
} from "./PeriodT";

import MetricToggle from "./MetricToggle";

import DateRangePicker, {
  type DateRange,
} from "./DateRangePicker";

interface DayData {
  date: string;
  tickets: number;
  resolved: number;
  total: number;
  mins: number[];
  medianRes: number;
}

const getDefaultRange =
  (): DateRange => ({
    from: new Date(
      Date.now() - 7 * 86400000
    )
      .toISOString()
      .slice(0, 10),

    to: new Date()
      .toISOString()
      .slice(0, 10),
  });

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: 6,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </div>

      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            color: "var(--text-muted)",
            display: "flex",
            gap: 8,
          }}
        >
          <span
            style={{
              color:
                p.color as string,
            }}
          >
            ●
          </span>

          <span>{p.name}:</span>

          <b>
            {p.name ===
            "Median Resolution"
              ? formatMinutes(
                  p.value as number
                )
              : p.value}
          </b>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({
  tickets,
}: {
  tickets: Ticket[];
}) {
  const [period, setPeriod] =
    useState<Period>("week");

  const [metric, setMetric] =
    useState<MetricType>("initial");

  const [range, setRange] =
    useState<DateRange>(
      getDefaultRange
    );

  const data = useMemo(() => {
    const filtered =
      filterByDateRange(
        filterByPeriod(
          tickets,
          period
        ),
        range
      );

    const keys =
      getPeriodKeys(period);

    const map: Record<
      string,
      DayData
    > = {};

    keys.forEach((k) => {
      map[k] = {
        date: k,
        tickets: 0,
        resolved: 0,
        total: 0,
        mins: [],
        medianRes: 0,
      };
    });

    filtered.forEach((t) => {
      if (!t.createdOn) return;

      const k = getTicketKey(
        t.createdOn,
        period
      );

      if (!map[k]) return;

      map[k].tickets++;

      if (isResolved(t)) {
        const val =
          metric === "initial"
            ? t.workingResolutionMin
            : t.totalResponseMin;

        map[k].resolved++;

        map[k].total += val;

        if (val > 0) {
          map[k].mins.push(val);
        }
      }
    });

    return Object.values(map).map(
      (d) => ({
        ...d,
        medianRes: median(
          d.mins
        ),
      })
    );
  }, [
    tickets,
    period,
    metric,
    range,
  ]);

  return (
    <div>
      {/* SAME JSX AS YOUR ORIGINAL */}
    </div>
  );
}