# Design Document: Fixed Background Video Section

## Overview

This document details the architectural and implementation design for a fixed background video section on the Kustom Koats homepage. The section creates a parallax-like effect where a background video remains stationary while content scrolls over it, positioned after the WhyKustomKoatsNeon component.

### Design Goals

1. **Visual Impact**: Create an engaging, modern scrolling experience that showcases automotive content
2. **Performance**: Maintain smooth 60fps scrolling without jank or layout shifts
3. **Reliability**: Ensure video playback works across browsers and devices with appropriate fallbacks
4. **Responsiveness**: Adapt seamlessly to mobile, tablet, and desktop viewports
5. **Integration**: Fit naturally within the existing HomePage component structure

### Technology Stack

- **React**: Functional component with hooks (useRef, useEffect)
- **CSS**: Position-based layering with hardware acceleration
- **HTML5 Video API**: Native video element with autoplay and loop
- **Intersection Observer API**: Viewport detection for playback management

## Architecture

### Component Hierarchy

```
HomePage
├── HeroSection
├── FeaturedCategoriesSection
├── XtremeKolorzSection
├── WhyKustomKoatsNeon
├── FixedVideoSection           ← NEW COMPONENT
│   ├── VideoContainer
│   │   ├── BackgroundVideo
│   │   ├── DarkOverlay
│   │   └── OverlayContent
│   │       ├── ContentHeading
│   │       ├── ContentDescription
│   │       └── CTAButton
├── NewsletterSection
└── Footer
```

### Positioning Strategy

The section uses a **three-layer stacking architecture**:

1. **Layer 0 (Bottom)**: Background video with `position: absolute` and `inset-0`
2. **Layer 1 (Middle)**: Dark overlay (`rgba(0, 0, 0, 0.4)`) for contrast
3. **Layer 2 (Top)**: Scrollable content with `position: relative`

The container itself uses `position: relative` to establish a stacking context.

### Scroll Behavior Model

```
┌─────────────────────────────┐
│   Viewport (Fixed Frame)    │
│  ┌───────────────────────┐  │
│  │   Video (Stationary)  │  │ ← position: absolute
│  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │   ┌─────────────────┐ │  │
│  │   │ Content (Moves) │ │  │ ← position: relative
│  │   │   [Scrolling]   │ │  │    (User scrolls this)
│  │   │                 │ │  │
│  │   │     ↓ ↓ ↓       │ │  │
│  │   └─────────────────┘ │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

As the user scrolls, the **content layer moves** while the **video layer remains fixed** relative to the container, creating the parallax effect.

## Components and Interfaces

### Component Structure

#### FixedVideoSection Component

```javascript
function FixedVideoSection() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Video playback management logic
    // Intersection Observer setup
    // Cleanup on unmount
  }, [])

  return (
    <section ref={containerRef} className="...">
      {/* Video Container */}
      <div className="...">
        {/* Background Video */}
        <video ref={videoRef} ...>
          <source src="/bgfixedscroll.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="..." />
        
        {/* Scrollable Content */}
        <div className="...">
          {/* Content elements */}
        </div>
      </div>
    </section>
  )
}
```

### CSS Architecture

#### Container Styles

```css
.video-container {
  position: relative;           /* Establishes stacking context */
  width: 100%;
  height: clamp(600px, 100vh, 1000px);
  overflow: hidden;             /* Prevents content overflow */
  background-color: #000000;    /* Fallback while video loads */
}
```

**Height Strategy**: Uses CSS `clamp()` for responsive sizing:
- Minimum: 600px (ensures sufficient space on small screens)
- Preferred: 100vh (full viewport height on medium screens)
- Maximum: 1000px (prevents excessive height on large displays)

#### Video Styles

```css
.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;            /* Fills container while maintaining aspect ratio */
  z-index: 0;
  will-change: transform;       /* Hints browser for GPU acceleration */
}
```

**Performance Optimization**:
- `will-change: transform`: Promotes video to its own compositor layer for GPU rendering
- `object-fit: cover`: Ensures video fills container without letterboxing
- `z-index: 0`: Explicitly sets stacking order (lowest layer)

#### Overlay Styles

```css
.dark-overlay {
  position: absolute;
  inset: 0;                     /* Shorthand for top/right/bottom/left: 0 */
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1;
  pointer-events: none;         /* Allows clicks to pass through */
}
```

**Purpose**: Increases text contrast and readability by darkening the video background by 40%.

#### Content Styles

```css
.overlay-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 3rem 1.5rem;         /* Mobile padding */
  text-align: center;
}

@media (min-width: 768px) {
  .overlay-content {
    padding: 4rem 2.5rem;       /* Tablet padding */
  }
}

@media (min-width: 1024px) {
  .overlay-content {
    padding: 5rem 4rem;         /* Desktop padding */
  }
}
```

### Video Playback Management

#### Autoplay Strategy

The component implements a **progressive enhancement approach** for video autoplay:

1. **Primary Method**: HTML5 autoplay attribute with required constraints
2. **Fallback Method**: Intersection Observer with retry logic

```javascript
useEffect(() => {
  const video = videoRef.current
  if (!video) return

  // Primary: Attempt autoplay on mount
  const playPromise = video.play()
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('Video autoplay successful')
      })
      .catch(error => {
        console.warn('Autoplay failed, setting up Intersection Observer fallback:', error)
        setupIntersectionObserver()
      })
  }

  // Fallback: Intersection Observer for viewport detection
  function setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(err => {
              console.error('Intersection Observer play attempt failed:', err)
            })
          }
        })
      },
      { threshold: 0.25 } // Trigger when 25% visible
    )

    observer.observe(video)
    return observer
  }

  const observer = setupIntersectionObserver()

  // Cleanup
  return () => {
    if (observer) {
      observer.disconnect()
    }
    if (video && !video.paused) {
      video.pause()
    }
  }
}, [])
```

#### Video Attributes

```html
<video
  ref={videoRef}
  autoPlay          <!-- Browser autoplay (requires muted) -->
  loop              <!-- Continuous playback -->
  muted             <!-- Required for autoplay to work -->
  playsInline       <!-- Prevents fullscreen on iOS -->
  preload="auto"    <!-- Start loading immediately -->
  className="..."
>
  <source src="/bgfixedscroll.mp4" type="video/mp4" />
</video>
```

**Attribute Rationale**:
- `autoPlay`: Enables automatic playback when page loads
- `loop`: Creates seamless continuous playback without gaps
- `muted`: Required by browser autoplay policies (prevents audio spam)
- `playsInline`: iOS Safari requires this to prevent forced fullscreen
- `preload="auto"`: Begins downloading video immediately for faster playback

### Responsive Design

#### Breakpoint Strategy

The component adapts across three breakpoints:

| Breakpoint | Width Range | Container Height | Content Padding | Typography Scale |
|------------|-------------|------------------|-----------------|------------------|
| Mobile     | 0-767px     | 600px (min)      | 3rem 1.5rem     | Base             |
| Tablet     | 768-1023px  | 100vh            | 4rem 2.5rem     | 1.2×             |
| Desktop    | 1024px+     | 1000px (max)     | 5rem 4rem       | 1.5×             |

#### Mobile Optimizations

```javascript
// Mobile-specific considerations
const isMobile = window.innerWidth < 768

const mobileOptimizedProps = {
  preload: isMobile ? 'metadata' : 'auto',  // Reduce data usage
  playsInline: true,                         // Prevent fullscreen
}
```

### Performance Optimizations

#### Hardware Acceleration

```css
.background-video {
  will-change: transform;
  transform: translateZ(0);     /* Forces GPU layer promotion */
  backface-visibility: hidden;  /* Reduces subpixel rendering issues */
}
```

These CSS properties ensure the video renders on the GPU, reducing main thread load during scrolling.

#### Intersection Observer Configuration

```javascript
const observerOptions = {
  threshold: 0.25,              // Trigger at 25% visibility
  rootMargin: '100px 0px',      // Start loading 100px before entering viewport
}
```

This configuration provides a buffer zone, starting video playback before the section is fully visible for a smoother user experience.

### Error Handling

#### Video Load Failures

```javascript
<video
  onError={(e) => {
    console.error('Video failed to load:', e)
    // Container maintains black background as fallback
    // Layout structure remains intact
  }}
>
```

**Graceful Degradation**: If the video fails to load:
1. Black background (`#000000`) remains visible
2. Content overlay is still readable
3. No layout shift or broken UI

#### Browser Compatibility Fallbacks

```javascript
// Check for Intersection Observer support
if (!('IntersectionObserver' in window)) {
  console.warn('Intersection Observer not supported, attempting immediate play')
  videoRef.current?.play()
}
```

## Data Flow

### Component Lifecycle

```
1. Mount Phase
   ├─→ Component renders with refs
   ├─→ useEffect runs
   ├─→ Attempt autoplay
   └─→ Setup Intersection Observer (if autoplay fails)

2. Interaction Phase
   ├─→ User scrolls page
   ├─→ Content scrolls over fixed video
   └─→ Video continues looping

3. Unmount Phase
   ├─→ useEffect cleanup runs
   ├─→ Disconnect Intersection Observer
   ├─→ Pause video playback
   └─→ Release resources
```

### State Management

**No React state required.** The component is **stateless** and relies on:
- DOM refs (`videoRef`, `containerRef`) for element access
- Native browser APIs for video control
- CSS for visual effects

This stateless approach minimizes re-renders and improves performance.

## Data Models

### Video Configuration Model

```typescript
interface VideoConfig {
  src: string               // '/bgfixedscroll.mp4'
  autoPlay: boolean         // true
  loop: boolean             // true
  muted: boolean            // true
  playsInline: boolean      // true
  preload: 'auto' | 'metadata' | 'none'  // 'auto'
}
```

### Container Dimensions Model

```typescript
interface ContainerDimensions {
  minHeight: string         // '600px'
  preferredHeight: string   // '100vh'
  maxHeight: string         // '1000px'
  heightFormula: string     // 'clamp(600px, 100vh, 1000px)'
}
```

### Overlay Style Model

```typescript
interface OverlayStyle {
  backgroundColor: string   // 'rgba(0, 0, 0, 0.4)'
  position: 'absolute'
  inset: string            // '0'
  zIndex: number           // 1
  pointerEvents: 'none'
}
```

### Intersection Observer Config

```typescript
interface ObserverConfig {
  threshold: number         // 0.25
  rootMargin: string       // '100px 0px'
}
```

These models define the shape of configuration data used throughout the component.

## Error Handling

### Video Load Failures

**Error Type**: Video resource fails to load (404, network error, unsupported format)

**Detection**: `<video>` element `onError` event handler

**Response Strategy**:
1. Log error to console: `console.error('Video failed to load:', error)`
2. Display fallback black background (`#000000`)
3. Maintain content overlay readability
4. Preserve section layout structure (no height collapse)

**User Impact**: Content remains accessible; video is simply absent

```javascript
<video
  onError={(e) => {
    console.error('Video failed to load:', e)
    // Container maintains black background as fallback
    // Layout structure remains intact
  }}
>
```

### Autoplay Blocked

**Error Type**: Browser autoplay policy blocks video playback

**Detection**: `video.play()` promise rejection

**Response Strategy**:
1. Log warning: `console.warn('Autoplay failed, setting up Intersection Observer fallback')`
2. Set up Intersection Observer fallback
3. Retry playback when section enters viewport
4. If retry fails, log error but don't break UI

**User Impact**: Video plays when user scrolls to section instead of immediately

```javascript
playPromise.catch(error => {
  console.warn('Autoplay failed, setting up Intersection Observer fallback:', error)
  setupIntersectionObserver()
})
```

### Intersection Observer Unsupported

**Error Type**: Browser doesn't support Intersection Observer API

**Detection**: Feature detection check `'IntersectionObserver' in window`

**Response Strategy**:
1. Log warning: `console.warn('Intersection Observer not supported')`
2. Attempt immediate video play as fallback
3. Accept that video may not play if autoplay is blocked

**User Impact**: Minimal; modern browsers all support Intersection Observer

```javascript
if (!('IntersectionObserver' in window)) {
  console.warn('Intersection Observer not supported, attempting immediate play')
  videoRef.current?.play()
}
```

### Component Unmount During Video Load

**Error Type**: Component unmounts before video finishes loading or while playing

**Detection**: `useEffect` cleanup function

**Response Strategy**:
1. Disconnect Intersection Observer: `observer?.disconnect()`
2. Pause video if playing: `video.paused || video.pause()`
3. Clear any pending promises or timers
4. Release references

**User Impact**: None; proper cleanup prevents memory leaks

```javascript
return () => {
  if (observer) observer.disconnect()
  if (video && !video.paused) video.pause()
}
```

### Scroll Performance Degradation

**Error Type**: Janky scrolling or frame drops

**Detection**: Manual testing, Chrome DevTools Performance profiling

**Response Strategy**:
1. Ensure `will-change: transform` is applied to video
2. Verify GPU layer promotion with DevTools
3. Check for excessive JavaScript during scroll
4. Reduce overlay complexity if needed

**User Impact**: Poor scrolling experience, reduced perceived quality

**Prevention**: Use CSS-based animations and hardware acceleration from the start

## Integration Points

### HomePage Integration

```javascript
// In src/pages/HomePage.jsx

function HomePage() {
  return (
    <>
      <Helmet>...</Helmet>
      <HeroSection />
      <FeaturedCategoriesSection />
      <XtremeKolorzSection />
      <XtremeWrapSection />
      <WhyKustomKoatsNeon />
      
      {/* NEW: Fixed Video Section */}
      <FixedVideoSection />
      
      <NewsletterSection />
    </>
  )
}
```

**Positioning**: Placed after `WhyKustomKoatsNeon` and before `NewsletterSection` to provide visual break in the middle-to-lower section of the homepage.

### Styling Consistency

The component follows the existing Kustom Koats design system:

- **Typography**: Uses `'Rajdhani'` for headings and `'Inter'` for body text
- **Colors**: Primary red (`#FF0000`), black (`#000000`), white (`#FFFFFF`)
- **Spacing**: Follows the `PX` constant pattern from HomePage
- **Animations**: Uses motion patterns consistent with other sections

## Accessibility Considerations

### Semantic HTML

```html
<section aria-label="Brand showcase video">
  <video aria-label="Kustom Koats automotive showcase">
    <source src="/bgfixedscroll.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <div role="presentation" aria-hidden="true"><!-- Dark overlay --></div>
  <div><!-- Content --></div>
</section>
```

### Motion Sensitivity

```css
@media (prefers-reduced-motion: reduce) {
  .background-video {
    animation: none;
    transform: none;
  }
}
```

Users with motion sensitivity preferences will see a static video frame without parallax effects.

### Keyboard Navigation

All interactive elements within the content overlay (buttons, links) remain fully keyboard-accessible:
- `tabindex` follows natural document order
- Focus indicators are visible
- No focus traps

## Testing Strategy

### Unit Tests

Focus on specific component behaviors and edge cases:

1. **Component Rendering**
   - Verify component renders without errors
   - Check video element exists with correct attributes
   - Validate overlay structure

2. **Video Attributes**
   - Verify `autoPlay`, `loop`, `muted`, `playsInline` attributes present
   - Check video source is `/bgfixedscroll.mp4`
   - Validate `preload="auto"` attribute

3. **DOM Structure**
   - Verify component appears after WhyKustomKoatsNeon in HomePage
   - Check stacking order: video → overlay → content
   - Validate CSS classes and inline styles

4. **Event Handlers**
   - Test video `onError` handler
   - Verify cleanup function disconnects Intersection Observer
   - Check video pauses on unmount

5. **Responsive Behavior**
   - Test height clamp at various viewport sizes
   - Verify padding adjustments at breakpoints
   - Check playsInline attribute presence for mobile

6. **Error Handling**
   - Simulate video load failure
   - Verify layout remains intact
   - Check fallback background color displays

### Integration Tests

Test interaction with parent components:

1. **HomePage Integration**
   - Verify section renders in correct position
   - Check no layout shifts occur when video loads
   - Test scroll behavior through entire page

2. **Video Playback**
   - Simulate Intersection Observer trigger
   - Verify play() called when section enters viewport
   - Test autoplay fallback mechanism

### Manual Testing Checklist

- [ ] Video plays automatically on page load (desktop)
- [ ] Video loops seamlessly without gaps
- [ ] Scrolling is smooth without jank
- [ ] Content remains readable over video
- [ ] Video doesn't force fullscreen on iOS
- [ ] Layout adapts on window resize
- [ ] Video plays when scrolling to section (if autoplay failed)
- [ ] Black background shows while video loads
- [ ] Section maintains height if video fails to load

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Reflection and Consolidation

After reviewing all testable criteria from the prework analysis, I identified the following consolidations:

1. **Video Attributes** (1.5, 1.6, 2.4, 3.1, 3.2, 3.3, 3.6): All attribute checks can be consolidated into a single property validating the complete attribute set
2. **Positioning** (1.3, 4.4, 4.5, 4.6): Positioning checks are related but test different elements, so they remain separate
3. **Dimensions** (1.4, 4.3): Similar dimension checks but for different elements (video vs overlay), remain separate
4. **Cleanup** (8.4, 8.5): Both test cleanup logic and can be consolidated into one comprehensive cleanup property
5. **Height Constraints** (2.1, 2.5, 2.6): The clamp function test subsumes the min/max tests, consolidate into one

The following properties provide unique validation value without redundancy:

### Property 1: Video Element Configuration

For any rendered FixedVideoSection component, the background video element shall have all required HTML5 attributes configured: `autoPlay`, `loop`, `muted`, `playsInline`, `preload="auto"`, source element with `type="video/mp4"`, and `src="/bgfixedscroll.mp4"`.

**Validates: Requirements 1.2, 1.5, 1.6, 2.4, 3.1, 3.2, 3.3, 3.6**

### Property 2: Component Positioning

For any rendered HomePage component, the FixedVideoSection element shall appear in the DOM after the WhyKustomKoatsNeon element and before the NewsletterSection element.

**Validates: Requirements 1.1, 6.4**

### Property 3: Layer Stacking Order

For any rendered FixedVideoSection component, the z-index stacking shall follow the order: Background_Video (z-index 0) < DarkOverlay (z-index 1) < OverlayContent (z-index 2), with Video_Container using `position: relative` to establish stacking context.

**Validates: Requirements 4.2, 4.4, 4.5, 4.6**

### Property 4: Responsive Height Constraints

For any viewport size, the Video_Container computed height shall satisfy the clamp function `clamp(600px, 100vh, 1000px)`, ensuring minimum height >= 600px and maximum height <= 1000px.

**Validates: Requirements 2.1, 2.5, 2.6**

### Property 5: Video Coverage

For any rendered BackgroundVideo element, the element shall have `width: 100%`, `height: 100%`, and `object-fit: cover` CSS properties to completely fill the Video_Container.

**Validates: Requirements 1.4**

### Property 6: Overlay Coverage

For any rendered DarkOverlay element, the element shall have `position: absolute`, `inset: 0` (or equivalent), and `background-color: rgba(0, 0, 0, 0.4)` to cover the full Video_Container with 40% opacity black overlay.

**Validates: Requirements 4.1, 4.3**

### Property 7: Scroll Independence

For any scroll event within the FixedVideoSection, the Background_Video element position shall remain fixed (or absolute within a positioned container) while the Overlay_Content scrolls independently.

**Validates: Requirements 1.3, 1.7, 5.1, 5.2**

### Property 8: Intersection Observer Fallback

For any FixedVideoSection where initial autoplay fails, the component shall set up an IntersectionObserver that attempts to call `video.play()` when the section enters the viewport (intersection threshold >= 0.25).

**Validates: Requirements 3.4, 3.5**

### Property 9: Component Lifecycle Cleanup

For any FixedVideoSection component that unmounts, the cleanup function shall disconnect the IntersectionObserver (if present) and pause the video if currently playing.

**Validates: Requirements 8.4, 8.5**

### Property 10: Error Resilience

For any video load error event, the FixedVideoSection shall invoke the onError handler, log the error, and maintain the Video_Container layout structure with black background fallback visible.

**Validates: Requirements 8.2, 8.3**

### Property 11: Performance Optimization

For any rendered BackgroundVideo element, the element shall include CSS properties optimized for scroll performance: `will-change: transform` or `transform: translateZ(0)` to enable hardware acceleration.

**Validates: Requirements 5.4, 5.5**

### Property 12: Brand Consistency

For any rendered FixedVideoSection, the component shall use styling consistent with other homepage sections: black fallback background (`#000000`), `overflow: hidden`, full width, and inline styles matching the existing HomePage pattern.

**Validates: Requirements 7.1, 7.2, 7.3, 7.5**

## Future Enhancements

### Potential Improvements

1. **Multiple Video Sources**: Support WebM and other formats for broader compatibility
2. **Lazy Loading**: Only load video when section approaches viewport
3. **Playback Controls**: Add pause/play button for user control
4. **Analytics**: Track video play rate and user engagement
5. **A/B Testing**: Compare static image vs video background performance
6. **Dynamic Content**: CMS-driven overlay content and video source

### Performance Monitoring

```javascript
// Add performance marks
performance.mark('video-section-start')
// ... component logic
performance.mark('video-section-end')
performance.measure('video-section-render', 'video-section-start', 'video-section-end')
```

Track metrics:
- Time to first video frame
- Scroll performance (FPS during scroll)
- Video load success rate
- User engagement time

## Conclusion

This design provides a performant, accessible, and reliable fixed background video section that integrates seamlessly with the existing Kustom Koats homepage. The component leverages modern web APIs (Intersection Observer, HTML5 Video) with progressive enhancement fallbacks to ensure broad browser compatibility and a smooth user experience across all devices.
