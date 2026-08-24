Adds a little "PR" button next to GitHub pull request titles, so developers can easily copy the PR title along with a link to it, for easy sharing.

# Testing Locally

The extension is plain JavaScript with no build step — load the folder directly and reload it after each edit.

The `chrome/` and `firefox/` folders are separate copies of the same extension. **Any change to one must be made in the other**, or the two published builds drift apart.

## Chrome

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `chrome/` folder.
4. Open any GitHub pull request, e.g. https://github.com/glenhayes/github-copy-pr-extension/pull/1

After editing `chrome/content.js`, press the ↻ reload icon on the extension card in `chrome://extensions`, then reload the PR tab.

## Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `firefox/manifest.json` (the manifest file itself, not the folder).
3. Open any GitHub pull request.

After editing `firefox/content.js`, press **Reload** next to the add-on, then reload the PR tab. Temporary add-ons are removed when Firefox restarts, so you will need to load it again each session.

## What to check

The button group appears immediately to the right of the PR title. Each button copies to the clipboard and flashes ✅ with a green glow for two seconds:

| Button  | Copies                                         |
| ------- | ---------------------------------------------- |
| `PR`    | `[this PR #123](url) — PR title`               |
| `PR+🔀` | `see [this PR #123](url) — PR title — [merge]` |
| `🔀'd`  | `Merged [this PR #123](url) — PR title`        |

Worth exercising:

- **Both themes.** Colors follow the OS setting (`prefers-color-scheme`), not GitHub's theme picker, and the buttons re-render when the OS setting changes.
- **Client-side navigation.** GitHub swaps pages without a full load. Click through to **Files changed** / **Commits** and back — a `MutationObserver` re-adds the buttons, and the PR number is read from the URL so it must stay correct on those sub-pages.
- **Syntax before loading.** A parse error makes the content script fail silently:

  ```bash
  node --check chrome/content.js && node --check firefox/content.js
  ```

- **Errors.** Content script errors show in the PR page's own DevTools console (not the extension's).

# Submitting to Chrome Extensions

Update the manifest.json to list the new version number.

Zip the parent folder with the extension in it:

```bash
cd chrome && \
  zip -r ../chrome-extension.zip . -x ".*" && \
  cd ..
```

Open Corey's personal browser profile (not R&V)

[Browse to your package](https://chrome.google.com/webstore/devconsole/9ba72856-3d3d-49d3-bdb5-5722e232d821/nlmjnlaccpcbifpomilaobenaahjgjpg/edit/package)

Click "Upload new package" and select the new zip.

Press "Submit for review" in the top right

# Submitting to Firefox Add-ons

Access [the developer hub entry](https://addons.mozilla.org/en-CA/developers/addon/share-pull-request/edit) and/or click [Add new version](https://addons.mozilla.org/en-CA/developers/addon/share-pull-request/versions/submit/)

Zip the file:

```bash
cd firefox && \
  zip -r ../firefox-addon.zip . -x ".*" && \
  cd ..
```

Select the file, enter release notes, and submit.
