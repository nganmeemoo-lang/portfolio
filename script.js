import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOpNRjz7QAmFk5ET2U0Vs60YZ9Gz73rhI",
  authDomain: "tlocportfolio.firebaseapp.com",
  projectId: "tlocportfolio",
  storageBucket: "tlocportfolio.firebasestorage.app",
  messagingSenderId: "1070516508225",
  appId: "1:1070516508225:web:3f6cccba09b0d5e1ee98c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

 /* =====================================================
     1. BACKGROUND MUSIC — plays the visitor's own MP3 file
        (assets/background-music.mp3), auto-plays and loops.
  ===================================================== */
  const bgMusic = document.getElementById("bgMusic");
  const soundToggle = document.getElementById("soundToggle");
  const soundIcon = document.getElementById("soundIcon");
  let musicStarted = false;
  let musicMuted = false;

  function trySetVolume() {
    if (!bgMusic) return;
    bgMusic.volume = 0; // start silent, fade in once playback begins
  }
  trySetVolume();

  function fadeIn() {
    if (!bgMusic || musicMuted) return;
    const target = 0.5;
    const step = () => {
      if (bgMusic.volume < target - 0.02) {
        bgMusic.volume = Math.min(target, bgMusic.volume + 0.03);
        requestAnimationFrame(step);
      } else {
        bgMusic.volume = target;
      }
    };
    step();
  }

  function tryStartMusic() {
    if (!bgMusic || musicStarted) return;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicStarted = true;
          fadeIn();
        })
        .catch(() => {
          // Autoplay was blocked; stay silent until the next user gesture.
        });
    }
  }

  // Try immediately on load...
  if (document.readyState === "complete" || document.readyState === "interactive") {
    tryStartMusic();
  } else {
    window.addEventListener("DOMContentLoaded", tryStartMusic, { once: true });
  }
  // ...and again on the visitor's first interaction, to satisfy browsers
  // that block audio autoplay until a user gesture occurs.
  ["pointerdown", "keydown", "touchstart", "scroll"].forEach((evt) => {
    window.addEventListener(evt, tryStartMusic, { once: true, passive: true });
  });

  if (soundToggle && bgMusic) {
    soundToggle.addEventListener("click", () => {
      musicMuted = !musicMuted;
      if (musicMuted) {
        bgMusic.volume = 0;
      } else {
        if (bgMusic.paused) tryStartMusic();
        fadeIn();
      }
      soundToggle.setAttribute("aria-pressed", String(!musicMuted));
      soundIcon.textContent = musicMuted ? "×" : "♪";
    });
  }

  /* =====================================================
  /* =====================================================
     2. SMOOTH ANCHOR SCROLL
  ===================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  /* =====================================================
     3. SCROLL-DRIVEN SPINE FILL (rAF-throttled, passive)
  ===================================================== */
  const spineFill = document.getElementById("spineFill");
  let ticking = false;

  function updateSpine() {
    ticking = false;
    if (!spineFill) return;
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
    spineFill.style.height = (ratio * 100) + "%";
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateSpine);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateSpine();

  /* =====================================================
     4. REVEAL-ON-SCROLL (IntersectionObserver, one-shot)
  ===================================================== */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* =====================================================
     5. SKILL BAR FILL — animate width once visible
  ===================================================== */
  const skillFills = document.querySelectorAll(".skillbar__fill");
  if ("IntersectionObserver" in window) {
    const skillIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-filled");
            skillIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillFills.forEach((el) => skillIo.observe(el));
  } else {
    skillFills.forEach((el) => el.classList.add("is-filled"));
  }

  /* =====================================================
     6. HERO CANVAS — lightweight particle field
  ===================================================== */
  const canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReducedMotion) {
    const gl = canvas.getContext("2d");
    let width, height, dpr;
    let particles = [];
    let rafId = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      gl.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      const count = Math.round((width * height) / 22000);
      particles = Array.from({ length: Math.min(count, 90) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15,
      }));
    }

    function draw() {
      gl.clearRect(0, 0, width, height);
      gl.fillStyle = "#5b9dff";
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        gl.globalAlpha = p.a;
        gl.beginPath();
        gl.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        gl.fill();
      });
      gl.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    let resizeTimer;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
      },
      { passive: true }
    );

    // Pause the animation when the hero is off-screen to save cycles.
    const heroSection = document.getElementById("hero");
    if ("IntersectionObserver" in window && heroSection) {
      const heroIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!rafId) draw();
          } else if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      });
      heroIo.observe(heroSection);
    }

    resize();
    draw();
  }

 /* =====================================================
   7. CONTACT FORM → FIRESTORE
===================================================== */
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      if (status) {
        status.textContent = "Please fill in all fields.";
      }
      return;
    }

    if (status) {
      status.textContent = "Sending...";
    }

    try {
      await addDoc(collection(db, "messages"), {
        name: name,
        email: email,
        message: message,
        createdAt: serverTimestamp()
      });

      if (status) {
        status.textContent = "✅ Tin nhắn đã gửi thành công !";
      }

      form.reset();

    } catch (error) {
      console.error("Firestore error:", error);

      if (status) {
        status.textContent = "❌ Tin nhắn không thể gửi do quá tải hệ thống.";
      }
    }
  });
}
  /* =====================================================
     8. MISC
  ===================================================== */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
