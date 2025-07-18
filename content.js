const copiedButtonText = "Copied!";
const defaultButtonText = "Copy";
const timeUntilReset = 2000;
const targetNode = document.getElementById('js-repo-pjax-container');
const config = { childList: true, subtree: true };


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

// Initialize the content script, adding the copy button if it doesn't exist
function initContentScript() {
  const existingButton = document.getElementById('copy-button');
  if (existingButton) {
    return;
  }

  // Find the PR title element
  const titleElement = document.querySelector(".js-issue-title");

  if (!titleElement) {
    return; 
  }
  
  // Create a new button element
  const copyButton = document.createElement("button");
  copyButton.textContent = defaultButtonText;
  copyButton.id = 'copy-button';
  copyButton.style.margin = "0 10px";
  copyButton.style.borderRadius = "1rem";
  copyButton.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.2)";
  copyButton.style.backgroundColor = "black";
  copyButton.style.color = "white";
  copyButton.style.border = "none";
  copyButton.style.padding = "3px 12px";
  copyButton.style.cursor = "pointer";

  // Insert the button next to the PR title
  titleElement.parentElement.insertBefore(
    copyButton,
    titleElement.nextSibling
  );

  // Add click event listener to the button
  copyButton.addEventListener("click", () => {
    const prTitle = titleElement.textContent.trim();
    const prLink = `see [this PR](${window.location.href}) — ${prTitle}`;

    // Copy the formatted message to the clipboard
    navigator.clipboard
      .writeText(prLink)
      .then(() => {
        // Provide user feedback that copying was successful
        copyButton.textContent = copiedButtonText;
        copyButton.style.boxShadow = "0 0 12px rgba(0, 255, 0, 0.2)";
        // Then change back to the default text
        setTimeout(() => {
          copyButton.textContent = defaultButtonText;
          copyButton.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.2)";
        }, timeUntilReset);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  });
}
