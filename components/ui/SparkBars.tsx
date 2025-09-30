import React from "react";
import { View } from "react-native";

type Props = {
  data: number[];
  width?: number; // default 120
  height?: number; // default 36
  barWidth?: number; // default auto
  gap?: number; // default 2
  color?: string; // default currentColor-like
  bg?: string; // track bg, default transparent
};

export default function SparkBars({
  data,
  width = 120,
  height = 36,
  gap = 2,
  color = "#0EA5E9",
  bg = "transparent",
  barWidth,
}: Props) {
  const max = Math.max(1, ...data);
  const bw =
    barWidth ??
    Math.max(
      2,
      Math.floor((width - gap * (data.length - 1)) / Math.max(1, data.length))
    );
  return (
    <View
      style={{
        width,
        height,
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: bg,
      }}
    >
      {data.map((v, idx) => {
        const h = Math.max(2, Math.round((v / max) * height));
        return (
          <View
            key={idx}
            style={{
              width: bw,
              height: h,
              backgroundColor: color,
              marginRight: idx === data.length - 1 ? 0 : gap,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          />
        );
      })}
    </View>
  );
}
