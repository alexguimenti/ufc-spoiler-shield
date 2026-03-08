// UFC Spoiler Blocker - hides total duration from the video player
(function () {
  "use strict";

  // Regex to detect time format (e.g. "24:00", "1:25:00")
  const TIME_REGEX = /^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/;

  function hidePlayerDuration(root) {
    // Find elements inside the video player that show total duration
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
      // Skip progress bars
      if (
        el.classList &&
        [...el.classList].some(
          (c) => c.includes("progress") || c.includes("bar")
        )
      )
        return;
      el.style.visibility = "hidden";
    });

    // Find spans/divs with time text inside player containers
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
          // Keep current time (left side), hide only total duration (right side)
          const rect = el.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();
          if (rect.left > parentRect.left + parentRect.width / 2) {
            el.style.visibility = "hidden";
          }
        }
      });
    });
  }

  // Run when DOM loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      hidePlayerDuration(document)
    );
  } else {
    hidePlayerDuration(document);
  }

  // MutationObserver for dynamically loaded elements (video player)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          hidePlayerDuration(node);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
