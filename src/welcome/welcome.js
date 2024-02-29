import { currentUri, linkClick } from "../core/browser";

export function docs() {
  return `
# Guide to Recomputer
Here is a Recomputer instance with a walk-through of all of its features. You can edit the text here, but your changes won't be saved. You can close it at any time with the button in top right corner or by clicking on this link: https://xixixao.github.io/recomputer. Your primary editor is below the guide.

## Privacy Notice
Recomputer never sends your calculations to any server.
Recomputer uses your browser's cache to save the text in your editor. To disable this, ${linkClick} on this link: ${currentUri(
    { autosave: "off" }
  )}.
Recomputer calls only one external API, hosted on https://cdn.jsdelivr.net, to fetch today's currency rates.
For analytics Recomputer uses https://www.cloudflare.com/web-analytics/, which doesn't track you across other sites or even multiple visits.

## Terms of Service
Use at your own risk. To report a bug file an issue on Github: https://github.com/xixixao/recomputer.

## Alternatives
For a list of alternatives visit https://github.com/xixixao/recomputer.
`;
}
