Adds a little "PR" button next to GitHub pull request titles, so developers can easily copy the PR title along with a link to it, for easy sharing.

# Submitting to Chrome Extensions

Update the manifest.json to list the new version number.

Zip the parent folder with the extension in it:

```bash
cd chrome && \
  zip -r ../chrome-extension.zip . -x ".*" && \
  cd ..
```

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
