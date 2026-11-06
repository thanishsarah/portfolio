import React, { useEffect, useId, useRef, useState } from "react";
import "./threshold-art.css";

const FOCUSES = {
  learning: {
    number: "01",
    title: "Learning systems",
    caption: "A useful idea, carried forward.",
    mark: [
      "M264 290h32v32h-32Z",
      "M272 282h32v32",
      "M280 274h32v32",
      "M280 322v17m-9-8h18",
    ],
  },
  communication: {
    number: "02",
    title: "Creative communication",
    caption: "A perspective, made understandable.",
    mark: [
      "M262 286h49v34h-28l-13 12v-12h-8Z",
      "M271 297h31",
      "M271 307h23",
      "M286 275v-8m33 36h8",
    ],
  },
  ai: {
    number: "03",
    title: "AI integration",
    caption: "New tools. A human direction.",
    mark: [
      "M286 276 309 299 286 322 263 299 286 276Z",
      "M286 287 298 299 286 311 274 299 286 287Z",
      "M286 268v-8m0 70v8m-31-39h-8m70 0h8",
    ],
  },
};

const stoneVeins = [
  "M154 183c29 5 32-4 57 1m145-1c22 3 43-5 65-3",
  "M153 284c18 5 26-1 47 0m168-2 51 4",
  "M155 405c31-3 38 5 52 0m156 4c23-6 33 1 54-2",
  "M184 134c11 24-3 29 1 42m18 12c-5 36 4 42-1 60",
  "M392 140c-4 13 4 22 0 34m15 151c-6 25 4 35-2 52",
  "M173 341c7 13-4 25 0 40m207-147c7 16-1 28 2 40",
];

function Inscription({ x, y, reflected = false }) {
  return (
    <g
      transform={`translate(${x} ${y})${reflected ? " scale(-1 1)" : ""}`}
      className="threshold-inscription"
    >
      <path d="M0 0h14m-7 0v13m-7 0h14M2 22l5-5 5 5-5 5-5-5Zm-2 14h14M3 40v9m8-9v9m-8-5h8M0 61l7-8 7 8m-7-8v18M1 81h12m-6-6v12M0 96h14v11H0Zm7 0v11M2 119l5-5 5 5-5 5-5-5Z" />
    </g>
  );
}

/** Original architectural study. It uses no image, video, or external asset. */
export default function ThresholdArt({ focus = "ai", motion = true }) {
  const selection = FOCUSES[focus] || FOCUSES.ai;
  const identity = useId().replaceAll(":", "");
  const figure = useRef(null);
  const surface = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const moving = Boolean(motion && !reduced && visible && pageVisible);
  const id = (name) => `threshold-${identity}-${name}`;

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    const visibility = () => setPageVisible(!document.hidden);
    update();
    visibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.08 },
    );
    if (figure.current) observer.observe(figure.current);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!moving && surface.current) {
      surface.current.style.transform = "none";
      surface.current.style.setProperty("--threshold-x", "50%");
      surface.current.style.setProperty("--threshold-y", "40%");
    }
  }, [moving]);

  function orient(event) {
    if (
      !moving ||
      event.pointerType !== "mouse" ||
      !matchMedia("(pointer: fine)").matches
    )
      return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
    surface.current.style.transform = `perspective(1100px) rotateY(${(x - 0.5) * 6}deg) rotateX(${(y - 0.5) * -4}deg)`;
    surface.current.style.setProperty("--threshold-x", `${x * 100}%`);
    surface.current.style.setProperty("--threshold-y", `${y * 100}%`);
  }

  function settle() {
    if (!surface.current) return;
    surface.current.style.transform = "none";
    surface.current.style.setProperty("--threshold-x", "50%");
    surface.current.style.setProperty("--threshold-y", "40%");
  }

  return (
    <figure
      ref={figure}
      className="threshold-art"
      data-focus={focus}
      data-motion={moving ? "on" : "off"}
      onPointerMove={orient}
      onPointerLeave={settle}
    >
      <div className="threshold-art-topline">
        <span>THE LIVING PRACTICE</span>
        <span>STUDY / {selection.number}</span>
      </div>
      <div className="threshold-surface" ref={surface}>
        <svg
          className="threshold-drawing"
          viewBox="0 0 560 640"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id={id("stone")}
              x1="128"
              y1="130"
              x2="431"
              y2="457"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#b8a885" />
              <stop offset=".22" stopColor="#8d8367" />
              <stop offset=".65" stopColor="#575e4c" />
              <stop offset="1" stopColor="#404b3e" />
            </linearGradient>
            <linearGradient
              id={id("stone-dark")}
              x1="435"
              y1="108"
              x2="480"
              y2="420"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6f725b" />
              <stop offset="1" stopColor="#252f27" />
            </linearGradient>
            <linearGradient
              id={id("cap")}
              x1="180"
              y1="102"
              x2="433"
              y2="154"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#c7b489" />
              <stop offset="1" stopColor="#72775d" />
            </linearGradient>
            <linearGradient
              id={id("depth")}
              x1="230"
              y1="229"
              x2="335"
              y2="425"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#19231c" />
              <stop offset=".6" stopColor="#111a15" />
              <stop offset="1" stopColor="#2b3528" />
            </linearGradient>
            <linearGradient
              id={id("step-top")}
              x1="110"
              y1="465"
              x2="459"
              y2="548"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9e9273" />
              <stop offset=".5" stopColor="#69705a" />
              <stop offset="1" stopColor="#424f40" />
            </linearGradient>
            <linearGradient
              id={id("step-front")}
              x1="107"
              y1="463"
              x2="107"
              y2="573"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#59614c" />
              <stop offset="1" stopColor="#233026" />
            </linearGradient>
            <linearGradient
              id={id("beam")}
              x1="141"
              y1="15"
              x2="321"
              y2="549"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f5d9a4" stopOpacity=".02" />
              <stop offset=".45" stopColor="#e6c88e" stopOpacity=".11" />
              <stop offset="1" stopColor="#d1b17b" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={id("aura")}>
              <stop stopColor="#c19c62" stopOpacity=".2" />
              <stop offset="1" stopColor="#6f7c58" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("shadow")}>
              <stop stopColor="#050a06" stopOpacity=".8" />
              <stop offset="1" stopColor="#050a06" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("floor-light")}>
              <stop stopColor="#e7c889" stopOpacity=".24" />
              <stop offset="1" stopColor="#e7c889" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id={id("inlay")}
              x1="283"
              y1="256"
              x2="283"
              y2="341"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f2dbac" />
              <stop offset="1" stopColor="#af8d56" />
            </linearGradient>
            <clipPath id={id("face-clip")}>
              <path d="M137 471V156H169V127H201V100H403V127H435V471H348V210H222V471Z" />
            </clipPath>
            <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".61"
                numOctaves="2"
                seed="17"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="linear" slope=".075" />
              </feComponentTransfer>
              <feBlend in="SourceGraphic" mode="soft-light" />
            </filter>
            <filter
              id={id("soft-light")}
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <ellipse
            cx="311"
            cy="293"
            rx="238"
            ry="256"
            fill={`url(#${id("aura")})`}
          />
          <g className="threshold-datum">
            <path d="M45 64h41m388 0h41M45 64v41m470-41v41M45 548v41h41m429-41v41h-41M36 329h14m460 0h14M283 44v14m0 537v14" />
            <path d="M72 80v464m-5-464h10m-10 464h10" />
            <path d="M83 80h39m-39 464h39" />
          </g>
          <g className="threshold-measure">
            <path d="M89 111h13m-13 39h8m-8 39h8m-8 39h13m-13 39h8m-8 39h8m-8 39h13m-13 39h8m-8 39h8m-8 39h13" />
          </g>
          <path
            className="threshold-beam"
            d="M86 0h46l310 566-142 1L86 0Z"
            fill={`url(#${id("beam")})`}
          />
          <ellipse
            cx="293"
            cy="555"
            rx="225"
            ry="47"
            fill={`url(#${id("shadow")})`}
          />
          <g className="threshold-floor-grid">
            <path d="m81 553 200 43 209-49M124 541l157 35 166-39M168 528l113 27 122-29M212 516l69 18 78-17M81 553l131-37m278 31-131-30M281 596v-80" />
          </g>

          <g className="threshold-building">
            <path
              d="M435 471 473 445V131L441 104V78H239L201 100H403V127H435V471Z"
              fill={`url(#${id("stone-dark")})`}
            />
            <path
              d="M201 100 239 78H441L403 100H201ZM169 127l38-23h32l-38 23h-32ZM137 156l38-24h32l-38 24h-32Z"
              fill={`url(#${id("cap")})`}
            />
            <path
              d="M403 100 441 78v26l-38 23V100Zm32 27 38-23v27l-38 25v-29Z"
              fill="#8b8a6b"
            />
            <path
              d="M137 471V156H169V127H201V100H403V127H435V471H348V210H222V471Z"
              fill={`url(#${id("stone")})`}
            />
            <g
              clipPath={`url(#${id("face-clip")})`}
              filter={`url(#${id("grain")})`}
            >
              <rect
                x="130"
                y="90"
                width="313"
                height="390"
                fill="#d7c5a0"
                fillOpacity=".06"
              />
              <path
                d="M149 460V168H181V139H213V113H391V139H423V460M159 460V178H191V149H223V124H381V149H413V460"
                stroke="#d8cba1"
                strokeOpacity=".2"
                strokeWidth=".8"
              />
              <path
                d="M137 244h85m126 0h87M137 376h85m126 0h87M201 100v27m202-27v27"
                stroke="#27372c"
                strokeOpacity=".42"
                strokeWidth="1.1"
              />
              <path
                d="M137 246h85m126 0h87M137 378h85m126 0h87"
                stroke="#d0c29d"
                strokeOpacity=".11"
                strokeWidth="1"
              />
              <g className="threshold-veins">
                {stoneVeins.map((path) => (
                  <path d={path} key={path} />
                ))}
              </g>
            </g>
            <path d="M222 210h126v261H222V210Z" fill={`url(#${id("depth")})`} />
            <path d="m222 210 13 13v225l-13 23V210Z" fill="#636b51" />
            <path d="m348 210-13 13v225l13 23V210Z" fill="#323f30" />
            <path d="m222 210 13 13h100l13-13H222Z" fill="#827d5e" />
            <path
              d="M235 448V223h100v225M244 432V236h82v196M253 417V248h64v169"
              stroke="#b49d6f"
              strokeOpacity=".12"
              strokeWidth=".8"
            />
            <path d="M235 448h100l13 23H222l13-23Z" fill="#696d50" />
            <path
              d="M286 224v224"
              className="threshold-inner-light"
              stroke="#e0c38e"
              strokeWidth="1"
              strokeOpacity=".28"
            />
            <ellipse
              className="threshold-inner-light"
              cx="286"
              cy="443"
              rx="49"
              ry="21"
              fill={`url(#${id("floor-light")})`}
            />
            <Inscription x={181} y={230} />
            <Inscription x={391} y={230} reflected />
            <g className="threshold-lintel">
              <path d="M224 169h124m-124 3h124M239 162v17m16-17v17m16-17v17m16-17v17m16-17v17m16-17v17m16-17v17" />
            </g>
            <g
              key={focus}
              className="threshold-focus-mark"
              stroke={`url(#${id("inlay")})`}
              strokeWidth="1.2"
              strokeLinejoin="miter"
            >
              <circle cx="286" cy="300" r="48" strokeOpacity=".14" />
              <circle cx="286" cy="300" r="39" strokeOpacity=".25" />
              {selection.mark.map((path, index) => (
                <path d={path} key={index} />
              ))}
            </g>
            <path
              d="M145 466h69m142 0h71M137 157h32v-29h32v-27h201"
              stroke="#e7d0a2"
              strokeOpacity=".42"
              strokeWidth=".8"
            />
            <path
              d="M435 158v310"
              stroke="#a7a181"
              strokeOpacity=".3"
              strokeWidth=".8"
            />
          </g>

          <g className="threshold-steps">
            <path
              d="m137 471 85-23h126l87 23-36 17H173l-36-17Z"
              fill={`url(#${id("step-top")})`}
            />
            <path
              d="M137 471v14l36 17h226l36-17v-14l-36 17H173l-36-17Z"
              fill={`url(#${id("step-front")})`}
            />
            <path
              d="m124 488 49 14h226l49-14 1 15-42 19H166l-42-19v-15Z"
              fill={`url(#${id("step-front")})`}
            />
            <path
              d="m137 485 36 17h226l36-17 13 3-42 19H166l-42-19 13-3Z"
              fill={`url(#${id("step-top")})`}
            />
            <path
              d="m111 511 55 11h241l55-11v16l-47 22H158l-47-22v-16Z"
              fill={`url(#${id("step-front")})`}
            />
            <path
              d="m124 503 42 19h241l42-19 13 8-47 22H158l-47-22 13-8Z"
              fill={`url(#${id("step-top")})`}
            />
            <path
              d="m97 540 61 9h257l62-9v15l-53 24H150l-53-24v-15Z"
              fill={`url(#${id("step-front")})`}
            />
            <path
              d="m111 527 47 22h257l47-22 15 13-53 24H150l-53-24 14-13Z"
              fill={`url(#${id("step-top")})`}
            />
            <path
              d="m137 471 36 17h226l36-17M124 488l42 19h240l42-19M111 511l47 22h257l47-22M97 540l53 24h274l53-24"
              stroke="#d3c095"
              strokeWidth=".7"
              strokeOpacity=".3"
            />
            <path
              d="m286 448 44 116h-47l3-116Z"
              fill={`url(#${id("floor-light")})`}
            />
            <path
              d="m288 451 16 37m2 5 4 14m3 8 6 18m3 8 9 23"
              stroke="#dfc48b"
              strokeOpacity=".25"
              strokeWidth="1.1"
            />
          </g>

          <g className="threshold-human">
            <ellipse
              cx="378"
              cy="505"
              rx="15"
              ry="4"
              fill="#111b14"
              fillOpacity=".6"
            />
            <circle cx="377" cy="473" r="3.1" />
            <path d="m374 478-1.2 13 3.3.3-1.3 13m4-24 2 10-3.2 1-1.5 13M374 480l-5 7m10-7 5 8" />
          </g>
          <g className="threshold-dust">
            {[
              [198, 91],
              [369, 197],
              [112, 324],
              [256, 177],
              [422, 392],
              [302, 380],
              [353, 81],
              [204, 432],
            ].map(([x, y], index) => (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={index % 3 === 0 ? 1.1 : 0.7}
                style={{ "--dust-delay": `${index * -0.8}s` }}
              />
            ))}
          </g>
          <g className="threshold-notation">
            <path d="M392 487h58l27-17M113 216H84" />
            <circle cx="392" cy="487" r="2" />
            <path d="M235 599h103m-103-3v6m103-6v6" />
          </g>
        </svg>
        <div className="threshold-pointer-light" aria-hidden="true" />
      </div>
      <figcaption className="threshold-caption">
        <span className="threshold-caption-number">{selection.number}</span>
        <span>
          <strong>{selection.title}</strong>
          <span>{selection.caption}</span>
        </span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m12 3 9 9-9 9-9-9 9-9Zm0 5 4 4-4 4-4-4 4-4Z"
            stroke="currentColor"
            strokeWidth=".8"
          />
        </svg>
      </figcaption>
    </figure>
  );
}
