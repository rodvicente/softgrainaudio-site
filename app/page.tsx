"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

type Language = "en" | "es";

const maxReferenceFiles = 5;
const maxReferenceSizeMb = 25;
const maxReferenceSizeBytes = maxReferenceSizeMb * 1024 * 1024;
const socialLinks = {
  instagram: "https://www.instagram.com/softgrainaudio",
  linkedin: "https://www.linkedin.com/in/rodvicente/",
};

const copy = {
  en: {
    nav: [
      ["Home", "home"],
      ["How it works", "how-it-works"],
      ["Custom Music", "custom-music"],
      ["Licensing", "licensing"],
      ["Examples", "examples"],
      ["Contact", "contact"],
    ],
    requestMusic: "Request Music",
    hearExamples: "Hear Examples",
    heroEyebrow: "Boutique custom music service",
    heroTitle: "Custom music, made by a real producer.",
    heroText:
      "Original, license-ready music for brands, creators, campaigns and media - shaped around your brief with direct human communication.",
    heroTags: ["Direct briefs", "Custom composition", "Clear usage terms"],
    overlayEyebrow: "Human-made custom music",
    overlayTitle: "Produced directly by Rod Vicente",
    overlayText: "Clear license included",
    processEyebrow: "Process",
    processTitle: "How it works",
    steps: [
      ["Tell us what you need", "Send references, mood, style, length and usage."],
      ["We produce the music", "Original music created around your project."],
      ["Receive a licensed track", "Delivered ready to use in your video, campaign, app or platform."],
    ],
    customEyebrow: "Custom music",
    customTitle: "Music for every project",
    customText:
      "Built for creators, brands, teams and products that need music with a clear purpose and a clean delivery path.",
    categories: [
      ["YouTube & Creators", "Signature openers, beds and loops built for channels and launches."],
      ["Brands & Ads", "Memorable cues for digital campaigns, product spots and identity moments."],
      ["Podcasts", "Intros, transitions and sonic branding for shows with a clean voice."],
      ["Apps & Games", "Adaptive loops, UI moments and immersive audio for interactive products."],
      ["Film & Video", "Custom cues for edits that need emotion, pace and precision."],
      ["Social Campaigns", "Fast, clear music for short-form ideas that need to move now."],
    ],
    whyEyebrow: "Why Softgrain Audio",
    whyTitle: "Boutique production, clear delivery.",
    benefits: [
      "Direct communication",
      "Original music",
      "Fast delivery",
      "Clear licensing",
      "Professional production",
      "Human musical direction",
    ],
    examplesEyebrow: "Examples",
    examplesTitle: "Hear the range",
    examplesText:
      "Reference pieces showing feel, production style and musical direction. These examples are here to frame possibilities, not as a fixed stock catalog.",
    mainMix: "Main mix",
    licensingEyebrow: "Licensing",
    licensingTitle: "Clear licenses. No confusion.",
    licensingText:
      "Every track is delivered with usage terms that make sense for your project, so you can publish, promote and distribute your content with confidence.",
    licenseItems: ["Royalty-free options", "Custom music", "Commercial use", "Simple delivery", "Written license"],
    humanEyebrow: "Human-led custom music",
    humanTitle: "A real composer behind every brief.",
    humanText:
      "Softgrain Audio is not an automatic music generator or an anonymous catalog drop. Each request is interpreted with musical judgment, reference listening, direct communication and a practical understanding of where the track will live.",
    humanLabel: "What you get",
    humanItems: [
      "Brief interpretation and creative direction",
      "Original production shaped around the project",
      "Clear delivery files and written usage terms",
      "A straightforward conversation from idea to handoff",
    ],
    ctaEyebrow: "Request Music",
    ctaTitle: "Need music for your next project?",
    ctaText:
      "Send a brief, reference track or idea. Softgrain Audio will help you turn it into original music ready to use.",
    form: {
      name: "Name",
      country: "Country",
      email: "Email",
      message: "Project / consultation",
      placeholder: "Tell us about the project, mood, length, deadline, usage and references.",
      files: "Reference files",
      send: "Send Request",
      note: "Your request will be sent directly to Softgrain Audio.",
      opening: "Sending your request...",
      ready: "Ready to upload",
      uploading: "Uploading",
      processing: "Processing",
      sent: "Request uploaded. Opening confirmation...",
      error: "The request could not be sent. Please try again.",
      serverError: "Server error. The file may exceed the upload limit configured on the hosting.",
      debugHint: "If this keeps happening, check php-error.log and private_submissions on the hosting.",
      fileEmpty: `Up to ${maxReferenceFiles} files, ${maxReferenceSizeMb} MB total.`,
      fileCount: "Please attach up to 5 files.",
      fileSize: "References can be up to 25 MB total.",
      selected: "selected",
      subject: "Softgrain Audio request",
      project: "Project / consultation:",
      references: "Reference files selected:",
      none: "none",
      attachNote: "Note: reference files are uploaded with this request.",
    },
    footerText: "Custom music, ready to license.",
  },
  es: {
    nav: [
      ["Inicio", "home"],
      ["Cómo funciona", "how-it-works"],
      ["Música a medida", "custom-music"],
      ["Licencias", "licensing"],
      ["Ejemplos", "examples"],
      ["Contacto", "contact"],
    ],
    requestMusic: "Pedir Música",
    hearExamples: "Escuchar Ejemplos",
    heroEyebrow: "Servicio boutique de música a medida",
    heroTitle: "Música original, hecha por un productor real.",
    heroText:
      "Música original y lista para licenciar para marcas, creadores, campañas y medios - creada alrededor de tu brief con comunicación directa y humana.",
    heroTags: ["Brief directo", "Composición a medida", "Licencia clara"],
    overlayEyebrow: "Música personalizada hecha por humanos",
    overlayTitle: "Producida directamente por Rod Vicente",
    overlayText: "Licencia clara incluida",
    processEyebrow: "Proceso",
    processTitle: "Cómo funciona",
    steps: [
      ["Contanos qué necesitás", "Enviá referencias, mood, estilo, duración y uso."],
      ["Producimos la música", "Música original creada alrededor de tu proyecto."],
      ["Recibí un track licenciado", "Entregado listo para usar en tu video, campaña, app o plataforma."],
    ],
    customEyebrow: "Música a medida",
    customTitle: "Música para cada proyecto",
    customText:
      "Pensado para creadores, marcas, equipos y productos que necesitan música con propósito claro y entrega ordenada.",
    categories: [
      ["YouTube & Creadores", "Openers, bases y loops con identidad para canales y lanzamientos."],
      ["Marcas & Ads", "Música memorable para campañas digitales, piezas de producto y momentos de identidad."],
      ["Podcasts", "Intros, transiciones y branding sonoro para contenidos con voz propia."],
      ["Apps & Juegos", "Loops, momentos de interfaz y audio inmersivo para productos interactivos."],
      ["Film & Video", "Cues a medida para ediciones que necesitan emoción, ritmo y precisión."],
      ["Campañas Sociales", "Música rápida y clara para ideas de formato corto que necesitan moverse."],
    ],
    whyEyebrow: "Por qué Softgrain Audio",
    whyTitle: "Producción boutique, entrega clara.",
    benefits: [
      "Comunicación directa",
      "Música original",
      "Entrega rápida",
      "Licencias claras",
      "Producción profesional",
      "Criterio musical humano",
    ],
    examplesEyebrow: "Ejemplos",
    examplesTitle: "Escuchá el rango",
    examplesText:
      "Piezas de referencia para mostrar sensación, estilo de producción y dirección musical. Estos ejemplos sirven para abrir posibilidades, no como un catálogo fijo de venta.",
    mainMix: "Mix principal",
    licensingEyebrow: "Licencias",
    licensingTitle: "Licencias claras. Sin confusión.",
    licensingText:
      "Cada track se entrega con términos de uso pensados para tu proyecto, para que puedas publicar, promocionar y distribuir tu contenido con confianza.",
    licenseItems: ["Opciones royalty-free", "Música a medida", "Uso comercial", "Entrega simple", "Licencia escrita"],
    humanEyebrow: "Música a medida guiada por humanos",
    humanTitle: "Un compositor real detrás de cada brief.",
    humanText:
      "Softgrain Audio no es un generador automático ni un catálogo anónimo. Cada pedido se interpreta con criterio musical, escucha de referencias, comunicación directa y comprensión práctica del lugar donde vivirá la música.",
    humanLabel: "Qué recibís",
    humanItems: [
      "Interpretación del brief y dirección creativa",
      "Producción original diseñada para el proyecto",
      "Archivos de entrega claros y términos de uso por escrito",
      "Una conversación simple desde la idea hasta la entrega",
    ],
    ctaEyebrow: "Pedir Música",
    ctaTitle: "¿Necesitás música para tu próximo proyecto?",
    ctaText:
      "Enviá un brief, una referencia o una idea. Softgrain Audio te ayuda a convertirlo en música original lista para usar.",
    form: {
      name: "Nombre",
      country: "País",
      email: "Email",
      message: "Proyecto / consulta",
      placeholder: "Contanos sobre el proyecto, mood, duración, fecha de entrega, uso y referencias.",
      files: "Archivos de referencia",
      send: "Enviar pedido",
      note: "Tu pedido se enviará directamente a Softgrain Audio.",
      opening: "Enviando tu pedido...",
      ready: "Listo para subir",
      uploading: "Subiendo",
      processing: "Procesando",
      sent: "Pedido subido. Abriendo confirmación...",
      error: "El pedido no pudo enviarse. Por favor intentá de nuevo.",
      serverError: "Error del servidor. Es posible que el archivo supere el límite de subida configurado en el hosting.",
      debugHint: "Si sigue pasando, revisá php-error.log y private_submissions en el hosting.",
      fileEmpty: `Hasta ${maxReferenceFiles} archivos, ${maxReferenceSizeMb} MB en total.`,
      fileCount: "Por favor adjuntá hasta 5 archivos.",
      fileSize: "Las referencias pueden pesar hasta 25 MB en total.",
      selected: "seleccionados",
      subject: "Pedido Softgrain Audio",
      project: "Proyecto / consulta:",
      references: "Archivos de referencia seleccionados:",
      none: "ninguno",
      attachNote: "Nota: los archivos de referencia se suben junto con este pedido.",
    },
    footerText: "Música a medida, lista para licenciar.",
  },
};

const tracks = [
  {
    title: "Jazzy Cool Kid",
    mood: { en: "Cool / Jazzy / Playful", es: "Cool / Jazzy / Juguetón" },
    duration: "1:46",
    tag: "Jazz hop",
    src: "/audio/jazzy-cool-kid-main.mp3",
  },
  {
    title: "Magic Tricks",
    mood: { en: "Quirky / Bright / Curious", es: "Curioso / Luminoso / Divertido" },
    duration: "2:13",
    tag: "Playful",
    src: "/audio/magic-tricks-main.mp3",
  },
  {
    title: "The Remember",
    mood: { en: "Warm / Cinematic / Emotional", es: "Cálido / Cinemático / Emocional" },
    duration: "2:43",
    tag: "Cinematic",
    src: "/audio/the-remember-main.mp3",
  },
  {
    title: "Total Funker",
    mood: { en: "Groovy / Funky / Upbeat", es: "Groovy / Funky / Enérgico" },
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

function LanguageSwitch({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  return (
    <div className="language-switch" aria-label="Language switch">
      <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>
        EN
      </button>
      <button type="button" className={language === "es" ? "active" : ""} onClick={() => setLanguage("es")}>
        ES
      </button>
    </div>
  );
}

function Header({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  const t = copy[language];

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
        {t.nav.map(([label, target]) => (
          <a key={target} href={`#${target}`}>
            {label}
          </a>
        ))}
      </nav>
      <div className="header-tools">
        <LanguageSwitch language={language} setLanguage={setLanguage} />
        <a className="button button-primary header-action" href="#contact">
          {t.requestMusic}
        </a>
      </div>
    </header>
  );
}

function StudioVisual({ language }: { language: Language }) {
  const t = copy[language];

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
        <p>{t.overlayEyebrow}</p>
        <strong>{t.overlayTitle}</strong>
        <span>{t.overlayText}</span>
      </div>
    </div>
  );
}

function Hero({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="hero section-shell" id="home">
      <div className="hero-copy">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1>{t.heroTitle}</h1>
        <p className="hero-text">{t.heroText}</p>
        <div className="hero-tags" aria-label="Service highlights">
          {t.heroTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href="#contact">
            {t.requestMusic}
          </a>
          <a className="button button-secondary" href="#examples">
            {t.hearExamples}
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <StudioVisual language={language} />
      </div>
    </section>
  );
}

function HowItWorks({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="section-shell section-block" id="how-it-works">
      <div className="section-heading">
        <p className="eyebrow">{t.processEyebrow}</p>
        <h2>{t.processTitle}</h2>
      </div>
      <div className="step-grid">
        {t.steps.map(([title, text], index) => (
          <article className="feature-card step-card" key={title}>
            <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="card-icon" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectCategories({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="section-shell section-block" id="custom-music">
      <div className="section-heading wide">
        <p className="eyebrow">{t.customEyebrow}</p>
        <h2>{t.customTitle}</h2>
        <p>{t.customText}</p>
      </div>
      <div className="category-grid">
        {t.categories.map(([title, text]) => (
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

function Benefits({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="benefits-band section-block">
      <div className="section-shell benefits-layout">
        <div>
          <p className="eyebrow">{t.whyEyebrow}</p>
          <h2>{t.whyTitle}</h2>
        </div>
        <div className="benefit-list">
          {t.benefits.map((benefit) => (
            <span key={benefit}>{benefit}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HumanService({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="section-shell human-section section-block">
      <div className="human-copy">
        <p className="eyebrow">{t.humanEyebrow}</p>
        <h2>{t.humanTitle}</h2>
        <p>{t.humanText}</p>
      </div>
      <div className="human-card">
        <span className="human-card-label">{t.humanLabel}</span>
        <ul>
          {t.humanItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
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

function Examples({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="section-shell section-block" id="examples">
      <div className="section-heading">
        <p className="eyebrow">{t.examplesEyebrow}</p>
        <h2>{t.examplesTitle}</h2>
        <p>{t.examplesText}</p>
      </div>
      <div className="track-grid">
        {tracks.map((track) => (
          <article className="track-card" key={track.title}>
            <span className="track-kicker">{t.mainMix}</span>
            <div className="track-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h3>{track.title}</h3>
            <p>{track.mood[language]}</p>
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

function Licensing({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="section-shell license-section section-block" id="licensing">
      <div className="license-copy">
        <p className="eyebrow">{t.licensingEyebrow}</p>
        <h2>{t.licensingTitle}</h2>
        <p>{t.licensingText}</p>
      </div>
      <div className="license-card">
        {t.licenseItems.map((item) => (
          <div key={item}>
            <span />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ language }: { language: Language }) {
  const t = copy[language];
  const [fileMessage, setFileMessage] = useState(t.form.fileEmpty);
  const [formMessage, setFormMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(t.form.ready);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSelectedFiles, setHasSelectedFiles] = useState(false);

  useEffect(() => {
    setFileMessage(t.form.fileEmpty);
    setFormMessage("");
    setUploadProgress(0);
    setUploadStatus(t.form.ready);
    setHasSelectedFiles(false);
  }, [t.form.fileEmpty]);

  const validateFiles = (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

    if (selectedFiles.length > maxReferenceFiles) {
      return t.form.fileCount;
    }

    if (totalSize > maxReferenceSizeBytes) {
      return t.form.fileSize;
    }

    if (!selectedFiles.length) {
      return t.form.fileEmpty;
    }

    return `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} ${t.form.selected}. ${(
      totalSize /
      1024 /
      1024
    ).toFixed(1)} MB total.`;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("referenceFiles[]") as HTMLInputElement | null;
    const files = fileInput?.files ?? null;
    const fileValidation = validateFiles(files);

    if (fileValidation === t.form.fileCount || fileValidation === t.form.fileSize) {
      setFileMessage(fileValidation);
      setFormMessage("");
      return;
    }

    setFormMessage(t.form.opening);
    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadStatus(t.form.uploading);

    const request = new XMLHttpRequest();
    request.open("POST", form.action);
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    request.upload.addEventListener("progress", (uploadEvent) => {
      if (!uploadEvent.lengthComputable) {
        return;
      }

      setUploadProgress(Math.max(1, Math.min(100, Math.round((uploadEvent.loaded / uploadEvent.total) * 100))));

      if (uploadEvent.loaded >= uploadEvent.total) {
        setUploadStatus(t.form.processing);
      }
    });

    request.addEventListener("load", () => {
      setIsSubmitting(false);

      let response: { ok?: boolean; redirect?: string; message?: string } | null = null;

      try {
        response = JSON.parse(request.responseText);
      } catch {
        response = null;
      }

      if (request.status >= 200 && request.status < 300) {
        setUploadProgress(100);
        setFormMessage(t.form.sent);
        window.location.href = response?.redirect || "thanks.html?status=ok&email=sent";
        return;
      }

      setUploadStatus(t.form.error);
      setFormMessage(response?.message || `${t.form.serverError} HTTP ${request.status || "unknown"}. ${t.form.debugHint}`);
    });

    request.addEventListener("error", () => {
      setIsSubmitting(false);
      setUploadStatus(t.form.error);
      setFormMessage(t.form.error);
    });

    request.send(new FormData(form));
  };

  return (
    <section className="cta-section section-shell section-block" id="contact">
      <div className="cta-copy">
        <p className="eyebrow">{t.ctaEyebrow}</p>
        <h2>{t.ctaTitle}</h2>
        <p>{t.ctaText}</p>
      </div>
      <form className="brief-form" action="contact.php" method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
        <input type="hidden" name="language" value={language} />
        <div className="form-grid">
          <label>
            <span>{t.form.name}</span>
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            <span>{t.form.country}</span>
            <input name="country" type="text" autoComplete="country-name" required />
          </label>
        </div>
        <label>
          <span>{t.form.email}</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>{t.form.message}</span>
          <textarea name="message" rows={5} placeholder={t.form.placeholder} required />
        </label>
        <label className="file-field">
          <span>{t.form.files}</span>
          <input
            name="referenceFiles[]"
            type="file"
            multiple
            accept="audio/*,video/*,image/*,.pdf,.txt,.doc,.docx"
            onChange={(event) => {
              setFileMessage(validateFiles(event.currentTarget.files));
              setUploadProgress(0);
              setUploadStatus(t.form.ready);
              setHasSelectedFiles((event.currentTarget.files?.length ?? 0) > 0);
            }}
          />
          <small>{fileMessage}</small>
        </label>
        <div className="upload-progress" hidden={!hasSelectedFiles && !isSubmitting && uploadProgress === 0}>
          <em>{uploadStatus}</em>
          <div className="upload-progress-bar">
            <span style={{ width: `${uploadProgress}%` }} />
          </div>
          <strong>{uploadProgress ? `${uploadProgress}%` : "Ready"}</strong>
        </div>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          {t.form.send}
        </button>
        <p className="form-note">{formMessage || t.form.note}</p>
      </form>
    </section>
  );
}

function Footer({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <footer className="site-footer">
      <div>
        <a className="logo" href="#home">
          <span className="logo-mark" />
          SOFTGRAIN AUDIO
        </a>
        <p>{t.footerText}</p>
      </div>
      <nav aria-label="Footer navigation">
        {t.nav
          .filter(([, target]) => ["home", "how-it-works", "licensing", "examples", "contact"].includes(target))
          .map(([label, target]) => (
            <a key={target} href={`#${target}`}>
              {label}
            </a>
          ))}
      </nav>
      <div className="social-space" aria-label="Social links">
        <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
          IG
        </a>
        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
          IN
        </a>
      </div>
    </footer>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("softgrain-language");

    if (storedLanguage === "en" || storedLanguage === "es") {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("softgrain-language", nextLanguage);
  };

  return (
    <main>
      <Header language={language} setLanguage={handleLanguageChange} />
      <Hero language={language} />
      <HowItWorks language={language} />
      <ProjectCategories language={language} />
      <Benefits language={language} />
      <Examples language={language} />
      <Licensing language={language} />
      <HumanService language={language} />
      <FinalCta language={language} />
      <Footer language={language} />
    </main>
  );
}
