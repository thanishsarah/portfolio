import React from 'react';

const forest = '#102421';
const cream = '#f5f3e9';
const lime = '#dbf994';
const rust = '#b9573e';
const mono = "'Courier New', monospace";

export default function ProjectArtwork({ kind }) {
  return (
    <svg
      className="project-artwork"
      viewBox="0 0 600 420"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'programme' ? (
        <>
          <rect width="600" height="420" fill={forest} />
          <path d="M40 65H560M40 355H560" stroke={cream} strokeOpacity=".23" />
          <text x="40" y="46" fill={cream} fontFamily={mono} fontSize="9" letterSpacing="1.1">PROGRAMME LEADERSHIP</text>
          <path d="M540 39H554M547 32V46" stroke={lime} strokeWidth="1.1" />

          <path d="M65 108V324M535 108V324" stroke={cream} strokeOpacity=".15" strokeWidth=".7" />
          <path d="M59 108H71M59 216H71M59 324H71M529 108H541M529 216H541M529 324H541" stroke={cream} strokeOpacity=".35" strokeWidth=".7" />
          <circle cx="300" cy="210" r="133" stroke={cream} strokeOpacity=".18" strokeWidth=".8" strokeDasharray="2 6" />

          <ellipse cx="300" cy="278" rx="180" ry="65" stroke={cream} strokeOpacity=".55" strokeWidth="1.1" />
          <ellipse cx="300" cy="278" rx="137" ry="45" stroke={lime} strokeOpacity=".32" strokeWidth=".8" />
          <g stroke={cream} strokeOpacity=".3" strokeWidth=".8">
            <path d="M300 278 120 278M300 278 171 324M300 278 300 343M300 278 429 324M300 278 480 278" />
            <path d="M300 278 145 245M300 278 455 245" />
          </g>

          <ellipse cx="254" cy="171" rx="42" ry="61" transform="rotate(-40 254 171)" fill={lime} stroke={forest} strokeWidth="1.2" />
          <ellipse cx="346" cy="171" rx="42" ry="61" transform="rotate(40 346 171)" fill={lime} stroke={forest} strokeWidth="1.2" />
          <ellipse cx="300" cy="146" rx="43" ry="62" fill={lime} stroke={forest} strokeWidth="1.2" />
          <path d="M300 103V208M300 208 247 152M300 208 353 152M300 165 278 142M300 165 322 142" stroke={forest} strokeWidth="1.15" />
          <path d="M300 207V275M277 220 300 242 323 220" stroke={cream} strokeWidth="1.8" />

          <g fill={forest} stroke={cream} strokeWidth="1.1">
            <circle cx="120" cy="278" r="12" />
            <circle cx="171" cy="324" r="12" />
            <circle cx="300" cy="343" r="12" />
            <circle cx="429" cy="324" r="12" />
            <circle cx="480" cy="278" r="12" />
            <circle cx="145" cy="245" r="9" />
            <circle cx="455" cy="245" r="9" />
          </g>
          <g fill={lime}>
            <circle cx="120" cy="278" r="3" />
            <circle cx="171" cy="324" r="3" />
            <circle cx="300" cy="343" r="3" />
            <circle cx="429" cy="324" r="3" />
            <circle cx="480" cy="278" r="3" />
          </g>
          <circle cx="300" cy="278" r="20" fill={forest} stroke={lime} strokeWidth="1.2" />
          <path d="M291 282c0-9 9-14 18-14 0 9-5 18-14 18M295 282l9-9" fill={lime} stroke={forest} strokeWidth="1" />
          <circle cx="394" cy="112" r="3" fill={rust} />
          <circle cx="205" cy="100" r="2" fill={cream} />

          <text x="40" y="383" fill={cream} fontFamily={mono} fontSize="8.5" letterSpacing="1">PARYAVARAN BAAL SANSAD</text>
          <text x="560" y="383" textAnchor="end" fill={lime} fontFamily={mono} fontSize="8" letterSpacing=".7">LED &amp; DIRECTED</text>
        </>
      ) : kind === 'design' ? (
        <>
          <rect width="600" height="420" fill={cream} />
          <path d="M40 65H560M40 355H560" stroke={forest} strokeOpacity=".18" />
          <text x="40" y="46" fill={forest} fontFamily={mono} fontSize="9" letterSpacing="1.1">A LIVING CURRICULUM</text>
          <text x="560" y="46" textAnchor="end" fill={forest} fontFamily={mono} fontSize="9">FS&amp;S / 01</text>

          <path d="M158 145H211V210H247M158 275H211V210" stroke={forest} strokeWidth="1.2" />
          <circle cx="211" cy="210" r="4" fill={rust} />
          <path d="M239 206L247 210L239 214" stroke={forest} strokeWidth="1.2" />

          <rect x="58" y="115" width="100" height="60" stroke={forest} />
          <path d="M70 127H84V141H70ZM90 127H104V141H90ZM70 147H84V161H70Z" fill={forest} />
          <rect x="90" y="147" width="14" height="14" fill={lime} stroke={forest} strokeWidth=".8" />
          <text x="144" y="163" textAnchor="end" fill={forest} fontFamily={mono} fontSize="8">01</text>
          <text x="58" y="194" fill={forest} fontFamily={mono} fontSize="8" letterSpacing="1.3">EXPLORE</text>

          <rect x="58" y="245" width="100" height="60" fill={lime} stroke={forest} />
          <path d="M72 288L91 259L110 288Z" stroke={forest} strokeWidth="1.1" />
          <circle cx="91" cy="278" r="8" fill={forest} />
          <text x="144" y="293" textAnchor="end" fill={forest} fontFamily={mono} fontSize="8">02</text>
          <text x="58" y="324" fill={forest} fontFamily={mono} fontSize="8" letterSpacing="1.3">PUT INTO PRACTICE</text>

          <circle cx="379" cy="210" r="113" stroke={forest} strokeWidth="45" />
          <path d="M379 97A113 113 0 0 1 492 210" stroke={lime} strokeWidth="45" />
          {Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              d="M379 82V96"
              transform={`rotate(${index * 30} 379 210)`}
              stroke={cream}
              strokeWidth="1"
            />
          ))}
          <circle cx="379" cy="210" r="57" stroke={forest} strokeWidth=".8" />
          <path d="M311 210H447M379 142V278" stroke={forest} strokeWidth=".7" strokeDasharray="2 5" />
          <circle cx="379" cy="210" r="11" fill={rust} />
          <circle cx="379" cy="210" r="3" fill={cream} />
          <path d="M553 115V305M549 115H557M549 210H557M549 305H557" stroke={forest} strokeOpacity=".35" strokeWidth=".7" />
          <text x="40" y="383" fill={forest} fontFamily={mono} fontSize="8" letterSpacing="1.2">LEARNING IS A CONTINUOUS PRACTICE.</text>
          <circle cx="549" cy="380" r="4" fill={rust} />
        </>
      ) : kind === 'development' ? (
        <>
          <rect width="600" height="420" fill={forest} />
          <g stroke="#365249" strokeWidth=".6" strokeOpacity=".55">
            {Array.from({ length: 14 }, (_, index) => (
              <path key={`v-${index}`} d={`M${40 + index * 40} 80V340`} />
            ))}
            {Array.from({ length: 7 }, (_, index) => (
              <path key={`h-${index}`} d={`M40 ${90 + index * 40}H560`} />
            ))}
          </g>
          <text x="40" y="46" fill={cream} fontFamily={mono} fontSize="9" letterSpacing="1.2">AI &amp; MEDIA LITERACY</text>
          <path d="M547 35V49M540 42H554" stroke={lime} strokeWidth="1.2" />

          {Array.from({ length: 9 }, (_, index) => (
            <React.Fragment key={index}>
              <path
                d={`M40 ${126 + index * 20}C128 ${126 + index * 20} 132 ${306 - index * 9} 211 ${306 - index * 9}S297 ${106 + index * 10} 365 210S471 ${112 + index * 18} 560 ${112 + index * 18}`}
                stroke={index % 3 === 0 ? lime : '#9cbea8'}
                strokeWidth={index === 4 ? '1.8' : '.9'}
                strokeOpacity={index % 3 === 0 ? '.95' : '.65'}
              />
              <circle cx="40" cy={126 + index * 20} r="2" fill={index % 3 === 0 ? lime : '#9cbea8'} />
              <circle cx="560" cy={112 + index * 18} r="2" fill={index % 3 === 0 ? lime : '#9cbea8'} />
            </React.Fragment>
          ))}

          <path d="M120 90H168V119" stroke="#719383" strokeWidth=".9" />
          <circle cx="120" cy="90" r="5" fill={lime} />
          <circle cx="120" cy="90" r="11" stroke={lime} strokeOpacity=".4" />
          <circle cx="365" cy="210" r="61" stroke="#97b19d" strokeWidth=".8" strokeDasharray="2 6" />
          <circle cx="365" cy="210" r="45" fill={forest} stroke={lime} strokeWidth="1" />
          <circle cx="365" cy="210" r="31" fill={cream} />
          <circle cx="365" cy="210" r="9" fill={rust} />
          <path d="M365 265V310H443" stroke={lime} strokeWidth=".8" />
          <circle cx="443" cy="310" r="2.5" fill={lime} />
          <text x="365" y="331" fill={cream} fontFamily={mono} fontSize="8" letterSpacing="1.2">HUMAN JUDGEMENT</text>
          <path d="M40 355H560" stroke="#557265" strokeOpacity=".6" />
          <text x="40" y="383" fill={cream} fontFamily={mono} fontSize="8" letterSpacing="1.2">QUESTION. CREATE. VERIFY.</text>
          <text x="560" y="383" textAnchor="end" fill="#a9c3aa" fontFamily={mono} fontSize="8">02 / LITERACY</text>
        </>
      ) : (
        <>
          <rect width="600" height="420" fill={rust} />
          <path d="M40 65H560M40 355H560" stroke={cream} strokeOpacity=".25" />
          <text x="40" y="46" fill={cream} fontFamily={mono} fontSize="9" letterSpacing="1.1">FUTURE SKILLS ECOSYSTEM</text>
          <text x="560" y="46" textAnchor="end" fill={cream} fontFamily={mono} fontSize="9">03 / CONNECT</text>

          <circle cx="300" cy="211" r="137" stroke="#edaa8b" strokeWidth=".7" strokeDasharray="2 5" />
          <ellipse cx="300" cy="211" rx="200" ry="79" transform="rotate(-24 300 211)" stroke={cream} strokeWidth="1.2" />
          <ellipse cx="300" cy="211" rx="200" ry="79" transform="rotate(24 300 211)" stroke={cream} strokeWidth="1.2" />
          <ellipse cx="300" cy="211" rx="130" ry="64" transform="rotate(90 300 211)" stroke={cream} strokeWidth="1.2" />

          <circle cx="300" cy="81" r="21" fill={forest} />
          <path d="M290 81H310M300 71V91" stroke={cream} strokeWidth="1.2" />
          <text x="335" y="84" fill={cream} fontFamily={mono} fontSize="8" letterSpacing="1">EDUCATORS</text>

          <g transform="translate(116 211) rotate(45)">
            <rect x="-22" y="-22" width="44" height="44" fill={cream} />
            <rect x="-9" y="-9" width="18" height="18" stroke={forest} strokeWidth="1.2" />
          </g>
          <text x="69" y="262" fill={cream} fontFamily={mono} fontSize="8" letterSpacing="1">LEARNERS</text>

          <circle cx="484" cy="211" r="29" fill={lime} />
          <path d="M484 182A29 29 0 0 1 484 240Z" fill={forest} />
          <text x="455" y="262" fill={cream} fontFamily={mono} fontSize="8" letterSpacing="1">PRACTICE</text>

          <g transform="translate(300 341) rotate(45)">
            <rect x="-19" y="-19" width="38" height="38" fill={forest} />
            <rect x="-5" y="-5" width="10" height="10" fill={lime} />
          </g>
          <text x="335" y="344" fill={cream} fontFamily={mono} fontSize="8" letterSpacing="1">PATHWAYS</text>

          <circle cx="300" cy="211" r="49" fill={cream} />
          <path d="M268 211H332M300 179V243" stroke={forest} strokeWidth="1" />
          <path d="M300 179A32 32 0 0 1 332 211H300Z" fill={forest} />
          <path d="M268 211H300V243A32 32 0 0 1 268 211Z" fill={forest} />
          <circle cx="300" cy="211" r="8" fill={rust} />
          <circle cx="170" cy="134" r="4" fill={cream} />
          <circle cx="430" cy="288" r="4" fill={cream} />
          <text x="40" y="383" fill={cream} fontFamily={mono} fontSize="8" letterSpacing="1.2">A CONNECTED APPROACH TO LEARNING.</text>
          <text x="560" y="383" textAnchor="end" fill={cream} fontFamily={mono} fontSize="8">KEDMAN GLOBAL</text>
        </>
      )}
    </svg>
  );
}
