# Design System Documentation

## Overview

This document describes the visual design system used in the Portal Keasramaan application, specifically for the Template Builder Rapor feature and related components.

## Design Principles

1. **Consistency** - Unified spacing, colors, and typography across all components
2. **Smooth Transitions** - All interactions have smooth, professional animations
3. **Accessibility** - Focus states, ARIA labels, and keyboard navigation support
4. **Responsive** - Mobile-first design that scales beautifully to desktop
5. **Performance** - Optimized animations with reduced motion support

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` (bg-blue-600)
- **Primary Hover**: `#1d4ed8` (bg-blue-700)
- **Primary Light**: `#dbeafe` (bg-blue-100)

### Secondary Colors
- **Success Green**: `#10b981` (bg-green-600)
- **Warning Yellow**: `#f59e0b` (bg-yellow-600)
- **Danger Red**: `#ef4444` (bg-red-600)
- **Info Cyan**: `#3b82f6` (bg-cyan-600)

### Neutral Colors
- **Gray 50**: `#f9fafb` - Backgrounds
- **Gray 100**: `#f3f4f6` - Subtle backgrounds
- **Gray 200**: `#e5e7eb` - Borders
- **Gray 300**: `#d1d5db` - Disabled states
- **Gray 400**: `#9ca3af` - Placeholders
- **Gray 500**: `#6b7280` - Secondary text
- **Gray 600**: `#4b5563` - Body text
- **Gray 700**: `#374151` - Headings
- **Gray 800**: `#1f2937` - Primary text
- **Gray 900**: `#111827` - Emphasis

## Typography

### Font Families
- **Sans-serif**: System font stack for optimal performance
- **Monospace**: For code and technical content

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)

### Font Weights
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## Spacing Scale

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 2.5rem (40px)
- **3xl**: 3rem (48px)

## Border Radius

- **sm**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)
- **full**: 9999px (circular)

## Shadows

- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1)`
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

## Animations

### Keyframe Animations

#### fadeIn
Fades element from transparent to opaque.
```css
.animate-fade-in
```

#### fadeInUp
Fades in while sliding up from below.
```css
.animate-fade-in-up
```

#### fadeInDown
Fades in while sliding down from above.
```css
.animate-fade-in-down
```

#### scaleIn
Scales element from 95% to 100% while fading in.
```css
.animate-scale-in
```

#### slideInRight
Slides in from the right while fading in.
```css
.animate-slide-in-right
```

#### slideInLeft
Slides in from the left while fading in.
```css
.animate-slide-in-left
```

#### pulse
Pulses opacity between 100% and 50%.
```css
.animate-pulse
```

#### spin
Rotates element 360 degrees continuously.
```css
.animate-spin
```

#### bounce
Bounces element up and down.
```css
.animate-bounce
```

#### shimmer
Creates a shimmer effect for loading states.
```css
.animate-shimmer
```

### Stagger Animations

For lists and grids, use stagger animations to create a cascading effect:
```css
.stagger-fade-in
```

Children will animate in sequence with 50ms delay between each.

### Transition Speeds

- **Fast**: 150ms - For hover states and quick interactions
- **Base**: 200ms - Default transition speed
- **Slow**: 300ms - For complex animations

```css
.transition-smooth-fast  /* 150ms */
.transition-smooth       /* 200ms */
.transition-smooth-slow  /* 300ms */
```

## Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Click Me
</button>
```

#### Secondary Button
```tsx
<button className="btn-secondary">
  Cancel
</button>
```

#### Danger Button
```tsx
<button className="btn-danger">
  Delete
</button>
```

#### Success Button
```tsx
<button className="btn-success">
  Confirm
</button>
```

### Cards

#### Basic Card
```tsx
<div className="card">
  Content
</div>
```

#### Hoverable Card
```tsx
<div className="card-hover">
  Content
</div>
```

#### Interactive Card
```tsx
<div className="card-interactive">
  Clickable Content
</div>
```

### Inputs

#### Text Input
```tsx
<input className="input" type="text" />
```

#### Input with Error
```tsx
<input className="input-error" type="text" />
```

### Badges

```tsx
<span className="badge-primary">Primary</span>
<span className="badge-success">Success</span>
<span className="badge-warning">Warning</span>
<span className="badge-danger">Danger</span>
<span className="badge-info">Info</span>
```

### Empty States

Use the `EmptyState` component for consistent empty state messaging:

```tsx
import EmptyState from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

<EmptyState
  icon={FileText}
  title="No Data Found"
  description="Start by creating your first item"
  action={{
    label: "Create Item",
    onClick: handleCreate,
    icon: Plus
  }}
/>
```

### Loading States

#### Skeleton Loaders
```tsx
import { SkeletonCard, SkeletonTable, SkeletonForm } from '@/components/ui/Skeleton';

<SkeletonCard />
<SkeletonTable />
<SkeletonForm />
```

#### Spinner
```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="md" variant="primary" text="Loading..." />
```

#### Progress Bar
```tsx
import ProgressBar from '@/components/ui/ProgressBar';

<ProgressBar value={75} max={100} variant="primary" showLabel />
```

### Toasts

Toasts are automatically styled. Use the toast context:

```tsx
import { useToast } from '@/components/ui/ToastContainer';

const toast = useToast();

toast.success('Operation successful!');
toast.error('Something went wrong');
toast.warning('Please be careful');
toast.info('Here is some information');
```

### Dialogs

```tsx
import ConfirmDialog from '@/components/ui/ConfirmDialog';

<ConfirmDialog
  isOpen={isOpen}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  confirmText="Yes, proceed"
  cancelText="Cancel"
  confirmVariant="danger"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

## Hover Effects

### Lift Effect
Lifts element slightly on hover with shadow.
```css
.hover-lift
```

### Scale Effect
Scales element to 102% on hover.
```css
.hover-scale
```

### Glow Effect
Adds a blue glow on hover.
```css
.hover-glow
```

## Focus States

All interactive elements should have focus states for keyboard navigation:

```css
.focus-ring  /* Adds blue focus ring */
```

## Accessibility

### Screen Reader Only
Hide content visually but keep it accessible to screen readers:
```css
.sr-only
```

### Focus Visible
Only show focus ring when navigating with keyboard:
```css
.focus-visible:focus-visible
```

### Reduced Motion
Respects user's motion preferences. All animations are automatically reduced for users who prefer reduced motion.

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Utilities
```css
.mobile-full-width  /* Full width on mobile */
.mobile-stack       /* Stack vertically on mobile */
```

## Custom Scrollbar

For better aesthetics, use custom scrollbar styling:
```css
.custom-scrollbar
```

## Best Practices

### 1. Consistent Spacing
Use the spacing scale consistently. Avoid arbitrary values.

✅ Good:
```tsx
<div className="p-4 mb-6 gap-2">
```

❌ Bad:
```tsx
<div className="p-[17px] mb-[23px] gap-[9px]">
```

### 2. Smooth Transitions
Always add transitions to interactive elements.

✅ Good:
```tsx
<button className="bg-blue-600 hover:bg-blue-700 transition-smooth">
```

❌ Bad:
```tsx
<button className="bg-blue-600 hover:bg-blue-700">
```

### 3. Proper Animations
Use appropriate animations for different contexts.

- **Page loads**: `animate-fade-in`
- **Modals**: `animate-scale-in`
- **Toasts**: `animate-slide-in-right`
- **Lists**: `stagger-fade-in`

### 4. Accessibility First
Always include:
- Focus states
- ARIA labels
- Keyboard navigation support
- Semantic HTML

### 5. Loading States
Always show loading states for async operations:
- Skeleton loaders for initial loads
- Spinners for actions
- Progress bars for long operations

### 6. Empty States
Provide helpful empty states with:
- Clear icon
- Descriptive title
- Helpful message
- Call-to-action button (when applicable)

## Examples

### Complete Card Example
```tsx
<div className="card-hover hover-lift animate-fade-in-up">
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      Card Title
    </h3>
    <p className="text-gray-600 mb-4">
      Card description goes here
    </p>
    <button className="btn-primary hover-lift">
      Action
    </button>
  </div>
</div>
```

### Complete Form Example
```tsx
<form className="card animate-fade-in">
  <div className="p-6 space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Name
      </label>
      <input
        type="text"
        className="input focus-ring"
        placeholder="Enter name"
      />
    </div>
    
    <div className="flex gap-2 pt-4">
      <button type="button" className="btn-secondary flex-1">
        Cancel
      </button>
      <button type="submit" className="btn-primary flex-1">
        Submit
      </button>
    </div>
  </div>
</form>
```

## Maintenance

When adding new components:
1. Follow the established patterns
2. Use the design tokens (colors, spacing, etc.)
3. Add smooth transitions
4. Include focus states
5. Test with keyboard navigation
6. Test with reduced motion enabled
7. Ensure mobile responsiveness

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
