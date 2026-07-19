import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Features from "../components/Features";
import Footer from "../components/Footer";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);

  // Only the left-side text content
  const heroCopyRef = useRef(null);

  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const actionsRef = useRef(null);

  // Separate keyboard wrappers to prevent GSAP conflicts
  const keyboardEntranceRef = useRef(null);
  const keyboardScrollRef = useRef(null);
  const keyboardRef = useRef(null);

  const speedCardRef = useRef(null);
  const accuracyCardRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      /*
       * Explicit initial values prevent the keyboard from retaining
       * opacity or transform values after scrolling back.
       */
      gsap.set(keyboardEntranceRef.current, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
      });

      gsap.set(keyboardScrollRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .from(".hero-label", {
          y: 25,
          opacity: 0,
          duration: 0.6,
        })
        .from(
          headingRef.current,
          {
            y: 90,
            opacity: 0,
            rotateX: -35,
            duration: 1,
          },
          "-=0.2",
        )
        .from(
          descriptionRef.current,
          {
            y: 40,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.55",
        )
        .from(
          actionsRef.current?.children || [],
          {
            y: 30,
            opacity: 1,
            stagger: 0.12,
            duration: 0.6,
          },
          "-=0.35",
        )
        .from(
          ".hero-stat-item",
          {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
          },
          "-=0.25",
        )
        .from(
          keyboardEntranceRef.current,
          {
            x: 180,
            y: 80,
            opacity: 0,
            scale: 0.72,
            rotateX: 42,
            rotateY: -30,
            rotateZ: 12,
            duration: 1.4,
          },
          "-=1.15",
        )
        .from(
          [speedCardRef.current, accuracyCardRef.current],
          {
            y: 30,
            opacity: 0,
            scale: 0.85,
            stagger: 0.15,
            duration: 0.6,
          },
          "-=0.45",
        );

      /*
       * Infinite keyboard floating animation.
       * This only controls the image, not the scroll wrapper.
       */
      gsap.to(keyboardRef.current, {
        y: -18,
        rotateZ: -1.5,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /*
       * Floating quick-stat cards.
       */
      gsap.to(speedCardRef.current, {
        y: -10,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(accuracyCardRef.current, {
        y: 12,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /*
       * Only the text portion moves and fades while scrolling.
       * The keyboard and quick cards are no longer inside this animation.
       */
      gsap.to(heroCopyRef.current, {
        y: -80,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      /*
       * Keyboard scroll effect.
       * Opacity is intentionally not animated.
       */
      gsap.to(keyboardScrollRef.current, {
        y: 100,
        scale: 0.88,
        rotateX: 14,
        rotateY: -8,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(".hero-orange-glow", {
        x: 90,
        y: 50,
        scale: 1.2,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".hero-secondary-glow", {
        x: -70,
        y: -40,
        scale: 1.15,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, heroRef);

    return () => context.revert();
  }, []);

  return (
    <main className="min-h-[calc(100vh-70px)] overflow-x-clip bg-[#111419] font-mono text-white">
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100vh-70px)] items-center overflow-hidden bg-[#181C22]"
      >
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30
          [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
          [background-size:55px_55px]
          [mask-image:linear-gradient(to_bottom,black,transparent_95%)]"
        />

        {/* Background glows */}
        {/* <div className="hero-orange-glow pointer-events-none absolute right-[8%] top-[8%] h-[330px] w-[330px] rounded-full bg-orange-500/15 blur-[100px]" /> */}

        <div className="hero-secondary-glow pointer-events-none absolute -bottom-10 -left-20 h-[280px] w-[280px] rounded-full bg-orange-700/10 blur-[100px]" />

        <div className="relative z-10 mx-auto grid w-[min(1450px,calc(100%-80px))] grid-cols-[minmax(0,1fr)_minmax(500px,1fr)] items-center gap-12 py-2 max-lg:w-[min(760px,calc(100%-40px))] max-lg:grid-cols-1 max-lg:gap-8 max-lg:pb-20 max-lg:pt-28">
          {/* Hero content */}
          <div
            ref={heroCopyRef}
            className="relative z-10 max-lg:flex max-lg:flex-col max-lg:items-center max-lg:text-center"
          >
            <div className="hero-label mb-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.9)]" />
              The complete typing experience
            </div>

            <h1
              ref={headingRef}
              style={{ fontFamily: "Chelsea Market, system-ui" }}
              className="w-full md:min-w-[760px] text-[clamp(3rem,6.5vw,7.8rem)] font-black leading-[0.92] tracking-[-0.075em] [perspective:1000px] max-sm:text-[clamp(2.4rem,13vw,3.9rem)]"
            >
              Master of 
              <span className="text-orange-500 [text-shadow:0_0_45px_rgba(249,115,22,0.18)]">
                {" "}Keys
              </span>
            </h1>

            <p
              ref={descriptionRef}
              className="mt-8 max-w-[660px] font-sans text-[clamp(1rem,1.3vw,1.2rem)] leading-8 text-zinc-400"
            >
              Test and improve your typing speed through focused practice,
              real-time competition and detailed performance tracking.
            </p>

            <div
              ref={actionsRef}
              className="mt-10 flex flex-wrap gap-4 max-sm:w-full max-sm:flex-col"
            >
              <Link
                to="/practice"
                className="group inline-flex min-h-14 items-center justify-center gap-8 rounded-xl bg-orange-500 px-6 font-sans text-sm font-bold text-[#151515] shadow-[0_18px_50px_rgba(249,115,22,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-[0_24px_55px_rgba(249,115,22,0.28)]"
              >
                <span>Start practicing</span>

                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </Link>

              <Link
                to="/multiplayer"
                className="group inline-flex min-h-14 items-center justify-center gap-8 rounded-xl border border-white/15 bg-white/[0.03] px-6 font-sans text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-orange-500/[0.06]"
              >
                <span>Compete online</span>

                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-6 max-lg:justify-center max-sm:w-full max-sm:gap-3">
              <div className="hero-stat-item flex flex-col gap-1">
                <strong className="text-sm text-white max-sm:text-xs">
                  Real-time
                </strong>

                <span className="font-sans text-xs text-zinc-600 max-sm:text-[10px]">
                  Performance
                </span>
              </div>

              <div className="hero-stat-item h-10 w-px bg-white/10 max-sm:hidden" />

              <div className="hero-stat-item flex flex-col gap-1">
                <strong className="text-sm text-white max-sm:text-xs">
                  Multiplayer
                </strong>

                <span className="font-sans text-xs text-zinc-600 max-sm:text-[10px]">
                  Typing rooms
                </span>
              </div>

              <div className="hero-stat-item h-10 w-px bg-white/10 max-sm:hidden" />

              <div className="hero-stat-item flex flex-col gap-1">
                <strong className="text-sm text-white max-sm:text-xs">
                  Detailed
                </strong>

                <span className="font-sans text-xs text-zinc-600 max-sm:text-[10px]">
                  Analytics
                </span>
              </div>
            </div>
          </div>

          {/* 3D keyboard */}
          <div className="relative flex min-h-[610px] items-center justify-center [perspective:1400px] max-lg:min-h-[460px] max-sm:min-h-[340px]">
            <div className="absolute h-[390px] w-[620px] rounded-full border border-orange-500/15 [transform:rotateX(67deg)_rotateZ(-12deg)] max-sm:h-[220px] max-sm:w-[370px]" />

            <div className="absolute h-[480px] w-[760px] rounded-full border border-orange-500/10 opacity-40 [transform:rotateX(67deg)_rotateZ(-12deg)] max-sm:h-[270px] max-sm:w-[440px]" />

            <div className="absolute bottom-[19%] z-[1] h-20 w-[68%] rounded-full bg-black/70 blur-[35px] [transform:rotate(-5deg)]" />

            {/* Entrance animation wrapper */}
            <div
              ref={keyboardEntranceRef}
              className="relative z-[5] [transform-style:preserve-3d] [will-change:transform,opacity]"
            >
              {/* Scroll animation wrapper */}
              <div
                ref={keyboardScrollRef}
                className="w-[min(780px,56vw)] [transform-style:preserve-3d] [will-change:transform] max-lg:w-[min(700px,95vw)]"
              >
                {/* Floating image */}
                <img
                  ref={keyboardRef}
                  src="/Dark_kb-Picsart-BackgroundRemover.png"
                  alt="Master of Keys keyboard"
                  className="block w-full object-contain [filter:drop-shadow(0_35px_40px_rgba(0,0,0,0.65))_drop-shadow(0_0_45px_rgba(249,115,22,0.12))] [transform:rotateX(18deg)_rotateY(-9deg)_rotateZ(2deg)] [transform-style:preserve-3d] [will-change:transform]"
                />
              </div>
            </div>

            {/* Quick cards stay outside the fading hero copy */}
            <div
              ref={speedCardRef}
              className="absolute left-0 top-[20%] z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16191f]/75 px-4 py-3 shadow-2xl backdrop-blur-xl max-lg:left-[5%] max-sm:-left-[7%] max-sm:top-[12%] max-sm:scale-75"
            >
              <span className="text-xl text-orange-500">⚡</span>

              <div className="font-sans">
                <strong className="block text-xs text-white">128 WPM</strong>

                <small className="text-[10px] text-zinc-500">
                  Typing speed
                </small>
              </div>
            </div>

            <div
              ref={accuracyCardRef}
              className="absolute bottom-[21%] right-[3%] z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16191f]/75 px-4 py-3 shadow-2xl backdrop-blur-xl max-sm:-right-[8%] max-sm:bottom-[13%] max-sm:scale-75"
            >
              <span className="text-xl text-orange-500">◎</span>

              <div className="font-sans">
                <strong className="block text-xs text-white">98%</strong>

                <small className="text-[10px] text-zinc-500">Accuracy</small>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 text-[10px] uppercase tracking-[0.14em] text-zinc-600 max-sm:hidden">
          <span>Scroll to explore</span>

          <span className="relative h-10 w-px overflow-hidden bg-white/10">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-pulse bg-orange-500" />
          </span>
        </div>
      </section>

      <Features />

      <Footer />
    </main>
  );
};

export default Home;
