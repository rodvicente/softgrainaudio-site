"use client";

import { useRef, useState } from "react";

const navItems = ["Home", "How it works", "Custom Music", "Licensing", "Examples", "Contact"];

const steps = [
  {
    title: "Tell us what you need",
    text: "Send references, mood, style, length and usage.",
  },
  {
    title: "We produce the music",
    text: "Original music created around your project.",
  },
  {
    title: "Receive a licensed track",
    text: "Delivered ready to use in your video, campaign, app or platform.",
  },
];

const categories = [
  ["YouTube & Creators", "Signature openers, beds and loops built for channels and launches."],
  ["Brands & Ads", "Memorable cues for digital campaigns, product spots and identity moments."],
  ["Podcasts", "Intros, transitions and sonic branding for shows with a clean voice."],
  ["Apps & Games", "Adaptive loops, UI moments and immersive audio for interactive products."],
  ["Film & Video", "Custom cues for edits that need emotion, pace and precision."],
  ["Social Campaigns", "Fast, clear music for short-form ideas that need to move now."],
];

const benefits = [
  "Direct communication",
  "Original music",
  "Fast delivery",
  "Clear licensing",
  "Professional production",
  "Human musical direction",
];

const tracks = [
  {
    title: "Jazzy Cool Kid",
    mood: "Cool / Jazzy / Playful",
    duration: "1:46",
    tag: "Jazz hop",
    src: "/audio/jazzy-cool-kid-main.mp3",
  },
  {
    title: "Magic Tricks",
    mood: "Quirky / Bright / Curious",
    duration: "2:13",
    tag: "Playful",
    src: "/audio/magic-tricks-main.mp3",
  },
  {
    title: "The Remember",
    mood: "Warm / Cinematic / Emotional",
    duration: "2:43",
    tag: "Cinematic",
    src: "/audio/the-remember-main.mp3",
  },
  {
    title: "Total Funker",
    mood: "Groovy / Funky / Upbeat",
    duration: "2:13",
    tag: "Funk",
    src: "/audio/total-funker-main.mp3",
  },
];

const waveformBars = Array.from({ length: 82 }, (_, index) => {
  const wave = Math.sin(index * 0.54) * 0.5 + Math.sin(index * 1.17) * 0.28 + 0.5;
  return Math.max(14, Math.min(46, Math.round(18 + wave * 24)));
});

function formatTime(value: number) {
  if (!Number.isFinite(value)) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function Header() {
  return (
    <header className="site-header">
      <a className="logo" href="#home" aria-label="Softgrain Audio home">
        <span className="logo-mark" />
        SOFTGRAIN AUDIO
      </a>
      <input className="nav-toggle" type="checkbox" id="nav-toggle" aria-label="Toggle navigation" />
      <label className="nav-button" htmlFor="nav-toggle">
        <span />
        <span />
        <span />
      </label>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
            {item}
          </a>
        ))}
      </nav>
      <a className="button button-primary header-action" href="#contact">
        Request Music
      </a>
    </header>
  );
}

function StudioVisual() {
  return (
    <div className="studio-visual" aria-label="Boutique studio visual placeholder">
      <div className="studio-image">
        <div className="studio-light" />
        <div className="studio-console" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="studio-wave" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="studio-overlay">
        <p>Human-made custom music</p>
        <strong>Produced directly by Rod Vicente</strong>
        <span>Clear license included</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section-shell" id="home">
      <div className="hero-copy">
        <p className="eyebrow">Boutique custom music service</p>
        <h1>Custom music, made by a real producer.</h1>
        <p className="hero-text">
          Original, license-ready music for brands, creators, campaigns and media - shaped around
          your brief with direct human communication.
        </p>
        <div className="hero-tags" aria-label="Service highlights">
          <span>Direct briefs</span>
          <span>Custom composition</span>
          <span>Clear usage terms</span>
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href="#contact">
            Request Music
          </a>
          <a className="button button-secondary" href="#examples">
            Hear Examples
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <StudioVisual />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section-shell section-block" id="how-it-works">
      <div className="section-heading">
        <p className="eyebrow">Process</p>
        <h2>How it works</h2>
      </div>
      <div className="step-grid">
        {steps.map((step, index) => (
          <article className="feature-card step-card" key={step.title}>
            <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="card-icon" />
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectCategories() {
  return (
    <section className="section-shell section-block" id="custom-music">
      <div className="section-heading wide">
        <p className="eyebrow">Custom music</p>
        <h2>Music for every project</h2>
        <p>
          Built for creators, brands, teams and products that need music with a clear purpose and a
          clean delivery path.
        </p>
      </div>
      <div className="category-grid">
        {categories.map(([title, text]) => (
          <article className="feature-card category-card" key={title}>
            <div className="mini-wave" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="benefits-band section-block">
      <div className="section-shell benefits-layout">
        <div>
          <p className="eyebrow">Why Softgrain Audio</p>
          <h2>Boutique production, clear delivery.</h2>
        </div>
        <div className="benefit-list">
          {benefits.map((benefit) => (
            <span key={benefit}>{benefit}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HumanService() {
  return (
    <section className="section-shell human-section section-block">
      <div className="human-copy">
        <p className="eyebrow">Human-led custom music</p>
        <h2>A real composer behind every brief.</h2>
        <p>
          Softgrain Audio is not an automatic music generator or an anonymous catalog drop. Each
          request is interpreted with musical judgment, reference listening, direct communication and
          a practical understanding of where the track will live.
        </p>
      </div>
      <div className="human-card">
        <span className="human-card-label">What you get</span>
        <ul>
          <li>Brief interpretation and creative direction</li>
          <li>Original production shaped around the project</li>
          <li>Clear delivery files and written usage terms</li>
          <li>A straightforward conversation from idea to handoff</li>
        </ul>
      </div>
    </section>
  );
}

function TrackPlayer({ track }: { track: (typeof tracks)[number] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      document.querySelectorAll("audio.track-source").forEach((element) => {
        if (element !== audio) {
          element.pause();
        }
      });

      await audio.play();
    } else {
      audio.pause();
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className={`custom-player ${isPlaying ? "is-playing" : ""}`}>
      <button
        className="custom-play"
        type="button"
        aria-label={`${isPlaying ? "Pause" : "Play"} ${track.title}`}
        onClick={togglePlayback}
      >
        <span />
      </button>
      <div className="player-main">
        <div className="player-topline">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : track.duration}</span>
        </div>
        <div className="player-wave" aria-hidden="true">
          <div className="player-wave-progress" style={{ width: `${progress * 100}%` }} />
          {waveformBars.map((height, index) => (
            <i key={`${track.title}-${index}`} style={{ height }} />
          ))}
        </div>
      </div>
      <audio
        ref={audioRef}
        className="track-source"
        preload="metadata"
        src={track.src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
    </div>
  );
}

function Examples() {
  return (
    <section className="section-shell section-block" id="examples">
      <div className="section-heading">
        <p className="eyebrow">Examples</p>
        <h2>Hear the range</h2>
        <p>
          Reference pieces showing feel, production style and musical direction. These examples are
          here to frame possibilities, not as a fixed stock catalog.
        </p>
      </div>
      <div className="track-grid">
        {tracks.map((track) => (
          <article className="track-card" key={track.title}>
            <span className="track-kicker">Main mix</span>
            <div className="track-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h3>{track.title}</h3>
            <p>{track.mood}</p>
            <TrackPlayer track={track} />
            <div className="track-meta">
              <span>{track.duration}</span>
              <strong>{track.tag}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Licensing() {
  return (
    <section className="section-shell license-section section-block" id="licensing">
      <div className="license-copy">
        <p className="eyebrow">Licensing</p>
        <h2>Clear licenses. No confusion.</h2>
        <p>
          Every track is delivered with usage terms that make sense for your project, so you can
          publish, promote and distribute your content with confidence.
        </p>
      </div>
      <div className="license-card">
        {["Royalty-free options", "Custom music", "Commercial use", "Simple delivery", "Written license"].map(
          (item) => (
            <div key={item}>
              <span />
              {item}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="cta-section section-shell section-block" id="contact">
      <p className="eyebrow">Request Music</p>
      <h2>Need music for your next project?</h2>
      <p>
        Send a brief, reference track or idea. Softgrain Audio will help you turn it into original
        music ready to use.
      </p>
      <a className="button button-primary" href="mailto:hello@softgrainaudio.com">
        Request Music
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <a className="logo" href="#home">
          <span className="logo-mark" />
          SOFTGRAIN AUDIO
        </a>
        <p>Custom music, ready to license.</p>
      </div>
      <nav aria-label="Footer navigation">
        {["Home", "How it works", "Licensing", "Examples", "Contact"].map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
            {item}
          </a>
        ))}
      </nav>
      <div className="social-space" aria-label="Social links placeholder">
        <span />
        <span />
        <span />
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <HowItWorks />
      <ProjectCategories />
      <Benefits />
      <Examples />
      <Licensing />
      <HumanService />
      <FinalCta />
      <Footer />
    </main>
  );
}
