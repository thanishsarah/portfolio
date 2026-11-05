import React from 'react';

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
      {kind === 'design' ? (
        <>
          <circle cx="467" cy="112" r="58" fill="#B7ADF0" />
          <circle cx="130" cy="302" r="49" stroke="#C4BAF0" strokeWidth="1.5" />
          <circle cx="130" cy="302" r="33" stroke="#C4BAF0" strokeWidth="1.5" />
          <g transform="translate(178 41) rotate(8 126 162)">
            <rect x="8" y="10" width="252" height="326" rx="2" fill="#423475" opacity=".11" />
            <rect width="252" height="326" rx="2" fill="#352A65" />
            <path d="M20 29H232" stroke="#A89ACF" strokeWidth=".7" />
            <text x="20" y="21" fill="#E4DDF8" fontFamily="Arial, sans-serif" fontSize="6.5" letterSpacing="1.1">FUTURE SKILLS &amp; SUSTAINABILITY</text>
            <text x="20" y="80" fill="#F3EFFF" fontFamily="Arial, sans-serif" fontSize="29" fontWeight="700" letterSpacing="-1.2">MEDIA SHALA</text>
            <circle cx="126" cy="179" r="71" fill="#B7A7EB" />
            <path d="M55 179H197A71 71 0 0 1 55 179Z" fill="#F2E9D6" />
            <circle cx="126" cy="179" r="34" fill="#352A65" />
            <path d="M126 108V250M55 179H197" stroke="#352A65" strokeWidth="1.2" />
            <path d="M20 277H232" stroke="#A89ACF" strokeWidth=".7" />
            <text x="20" y="296" fill="#E4DDF8" fontFamily="Arial, sans-serif" fontSize="8" letterSpacing="1.2">LEARNING FOR WHAT’S NEXT.</text>
            <text x="232" y="315" textAnchor="end" fill="#C5B9E3" fontFamily="Arial, sans-serif" fontSize="7">CURRICULUM ILLUSTRATION</text>
          </g>
          <g transform="translate(73 216) rotate(-12 70 58)">
            <rect x="4" y="5" width="147" height="112" rx="2" fill="#423475" opacity=".12" />
            <rect width="147" height="112" rx="2" fill="#F8F4E9" />
            <text x="14" y="24" fill="#352A65" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" letterSpacing="-.4">MEDIA SHALA</text>
            <path d="M14 35H133" stroke="#C6BED8" strokeWidth=".8" />
            <circle cx="104" cy="72" r="25" fill="#B7A7EB" />
            <path d="M79 72H129A25 25 0 0 1 79 72Z" fill="#352A65" />
            <path d="M14 63H54M14 70H45M14 91H31" stroke="#8E84A5" strokeWidth="2" />
          </g>
          <path d="M468 264V294M453 279H483" stroke="#8070AF" strokeWidth="1.5" />
          <circle cx="476" cy="328" r="4" fill="#8070AF" />
        </>
      ) : kind === 'development' ? (
        <>
          <circle cx="103" cy="122" r="51" stroke="#DB9E80" strokeWidth="1.5" />
          <circle cx="495" cy="304" r="66" fill="#E3A180" opacity=".55" />
          <g transform="translate(74 65) rotate(-3 226 144)">
            <rect x="9" y="13" width="452" height="288" rx="10" fill="#87462E" opacity=".12" />
            <rect width="452" height="288" rx="10" fill="#FBF6EC" />
            <path d="M10 0H442A10 10 0 0 1 452 10V35H0V10A10 10 0 0 1 10 0Z" fill="#F0E6D7" />
            <circle cx="17" cy="18" r="3" fill="#D17A60" />
            <circle cx="29" cy="18" r="3" fill="#D7B27A" />
            <circle cx="41" cy="18" r="3" fill="#A6B398" />
            <rect x="170" y="10" width="112" height="15" rx="4" fill="#FBF6EC" />
            <text x="226" y="20.5" textAnchor="middle" fill="#9C8E7B" fontFamily="Arial, sans-serif" fontSize="6">educator workflow · illustration</text>
            <path d="M109 35V288" stroke="#E9E0D2" />
            <rect x="16" y="55" width="20" height="20" rx="6" fill="#B45D3E" />
            <path d="M22 70V61L30 70V61" stroke="#FFF6E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="43" y="68" fill="#473C31" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="700">Learning Lab</text>
            <rect x="10" y="96" width="90" height="24" rx="4" fill="#EDDBCA" />
            <rect x="20" y="104" width="7" height="7" rx="1" stroke="#B45D3E" />
            <text x="35" y="111" fill="#8D4E35" fontFamily="Arial, sans-serif" fontSize="8">Workflows</text>
            <circle cx="23" cy="138" r="3" stroke="#A99A86" />
            <text x="35" y="141" fill="#9A8A75" fontFamily="Arial, sans-serif" fontSize="8">Guidelines</text>
            <path d="M20 164H27M23.5 160.5V167.5" stroke="#A99A86" />
            <text x="35" y="167" fill="#9A8A75" fontFamily="Arial, sans-serif" fontSize="8">Resources</text>
            <text x="130" y="73" fill="#473C31" fontFamily="Georgia, serif" fontSize="24">Learn. Create. Verify.</text>
            <text x="131" y="91" fill="#9A8A75" fontFamily="Arial, sans-serif" fontSize="7.5">AI &amp; digital media literacy for educators.</text>
            <rect x="377" y="56" width="53" height="22" rx="5" fill="#B45D3E" />
            <text x="403.5" y="70" textAnchor="middle" fill="#FFF8ED" fontFamily="Arial, sans-serif" fontSize="7">AI literacy</text>
            <rect x="131" y="113" width="144" height="145" rx="5" fill="#E8C4A9" />
            <path d="M148 132H166M148 138H159" stroke="#BC8363" strokeWidth="2" />
            <text x="148" y="163" fill="#6A4837" fontFamily="Georgia, serif" fontSize="17">Kaushal Bodh</text>
            <path d="M148 180H256M148 187H250M148 194H232" stroke="#C79B7B" strokeWidth="2" />
            <path d="M183 227C183 209 208 209 208 227C208 242 231 243 231 225" stroke="#9D6549" strokeWidth="1.4" strokeLinecap="round" />
            <rect x="287" y="113" width="143" height="89" rx="5" fill="#E9E8D6" />
            <text x="302" y="136" fill="#5D6249" fontFamily="Georgia, serif" fontSize="14">Fact-checking</text>
            <path d="M303 151H413M303 158H399M303 165H405" stroke="#B7BA9B" strokeWidth="2" />
            <circle cx="307" cy="183" r="3" fill="#A2A986" />
            <circle cx="319" cy="183" r="3" fill="#C8B38B" />
            <rect x="287" y="214" width="143" height="44" rx="5" stroke="#DED2C0" strokeDasharray="3 3" />
            <path d="M352 236H364M358 230V242" stroke="#C0AE96" strokeWidth="1.3" />
          </g>
          <path d="M113 346H158M113 353H141" stroke="#C77F5E" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <ellipse cx="300" cy="210" rx="211" ry="137" stroke="#A5B6A0" strokeWidth="1" transform="rotate(-18 300 210)" />
          <ellipse cx="300" cy="210" rx="182" ry="154" stroke="#AFBEA9" strokeWidth="1" transform="rotate(24 300 210)" />
          <path d="M300 45V375M117 210H483" stroke="#B8C5AF" strokeWidth=".8" strokeDasharray="3 6" />
          {Array.from({ length: 12 }, (_, index) => (
            <ellipse
              key={index}
              cx="300"
              cy="145"
              rx="35"
              ry="80"
              transform={`rotate(${index * 30} 300 210)`}
              fill={index % 2 === 0 ? '#6E876B' : '#91A487'}
              fillOpacity=".72"
              stroke="#587451"
              strokeWidth=".8"
            />
          ))}
          <circle cx="300" cy="210" r="49" fill="#E5E8CF" />
          <circle cx="300" cy="210" r="39" stroke="#657B5F" strokeWidth="1" />
          <circle cx="300" cy="210" r="27" stroke="#8B9D7D" strokeWidth=".8" />
          <circle cx="300" cy="210" r="8" fill="#526B4E" />
          <circle cx="105" cy="259" r="9" fill="#496445" />
          <circle cx="478" cy="132" r="6" fill="#D9C58F" />
          <circle cx="425" cy="341" r="4" fill="#78916F" />
          <circle cx="165" cy="81" r="3" fill="#78916F" />
          <path d="M466 290V310M456 300H476" stroke="#7B9271" strokeWidth="1.2" />
          <text x="61" y="363" fill="#597052" fontFamily="Arial, sans-serif" fontSize="8" letterSpacing="2">FUTURE SKILLS</text>
          <text x="539" y="363" textAnchor="end" fill="#7C9073" fontFamily="Arial, sans-serif" fontSize="8" letterSpacing="1">KEDMAN GLOBAL</text>
        </>
      )}
    </svg>
  );
}
