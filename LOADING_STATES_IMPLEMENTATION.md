# Loading States and Skeletons Implementation

## Overview
This document describes the implementation of loading states and skeleton screens for the Template Builder Rapor feature, improving user experience during data fetching and processing operations.

## Implemented Components

### 1. Template Builder Loading States

#### TemplateBuilderSkeleton Component
**Location:** `components/template-builder/TemplateBuilderSkeleton.tsx`

A comprehensive skeleton screen that mimics the three-column layout of the template builder:
- **Left Sidebar:** Component list skeleton with icons and labels
- **Center Canvas:** A4 page skeleton with placeholder content areas
- **Right Panel:** Properties panel skeleton with form fields
- **Top Toolbar:** Toolbar skeleton with buttons and controls

**Features:**
- Matches the exact layout of the actual template builder
- Smooth pulse animation for visual feedback
- Responsive design that adapts to screen sizes

#### Template Builder Page Updates
**Location:** `app/manajemen-rapor/template-rapor/builder/[id]/page.tsx`

**Changes:**
1. Added `isLoading` state to track initial template loading
2. Replaced simple loading spinner with `TemplateBuilderSkeleton`
3. Enhanced save button with animated spinner using `Loader2` icon
4. Shows "Menyimpan..." text during save operations

**Loading States:**
- **Initial Load:** Full skeleton screen while fetching template data
- **Saving:** Animated spinner in save button with disabled state
- **Preview Generation:** Progress indicator in PreviewModal (already existed, enhanced)

#### PreviewModal Enhancements
**Location:** `components/template-builder/PreviewModal.tsx`

**Improvements:**
- Enhanced loading message with more descriptive text
- Added subtitle explaining what's being loaded ("Mengambil data siswa dan habit tracker")
- Better visual hierarchy for loading state

### 2. Generate Rapor Loading States

#### GenerateRaporSkeleton Component
**Location:** `components/rapor/GenerateRaporSkeleton.tsx`

A skeleton screen for the generate rapor form:
- Header skeleton (title and description)
- Template selection dropdown skeleton
- Periode selector skeleton (2 columns)
- Student filter skeleton with tabs and textarea
- Generate button skeleton

**Features:**
- Matches the form layout exactly
- Responsive grid for periode fields
- Smooth animations

#### Generate Rapor Page Updates
**Location:** `app/manajemen-rapor/generate-rapor/page.tsx`

**Changes:**
1. Changed initial `loading` state from `false` to `true`
2. Added skeleton screen display while loading templates
3. Enhanced generate button with animated spinner
4. Added status message box during generation process

**Loading States:**
- **Initial Load:** Full skeleton screen while fetching templates
- **Generating:** 
  - Animated spinner in button
  - Blue info box with progress message
  - Different messages for single vs bulk generation
  - Real-time progress tracking (already existed)

**Status Messages:**
- Single generation: "Mohon tunggu, PDF sedang dibuat"
- Bulk generation: "Memproses X siswa. Ini mungkin memakan waktu beberapa menit."

### 3. Archive Rapor Loading States

#### ArchiveSkeleton Component
**Location:** `components/rapor/ArchiveSkeleton.tsx`

A skeleton screen for the archive list:
- Header skeleton
- Search and filter bar skeleton
- Desktop table skeleton with 6 columns and 5 rows
- Mobile card skeleton for responsive view

**Features:**
- Separate skeletons for desktop table and mobile cards
- Matches the actual table structure
- Responsive design

#### Archive Rapor Page Updates
**Location:** `app/manajemen-rapor/arsip-rapor/page.tsx`

**Changes:**
1. Replaced `SkeletonGrid` with custom `ArchiveSkeleton`
2. Shows skeleton immediately on page load
3. Enhanced download button with spinner during download

**Loading States:**
- **Initial Load:** Full skeleton screen while fetching archive data
- **Downloading:** Animated spinner in download button with "Mengunduh..." text

### 4. Template List Skeleton (Bonus)

#### TemplateListSkeleton Component
**Location:** `components/rapor/TemplateListSkeleton.tsx`

A skeleton screen for the template list page:
- Header skeleton
- Search and action bar skeleton
- Grid of template card skeletons (6 cards)
- Each card includes: header, details, badges, and action buttons

**Features:**
- Matches the card-based layout
- Responsive grid (1/2/3 columns)
- Detailed card structure matching actual templates

## Loading State Patterns

### 1. Skeleton Screens
Used for initial page loads to show the structure of content being loaded:
- Template Builder
- Generate Rapor form
- Archive list
- Template list

**Benefits:**
- Reduces perceived loading time
- Shows users what to expect
- Better UX than blank screens or simple spinners

### 2. Inline Spinners
Used for actions within loaded pages:
- Save button in template builder
- Generate button in generate rapor
- Download buttons in archive

**Benefits:**
- Clear feedback for user actions
- Prevents duplicate submissions
- Shows processing state

### 3. Progress Indicators
Used for long-running operations:
- PDF generation progress (already existed)
- Bulk generation tracking (already existed)
- Preview data loading

**Benefits:**
- Shows completion percentage
- Provides detailed status per item
- Allows users to track progress

## User Experience Improvements

### Before Implementation
- Blank screens during loading
- Simple text "Loading..." messages
- No visual feedback during saves
- Unclear when operations are in progress

### After Implementation
- Structured skeleton screens showing layout
- Animated spinners with descriptive text
- Clear visual feedback for all operations
- Status messages explaining what's happening
- Progress tracking for bulk operations

## Technical Details

### Animation
All skeletons use Tailwind's `animate-pulse` class for smooth pulsing effect:
```css
animate-pulse
```

### Icons
Using `lucide-react` icons for consistency:
- `Loader2` - Animated spinner
- `Download` - Download actions
- `Save` - Save actions

### State Management
- Local component state for loading flags
- Disabled states on buttons during operations
- Conditional rendering based on loading state

## Testing Recommendations

1. **Skeleton Screens:**
   - Verify layout matches actual content
   - Test on different screen sizes
   - Check animation smoothness

2. **Loading States:**
   - Test with slow network (throttling)
   - Verify all buttons disable during operations
   - Check error handling

3. **Progress Indicators:**
   - Test with single and bulk operations
   - Verify progress updates in real-time
   - Check completion messages

## Future Enhancements

1. **Optimistic Updates:**
   - Show immediate feedback before server response
   - Revert on error

2. **Retry Mechanisms:**
   - Add retry buttons for failed operations
   - Automatic retry with exponential backoff

3. **Offline Support:**
   - Show offline indicators
   - Queue operations when offline

4. **Performance Metrics:**
   - Track loading times
   - Optimize slow operations

## Conclusion

The implementation of comprehensive loading states and skeleton screens significantly improves the user experience of the Template Builder Rapor feature. Users now have clear visual feedback at every stage of their interaction, from initial page loads to complex PDF generation operations.
