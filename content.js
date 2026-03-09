// UFC Spoiler Blocker - hides fight durations, spoiler thumbnails, and results
(function () {
  "use strict";

  // Spoiler section titles (matched against data-title attribute on carousel sections)
  const SPOILER_SECTION_PATTERN = /highlight|clipes|most recent|recap|lutador|fighter|finish/i;

  // Matches duration text like "18M", "25M", "1H", "1H 30M"
  const DURATION_REGEX = /^\s*(\d{1,2}H\s*)?(\d{1,3}M)\s*$/i;

  // Matches time format in player (e.g. "24:00", "1:25:00")
  const TIME_REGEX = /^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/;

  function hideSpoilers(root) {
    if (!root || !root.querySelectorAll) return;

    // 1. Hide text nodes that look like a fight duration (e.g. "18M", "25M", "1H")
    const textElements = root.querySelectorAll(
      "span, div, p, td, li, a"
    );

    textElements.forEach((el) => {
      const text = el.textContent.trim();

      // Check direct text content (not children's text)
      const directText = getDirectTextContent(el).trim();

      if (DURATION_REGEX.test(directText)) {
        el.style.visibility = "hidden";
        el.style.width = "0";
        el.style.overflow = "hidden";
        el.style.position = "absolute";
        return;
      }

      // Strip duration prefix when followed by a date (e.g. "18M Jun 28, 2025")
      if (el.children.length === 0 && /^\s*\d{1,2}[HM]\s+/i.test(text) && text.length < 30) {
        // Keep the date, remove the duration
        const cleaned = text.replace(/^\s*(\d{1,2}H\s*)?(\d{1,3}M)\s*/i, "");
        if (cleaned !== text) {
          el.textContent = cleaned;
        }
      }
    });

    // 2. Blur spoiler thumbnails in carousels and episode grid
    blurSpoilerThumbnails(root);

    // 3. Hide total duration in the video player
    hidePlayerDuration(root);
  }

  function addSpoilerOverlay(wrapper) {
    if (wrapper.dataset.spoilerProcessed) return;
    wrapper.dataset.spoilerProcessed = "true";

    const overlay = document.createElement("div");
    overlay.className = "spoiler-overlay";
    const label = document.createElement("span");
    label.textContent = "SPOILER \u2014 click to reveal";
    overlay.appendChild(label);
    overlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const img = wrapper.querySelector("img.thumb");
      if (img) img.classList.add("spoiler-revealed");
      overlay.remove();
    });
    wrapper.appendChild(overlay);
  }

  function blurSpoilerThumbnails(root) {
    if (!root || !root.querySelectorAll) return;

    // 1. Carousel sections matched by data-title
    const sections = root.querySelectorAll("section.js-le-carousel");
    const rootSection = root.closest
      ? root.closest("section.js-le-carousel")
      : null;
    const allSections = rootSection
      ? [...sections, rootSection]
      : [...sections];

    for (const section of allSections) {
      const title = section.dataset.title || "";
      if (!SPOILER_SECTION_PATTERN.test(title)) continue;
      section.querySelectorAll(".thumb-wrapper").forEach(addSpoilerOverlay);
    }

    // 2. Episode grid (individual fight cards)
    const grids = root.querySelectorAll
      ? root.querySelectorAll("#latest-episodes")
      : [];
    const rootGrid = root.closest
      ? root.closest("#latest-episodes")
      : null;
    const allGrids = rootGrid ? [...grids, rootGrid] : [...grids];

    for (const grid of allGrids) {
      grid.querySelectorAll(".thumb-wrapper").forEach(addSpoilerOverlay);
    }
  }

  function getDirectTextContent(element) {
    let text = "";
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    }
    return text;
  }

  function hidePlayerDuration(root) {
    // Hide elements inside the video player that show total duration
    const playerSelectors = [
      ".player-duration",
      ".vjs-duration-display",
      ".vjs-remaining-time-display",
      "[class*='duration']",
      "[class*='endTime']",
      "[class*='end-time']",
      "[class*='total-time']",
      "[class*='totalTime']",
      "[aria-label*='duration' i]",
      "[aria-label*='total time' i]",
    ];

    const selector = playerSelectors.join(", ");
    const elements = root.querySelectorAll(selector);

    elements.forEach((el) => {
      // Don't hide progress bars
      if (
        el.classList &&
        [...el.classList].some(
          (c) => c.includes("progress") || c.includes("bar")
        )
      )
        return;
      el.style.visibility = "hidden";
    });

    // Hide time text inside player containers (right side = total duration)
    const videoContainers = root.querySelectorAll(
      'video, [class*="player"], [class*="Player"], [id*="player"], [id*="Player"]'
    );

    videoContainers.forEach((container) => {
      const parent = container.closest(
        '[class*="player"], [class*="Player"], [id*="player"], [id*="Player"]'
      );
      if (!parent) return;

      parent.querySelectorAll("span, div").forEach((el) => {
        if (el.children.length === 0 && TIME_REGEX.test(el.textContent)) {
          // Keep current time (left), hide total duration (right)
          const rect = el.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();
          if (rect.left > parentRect.left + parentRect.width / 2) {
            el.style.visibility = "hidden";
          }
        }
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      hideSpoilers(document)
    );
  } else {
    hideSpoilers(document);
  }

  // Watch for dynamically loaded elements
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          hideSpoilers(node);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Periodic re-scan for lazy-loaded carousels and content
  setInterval(() => hideSpoilers(document), 2000);
})();
