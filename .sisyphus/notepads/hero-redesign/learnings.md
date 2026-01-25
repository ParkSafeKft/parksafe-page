# Learnings - Hero Redesign

## Visual Improvements
- **Gradient Blobs**: Replaced static white background with subtle, large, blurred gradient blobs (`blur-[120px]`) in brand colors (`#34aa56`, `emerald-500`). This adds depth without clutter.
- **Typography**: Tightened tracking (`tracking-tighter`) on the main headline for a more modern, editorial look. Used `bg-clip-text` for the subtitle to integrate the brand color more organically.
- **Animations**: Switched to smoother easing (`[0.16, 1, 0.3, 1]`) for entrance animations. Added a continuous floating animation (`y: [0, -15, 0]`) to the mobile mockup to make the page feel "alive".
- **Buttons**: Refined button styles. The primary button now uses the brand green with a subtle shadow and ring focus state. The secondary button is cleaner with a hover border effect.

## Technical Details
- **Framer Motion**: Used `motion.div` for staggered entrances and the floating effect.
- **Tailwind**: Leveraged `backdrop-blur` (implicitly via the blobs behind content) and `mix-blend-multiply` for the noise texture to maintain texture while adding color depth.
- **Responsiveness**: Maintained the 2-column grid that stacks on mobile.

## Future Considerations
- The "noise" texture is a nice touch for a "paper" feel, keeping it with `mix-blend-multiply` works well over gradients.
- The floating animation on the image adds a lot of perceived value/polish with very little code.
