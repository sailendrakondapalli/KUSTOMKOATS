# Implementation Plan: Fixed Background Video Section

## Overview

This plan outlines the implementation of a fixed background video section with scrollable overlay content for the Kustom Koats homepage. The section will be implemented directly within the existing HomePage.jsx file, featuring a video background that remains stationary while content scrolls over it, positioned after the WhyKustomKoatsNeon component.

The implementation leverages React hooks (useRef, useEffect) for video management, CSS positioning for the parallax effect, and Intersection Observer API for reliable video playback across browsers.

## Tasks

- [ ] 1. Implement core FixedVideoSection component structure
  - [ ] 1.1 Create FixedVideoSection functional component in HomePage.jsx
    - Define FixedVideoSection as a functional component below the existing sections
    - Set up React hooks: useRef for video element (videoRef) and container element (containerRef)
    - Create basic JSX structure with section wrapper and nested div elements
    - Use inline styles consistent with other HomePage sections
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ] 1.2 Implement video container with proper positioning
    - Create VideoContainer div with relative positioning to establish stacking context
    - Apply responsive height using clamp(600px, 100vh, 1000px)
    - Set overflow-hidden to prevent content overflow
    - Add black background (#000000) as fallback
    - Apply full width styling consistent with other homepage sections
    - _Requirements: 2.1, 2.5, 2.6, 4.6, 7.1, 7.2, 7.3_
  
  - [ ] 1.3 Add HTML5 video element with required attributes
    - Create video element with ref={videoRef}
    - Add attributes: autoPlay, loop, muted, playsInline, preload="auto"
    - Include source element with src="/bgfixedscroll.mp4" and type="video/mp4"
    - Apply positioning: absolute with inset-0
    - Set width/height to 100% with object-fit: cover
    - Add z-index: 0 for bottom layer
    - Include will-change: transform for GPU acceleration
    - _Requirements: 1.2, 1.5, 1.6, 2.2, 2.4, 3.1, 3.2, 3.3, 3.6, 4.4, 5.5_

- [ ] 2. Implement overlay and content layers
  - [ ] 2.1 Create dark overlay layer for contrast
    - Add div element positioned between video and content
    - Apply absolute positioning with inset: 0
    - Set background-color to rgba(0, 0, 0, 0.4)
    - Add z-index: 1 for middle layer
    - Include pointer-events: none to allow clicks through
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 2.2 Implement scrollable overlay content container
    - Create content container div with relative positioning
    - Set z-index: 2 for top layer
    - Apply responsive padding: 3rem 1.5rem (mobile), 4rem 2.5rem (tablet), 5rem 4rem (desktop)
    - Use flexbox with center alignment and column direction
    - Set height to 100% to fill container
    - Add text-align: center for content centering
    - _Requirements: 1.7, 4.5, 7.4_
  
  - [ ] 2.3 Add placeholder content with brand styling
    - Create heading element with Rajdhani font family
    - Add description paragraph with Inter font family
    - Include CTA button with hover effects
    - Use brand colors: white text (#FFFFFF), red accents (#FF0000)
    - Apply responsive typography scaling across breakpoints
    - _Requirements: 7.1, 7.5_

- [ ] 3. Implement video playback management
  - [ ] 3.1 Set up useEffect hook for video initialization
    - Create useEffect with empty dependency array for mount/unmount
    - Access video element via videoRef.current
    - Add early return if video element is null
    - Include JSDoc comment explaining video playback logic
    - _Requirements: 6.2, 6.6_
  
  - [ ] 3.2 Implement primary autoplay attempt
    - Call video.play() inside useEffect
    - Store returned Promise in playPromise variable
    - Add success handler logging "Video autoplay successful"
    - Add catch handler for autoplay failures
    - Log autoplay failure with console.warn
    - _Requirements: 1.5, 3.7_
  
  - [ ] 3.3 Implement Intersection Observer fallback mechanism
    - Create setupIntersectionObserver function inside useEffect
    - Configure IntersectionObserver with threshold: 0.25
    - Implement callback to attempt video.play() when section is intersecting
    - Call setupIntersectionObserver if primary autoplay fails
    - Store observer reference for cleanup
    - _Requirements: 3.4, 3.5_
  
  - [ ] 3.4 Add video error handling
    - Implement onError handler on video element
    - Log error with console.error('Video failed to load:', error)
    - Maintain container layout structure on error
    - Ensure black background remains visible as fallback
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 3.5 Implement cleanup function
    - Create useEffect return function for cleanup
    - Disconnect IntersectionObserver if present
    - Check if video is playing (!video.paused)
    - Call video.pause() to stop playback
    - Clear any references
    - _Requirements: 8.4, 8.5_

- [ ] 4. Add responsive styling and performance optimizations
  - [ ] 4.1 Implement responsive breakpoints
    - Add media query for tablet (min-width: 768px) with updated padding
    - Add media query for desktop (min-width: 1024px) with updated padding
    - Test container height behavior at various viewport sizes
    - Verify minimum height (600px) and maximum height (1000px) constraints
    - _Requirements: 2.1, 2.3, 2.5, 2.6_
  
  - [ ] 4.2 Apply performance optimizations
    - Add will-change: transform to video element
    - Consider transform: translateZ(0) for GPU layer promotion
    - Add backface-visibility: hidden to reduce subpixel rendering issues
    - Verify hardware-accelerated rendering in Chrome DevTools
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ] 4.3 Ensure proper spacing with adjacent sections
    - Verify no layout shifts when video loads
    - Check spacing above (WhyKustomKoatsNeon) and below (NewsletterSection)
    - Test scroll behavior through the section
    - Ensure smooth rendering performance during scroll
    - _Requirements: 5.1, 5.2, 5.3, 7.4_

- [ ] 5. Integration and verification
  - [ ] 5.1 Verify component placement in HomePage
    - Confirm FixedVideoSection renders between WhyKustomKoatsNeon and NewsletterSection
    - Check that component follows naming convention of other sections
    - Ensure consistent styling with other homepage sections
    - _Requirements: 1.1, 6.3, 6.4, 7.3_
  
  - [ ] 5.2 Test video playback across browsers
    - Test autoplay in Chrome, Firefox, Safari, Edge
    - Verify playsInline works on iOS Safari (prevents fullscreen)
    - Test Intersection Observer fallback when autoplay is blocked
    - Confirm video loops seamlessly without gaps
    - Check muted attribute enables autoplay
    - _Requirements: 1.5, 1.6, 2.4, 3.1, 3.2, 3.4, 3.5_
  
  - [ ] 5.3 Test responsive behavior
    - Test on mobile devices (320px - 767px)
    - Test on tablets (768px - 1023px)
    - Test on desktop (1024px+)
    - Verify container height clamp function works correctly
    - Check content padding adjusts at each breakpoint
    - Ensure video covers container at all sizes
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_
  
  - [ ] 5.4 Verify layering and visual depth
    - Inspect z-index stacking with browser DevTools
    - Confirm video is bottom layer (z-index: 0)
    - Verify overlay is middle layer (z-index: 1)
    - Ensure content is top layer (z-index: 2)
    - Check dark overlay provides sufficient contrast (40% opacity)
    - Test content readability over video
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 5.5 Write unit tests for video configuration
  - Test FixedVideoSection renders without errors
  - Verify video element has correct attributes (autoPlay, loop, muted, playsInline, preload="auto")
  - Check video source is "/bgfixedscroll.mp4"
  - Validate video element uses videoRef
  - Test that useEffect cleanup function disconnects observer and pauses video

- [ ]* 5.6 Write property test for video element configuration (Property 1)
  - **Property 1: Video Element Configuration**
  - **Validates: Requirements 1.2, 1.5, 1.6, 2.4, 3.1, 3.2, 3.3, 3.6**
  - Generate various component mount scenarios
  - For each scenario, verify video element has all required attributes
  - Check: autoPlay, loop, muted, playsInline, preload="auto", src="/bgfixedscroll.mp4", type="video/mp4"

- [ ]* 5.7 Write property test for layer stacking order (Property 3)
  - **Property 3: Layer Stacking Order**
  - **Validates: Requirements 4.2, 4.4, 4.5, 4.6**
  - Generate various rendering scenarios
  - For each scenario, verify z-index values: video (0) < overlay (1) < content (2)
  - Check container uses position: relative

- [ ]* 5.8 Write property test for responsive height constraints (Property 4)
  - **Property 4: Responsive Height Constraints**
  - **Validates: Requirements 2.1, 2.5, 2.6**
  - Generate various viewport dimensions (300px to 2000px)
  - For each viewport, compute container height using clamp(600px, 100vh, 1000px)
  - Verify computed height >= 600px and <= 1000px

- [ ]* 5.9 Write property test for video coverage (Property 5)
  - **Property 5: Video Coverage**
  - **Validates: Requirements 1.4**
  - Generate various container dimensions
  - For each container, verify video element has width: 100%, height: 100%, object-fit: cover

- [ ]* 5.10 Write property test for overlay coverage (Property 6)
  - **Property 6: Overlay Coverage**
  - **Validates: Requirements 4.1, 4.3**
  - Generate various container dimensions
  - For each container, verify overlay has position: absolute, inset: 0, background-color: rgba(0, 0, 0, 0.4)

- [ ]* 5.11 Write integration test for Intersection Observer fallback (Property 8)
  - **Property 8: Intersection Observer Fallback**
  - **Validates: Requirements 3.4, 3.5**
  - Mock initial autoplay failure
  - Verify IntersectionObserver is created with threshold >= 0.25
  - Simulate section entering viewport
  - Confirm video.play() is called when section intersects

- [ ]* 5.12 Write integration test for component lifecycle cleanup (Property 9)
  - **Property 9: Component Lifecycle Cleanup**
  - **Validates: Requirements 8.4, 8.5**
  - Mount component and set up observer
  - Start video playback
  - Unmount component
  - Verify IntersectionObserver.disconnect() was called
  - Verify video.pause() was called

- [ ]* 5.13 Write integration test for error resilience (Property 10)
  - **Property 10: Error Resilience**
  - **Validates: Requirements 8.2, 8.3**
  - Simulate video load error
  - Verify onError handler logs error
  - Check container maintains layout with black background
  - Ensure no layout shift occurs

- [ ] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- The component is implemented directly in HomePage.jsx, not as a separate file
- Video file (/bgfixedscroll.mp4) must exist in the public directory
- Property tests validate universal correctness properties from the design document
- Unit tests and integration tests validate specific examples and error handling
- All tasks reference specific requirements for traceability
- The useEffect cleanup ensures proper resource management when component unmounts
- Intersection Observer provides fallback for browsers with strict autoplay policies
- Hardware acceleration (will-change: transform) optimizes scroll performance

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["1.3", "2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4"] },
    { "id": 5, "tasks": ["3.5", "4.1"] },
    { "id": 6, "tasks": ["4.2", "4.3"] },
    { "id": 7, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 8, "tasks": ["5.5", "5.6", "5.7", "5.8", "5.9", "5.10", "5.11", "5.12", "5.13"] }
  ]
}
```
