import { linkClick, currentUri } from "../core/browser";

export function docs() {
  return `
# Welcome to Recomputer!
.Recomputer is a better, smarter calculator:
tectonic shift = (0.6 inches / year) * 5K years in meters

.It looks like this is your first time visiting using this browser. The text below gives you all the important information and shows you examples of how to use Recomputer. If you're familiar with it already, or want to explore on your own, ${linkClick} here: ${currentUri(
    { empty: true }
  )}.

## Privacy Notice
.Recomputer never sends your calculations to any server.
.Recomputer uses your browser's cache to save the text in your editor. To disable this, ${linkClick} on this link: ${currentUri(
    { autosave: "off" }
  )}.
.Recomputer calls only one external API, hosted on https://cdn.jsdelivr.net, to fetch today's currency rates.
.For analytics Recomputer uses https://www.cloudflare.com/web-analytics/, which doesn't track you across other sites or even multiple visits.

## Terms of Service
.Use at your own risk. To report a bug file an issue on Github: https://github.com/xixixao/recomputer.

## Alternatives
.For a list of alternatives visit https://github.com/xixixao/recomputer.
`;
}
