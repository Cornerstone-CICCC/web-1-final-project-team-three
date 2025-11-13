// Home
const EMAILJS_PUBLIC_KEY = "REPLACE_WITH_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "REPLACE_WITH_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "REPLACE_WITH_EMAILJS_TEMPLATE_ID";

const configureEmailJS = () => {
  if (!window.emailjs) {
    console.error(
      "EmailJS SDK not found. Ensure the CDN script is loaded before app.js."
    );
    return false;
  }

  const placeholders = [
    EMAILJS_PUBLIC_KEY,
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
  ];

  const hasPlaceholders = placeholders.some((value) =>
    value.includes("REPLACE_WITH_EMAILJS")
  );

  if (hasPlaceholders) {
    console.warn(
      "EmailJS keys are not configured. Update EMAILJS_* constants in app.js before deploying."
    );
    return false;
  }

  window.emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
  });

  return true;
};

const initializeLetsTalkForm = () => {
  const form = document.getElementById("letsTalkForm");
  if (!form) return;

  const feedbackEl = form.querySelector(".form-feedback");
  const submitButton = form.querySelector('button[type="submit"]');
  const eventDateInput = form.querySelector('input[name="eventDate"]');
  const eventDateUndecided = form.querySelector(
    'input[name="eventDateUndecided"]'
  );
  const eventTimeSelect = form.querySelector('select[name="eventTime"]');
  const eventTimeUndecided = form.querySelector(
    'input[name="eventTimeUndecided"]'
  );
  const contactRadios = form.querySelectorAll('input[name="contactMethod"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const countryCodeSelect = form.querySelector('select[name="countryCode"]');

  const emailIsReady = configureEmailJS();

  const setFieldDisabled = (input, isDisabled) => {
    if (!input) return;
    input.disabled = isDisabled;
    const field = input.closest(".field");
    if (field) {
      field.classList.toggle("is-disabled", isDisabled);
    }
    if (isDisabled && "value" in input) {
      input.value = "";
    }
  };

  const handleEventDateToggle = () => {
    const shouldDisable = eventDateUndecided?.checked ?? false;
    setFieldDisabled(eventDateInput, shouldDisable);
  };

  const handleEventTimeToggle = () => {
    const shouldDisable = eventTimeUndecided?.checked ?? false;
    setFieldDisabled(eventTimeSelect, shouldDisable);
    if (!shouldDisable && eventTimeSelect && !eventTimeSelect.value) {
      eventTimeSelect.value = eventTimeSelect.options[0]?.value ?? "";
    }
  };

  const updatePhoneRequirement = () => {
    if (!phoneInput) return;
    const selected = form.querySelector('input[name="contactMethod"]:checked');
    const needsPhone = selected?.value === "Call";
    phoneInput.required = Boolean(needsPhone);
    if (needsPhone) {
      phoneInput.setAttribute("aria-required", "true");
    } else {
      phoneInput.removeAttribute("aria-required");
    }
  };

  const setFeedback = (type, message) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.classList.remove("is-success", "is-error");
    if (type === "success") {
      feedbackEl.classList.add("is-success");
    } else if (type === "error") {
      feedbackEl.classList.add("is-error");
    }
  };

  handleEventDateToggle();
  handleEventTimeToggle();
  updatePhoneRequirement();

  eventDateUndecided?.addEventListener("change", handleEventDateToggle);
  eventTimeUndecided?.addEventListener("change", handleEventTimeToggle);
  contactRadios.forEach((radio) =>
    radio.addEventListener("change", updatePhoneRequirement)
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setFeedback("error", "Please complete the required fields.");
      return;
    }

    const selectedContact =
      form.querySelector('input[name="contactMethod"]:checked')?.value ??
      "Call";
    const sanitizedPhone = phoneInput ? phoneInput.value.trim() : "";

    if (selectedContact === "Call" && !sanitizedPhone && phoneInput) {
      setFeedback(
        "error",
        "Please provide your phone number so we can call you."
      );
      phoneInput.focus();
      return;
    }

    const isConfigured = emailIsReady && Boolean(window.emailjs);
    if (!isConfigured) {
      setFeedback(
        "error",
        "We’re setting up our booking form. Please reach out directly while we finish configuring it."
      );
      return;
    }

    const templateParams = {
      event_type: form.eventType.value,
      event_date: eventDateUndecided?.checked
        ? "Not decided"
        : eventDateInput?.value || "Not provided",
      event_time: eventTimeUndecided?.checked
        ? "Not decided"
        : eventTimeSelect?.value || "Not provided",
      name: form.name.value,
      contact_method: selectedContact,
      phone_number:
        selectedContact === "Call" && sanitizedPhone
          ? `${countryCodeSelect?.value ?? ""} ${sanitizedPhone}`
          : "Not provided",
      submitted_at: new Date().toISOString(),
    };

    try {
      submitButton?.setAttribute("aria-busy", "true");
      submitButton?.setAttribute("disabled", "disabled");
      setFeedback("success", "Sending your message…");

      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      setFeedback(
        "success",
        "Thank you! Your request has been sent. We’ll get back to you shortly."
      );
      form.reset();
      handleEventDateToggle();
      handleEventTimeToggle();
      updatePhoneRequirement();
    } catch (error) {
      console.error("EmailJS submission failed:", error);
      setFeedback(
        "error",
        "Oops! Something went wrong. Please try again in a moment."
      );
    } finally {
      submitButton?.removeAttribute("aria-busy");
      submitButton?.removeAttribute("disabled");
    }
  });
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
