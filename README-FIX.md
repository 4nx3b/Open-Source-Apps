# OpenHouse Fix - Sound + Cross Hit + Modern Compact Pills

## What was broken?

**Sound:**
1. `tapAudio.src = 'data:audio/wav;base64,UklGRn...'` - that base64 string is not a valid WAV (only header, 0 samples). It fails to play on all devices.
2. Double debounce: `handleTap` debounces 100ms AND `playTapSound` debounces again → second tap blocked, timing race.
3. `AudioContext` never resumed after creation. On iOS/Android Chrome, context stays `suspended` until user gesture with `resume()`. Code called `start()` on dummy buffer but never awaited resume.
4. Audio unlock listeners were `once:true` but could fire before context existed.

**Cross × hit:**
1. CSS only had `::before` (vertical line) - missing `::after` (horizontal) so × never looked like ×.
2. Size 20px too small, animation 0.15s too fast to notice.
3. No ring/ripple feedback that makes game-like hit satisfying.

**Category pills:**
- Old: `padding:12px 18px`, `32px` circular icon, `flex-wrap` centered, huge 100px radius, lots of gap. On mobile screenshot - 1 column with huge rows = not compact, not modern.
- New enhanced.css tried to fix with `grid` but minmax 200px still leaves massive whitespace.

## Fix files
- `js-enhanced-fixed.js` - Drop-in replacement for `js/enhanced.js` section 15 (or full file)
- `style-pills-modern.css` - Put AFTER style.css + style-enhanced.css. It overrides cat pills + adds proper crosshair
- `preview.html` - Visual demo of new pills

### How to apply
1. Copy `style-pills-modern.css` to repo as `style-pills-modern.css` and add in index.html:
   ```html
   <link rel="stylesheet" href="style.css">
   <link rel="stylesheet" href="style-enhanced.css">
   <link rel="stylesheet" href="style-pills-modern.css">
   ```
2. Replace `js/enhanced.js` with `js-enhanced-fixed.js` OR apply patch below.

