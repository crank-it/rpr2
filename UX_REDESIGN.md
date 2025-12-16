# RPR Flow - Ultra-Minimal UX Redesign

## 🎨 Design System Applied

### Color Palette
**Primary:** Teal `#14b8a6` (hsl(174 72% 56%))
**Base:** Black `#0a0a0a` + White `#ffffff`
**Grey Scale:** 8%, 10%, 45%, 90%, 96%, 98%

### Typography
- **Headings:** Dosis (400, 500, 600, 700)
- **Body:** Lato (400, 700)
- Clean hierarchy with generous line-height

### Visual Language
- ✅ No gradients - solid colors only
- ✅ Soft shadows (very subtle)
- ✅ Rounded corners (12px base, up to 24px for cards)
- ✅ Minimal borders
- ✅ Generous whitespace
- ✅ Smooth transitions (200-300ms)

---

## ✅ Phase 1: Foundation (COMPLETE)

1. **globals.css** - EA Flow-inspired design system
   - Two-tone color palette (teal + black/white)
   - Soft shadow system
   - Clean animations
   - Custom utility classes

2. **layout.tsx** - Typography setup
   - Dosis for headings
   - Lato for body text
   - Proper font loading

---

## 🎯 Phase 2: Component Redesign (NEXT)

### Priority 1: Core UI Components
These are used everywhere and will have the biggest impact:

1. **Button Component** (`/components/ui/button.tsx`)
   - Apply teal primary color
   - Remove unnecessary variants
   - Soft shadows on hover
   - Clean transitions

2. **Card Component** (`/components/ui/card.tsx`)
   - Larger border radius (rounded-2xl)
   - Softer shadows
   - Clean borders
   - Hover effects

3. **Badge Component** (`/components/ui/badge.tsx`)
   - Simplify to teal + grey variants
   - Remove colorful status badges
   - Minimal design

### Priority 2: Form Components

4. **Input Component** (`/components/ui/input.tsx`)
   - Rounded corners (rounded-xl)
   - Teal focus ring
   - Clean border

5. **Select Component** (`/components/ui/select.tsx`)
   - Match input styling
   - Clean dropdown

6. **Multi-Select Component** (`/components/ui/multi-select.tsx`)
   - Teal selected state
   - Minimal chips

### Priority 3: Layout Components

7. **Modal Component** (`/components/ui/modal.tsx`)
   - Larger border radius
   - Backdrop blur
   - Clean animation

---

## 🎯 Phase 3: Page Redesign

### Projects List (`/app/projects/page.tsx`)
**Current Issues:**
- Cluttered grid layout
- Too many colors/badges
- Tight spacing

**Improvements:**
- Cleaner card design
- More whitespace
- Simplified status indicators
- Better typography hierarchy

### Project Detail (`/app/projects/[id]/page.tsx`)
**Current Issues:**
- Inconsistent spacing
- Too many sections
- Cluttered info display

**Improvements:**
- Cleaner layout sections
- Better visual grouping
- Simplified task cards
- More breathing room

### Settings Page (`/app/settings/page.tsx`)
**Current Issues:**
- Tab styling
- Form layouts
- Category cards

**Improvements:**
- Clean tab design
- Better form spacing
- Minimal category cards

---

## 🎯 Phase 4: Feature Components

### CreateProjectModal
- Clean form layout
- Better field spacing
- Teal primary actions
- Simplified asset inputs

### CommentThread
- Cleaner message bubbles
- Better avatar design
- Simplified reply UI
- Teal accents

### UserAvatar
- Clean circular design
- Teal color variations
- Consistent sizing

---

## 📐 Design Principles to Follow

### Spacing
- Mobile: 16px (1rem) base
- Desktop: 24px (1.5rem) base
- Section gaps: 32-48px (2-3rem)
- Card padding: 24-32px

### Typography Scale
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 30px
- 4xl: 36px

### Border Radius
- sm: 8px (inputs, small elements)
- md: 12px (buttons)
- lg: 16px (cards)
- xl: 20px (modals)
- 2xl: 24px (large cards)

### Shadows
- xs: Barely visible
- sm: Subtle lift
- md: Clear elevation
- lg: Prominent depth
- xl: Maximum depth (modals)

---

## 🚀 Implementation Order

1. **Now:** Update core UI components (Button, Card, Badge)
2. **Next:** Update form components (Input, Select, Modal)
3. **Then:** Redesign Projects list page
4. **Then:** Redesign Project detail page
5. **Finally:** Polish Settings & other pages

---

## 🎨 Color Usage Guide

### Primary Teal
- Primary buttons
- Focus states
- Active states
- Success indicators
- Links
- Selected items

### Black/Dark Grey
- Main text
- Headings
- Icons
- Dark mode cards

### Light Grey
- Backgrounds
- Subtle borders
- Disabled states
- Muted text

### White
- Card backgrounds
- Button text on teal
- Light mode base

### Minimal Use
- Red: Only for destructive actions
- Yellow: Only for warnings
- Never: Purple, pink, orange, blue (except teal)

---

## ✨ Visual Details

### Hover States
- Lift effect: `transform: translateY(-1px)`
- Shadow increase: `sm → md` or `md → lg`
- Brightness: `filter: brightness(1.05)` on teal
- Transition: `200ms ease`

### Focus States
- Ring: 2px teal with 15% opacity
- Offset: 2px from element
- No outline

### Disabled States
- Opacity: 50%
- Cursor: not-allowed
- No hover effects

### Loading States
- Teal spinner
- Subtle pulse animation
- Disabled interaction

---

Ready to start Phase 2: Component Redesign!
