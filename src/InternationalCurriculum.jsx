import React from 'react';
import { profile } from './content';
import { internationalPractice } from './international';
import './international.css';

function PerspectiveMark({ index }) {
  return <svg className="international-mark" viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false">
    {index === 0 ? <>
      <path d="M15 23c10-5 18-5 25 0 7-5 15-5 25 0v36c-10-5-18-5-25 0-7-5-15-5-25 0V23Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M40 23v36M23 31c3-1 6-1 9 0M48 31c3-1 6-1 9 0" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="40" cy="15" r="3" fill="currentColor" />
    </> : index === 1 ? <>
      <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="40" cy="40" rx="12" ry="25" stroke="currentColor" strokeWidth="1.2" transform="rotate(35 40 40)" />
      <path d="m17 30 46 20" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="60" cy="24" r="3" fill="currentColor" />
    </> : <>
      <path d="M17 56 40 16l23 40H17ZM29 56l11-19 11 19M29 36h22" stroke="currentColor" strokeWidth="1.2" />
      <path d="M40 63v7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="40" cy="16" r="3" fill="currentColor" />
    </>}
  </svg>;
}

export default function InternationalCurriculum() {
  const enquiry = `mailto:${profile.email}?subject=${encodeURIComponent('International curriculum collaboration')}`;

  return <section id="international" className="international-section" aria-labelledby="international-title">
    <div className="container international-container">
      <p className="international-kicker">04 / INTERNATIONAL PERSPECTIVES</p>
      <div className="international-heading">
        <h2 id="international-title">Learning,<br /><em>across perspectives.</em></h2>
        <p>{internationalPractice.introduction}</p>
      </div>

      <div className="international-areas">
        {internationalPractice.areas.map((area, index) => <article className="international-area" key={area.title}>
          <div className="international-area-top"><span className="international-index">0{index + 1}</span><PerspectiveMark index={index} /></div>
          <h3>{area.title}</h3>
          <p>{area.summary}</p>
        </article>)}
      </div>

      <div className="international-footer">
        <p className="international-privacy"><span aria-hidden="true" />Public overview · Source documents kept private</p>
        <a className="international-enquiry" href={enquiry}>Let’s talk curriculum <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
      </div>
    </div>
  </section>;
}
