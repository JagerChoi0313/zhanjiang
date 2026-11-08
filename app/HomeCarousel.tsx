"use client";

import { Carousel } from "antd";
import Image from "next/image";
import styles from "./home.module.css";

const slides = [
  { image: "/Image/slider1.png", alt: "配有沙姜蘸料的湛江白切鸡" },
  { image: "/Image/slider2.png", alt: "湛江生蚝" },
  { image: "/Image/slider3.png", alt: "徐闻菠萝" },
  { image: "/Image/slider4.png", alt: "湛江虾饼" },
];

export default function HomeCarousel() {
  return (
    <div className={styles.heroImage} role="region" aria-label="湛江美食轮播">
      <Carousel
        className={styles.heroCarousel}
        effect="fade"
        autoplay={{ dotDuration: true }}
        autoplaySpeed={5000}
        pauseOnHover
        pauseOnFocus
        pauseOnDotsHover
        accessibility
      >
        {slides.map(({ image, alt }, index) => (
          <div key={image}>
            <Image
              src={image}
              alt={alt}
              fill
              sizes="(max-width: 760px) 100vw, 58vw"
              preload={index === 0}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
