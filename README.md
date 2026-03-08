# UFC Spoiler Blocker - Paramount+

<p align="center">
  <img src="icon128.png" alt="UFC Spoiler Blocker" width="128" height="128">
</p>

A Chrome extension that hides spoiler information from UFC pages on Paramount+.

If a fight lasted 8 minutes, it was a knockout. If it lasted 25, it went to decision. Knowing the duration before watching ruins the experience. This extension fixes that.

## What it hides

| Information | Where it appears | Example |
|---|---|---|
| Fight duration | Episode list | "18M", "25M", "1H" |
| Fight duration | Video page header | "24M" next to the date |
| Result description | Episode list | "Fighter X won by knockout..." |
| Result description | Video page header | Paragraph below the title |
| Total video time | Player bar | "24:00" on the right side |

## How it works

The extension uses two strategies:

1. **CSS injected before the page renders** (`hide-duration.css`) — hides durations, descriptions, and static elements. Since the CSS is injected with `run_at: document_start`, the content never flashes on screen.

2. **Content script with MutationObserver** (`content.js`) — monitors the DOM to hide the total duration in the video player, which loads dynamically via JavaScript after the initial page load.

## Installation

### Developer mode (local)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right corner)
4. Click **Load unpacked**
5. Select the project folder

### Updating

After modifying files, go to `chrome://extensions/` and click the reload button on the extension card.

## Project structure

```
ufc-spoiler-shield/
├── manifest.json        # Extension config (Manifest V3)
├── hide-duration.css    # CSS rules to hide spoilers
├── content.js           # JS script for the video player
├── icon48.png           # 48x48 icon
├── icon128.png          # 128x128 icon
└── README.md
```

## Technical details

### CSS selectors

| Selector | Target |
|---|---|
| `span[itemprop="duration"]` | Duration on episode cards |
| `.lockup-info__details-eyebrow > span:first-child` | Duration on video page header |
| `.description-wrapper` | Description on episode cards |
| `.lockup-info__details-episode-description` | Description on video page header |
| `[class*="duration"]`, `.vjs-duration`, etc. | Total time in the player |

### Content script

The `content.js` uses a `MutationObserver` to watch for new DOM elements. When the video player loads (after the initial HTML), the script detects elements with a time format (e.g. `24:00`) positioned on the right half of the player and hides them, while preserving the current playback time on the left.

## Compatibility

- **Browsers**: Chrome, Edge, Brave (any Chromium-based browser)
- **Manifest**: V3
- **Target site**: `https://www.paramountplus.com/*`
- **Permissions**: None required

## Limitations

- CSS selectors depend on Paramount+'s current site structure. If the site redesigns, selectors may need updating.
- Player total time blocking relies on element positioning. Unusual layouts may require adjustments.
- The extension only runs on Paramount+ (does not affect other sites).

## License

MIT
