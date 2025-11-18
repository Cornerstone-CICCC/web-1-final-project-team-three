// Home
const EMAILJS_PUBLIC_KEY = "REPLACE_WITH_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "REPLACE_WITH_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "REPLACE_WITH_EMAILJS_TEMPLATE_ID";

const initializeLetsTalkForm = () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log(EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID);
  window.onload = function () {
    document
      .getElementById("letsTalkForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this).then(
          function () {
            console.log("SUCCESS!");
          },
          function (error) {
            console.log("FAILED...", error);
          }
        );
      });
  };
};

const initializeQuoteSlider = () => {
  const slidesContainer = document.querySelector("[data-quote-slides]");
  if (!slidesContainer) return;

  const slides = Array.from(
    slidesContainer.querySelectorAll("[data-quote-slide]")
  );
  if (!slides.length) return;

  let currentIndex =
    slides.findIndex((slide) => slide.classList.contains("is-active")) || 0;

  const applyActiveSlide = (nextIndex) => {
    slides[currentIndex]?.classList.remove("is-active");
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides[currentIndex]?.classList.add("is-active");
  };

  slidesContainer.querySelectorAll("[data-quote-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      applyActiveSlide(currentIndex - 1);
    });
  });

  slidesContainer.querySelectorAll("[data-quote-next]").forEach((button) => {
    button.addEventListener("click", () => {
      applyActiveSlide(currentIndex + 1);
    });
  });

  // Ensure only the current slide is visible on init
  slides.forEach((slide, index) => {
    if (index === currentIndex) {
      slide.classList.add("is-active");
    } else {
      slide.classList.remove("is-active");
    }
  });
};

// DIY Beauty Corner slider + modal
const initializeDIYBeautyCorner = () => {
  const slider = document.querySelector("[data-diy-slider]");
  const modal = document.querySelector("[data-video-modal]");
  if (!slider || !modal) return;

  const track = slider.querySelector("[data-diy-track]");
  const cards = Array.from(track.querySelectorAll(".video-card"));
  const prevBtn = slider.querySelector("[data-diy-prev]");
  const nextBtn = slider.querySelector("[data-diy-next]");
  const modalFrame = modal.querySelector("[data-video-frame]");
  const closeBtn = modal.querySelector("[data-video-close]");
  const mq = window.matchMedia("(max-width: 820px)");
  let currentIndex = 0;
  let isProgrammaticScroll = false;
  let programmaticScrollTimeoutId = null;

  const isMobile = () => mq.matches;

  const clampIndex = (index) => {
    const total = cards.length;
    if (!total) return 0;
    if (index < 0) return total - 1;
    if (index >= total) return 0;
    return index;
  };

  const getCardWidth = () => {
    const card = cards[0];
    if (!card) {
      return track.clientWidth;
    }
    return card.getBoundingClientRect().width;
  };

  const clearProgrammaticScrollTimeout = () => {
    if (programmaticScrollTimeoutId) {
      window.clearTimeout(programmaticScrollTimeoutId);
      programmaticScrollTimeoutId = null;
    }
  };

  const stopProgrammaticScroll = () => {
    clearProgrammaticScrollTimeout();
    isProgrammaticScroll = false;
  };

  const scrollToIndex = (index, { smooth = true } = {}) => {
    if (!isMobile()) return;
    const cardWidth = getCardWidth();
    if (!cardWidth) return;

    const targetLeft = index * cardWidth;
    isProgrammaticScroll = true;

    if (typeof track.scrollTo === "function") {
      track.scrollTo({
        left: targetLeft,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      track.scrollLeft = targetLeft;
    }

    clearProgrammaticScrollTimeout();
    programmaticScrollTimeoutId = window.setTimeout(
      () => {
        isProgrammaticScroll = false;
        programmaticScrollTimeoutId = null;
      },
      smooth ? 350 : 50
    );
  };

  const goToSlide = (nextIndex, options) => {
    if (!isMobile()) return;
    currentIndex = clampIndex(nextIndex);
    scrollToIndex(currentIndex, options);
  };

  const handlePrev = () => goToSlide(currentIndex - 1);
  const handleNext = () => goToSlide(currentIndex + 1);

  prevBtn?.addEventListener("click", handlePrev);
  nextBtn?.addEventListener("click", handleNext);

  const handleScroll = () => {
    if (!isMobile() || isProgrammaticScroll) return;
    const cardWidth = getCardWidth();
    if (!cardWidth) return;

    const rawIndex = Math.round(track.scrollLeft / cardWidth);
    currentIndex = clampIndex(rawIndex);
  };

  track.addEventListener("scroll", handleScroll, { passive: true });

  const handleMediaChange = () => {
    stopProgrammaticScroll();
    track.style.removeProperty("transform");

    if (!isMobile()) {
      currentIndex = 0;
      if (typeof track.scrollTo === "function") {
        track.scrollTo({ left: 0, behavior: "auto" });
      } else {
        track.scrollLeft = 0;
      }
      return;
    }

    currentIndex = clampIndex(currentIndex);
    scrollToIndex(currentIndex, { smooth: false });
  };

  mq.addEventListener("change", handleMediaChange);

  const handleResize = () => {
    if (!isMobile()) return;
    scrollToIndex(currentIndex, { smooth: false });
  };

  window.addEventListener("resize", handleResize);

  handleMediaChange();

  const openModal = (videoUrl) => {
    const url = `${videoUrl}?autoplay=1&rel=0`;
    modalFrame?.setAttribute("src", url);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modalFrame?.setAttribute("src", "");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const videoUrl = card.getAttribute("data-video");
      if (videoUrl) {
        openModal(videoUrl);
      }
    });
  });

  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initializeLetsTalkForm();
  initializeDIYBeautyCorner();
  initializeQuoteSlider();
});

// Portfolio

// Service

// About
