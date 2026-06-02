"use client";

import React, { useEffect, useMemo, useState } from "react";
import AreaCard from "./AreaCard/AreaCard";

const SCENE_WIDTH = 1440;
const SCENE_HEIGHT = 600;
const MAP_WIDTH = 430;
const MAP_HEIGHT = 550;
const NAV_SAFE_SPACE = 92;
const PAGE_SIDE_GAP = 40;
const PAGE_BOTTOM_GAP = 40;
const MAX_SCENE_SCALE = 1.16;
const CARD_WIDTH = 280;
const CARD_HEIGHT = 110;
const CARD_STACK_GAP = 26;
const BOTTOM_CARD_SAFE_SPACE = 140;
const LEFT_SCATTER_LEFT = [4, 13, 4, 12];
const RIGHT_SCATTER_LEFT = [95, 88, 95, 88];
const STACK_TOP_JITTER = [-1.5, 1.2, -0.8, 4.2];

const pageShellStyle = {
  position: "relative",
  width: "100%",
  minHeight: "calc(100vh - 88px)",
  padding: `${NAV_SAFE_SPACE}px 24px ${PAGE_BOTTOM_GAP}px`,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowX: "hidden",
  overflowY: "visible",
  background: "#fdfcfb",
};

const sceneViewportStyle = {
  position: "relative",
  flexShrink: 0,
  overflow: "visible",
};

const sceneStyle = {
  position: "absolute",
  inset: 0,
  width: `${SCENE_WIDTH}px`,
  height: `${SCENE_HEIGHT}px`,
  overflow: "visible",
};

const mapStyle = {
  position: "absolute",
  top: "47%",
  left: "52%",
  transform: "translate(-50%, -50%)",
  width: `${MAP_WIDTH}px`,
  height: `${MAP_HEIGHT}px`,
  zIndex: 1,
  filter: "drop-shadow(0 18px 32px rgba(132, 116, 93, 0.15))",
};

const lineLayerStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 2,
  overflow: "visible",
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const buildCurvePath = ({ startX, startY, endX, endY, side }) => {
  if (side === "left") {
    const controlX = startX + Math.max(8, (endX - startX) * 0.58);
    const controlY = startY + (endY - startY) * 0.22;
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  if (side === "right") {
    const controlX = startX - Math.max(8, (startX - endX) * 0.58);
    const controlY = startY + (endY - startY) * 0.22;
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  if (side === "bottom") {
    const controlX = startX + (endX - startX) * 0.18;
    const controlY = startY - Math.max(8, (startY - endY) * 0.42);
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  const controlX = startX + (endX - startX) * 0.55;
  const controlY = Math.max(startY, endY) + 10;
  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
};

const ProcessedMap = () => {
  const [processedSrc, setProcessedSrc] = useState("/Image/Map.png");

  useEffect(() => {
    let isMounted = true;
    const sourceImage = new window.Image();

    sourceImage.crossOrigin = "anonymous";
    sourceImage.src = "/Image/Map.png";

    sourceImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      context.drawImage(sourceImage, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      for (let index = 0; index < data.length; index += 4) {
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        const alpha = data[index + 3];
        const brightness = (red + green + blue) / 3;

        if (alpha === 0) continue;

        // 去掉地图图片里接近纯白的底板，同时保留地图本身的浅米色区域。
        if (brightness > 247) {
          data[index + 3] = 0;
          continue;
        }

        if (brightness > 239) {
          data[index + 3] = Math.round(alpha * 0.18);
        }
      }

      context.putImageData(imageData, 0, 0);

      if (isMounted) {
        setProcessedSrc(canvas.toDataURL("image/png"));
      }
    };

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <img
      src={processedSrc}
      alt="湛江地图"
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  );
};

const FamousDish = () => {
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sceneScale, setSceneScale] = useState(1);

  const layoutData = useMemo(() => {
    const cardWidthPercent = (CARD_WIDTH / SCENE_WIDTH) * 100;
    const cardHeightPercent = (CARD_HEIGHT / SCENE_HEIGHT) * 100;
    const gapPercent = (CARD_STACK_GAP / SCENE_HEIGHT) * 100;
    const topBound = 10;
    const bottomBound = 92;

    const leftItems = pointsData
      .filter((item) => item.cardLeft <= 50)
      .sort((a, b) => a.cardTop - b.cardTop)
      .map((item) => ({ ...item, side: "left" }));

    const rightItems = pointsData
      .filter((item) => item.cardLeft > 50 && item.areaSlug !== "xu_wen")
      .sort((a, b) => a.cardTop - b.cardTop)
      .map((item) => ({ ...item, side: "right" }));

    const xuWenItem = pointsData.find((item) => item.areaSlug === "xu_wen");

    const distributeStack = (items) => {
      if (!items.length) return [];

      const adjusted = items.map((item) => ({ ...item, adjustedTop: item.cardTop }));
      adjusted[0].adjustedTop = clamp(adjusted[0].adjustedTop, topBound, bottomBound - cardHeightPercent);

      for (let index = 1; index < adjusted.length; index += 1) {
        const previousTop = adjusted[index - 1].adjustedTop;
        const minTop = previousTop + cardHeightPercent + gapPercent;
        adjusted[index].adjustedTop = Math.max(adjusted[index].adjustedTop, minTop);
      }

      const overflow = adjusted[adjusted.length - 1].adjustedTop + cardHeightPercent - bottomBound;
      if (overflow > 0) {
        for (let index = adjusted.length - 1; index >= 0; index -= 1) {
          adjusted[index].adjustedTop -= overflow;
        }

        adjusted[0].adjustedTop = Math.max(adjusted[0].adjustedTop, topBound);

        for (let index = 1; index < adjusted.length; index += 1) {
          const previousTop = adjusted[index - 1].adjustedTop;
          const minTop = previousTop + cardHeightPercent + gapPercent;
          adjusted[index].adjustedTop = Math.max(adjusted[index].adjustedTop, minTop);
        }
      }

      return adjusted;
    };

    const arrangedLeft = distributeStack(leftItems).map((item, index) => {
      const renderLeft = LEFT_SCATTER_LEFT[index] ?? 6;
      const renderTop = item.adjustedTop + (STACK_TOP_JITTER[index] ?? 0);

      return {
        ...item,
        renderTop,
        renderLeft,
        path: buildCurvePath({
          startX: renderLeft + cardWidthPercent,
          startY: renderTop,
          endX: item.dotLeft,
          endY: item.dotTop,
          side: "left",
        }),
      };
    });

    const arrangedRight = distributeStack(rightItems).map((item, index) => {
      const renderLeft = RIGHT_SCATTER_LEFT[index] ?? 94;
      const renderTop = item.adjustedTop + (STACK_TOP_JITTER[index] ?? 0);

      return {
        ...item,
        renderTop,
        renderLeft,
        path: buildCurvePath({
          startX: renderLeft - cardWidthPercent,
          startY: renderTop,
          endX: item.dotLeft,
          endY: item.dotTop,
          side: "right",
        }),
      };
    });

    const arrangedXuWen = xuWenItem
      ? [
          {
            ...xuWenItem,
            side: "bottom",
            renderTop: xuWenItem.cardTop + 11,
            renderLeft: 66,
            path: buildCurvePath({
              startX: 66 - cardWidthPercent / 2,
              startY: xuWenItem.cardTop + 11 - cardHeightPercent / 2,
              endX: xuWenItem.dotLeft,
              endY: xuWenItem.dotTop,
              side: "bottom",
            }),
          },
        ]
      : [];

    return [...arrangedLeft, ...arrangedRight, ...arrangedXuWen];
  }, [pointsData]);

  useEffect(() => {
    const updateSceneScale = () => {
      if (typeof window === "undefined") return;

      const widthScale = (window.innerWidth - PAGE_SIDE_GAP * 2) / SCENE_WIDTH;
      const heightScale =
        (window.innerHeight - NAV_SAFE_SPACE - PAGE_BOTTOM_GAP - 24) / SCENE_HEIGHT;
      const nextScale = Math.min(widthScale, heightScale, MAX_SCENE_SCALE);

      setSceneScale(Math.max(0.78, nextScale));
    };

    updateSceneScale();
    window.addEventListener("resize", updateSceneScale);

    return () => window.removeEventListener("resize", updateSceneScale);
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const res = await fetch("/API/FamousDish");
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("FamousDish API did not return JSON:", text);
          return;
        }

        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          const normalizedData = result.data.map((item) => ({
            ...item,
            dotLeft: toNumber(item.dotLeft),
            dotTop: toNumber(item.dotTop),
            cardLeft: toNumber(item.cardLeft),
            cardTop: toNumber(item.cardTop),
            carousel_data: Array.isArray(item.carousel_data) ? item.carousel_data : [],
          }));

          setPointsData(normalizedData);
        }
      } catch (error) {
        console.error("Failed to load FamousDish map data:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>正在加载湛江美食地图...</div>;
  }

  return (
    <div style={pageShellStyle}>
      <div
        style={{
          ...sceneViewportStyle,
          width: `${SCENE_WIDTH * sceneScale}px`,
          height: `${(SCENE_HEIGHT + BOTTOM_CARD_SAFE_SPACE) * sceneScale}px`,
        }}
      >
        <div
          style={{
            ...sceneStyle,
            transform: `scale(${sceneScale})`,
            transformOrigin: "top left",
          }}
        >
        <div style={mapStyle}>
          <ProcessedMap />
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={lineLayerStyle}>
          {layoutData.map((item) => (
            <path
              key={`line-${item.id}`}
              d={item.path}
              fill="none"
              stroke="#b9b2aa"
              strokeWidth="0.18"
              strokeLinecap="round"
              opacity="0.9"
            />
          ))}
        </svg>

        {layoutData.map((item) => {
          const anchorX = item.side === "right" || item.side === "bottom" ? "-100%" : "0%";

          return (
            <React.Fragment key={item.id}>
              <div
                style={{
                  position: "absolute",
                  left: `${item.dotLeft}%`,
                  top: `${item.dotTop}%`,
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#9c4b38",
                  border: "3px solid rgba(255,255,255,0.98)",
                  boxShadow: "0 0 0 2px rgba(156, 75, 56, 0.12), 0 4px 12px rgba(156, 75, 56, 0.25)",
                  transform: "translate(-50%, -50%)",
                  zIndex: 3,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: `${item.renderLeft}%`,
                  top: `${item.renderTop}%`,
                  transform: `translate(${anchorX}, -50%)`,
                  zIndex: 4,
                }}
              >
                <AreaCard
                  areaName={item.areaName}
                  areaSlug={item.areaSlug}
                  carouselData={item.carousel_data}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default FamousDish;
