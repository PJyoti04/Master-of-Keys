import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".footer-animated-item", {
        y: 45,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
        },
      });
    }, footerRef);

    return () => context.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-[#101318] font-mono text-white"
    >
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[110px]" />

      <div className="relative z-10 mx-auto w-[min(1320px,calc(100%-80px))] pb-9 pt-24 max-md:w-[calc(100%-40px)]">
        <div className="footer-animated-item flex items-end justify-between gap-10 max-md:flex-col max-md:items-start">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-lg font-extrabold text-white no-underline"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 font-sans font-black text-[#151515]">
                M
              </span>

              <span>master of keys</span>
            </Link>

            <p className="mt-5 max-w-[420px] font-sans leading-7 text-zinc-500">
              Practice smarter, type faster and compete with confidence.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 max-md:items-start">
            <span className="font-sans text-xs text-zinc-600">
              Ready to improve?
            </span>

            <Link
              to="/practice"
              className="group flex items-center gap-5 text-[clamp(1.8rem,3vw,3.2rem)] font-extrabold tracking-[-0.05em] text-orange-500 no-underline transition-all duration-300 hover:gap-8"
            >
              <span>Start typing</span>

              <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </div>
        </div>

        <div className="footer-animated-item my-16 h-px bg-gradient-to-r from-orange-500 via-orange-500/10 to-white/[0.04]" />

        <div className="grid grid-cols-[1fr_1fr_1.3fr] gap-16 max-md:grid-cols-2 max-md:gap-10">
          <div className="footer-animated-item flex flex-col items-start gap-4">
            <span className="mb-1 font-sans text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Explore
            </span>

            <Link
              to="/practice"
              className="font-sans text-sm text-zinc-300 transition duration-200 hover:translate-x-1 hover:text-orange-500"
            >
              Practice
            </Link>

            <Link
              to="/multiplayer"
              className="font-sans text-sm text-zinc-300 transition duration-200 hover:translate-x-1 hover:text-orange-500"
            >
              Multiplayer
            </Link>

            <Link
              to="/login"
              className="font-sans text-sm text-zinc-300 transition duration-200 hover:translate-x-1 hover:text-orange-500"
            >
              Sign in
            </Link>
          </div>

          <div className="footer-animated-item flex flex-col items-start gap-4">
            <span className="mb-1 font-sans text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Company
            </span>

            <button
              type="button"
              className="border-0 bg-transparent p-0 font-sans text-sm text-zinc-300 transition duration-200 hover:translate-x-1 hover:text-orange-500"
            >
              About us
            </button>

            <button
              type="button"
              className="border-0 bg-transparent p-0 font-sans text-sm text-zinc-300 transition duration-200 hover:translate-x-1 hover:text-orange-500"
            >
              Contact us
            </button>

            <button
              type="button"
              className="border-0 bg-transparent p-0 font-sans text-sm text-zinc-300 transition duration-200 hover:translate-x-1 hover:text-orange-500"
            >
              Feedback
            </button>
          </div>

          <div className="footer-animated-item flex flex-col items-start gap-4 max-md:col-span-2">
            <span className="mb-1 font-sans text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Connect
            </span>

            <div className="flex gap-3">
              <a
                href="#github"
                aria-label="GitHub"
                className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-orange-500/[0.07]"
              >
                <img
                  src="/icons8-github-200.png"
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              </a>

              <a
                href="mailto:"
                aria-label="Email"
                className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-orange-500/[0.07]"
              >
                <img
                  src="/icons8-gmail-200.png"
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              </a>

              <a
                href="#instagram"
                aria-label="Instagram"
                className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-orange-500/[0.07]"
              >
                <img
                  src="/icons8-instagram-200.png"
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-animated-item mt-20 flex items-center justify-between gap-6 border-t border-white/[0.06] pt-6 font-sans text-xs text-zinc-600 max-sm:flex-col max-sm:items-start">
          <p>
            Copyright © {new Date().getFullYear()}{" "}
            <span className="text-orange-500">Master of Keys</span>. All rights
            reserved.
          </p>

          <p className="max-sm:hidden">
            Built for people who love to type.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;