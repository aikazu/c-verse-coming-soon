---
name: C.Verse Join
description: A card-led collaboration deck on a creator's working surface.
colors:
  ink: "#171717"
  lime: "#CCFF66"
  orange: "#FF6633"
  silver: "#CCCCCC"
typography:
  choice-display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(52px, 6.1vw, 92px)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-.04em"
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(44px, 5.4vw, 82px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-.04em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 56px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-.035em"
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(16px, 1.4vw, 20px)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  note:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: ".08em"
  numeric:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(112px, 14vw, 200px)"
    fontWeight: 700
    lineHeight: .9
    letterSpacing: "-.04em"
rounded:
  control: "0"
  card: "4.76% / 3.41%"
spacing:
  gutter: "clamp(24px, 5vw, 80px)"
  section-y: "clamp(64px, 9vh, 100px)"
  split-gap: "clamp(40px, 6vw, 96px)"
  control-gap: "12px"
  rule-gap: "20px"
  chrome-height: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lime}"
    typography: "600 14px/1.5 Inter, system-ui, sans-serif"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  role-action:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.silver}"
    typography: "400 13px/1.5 Inter, system-ui, sans-serif"
    rounded: "{rounded.control}"
    padding: "22px {spacing.gutter}"
    height: "112px"
    width: "100%"
  role-action-hover:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
  preset:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "600 13px/1.5 Inter, system-ui, sans-serif"
    rounded: "{rounded.control}"
    padding: "8px 14px"
    height: "44px"
  preset-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.orange}"
  physical-card:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.card}"
    size: "63 / 88"
---

# Design System: C.Verse Join

## Overview

**Creative North Star: "The Creator's Working Table"**

The join surface treats artwork as a physical collectible on a bold working plane, not as decoration inside a slide template. Large ink fields, diagonal lime planes, tightly tracked Inter headlines, and fine registration rules give the twenty guided sections a direct editorial rhythm. The role chooser makes three real card examples and the two role actions the immediate visual decision.

Depth belongs to the physical cards. Information stays flat and exposed on black, silver, lime, or orange planes; rules and spacing replace nested panels. Existing artwork remains unrecolored and credited. Master brand marks retain their original silhouettes through masks, while all supporting text uses Inter.

**Key Characteristics:**
- Physical 63 × 88 mm card art, uneven fanning, and soft object shadows carry desire.
- Flat color fields and diagonal clipping establish structure without rounded content panels.
- One accent governs each section; black and silver also serve as full planes.
- Dense process, rights, and calculator content reads through aligned rules and tabular numerals.
- Short reveals, bounded pointer tilt, and card flips respect reduced-motion preferences.

## Colors

The palette is strictly the four validated CreatorVerse colors; their full-plane alternation supplies most of the visual rhythm.

### Primary
- **CreatorVerse Ink**: The default canvas, fixed navigation chrome, primary button fill, and foreground on light planes.
- **CreatorVerse Lime**: The role-chooser and cover diagonal, selected earnings totals, primary-release figures, schedule markers, and selected text.

### Secondary
- **CreatorVerse Orange**: The resale-royalty section plane. Black remains its foreground and control accent.

### Neutral
- **CreatorVerse Silver**: Body copy on ink, master logo color on dark covers, progress marks, and the full plane for explanatory sections.

### Named Rules
**The One Accent Rule.** Give each section one accent context. Never place lime and orange together; use ink for controls on lime, silver, and orange planes.

**The Four-Color Rule.** Do not introduce additional brand hues, background gradients, or tinted panels. Existing card artwork is the only exception and must remain unrecolored; the restrained foil highlight is a lighting effect on that artwork, not a background treatment.

## Typography

**Display Font:** Inter (with system-ui and sans-serif fallbacks)
**Body Font:** Inter (with system-ui and sans-serif fallbacks)
**Label/Mono Font:** Inter; use tabular numerals rather than a separate monospace face.

**Character:** A single grotesk voice keeps commercial detail sober while heavy, compressed headlines give the artwork a confident editorial frame. Optical sizing is automatic.

### Hierarchy
- **Role display** (700, tightly tracked): The chooser's two-line promise; its emphasized second line is lime.
- **Display** (700, balanced): Cover and closing questions, with a slightly smaller closing variant.
- **Title** (700, balanced): Section headings, usually capped at 20 characters unless the section needs a full-width heading.
- **Numeric** (700, tabular): Large percentage examples and stable calculator readouts.
- **Lead** (400): The proposal beneath major headings, generally limited to 35 characters.
- **Body** (400): Feature, responsibility, rights, and process copy; long-form measures stay within 43–76 characters by context.
- **Note** (400): Qualifications, example disclaimers, and calculation notes.
- **Label** (600, uppercase where authored): Object specifications, edition labels, reply labels, and compact navigation metadata.

### Named Rules
**The One Voice Rule.** Use Inter for every textual role. Differentiate through size, weight, tracking, case, and numeric features, not another font.

**The Quiet Detail Rule.** Keep supporting copy compact and line length controlled; reserve heavy weight and negative tracking for headings, role names, and key figures.

## Layout

The chooser and each guided section fill at least one small viewport. Content uses a centered maximum width of 1440px, fluid side gutters, generous top space, and clearance above the fixed bottom chrome. Two-column splits pair narrative with an object or calculator; full-width tracks, timelines, role lists, and rights grids use fine rules instead of containers.

The role chooser places copy and an unequal three-card fan across a diagonal ink/lime plane, then anchors two equal role actions across the bottom. At desktop deck sizes, sections snap vertically. At 760px and below, splits become one column, card fans become compact horizontal arrangements, timelines become two columns, and process tracks become ruled rows. At 380px and below, gutters narrow and calculator totals wrap. Dot navigation disappears on mobile while the fixed previous/next chrome remains.

Reveal motion uses short upward translations with 60ms stagger increments. Card fans settle over 650–900ms; card flips use an 800ms rotation. Pointer tilt is limited to fine pointers and bounded to 14° horizontal and 10° vertical on covers, or 10° and 7° on the chooser. Reduced motion disables animation, transitions, smooth scrolling, and tilt while keeping all content visible.

## Elevation & Depth

Surfaces are flat. Only physical cards receive soft, offset shadows; perspective, overlap, rotation, and a restrained foil highlight make them tangible. Rules, color planes, and clipping provide all other separation.

### Shadow Vocabulary
- **Card object** (`0 24px 40px -16px rgb(23 23 23 / .6), 0 5px 12px rgb(23 23 23 / .2)`): The shared physical-card lift.
- **Chooser card** (`0 26px 34px -14px rgb(23 23 23 / .55), 0 5px 12px rgb(23 23 23 / .2)`): A slightly tighter lift for the opening fan.

### Named Rules
**The Object-Only Lift Rule.** Shadows describe cards, never ordinary copy, calculators, buttons, or content sections.

## Shapes

Controls, labels, totals, navigation buttons, switches, and registration marks are square. Content separation uses 1px rules, with 2px top rules for calculators and responsibility groups. Large diagonal polygons cut the cover and chooser planes; the Seed section adds a rotated lime strip behind its physical card.

Only the physical card silhouette is rounded, proportionally to its 63:88 ratio. Card artwork is clipped to that silhouette and never redesigned. Existing SVG arrows use 1.5px strokes; master logos and the C.Card symbol are masked from the supplied assets.

## Components

### Buttons
- **Shape:** Sharp rectangle with no radius.
- **Primary:** Ink fill, lime text, a 52px minimum height, and compact horizontal padding. On lime surfaces this is the main reply action.
- **Hover / Focus:** Primary hover removes the fill and retains the accent outline; active moves down 2px. Keyboard focus uses a 2px current-color outline with a 5px offset.
- **Role actions:** Full-width, two-column ink actions with silver copy, lime diagonal arrows, and a shared divider. Hover and focus invert the whole action to lime and ink.

### Chips
- **Style:** Calculator price presets are transparent, square, and hairline-outlined rather than pill-shaped.
- **State:** The selected preset fills with the section's control accent and uses its contrasting foreground; minimum target height is 44px.

### Cards / Containers
- **Corner Style:** Only card art receives the proportional card radius.
- **Background:** The supplied front/back artwork is shown intact at a 63:88 ratio.
- **Shadow Strategy:** Use only the card-object shadow vocabulary.
- **Border:** No added border; use clipping and shadow.
- **Internal Padding:** None over the artwork. Captions and credits sit outside the card.
- **Flip:** The front and back share one grid area, preserve 3D depth, and rotate 180° when pressed. The visible label updates with the face.

### Inputs / Fields
- **Style:** Range inputs pair a 3px progress track with a 20px square thumb and a 40px interaction height. Labels and right-aligned tabular outputs sit above the track.
- **Focus:** A 2px current-color outline with clear offset; custom switches repeat that treatment on their visible frame.
- **Switch:** A 42 × 24px square frame contains a 16px block that translates 18px when checked. The label supplies a 44px minimum target.
- **Readout:** Ruled rows end in a solid accent total. Numeric values use tabular figures and do not shift alignment as values change.

### Navigation
- **Style:** Fixed 64px ink chrome with a silver top rule, role-switch link, tabular section count, and two 44px square arrow buttons. A 3px silver progress bar sits at the top.
- **State:** Active side dots fill and scale to 1.5; inactive dots remain 6px outlines. Disabled arrows reduce opacity to 35%. Hovering an enabled arrow swaps it to silver with ink iconography.
- **Mobile:** Chrome reduces to 60px, hides the wordmark and section label, and retains role switching plus previous/next controls.

### Reply Template
- **Style:** Inter text between two ink horizontal rules on the lime closing plane; no boxed code treatment or monospace face.
- **Action:** A square ink/lime copy button sits below the text, with a compact status line and a selection fallback.

## Do's and Don'ts

### Do:
- **Do** keep one accent per section and never combine lime with orange.
- **Do** use existing card artwork intact, with visible creator/illustrator credits and example context.
- **Do** preserve the master logo silhouettes and use Inter for supporting text.
- **Do** expose structure through full planes, square controls, fine rules, and generous gutters.
- **Do** keep calculator numerals tabular and all custom control targets at least 44px high.
- **Do** preserve visible focus and reduced-motion behavior.

### Don't:
- **Don't** add extra brand colors, recolor artwork, or introduce decorative background gradients.
- **Don't** wrap sections, calculators, or reply templates in rounded floating panels.
- **Don't** apply card shadows to text, navigation, or ordinary containers.
- **Don't** redraw, retype, or replace the supplied master logos.
- **Don't** hide artwork credits, example labels, or commercial qualifications for visual simplicity.
