const copiedButtonText = "✅";
const copyPrButtonText = "PR";
const copyPrWithMergeButtonText = "PR+🔀";
const copyMergedButtonText = "🔀'd";
const timeUntilReset = 2000;
const pollInterval = 1000;

const copyContainerId = "copy-container";
const copyRowId = "copy-container-row";

// Dark mode colors
const darkModeBackgroundColor = "black";
const darkModeTextColor = "white";
const darkModeHoverColor = "#333333";
const darkModeSeparatorColor = "white";
const darkModeShadowColor = "rgba(255, 255, 255, 0.2)";

// Light mode colors
const lightModeBackgroundColor = "white";
const lightModeTextColor = "black";
const lightModeHoverColor = "#e0e0e0";
const lightModeSeparatorColor = "black";
const lightModeShadowColor = "rgba(0, 0, 0, 0.2)";

// GitHub swaps pages in without a full reload, so watch the whole document
// rather than one container that a soft navigation can replace
let checkScheduled = false;
function scheduleCheck() {
  if (checkScheduled) return;
  checkScheduled = true;
  requestAnimationFrame(() => {
    checkScheduled = false;
    initContentScript();
  });
}

const observer = new MutationObserver(scheduleCheck);
observer.observe(document.body, { childList: true, subtree: true });

// Belt and braces: back/forward plus the events GitHub's routers fire.
// Harmless if a given event never arrives.
window.addEventListener("popstate", scheduleCheck);
document.addEventListener("turbo:load", scheduleCheck);
document.addEventListener("pjax:end", scheduleCheck);
document.addEventListener("soft-nav:end", scheduleCheck);

// Last resort. GitHub can finish a soft navigation without any signal we can
// observe from an isolated content script (it calls history.pushState in the
// page's own JS context, which we can't hook). This poll is cheap - two id
// lookups and a regex - and guarantees the buttons appear within a second
// however GitHub changes its router.
setInterval(scheduleCheck, pollInterval);

scheduleCheck();

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addListener(() => {
    if (document.getElementById(copyContainerId)) {
      removeButtons();
      initContentScript();
    }
  });
}

// The script now runs on every github.com page so it can catch soft
// navigations into a PR; only PR pages get buttons
function isPullRequestPage() {
  return /^\/[^/]+\/[^/]+\/pull\/\d+/.test(window.location.pathname);
}

// Read the title at click time rather than holding a reference that a
// re-render can detach
function getPrTitle() {
  const titleElement =
    document.querySelector(".markdown-title") ||
    document.querySelector(".js-issue-title");
  return titleElement ? titleElement.textContent.trim() : "";
}

function removeButtons() {
  const row = document.getElementById(copyRowId);
  if (row) row.remove();
  const container = document.getElementById(copyContainerId);
  if (container) container.remove();
}

// Extract the PR number from the URL (e.g. /owner/repo/pull/4512/files -> 4512)
function getPrNumber() {
  const match = window.location.pathname.match(/\/pull\/(\d+)/);
  return match ? match[1] : null;
}

// Initialize the content script, adding the copy button if it doesn't exist
function initContentScript() {
  if (!isPullRequestPage()) {
    removeButtons();
    return;
  }

  const existingButton = document.getElementById(copyContainerId);
  if (existingButton) {
    return;
  }

  // Clear an orphaned wrapper left behind if a re-render dropped the buttons
  removeButtons();

  // Find the PR title element (new UI: .markdown-title, fallback: .js-issue-title)
  const titleElement =
    document.querySelector(".markdown-title") ||
    document.querySelector(".js-issue-title");

  if (!titleElement) {
    return;
  }

  // Detect dark/light mode
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const backgroundColor =
    isDarkMode ? darkModeBackgroundColor : lightModeBackgroundColor;
  const textColor = isDarkMode ? darkModeTextColor : lightModeTextColor;
  const hoverColor = isDarkMode ? darkModeHoverColor : lightModeHoverColor;
  const separatorColor =
    isDarkMode ? darkModeSeparatorColor : lightModeSeparatorColor;
  const shadowColor = isDarkMode ? darkModeShadowColor : lightModeShadowColor;

  // Create a new button element
  const copyContainer = document.createElement("div");
  copyContainer.id = copyContainerId;
  copyContainer.style.display = "inline-flex";
  copyContainer.style.gap = "0px";
  copyContainer.style.margin = "0 10px";
  copyContainer.style.overflow = "hidden";
  copyContainer.style.borderRadius = "0.35rem";
  copyContainer.style.boxShadow = `0 0 12px ${shadowColor}`;
  copyContainer.style.backgroundColor = backgroundColor;
  copyContainer.style.color = textColor;
  copyContainer.style.border = "none";

  // Style a button so GitHub's own button CSS can't leak in and so tall
  // glyphs (the merge emoji) stay centered instead of spilling out
  function styleButton(button, id, text) {
    button.id = id;
    button.textContent = text;
    button.style.display = "inline-flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.margin = "0";
    button.style.border = "none";
    button.style.outline = "none";
    button.style.boxShadow = "none";
    button.style.appearance = "none";
    button.style.backgroundColor = backgroundColor;
    button.style.backgroundImage = "none";
    button.style.color = textColor;
    button.style.borderRadius = "0";
    button.style.padding = "4px 12px";
    button.style.font = "inherit";
    button.style.fontSize = "14px";
    button.style.lineHeight = "20px";
    button.style.whiteSpace = "nowrap";
    button.style.cursor = "pointer";
    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = hoverColor;
    });
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = backgroundColor;
    });
    return button;
  }

  const copyPrButton = styleButton(
    document.createElement("button"),
    "copy-pr-button",
    copyPrButtonText,
  );

  const separator = document.createElement("div");
  separator.style.width = "1px";
  separator.style.alignSelf = "stretch";
  separator.style.backgroundColor = separatorColor;
  separator.style.margin = "0 1px";
  separator.style.flex = "0 0 auto";

  const copyPrWithMergeButton = styleButton(
    document.createElement("button"),
    "copy-merge-button",
    copyPrWithMergeButtonText,
  );

  const separatorTwo = separator.cloneNode(true);

  const copyMergedButton = styleButton(
    document.createElement("button"),
    "copy-merged-button",
    copyMergedButtonText,
  );

  copyContainer.appendChild(copyPrButton);
  copyContainer.appendChild(separator);
  copyContainer.appendChild(copyPrWithMergeButton);
  copyContainer.appendChild(separatorTwo);
  copyContainer.appendChild(copyMergedButton);

  // Insert the buttons at the end of the page header's title area, so they sit
  // on their own line beneath the PR title, number, and edit button.
  // Fall back to sitting next to the PR title if that markup isn't found.
  const titleArea = document.querySelector('[data-component="TitleArea"]');

  if (titleArea) {
    // The title area lays out as a row, so give the buttons a full-width
    // wrapper that wraps onto its own line beneath the title and number
    titleArea.style.flexWrap = "wrap";

    const copyRow = document.createElement("div");
    copyRow.id = copyRowId;
    copyRow.style.display = "flex";
    copyRow.style.width = "100%";
    copyRow.style.flexBasis = "100%";
    copyRow.style.justifyContent = "flex-start";

    copyContainer.style.margin = "0";
    copyRow.appendChild(copyContainer);
    titleArea.appendChild(copyRow);
  } else {
    titleElement.parentElement.insertBefore(
      copyContainer,
      titleElement.nextSibling,
    );
  }

  // Add click event listener to the button
  copyPrButton.addEventListener("click", () => {
    const prTitle = getPrTitle();
    const prNumber = getPrNumber();
    const linkText = prNumber ? `this PR #${prNumber}` : "this PR";
    const prLink = `[${linkText}](${window.location.href}) — ${prTitle}`;

    // Copy the formatted message to the clipboard
    navigator.clipboard
      .writeText(prLink)
      .then(() => {
        // Provide user feedback that copying was successful
        copyPrButton.textContent = copiedButtonText;
        copyContainer.style.boxShadow = "0 0 12px rgba(0, 255, 0, 0.2)";
        // Then change back to the default text
        setTimeout(() => {
          copyPrButton.textContent = copyPrButtonText;
          copyContainer.style.boxShadow = `0 0 12px ${shadowColor}`;
        }, timeUntilReset);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  });

  copyPrWithMergeButton.addEventListener("click", () => {
    const prTitle = getPrTitle();
    const prNumber = getPrNumber();
    const linkText = prNumber ? `this PR #${prNumber}` : "this PR";
    const prLink = `see [${linkText}](${window.location.href}) — ${prTitle} — [merge]`;

    navigator.clipboard
      .writeText(prLink)
      .then(() => {
        copyPrWithMergeButton.textContent = copiedButtonText;
        copyContainer.style.boxShadow = "0 0 12px rgba(0, 255, 0, 0.2)";
        setTimeout(() => {
          copyPrWithMergeButton.textContent = copyPrWithMergeButtonText;
          copyContainer.style.boxShadow = `0 0 12px ${shadowColor}`;
        }, timeUntilReset);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  });

  copyMergedButton.addEventListener("click", () => {
    const prTitle = getPrTitle();
    const prNumber = getPrNumber();
    const linkText = prNumber ? `this PR #${prNumber}` : "this PR";
    const prLink = `Merged [${linkText}](${window.location.href}) — ${prTitle}`;

    navigator.clipboard
      .writeText(prLink)
      .then(() => {
        copyMergedButton.textContent = copiedButtonText;
        copyContainer.style.boxShadow = "0 0 12px rgba(0, 255, 0, 0.2)";
        setTimeout(() => {
          copyMergedButton.textContent = copyMergedButtonText;
          copyContainer.style.boxShadow = `0 0 12px ${shadowColor}`;
        }, timeUntilReset);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  });
}
