# Research Findings: ALL-01 데모 테스트 + 최종 검증

**Date**: 2026-02-28
**Feature**: Demo Validation — ACT 1–4, Plan A/B, CP3
**Sources**: Chrome DevTools documentation, MDN Web Performance API, Next.js dev server behavior

---

## 1. Browser DevTools Performance Measurement

### Network Tab — API Response Time

The Network tab in Chrome DevTools is the primary tool for measuring Gemini API response time.

**Procedure**:
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Click the **Network** tab
3. Enable **Preserve log** checkbox (prevents clearing on navigation)
4. Clear existing entries with the "Clear" button (circle with slash icon)
5. Trigger the demo: click "경로 생성하기"
6. In the request list, find `simulate` (the POST request to `/api/paths/simulate`)
7. In the **Timing** panel for that request, read:
   - **Waiting (TTFB)**: Time waiting for the first byte — this is the Gemini processing time
   - **Content Download**: Time to receive the full response body
   - **Total**: Total time from request sent to response received

**Key Column**: The **"Time"** column in the request list shows total round-trip time. Target: ≤ 15000ms.

**Filtering**: Type `simulate` in the filter box to isolate the API call from static asset requests.

**Plan A vs Plan B verification**:
- Plan A: The request to `simulate` should show a request to your local Next.js server, which internally calls `generativelanguage.googleapis.com`. You can see this secondary call in the `simulate` timing breakdown as the backend processing time.
- Plan B: The request to `simulate` returns quickly (< 100ms). No request to `generativelanguage.googleapis.com` will appear in the Network tab because the mock data is served entirely server-side.

### Performance Tab — Rendering Timeline

For measuring map render time (the time from receiving data to the path map being fully painted):

1. Open DevTools → **Performance** tab
2. Click **Record** (circle icon)
3. Trigger the demo (click "경로 생성하기")
4. Wait until path map is fully visible
5. Click **Stop**
6. In the flame chart, look for:
   - **Network** section: shows when the `/api/paths/simulate` response arrived
   - **Main** section: shows JavaScript execution for rendering
   - **Frames** section: shows when frames were painted
7. Measure from the response arrival to the last significant "Paint" event in the Frames section

**Alternative — Simpler approach**: Use the console to add timing logs if the source code permits console inspection (no code changes needed — you're only reading logs):
```javascript
// In the browser console, these measurements are available via the Performance API:
performance.getEntriesByType('measure')
performance.getEntriesByType('navigation')
```

### Lighthouse — Quick Performance Audit

For a broad performance snapshot:
1. DevTools → **Lighthouse** tab
2. Select **Performance** category
3. Click **Analyze page load**
4. Look at **Time to Interactive (TTI)** and **Total Blocking Time (TBT)**

Note: Lighthouse measures initial page load, not the demo interaction flow. Use Network tab for interaction-specific timing.

---

## 2. Network Throttling for API Timeout Testing

Chrome DevTools allows simulating slow network conditions to test timeout behavior.

**Setup**:
1. DevTools → **Network** tab
2. In the throttling dropdown (default: "No throttling"), select:
   - **Slow 3G**: ~400ms latency, 400kb/s download — simulates bad mobile network
   - **Fast 3G**: ~170ms latency, 1.5Mb/s download — simulates average mobile network
   - **Custom**: Can set specific upload/download speeds and latency

**Use case for ALL-01**: Test what happens when the Gemini API is slow by throttling to "Slow 3G". This simulates a venue with poor Wi-Fi. Verify:
- Loading animation remains visible (not stuck or dismissed prematurely)
- App does not throw a timeout error before 15 seconds
- If the call exceeds 15s, verify the fallback behavior (if implemented)

**Important**: Network throttling in DevTools only affects browser-to-server requests. The Gemini API call from Next.js server to Google is not throttled by browser DevTools — it's a server-side call. For testing server-side API timeout, the Gemini SDK's built-in timeout (configured in `lib/gemini.ts`) is the relevant boundary.

**Practical approach for demo risk testing**: Use Plan B (USE_MOCK=true) as the primary test for network-independence. Plan A testing should be done on the actual venue network conditions if possible, or on a hotspot as a proxy.

---

## 3. Console Error Detection

The browser console is the fastest way to detect JavaScript errors during demo validation.

### Console Configuration for Demo Validation

1. Open DevTools → **Console** tab
2. Set filter level to **"All"** or keep **"Errors"** to focus only on errors
3. Enable **"Preserve log"** to keep errors across navigations
4. Enable **"Show timestamps"** (gear icon → check "Timestamps") to correlate errors with demo steps

### Error Severity Classification

| Console Level | Icon | Meaning |
|---|---|---|
| Error | Red ✕ | JavaScript exception or React rendering error — always investigate |
| Warning | Yellow △ | Potential issue, often from libraries — investigate if from LifePath code |
| Info | Blue ℹ | Informational log — usually safe to ignore |
| Log | White | Debug output — safe to ignore |

### Distinguishing LifePath Errors vs Extension Noise

Browser extensions commonly inject console errors that are unrelated to your app. To isolate LifePath errors:

1. Open Chrome in **Incognito mode** (`Cmd+Shift+N` / `Ctrl+Shift+N`) — extensions are disabled by default
2. Alternatively, right-click the console filter and enable "Hide violations" and "Hide warnings" to reduce noise
3. In the Console filter box, type the app's URL or a known LifePath identifier to filter relevant messages
4. Look for errors from file paths like `localhost:3000` or your app's source files — these are LifePath errors

### React-Specific Errors to Watch For

```
Warning: Each child in a list should have a unique "key" prop.
```
Minor warning — won't break the demo but indicates missing keys in list rendering.

```
Error: Objects are not valid as a React child
```
Severe — indicates a state or prop type mismatch that will cause a white screen.

```
Warning: Can't perform a React state update on an unmounted component.
```
Minor warning — usually from async operations completing after a component unmounts. Won't break the demo but indicates a potential memory leak.

```
Uncaught Error: ...
```
Any uncaught error is Severe — the demo may be in an unrecoverable state.

---

## 4. Cross-Browser Testing Checklist

The primary demo browser is Chrome (latest stable). Secondary validation is Firefox (latest stable).

### Chrome-Specific Notes

- Chrome handles CSS animations and `@xyflow/react` canvas rendering with best performance
- Chrome DevTools is the richest tool for measuring performance metrics
- Chrome's JavaScript engine (V8) matches Vercel's Node.js runtime behavior most closely
- **Test in Chrome first** — all 3 consecutive runs should be done in Chrome

### Firefox-Specific Notes

- Firefox handles CSS gradients slightly differently — verify merge point gradient renders correctly
- Firefox's DevTools Network tab has equivalent API timing measurement capability
- `@xyflow/react` is tested on Firefox but complex canvas interactions may differ subtly
- **Test in Firefox after Chrome validation** — a single successful run is sufficient for Firefox

### Responsive / Viewport Considerations

- Primary demo will be on a laptop screen — test at 1920×1080 or 1440×900
- The vertical path map must be fully visible without horizontal scrolling
- If presenting with screen sharing, the actual visible viewport may be smaller — test at 1280×720 as the minimum acceptable viewport

### Known Cross-Browser Compatibility Notes

| Feature | Chrome | Firefox | Risk Level |
|---|---|---|---|
| CSS `@keyframes` animations | Full support | Full support | Low |
| CSS gradients (merge point) | Full support | Full support | Low |
| `@xyflow/react` canvas rendering | Primary support | Supported | Medium |
| CSS `backdrop-filter` (if used) | Full support | Partial support | Medium |
| `requestAnimationFrame` timing | Consistent | Consistent | Low |
| `localStorage` (for mock caching) | Full support | Full support | Low |

---

## 5. Plan B Environment Verification

Before running Plan B tests, verify the mock mode is correctly active:

**Verification method 1 — Network tab**:
- After starting with `USE_MOCK=true`, trigger the demo
- Network tab should show a request to `/api/paths/simulate` completing in < 100ms
- No request to `generativelanguage.googleapis.com` should appear

**Verification method 2 — Console log (if present)**:
- The API route may log `[mock mode]` or similar — check Console for this

**Verification method 3 — Response inspection**:
- Open Network tab, click on the `/api/paths/simulate` request
- View the **Response** tab — the JSON should match the known mock data structure exactly (consistent between runs)
- In Plan A, the JSON content changes between runs (Gemini generates fresh data)

---

## 6. Key Findings and Decisions

| Finding | Implication |
|---|---|
| Browser DevTools Network tab provides accurate TTFB and total time for `/api/paths/simulate` | Use as primary measurement tool for API response time |
| Browser throttling does not affect server-to-Gemini calls | Network throttling tests client-side resilience only; Plan B is the reliable fallback strategy |
| Chrome Incognito mode eliminates extension noise from console | Run all 3 consecutive validation runs in Incognito for clean console measurement |
| React error boundaries may suppress visible crashes but log to console | Always check console even if the UI appears to work |
| `@xyflow/react` performance is sensitive to node count | If slider performance is slow, check node count vs. budget in the React Flow component |
| Firefox CSS `backdrop-filter` support is partial | If the detail panel uses `backdrop-filter`, test in Firefox explicitly |
