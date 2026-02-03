const copiedButtonText = "✅";
const copyPrButtonText = "PR";
const copyPrWithMergeButtonText = "PR+🔀";
const timeUntilReset = 2000;
const targetNode = document.getElementById('js-repo-pjax-container');
const config = { childList: true, subtree: true };

const copyContainerId = 'copy-container';

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

// Select the container element that wraps the PR content
// We observe this for changes since GitHub uses client-side routing
const callback = function (mutationsList, observer) {
  let hasMutation = false;
  for (let mutation of mutationsList) {
    if (mutation.type !== 'childList') continue;
    hasMutation = true;
    break;
  }
  if (hasMutation) initContentScript();
};
const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
    const container = document.getElementById(copyContainerId);
    if (container) {
      container.remove();
      initContentScript();
    }
  });
}

// Initialize the content script, adding the copy button if it doesn't exist
function initContentScript() {
  const existingButton = document.getElementById(copyContainerId);
  if (existingButton) {
    return;
  }

  // Find the PR title element
  const titleElement = document.querySelector(".js-issue-title");

  if (!titleElement) {
    return; 
  }
  
  // Detect dark/light mode
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const backgroundColor = isDarkMode ? darkModeBackgroundColor : lightModeBackgroundColor;
  const textColor = isDarkMode ? darkModeTextColor : lightModeTextColor;
  const hoverColor = isDarkMode ? darkModeHoverColor : lightModeHoverColor;
  const separatorColor = isDarkMode ? darkModeSeparatorColor : lightModeSeparatorColor;
  const shadowColor = isDarkMode ? darkModeShadowColor : lightModeShadowColor;
  
  // Create a new button element
  const copyContainer = document.createElement("div");
  copyContainer.id = copyContainerId;
  copyContainer.style.display = "inline-flex";
  copyContainer.style.gap = "0px";
  copyContainer.style.margin = "0 10px";
  copyContainer.style.overflow = "hidden";
  copyContainer.style.borderRadius = "1rem";
  copyContainer.style.boxShadow = `0 0 12px ${shadowColor}`;
  copyContainer.style.backgroundColor = backgroundColor;
  copyContainer.style.color = textColor;
  copyContainer.style.border = "none";

  const copyPrButton = document.createElement("button");
  copyPrButton.textContent = copyPrButtonText;
  copyPrButton.id = 'copy-pr-button';
  copyPrButton.style.margin = "0";
  copyPrButton.style.border = "none";
  copyPrButton.style.backgroundColor = backgroundColor;
  copyPrButton.style.color = textColor;
  copyPrButton.style.borderRadius = "0";
  copyPrButton.style.padding = "3px 12px";
  copyPrButton.style.cursor = "pointer";
  copyPrButton.addEventListener('mouseover', () => {
    copyPrButton.style.backgroundColor = hoverColor;
  });
  copyPrButton.addEventListener('mouseout', () => {
    copyPrButton.style.backgroundColor = backgroundColor;
  });
  
  const separator = document.createElement("div");
  separator.style.width = "1px";
  separator.style.height = "100%";
  separator.style.backgroundColor = separatorColor;
  separator.style.margin = "0 1px";
  
  const copyPrWithMergeButton = document.createElement("button");
  copyPrWithMergeButton.textContent = copyPrWithMergeButtonText;
  copyPrWithMergeButton.id = 'copy-merge-button';
  copyPrWithMergeButton.style.margin = copyPrButton.style.margin;
  copyPrWithMergeButton.style.border = copyPrButton.style.border;
  copyPrWithMergeButton.style.backgroundColor = backgroundColor;
  copyPrWithMergeButton.style.color = textColor;
  copyPrWithMergeButton.style.borderRadius = copyPrButton.style.borderRadius;
  copyPrWithMergeButton.style.padding = copyPrButton.style.padding;
  copyPrWithMergeButton.style.cursor = copyPrButton.style.cursor;
  copyPrWithMergeButton.addEventListener('mouseover', () => {
    copyPrWithMergeButton.style.backgroundColor = hoverColor;
  });
  copyPrWithMergeButton.addEventListener('mouseout', () => {
    copyPrWithMergeButton.style.backgroundColor = backgroundColor;
  });
  
  copyContainer.appendChild(copyPrButton);
  copyContainer.appendChild(separator);
  copyContainer.appendChild(copyPrWithMergeButton);
  
  // Insert the button next to the PR title
  titleElement.parentElement.insertBefore(
    copyContainer,
    titleElement.nextSibling
  );

  // Add click event listener to the button
  copyPrButton.addEventListener("click", () => {
    const prTitle = titleElement.textContent.trim();
    const prLink = `see [this PR](${window.location.href}) — ${prTitle}`;

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
    const prTitle = titleElement.textContent.trim();
    const prLink = `see [this PR](${window.location.href}) — ${prTitle} — [merge]`;

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
};
