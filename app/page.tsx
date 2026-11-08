import Image from "next/image";
import Link from "next/link";
import { Anchor, ArrowUpRight } from "lucide-react";
import HomeCarousel from "./HomeCarousel";
import styles from "./home.module.css";

const destinations = {
  shops: {
    title: "探店寻味",
    href: "/views/discover/children-views/FamousDish",
    image: "/Image/CK1.png",
    description: "从赤坎老街出发",
  },
  tastes: {
    title: "味觉卡片",
    href: "/views/discover/children-views/TasteCard",
    image: "/Image/food/07.png",
    description: "认识湛江的时令风味",
  },
  routes: {
    title: "寻味路线",
    href: "/views/discover/children-views/FoodMap",
    image: "/Image/XS1.png",
    description: "用 AI 规划一趟逛吃",
  },
  ranking: {
    title: "热门推荐",
    href: "/views/FoodRanking",
    image: "/Image/Hot1.png",
    description: "看看大家爱吃什么",
  },
  community: {
    title: "用户互动",
    href: "/views/FoodCommunity",
    image: "/Image/Left3.png",
    description: "聊聊吃过的那一口",
  },
};

function SectionLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={styles.action}>
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
    </Link>
  );
}

export default function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>湛江本地美食指南</p>
          <h1 id="home-title">今天，<br />去湛江吃点鲜。</h1>
          <p className={styles.description}>从老街的一口小吃，到海边的一桌好菜。</p>
          <SectionLink href={destinations.shops.href}>开始探店</SectionLink>
        </div>
        <HomeCarousel />
      </section>

      <section className={styles.story} aria-labelledby="taste-title">
        <div className={styles.storyImage}>
          <Image src="/Image/Hot3.png" alt="撒着芝麻和葱花的簸箕炊" fill sizes="(max-width: 760px) 100vw, 46vw" />
        </div>
        <div>
          <p className={styles.eyebrow}>认识寻味湛江</p>
          <h2 id="taste-title">一座城，有它<br />自己的味道。</h2>
          <p className={styles.description}>沙姜蘸白切鸡，米浆蒸成簸箕炊。翻开味觉卡片，看看湛江人平常吃什么、怎么吃。</p>
          <SectionLink href={destinations.tastes.href}>翻开味觉卡片</SectionLink>
        </div>
      </section>

      <section className={styles.explore} aria-labelledby="explore-title">
        <p className={styles.eyebrow}>从这里开始</p>
        <h2 id="explore-title">五种方式，逛吃湛江</h2>
        <ul className={styles.cards}>
          {Object.values(destinations).map(({ title, href, image, description }) => (
            <li key={href}>
              <Link className={styles.card} href={href}>
                <div className={styles.cardImage}>
                  <Image src={image} alt="" fill sizes="(max-width: 760px) 50vw, (max-width: 1000px) 33vw, 20vw" />
                </div>
                <div className={styles.cardCopy}>
                  <h3>{title}<ArrowUpRight size={15} aria-hidden="true" /></h3>
                  <p>{description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.route} aria-labelledby="route-title">
        <div className={styles.routeImage}>
          <Image src={destinations.shops.image} alt="赤坎老街的鸭仔饭店面" fill sizes="(max-width: 760px) 100vw, 56vw" />
        </div>
        <div className={styles.routeCopy}>
          <p className={styles.eyebrow}>寻味路线</p>
          <h2 id="route-title">下一站，<br />去哪里吃？</h2>
          <p className={styles.description}>按时间、预算和口味，让 AI 帮你排一条初步路线。遇到叫不上名字的小吃，也能拍照问问。</p>
          <SectionLink href={destinations.routes.href}>打开寻味向导</SectionLink>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="community-title">
        <div>
          <p className={styles.eyebrow}>用户互动</p>
          <h2 id="community-title">这一口，<br />值得跟大家聊聊。</h2>
          <p className={styles.description}>读读本地食客的探店日记，或者分享自己的逛吃发现。</p>
          <SectionLink href={destinations.community.href}>逛逛美食社区</SectionLink>
        </div>
        <div className={styles.storyImage}>
          <Image src={destinations.community.image} alt="食客一起品尝湛江美食" fill sizes="(max-width: 760px) 100vw, 46vw" />
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link className={styles.brand} href="/"><Anchor size={20} aria-hidden="true" />Zhanjiang·Food</Link>
          <nav aria-label="首页页脚导航">
            {Object.values(destinations).map(({ title, href }) => <Link key={href} href={href}>{title}</Link>)}
          </nav>
        </div>
      </footer>
    </div>
  );
}
