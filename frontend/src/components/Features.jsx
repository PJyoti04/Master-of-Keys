import React, { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const featureData = [
  {
    number: "01",
    title: "Daily Practice",
    shortTitle: "Practice",
    subtitle: "Build speed through consistency",
    description:
      "Train with customizable durations, focused typing passages and a distraction-free practice environment designed to improve muscle memory.",
    image: "/practice.png",
    link: "/practice",
    linkText: "Start practicing",
    stats: [
      {
        value: "15s–24h",
        label: "Custom duration",
      },
      {
        value: "Live",
        label: "WPM tracking",
      },
    ],
    keyboardPosition: {
      x: 0,
      y: -85,
      rotateX: 22,
      rotateY: -18,
      rotateZ: -5,
      scale: 0.9,
    },
  },
  {
    number: "02",
    title: "Competitions",
    shortTitle: "Compete",
    subtitle: "Push beyond your personal best",
    description:
      "Enter fast-paced typing competitions, compare your results and challenge yourself against increasingly difficult targets.",
    image: "/rooms.png",
    link: "/multiplayer",
    linkText: "View competitions",
    stats: [
      {
        value: "Live",
        label: "Leaderboards",
      },
      {
        value: "Global",
        label: "Competition",
      },
    ],
    keyboardPosition: {
      x: 30,
      y: -20,
      rotateX: 12,
      rotateY: 19,
      rotateZ: 4,
      scale: 0.96,
    },
  },
  {
    number: "03",
    title: "Multiplayer Rooms",
    shortTitle: "Multiplayer",
    subtitle: "Race together in real time",
    description:
      "Create private rooms, share a unique room code and compete with friends through synchronized real-time typing races.",
    image: "/multiplayer.png",
    link: "/multiplayer",
    linkText: "Create a room",
    stats: [
      {
        value: "Real-time",
        label: "Race updates",
      },
      {
        value: "Private",
        label: "Room codes",
      },
    ],
    keyboardPosition: {
      x: -25,
      y: 55,
      rotateX: 27,
      rotateY: -14,
      rotateZ: -3,
      scale: 1.02,
    },
  },
  {
    number: "04",
    title: "Personalized Analysis",
    shortTitle: "Analysis",
    subtitle: "Understand every keystroke",
    description:
      "Review WPM, accuracy, mistakes and progress over time. Use detailed insights to identify weak areas and improve efficiently.",
    image: "/analysis.png",
    link: "/practice",
    linkText: "View your progress",
    stats: [
      {
        value: "Detailed",
        label: "Performance data",
      },
      {
        value: "Visual",
        label: "Progress reports",
      },
    ],
    keyboardPosition: {
      x: 10,
      y: 125,
      rotateX: 16,
      rotateY: 14,
      rotateZ: 3,
      scale: 0.92,
    },
  },
];

const Features = () => {
  const sectionRef = useRef(null);
  const keyboardRef = useRef(null);
  const keyboardFloatRef = useRef(null);
  const keyboardGlowRef = useRef(null);
  const progressRef = useRef(null);
  const featureRefs = useRef([]);

  const [activeFeature, setActiveFeature] = useState(0);

  const setFeatureRef = (element, index) => {
    featureRefs.current[index] = element;
  };

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".features-heading-word", {
        y: 90,
        opacity: 0,
        rotateX: -45,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-intro",
          start: "top 78%",
        },
      });

      gsap.from(".features-description", {
        y: 35,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-intro",
          start: "top 70%",
        },
      });

      gsap.fromTo(
        progressRef.current,
        {
          scaleY: 0,
          transformOrigin: "top",
        },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".features-showcase",
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        }
      );

      gsap.to(keyboardFloatRef.current, {
        y: 14,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      featureRefs.current.forEach((featureElement, index) => {
        if (!featureElement) return;

        const feature = featureData[index];
        const featureContent =
          featureElement.querySelector(".feature-content");
        const featureImage =
          featureElement.querySelector(".feature-image-frame");
        const featureNumber =
          featureElement.querySelector(".feature-background-number");

        gsap.from(featureContent, {
          y: 80,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featureElement,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.from(featureImage, {
          y: 100,
          opacity: 0,
          scale: 0.9,
          rotateY: index % 2 === 0 ? -12 : 12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featureElement,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.to(keyboardRef.current, {
          ...feature.keyboardPosition,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: featureElement,
            start: "top center",
            end: "bottom center",
            toggleActions: "play none none reverse",
            onEnter: () => setActiveFeature(index),
            onEnterBack: () => setActiveFeature(index),
          },
        });

        gsap.to(keyboardGlowRef.current, {
          y: feature.keyboardPosition.y * 0.45,
          scale: 1 + index * 0.08,
          opacity: 0.35 + index * 0.08,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: featureElement,
            start: "top center",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        });

        gsap.to(featureNumber, {
          yPercent: -25,
          ease: "none",
          scrollTrigger: {
            trigger: featureElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  const scrollToFeature = (index) => {
    featureRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#12151A]
      before:pointer-events-none before:absolute before:left-[8%] before:top-[12%] before:h-[350px] before:w-[350px] before:rounded-full before:bg-orange-500/[0.06] before:blur-[110px]"
    >
      {/* Intro */}
      <div className="features-intro relative z-10 mx-auto w-[min(1260px,calc(100%-80px))] py-36 max-lg:w-[min(760px,calc(100%-40px))] max-lg:py-28">
        <div className="mb-7 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
          <span className="h-px w-10 bg-orange-500" />
          What we offer
        </div>

        <h2 className="m-0 text-[clamp(3rem,6.6vw,7.4rem)] font-black leading-[0.94] tracking-[-0.075em] text-zinc-100 [perspective:1000px] max-sm:text-[clamp(2.8rem,14vw,4.8rem)]">
          <span className="features-heading-word inline-block">
            Everything
          </span>{" "}
          <span className="features-heading-word inline-block">you need</span>
          <br />
          <span className="features-heading-word inline-block text-orange-500">
            to type better.
          </span>
        </h2>

        <p className="features-description ml-auto mt-10 max-w-[650px] font-sans text-lg leading-8 text-zinc-500 max-lg:ml-0 max-sm:text-base">
          One platform for practicing, competing and understanding your
          performance.
        </p>
      </div>

      <div className="features-showcase relative mx-auto grid w-full max-w-[1500px] grid-cols-[minmax(420px,0.82fr)_minmax(0,1.18fr)] max-lg:block">
        {/* Sticky keyboard area */}
        <aside className="relative min-w-0 max-lg:hidden">
          <div
            className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden border-r border-white/[0.07] bg-[#15191F]
            before:pointer-events-none before:absolute before:inset-0 before:opacity-40
            before:[background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
            before:[background-size:48px_48px]"
          >
            <div className="absolute left-14 top-14 z-10 flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-500">
                0{activeFeature + 1}
              </span>

              <span className="h-px w-9 bg-white/20" />

              <span className="text-xs text-zinc-600">
                0{featureData.length}
              </span>
            </div>

            <div className="absolute right-14 top-[62px] z-10 font-sans text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              {featureData[activeFeature].shortTitle}
            </div>

            <div
              ref={keyboardGlowRef}
              className="pointer-events-none absolute h-[280px] w-[400px] rounded-full bg-orange-500/20 blur-[95px] [will-change:transform]"
            />

            <div className="relative z-[3] w-[min(620px,86%)] [perspective:1300px] [transform-style:preserve-3d]">
              <div ref={keyboardFloatRef}>
                <img
                  ref={keyboardRef}
                  src="/Dark_kb-Picsart-BackgroundRemover.png"
                  alt="3D keyboard moving between features"
                  className="block w-full object-contain [filter:drop-shadow(0_45px_38px_rgba(0,0,0,0.7))_drop-shadow(0_0_45px_rgba(249,115,22,0.13))] [transform-style:preserve-3d] [will-change:transform]"
                />
              </div>
            </div>

            <div className="absolute bottom-12 left-14 z-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              <div className="relative h-20 w-0.5 overflow-hidden bg-white/10">
                <div
                  ref={progressRef}
                  className="absolute inset-0 bg-orange-500"
                />
              </div>

              <span>Explore features</span>
            </div>

            <div className="absolute bottom-14 right-12 z-10 flex gap-2">
              {featureData.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  aria-label={`View ${feature.title}`}
                  onClick={() => scrollToFeature(index)}
                  className={`h-2 rounded-full border-0 p-0 transition-all duration-300 ${
                    activeFeature === index
                      ? "w-7 bg-orange-500"
                      : "w-2 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Feature panels */}
        <div className="min-w-0">
          {featureData.map((feature, index) => (
            <article
              key={feature.title}
              ref={(element) => setFeatureRef(element, index)}
              className={`relative flex min-h-screen flex-col justify-center gap-14 overflow-hidden border-b border-white/[0.07] px-[clamp(45px,6vw,105px)] py-28 ${
                index % 2 === 0 ? "bg-[#181C22]" : "bg-[#1B1F25]"
              } max-lg:min-h-0 max-lg:px-[max(30px,6vw)] max-sm:gap-10 max-sm:px-5 max-sm:py-20`}
            >
              <span className="feature-background-number pointer-events-none absolute -right-[3%] top-[3%] font-sans text-[clamp(13rem,25vw,25rem)] font-black leading-none tracking-[-0.09em] text-white/[0.025]">
                {feature.number}
              </span>

              <div className="feature-content relative z-10 max-w-[660px]">
                <span className="mb-6 block text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">
                  Feature {feature.number}
                </span>

                <p className="mb-3 font-sans text-sm text-zinc-500">
                  {feature.subtitle}
                </p>

                <h3 className="m-0 text-[clamp(2.8rem,5vw,5.8rem)] font-black leading-[0.98] tracking-[-0.065em] text-white max-sm:text-[clamp(2.6rem,13vw,4.5rem)]">
                  {feature.title}
                </h3>

                <p className="mt-7 max-w-[650px] font-sans text-base leading-7 text-zinc-400 max-sm:text-[15px]">
                  {feature.description}
                </p>

                <div className="mt-8 flex gap-12 max-sm:gap-7">
                  {feature.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-1.5 font-sans"
                    >
                      <strong className="text-sm text-white">
                        {stat.value}
                      </strong>

                      <span className="text-[11px] text-zinc-600">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to={feature.link}
                  className="group mt-9 inline-flex items-center gap-4 border-b border-orange-500 pb-2 font-sans text-sm font-bold text-orange-500 transition-all duration-300 hover:gap-7 hover:text-orange-400"
                >
                  <span>{feature.linkText}</span>
                  <span className="text-lg transition-transform duration-300 group-hover:-translate-y-1">
                    ↗
                  </span>
                </Link>
              </div>

              <div className="feature-image-frame group relative z-10 h-[clamp(260px,34vw,450px)] overflow-hidden rounded-[22px] border border-orange-500/25 bg-[#101318] shadow-[0_35px_75px_rgba(0,0,0,0.32)] [transform-style:preserve-3d] max-sm:h-[245px] max-sm:rounded-2xl">
                <img
                  src={feature.image}
                  alt={`${feature.title} interface`}
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.055] group-hover:brightness-110"
                />

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,7,10,0.75),transparent_50%),linear-gradient(135deg,rgba(249,115,22,0.06),transparent_45%)]" />

                <div className="absolute bottom-5 left-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0C0E12]/65 px-3 py-2 font-sans text-[10px] text-zinc-300 backdrop-blur-xl">
                  <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                  Live experience
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;