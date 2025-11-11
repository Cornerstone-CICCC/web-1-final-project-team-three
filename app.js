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

document.addEventListener("DOMContentLoaded", () => {
  initializeLetsTalkForm();
});

// Portfolio

// Service

// About
