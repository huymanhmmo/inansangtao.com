'use client';

import { Children, useEffect, useState } from 'react';

export default function OwlCarousel({ children, className = '', items = 1, interval = 5000, nav = true, dots = false, responsive = false, loop = true }) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(items);
  useEffect(() => {
    if (!responsive) return;
    const update = () => setVisible(window.innerWidth < 600 ? 1 : window.innerWidth < 1000 ? 3 : items);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [items, responsive]);
  useEffect(() => {
    if (slides.length <= visible || interval <= 0) return;
    const timer = window.setInterval(() => setIndex((current) => current >= slides.length - visible ? (loop ? 0 : current) : current + 1), interval);
    return () => window.clearInterval(timer);
  }, [slides.length, visible, interval, loop]);
  const maxIndex = Math.max(0, slides.length - visible);
  const move = (direction) => setIndex((current) => {
    const next = current + direction;
    if (next < 0) return loop ? maxIndex : 0;
    if (next > maxIndex) return loop ? 0 : maxIndex;
    return next;
  });
  return <div className={`owl-carousel owl-theme owl-loaded owl-drag legacy-carousel ${className}`}>
    <div className="owl-stage-outer"><div className="owl-stage" style={{ width: `${slides.length * 100 / visible}%`, transform: `translate3d(-${index * 100 / slides.length}%,0,0)` }}>
      {slides.map((slide, slideIndex) => <div className="owl-item" style={{ flex: `0 0 ${100 / slides.length}%` }} key={slide.key ?? slideIndex}>{slide}</div>)}
    </div></div>
    {nav && slides.length > visible && <div className="owl-nav"><button type="button" className="owl-prev" aria-label="Previous" onClick={() => move(-1)}>‹</button><button type="button" className="owl-next" aria-label="Next" onClick={() => move(1)}>›</button></div>}
    {dots && <div className="owl-dots">{slides.map((_, dot) => <button type="button" key={dot} className={`owl-dot${Math.min(index, slides.length - 1) === dot ? ' active' : ''}`} aria-label={`Slide ${dot + 1}`} onClick={() => setIndex(Math.min(dot, maxIndex))}><span /></button>)}</div>}
  </div>;
}
