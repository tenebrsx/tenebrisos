# 🎯 Brutalist Design System Guide

A **brutalist-lite** design system that balances bold, geometric aesthetics with usability and delight. Think "brutalism with a zen garden" — one hero moment per screen, surrounded by intentional breathing space.

## 📐 **Design Philosophy**

### **The Balance**
- **Bold, not chaotic** → One neon accent per screen maximum
- **Hierarchy first** → Oversized type guides the eye, doesn't overwhelm
- **Whitespace is a feature** → Generous spacing creates calm focus
- **Confident motion** → Quick, decisive animations that add delight

### **60-35-5 Rule**
- **60%** Foundation colors (black, white, grays)
- **35%** Pastel supporting colors (cream, mint, lavender)
- **5%** Neon accents (electric green, cyber pink, volt yellow)

---

## 🎨 **Color System**

### **Foundation Colors (Primary Usage)**
```javascript
import { BrutalistColors } from './src/theme/brutalist.js';

// Core colors
BrutalistColors.foundation.black    // #0A0A0A
BrutalistColors.foundation.white    // #FFFFFF
BrutalistColors.foundation.gray[400] // Use bracket notation
BrutalistColors.foundation.gray[800]
```

### **Neon Accents (Hero Moments Only)**
```javascript
// ONE per screen maximum
BrutalistColors.neon.electric  // #00FF94 - Primary neon
BrutalistColors.neon.cyber     // #FF0080 - Warnings/errors
BrutalistColors.neon.volt      // #FFFF00 - Highlights
BrutalistColors.neon.plasma    // #00D9FF - Info
```

### **Pastels (Supporting Elements)**
```javascript
// Background variants and calm accents
BrutalistColors.pastel.cream    // Default background
BrutalistColors.pastel.mint     // Success states
BrutalistColors.pastel.lavender // Info states
BrutalistColors.pastel.peach    // Warning states
```

---

## ✍️ **Typography System**

### **Hierarchy Rules**
1. **Display (48px)** - Hero moments only, one per screen
2. **H1 (32px)** - Page titles
3. **H2 (24px)** - Section breaks
4. **Body (16px)** - Always readable, high contrast
5. **Caption (14px)** - Supporting info
6. **Micro (12px)** - Labels, badges

### **Usage Examples**
```jsx
import { DisplayText, H1, H2, BodyText, Label } from './src/components/brutalist';

// Hero moment - display text
<DisplayText color={BrutalistColors.neon.electric}>
  87%
</DisplayText>

// Section title
<H1>Today's Tasks</H1>

// Readable body content
<BodyText>Review quarterly goals and plan next steps</BodyText>

// Labels and metadata
<Label uppercase>PRIORITY</Label>
```

---

## 🧱 **Components**

### **Buttons**

```jsx
import { HeroButton, PrimaryButton, GhostButton } from './src/components/brutalist';

// Hero moment - ONE per screen
<HeroButton 
  title="Start Deep Work"
  onPress={handleDeepWork}
/>

// Primary actions
<PrimaryButton 
  title="Add Task"
  onPress={handleAddTask}
/>

// Secondary actions
<GhostButton 
  title="Cancel"
  onPress={handleCancel}
/>
```

### **Cards**

```jsx
import { HeroCard, MinimalCard, NeonCard } from './src/components/brutalist';

// Hero moment card (dark background)
<HeroCard>
  <DarkText variant="display">87%</DarkText>
  <DarkText variant="body">Tasks completed</DarkText>
</HeroCard>

// Standard content card
<MinimalCard>
  <H2>Quick Stats</H2>
  <BodyText>Your daily progress</BodyText>
</MinimalCard>

// High priority content
<NeonCard accentColor={BrutalistColors.neon.cyber}>
  <BodyText>Urgent: Review contracts</BodyText>
</NeonCard>
```

---

## 📱 **Screen Layout Patterns**

### **1. Hero Moment Pattern**
Every screen should have **ONE** bold focal point:

```jsx
const BrutalistScreen = () => (
  <SafeAreaView style={styles.container}>
    
    {/* Clean header with breathing room */}
    <View style={styles.header}>
      <H1>Page Title</H1>
      <CaptionText>Subtitle for context</CaptionText>
    </View>

    {/* HERO MOMENT - One per screen */}
    <View style={styles.heroSection}>
      <HeroCard>
        <DarkText variant="display" neon>87%</DarkText>
        <DarkText variant="body">Completion rate</DarkText>
      </HeroCard>
    </View>

    {/* Supporting content with calm spacing */}
    <View style={styles.supportingContent}>
      <MinimalCard>
        <H2>Supporting Info</H2>
        <BodyText>Secondary content here</BodyText>
      </MinimalCard>
    </View>

  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrutalistColors.pastel.cream
  },
  header: {
    padding: BrutalistSpacing.lg,
    marginBottom: BrutalistSpacing.hero // 64px breathing room
  },
  heroSection: {
    paddingHorizontal: BrutalistSpacing.lg,
    marginBottom: BrutalistSpacing.hero // Space around hero
  },
  supportingContent: {
    paddingHorizontal: BrutalistSpacing.lg,
    marginBottom: BrutalistSpacing.xl
  }
});
```

### **2. Empty State Pattern**
When there's no content, make the CTA the hero:

```jsx
<View style={styles.emptyHero}>
  <HeroCard>
    <DarkText variant="h2">Ready to get started?</DarkText>
    <DarkText variant="body">Create your first item</DarkText>
    <HeroButton title="Get Started" onPress={handleStart} />
  </HeroCard>
</View>
```

---

## 🏗️ **Spacing System**

### **Breathing Room Guidelines**
```javascript
BrutalistSpacing.xs    // 4px  - Tight spacing
BrutalistSpacing.sm    // 8px  - Small gaps
BrutalistSpacing.md    // 16px - Standard spacing
BrutalistSpacing.lg    // 24px - Section spacing
BrutalistSpacing.xl    // 32px - Large spacing
BrutalistSpacing.xxl   // 48px - Section breaks
BrutalistSpacing.hero  // 64px - Around hero moments
```

### **Usage Rules**
- **Hero moments**: 64px margin on all sides
- **Section breaks**: 48px between major sections
- **Card spacing**: 24px padding inside cards
- **Element spacing**: 16px between related elements

---

## ⚡ **Motion Guidelines**

### **Timing & Easing**
```javascript
import { BrutalistMotion } from './src/theme/brutalist.js';

// Quick, confident animations
BrutalistMotion.timing.fast   // 150ms - Micro-interactions
BrutalistMotion.timing.normal // 250ms - Standard transitions
BrutalistMotion.timing.slow   // 350ms - Complex animations

// Decisive easing curves
BrutalistMotion.easing.snap   // Confident, quick
BrutalistMotion.easing.bounce // Playful, attention-grabbing
```

### **Animation Principles**
- **Decisive, not bouncy** - Quick snaps over long bounces
- **Functional, not decorative** - Animations guide attention
- **Consistent timing** - Use system timing values
- **Respect reduced motion** - Always provide fallbacks

---

## ✅ **Do's and Don'ts**

### **✅ DO**
- Use **one neon accent** per screen maximum
- Surround hero moments with **generous whitespace**
- Make body text **high contrast and readable**
- Use **bold typography hierarchy** to guide attention
- Apply **consistent spacing** from the system
- Create **decisive, quick animations**

### **❌ DON'T**
- Use multiple neon colors on the same screen
- Cram content without breathing room
- Make text hard to read for style points
- Use tiny font sizes for important content
- Ignore the spacing system
- Create slow, overly bouncy animations

---

## 🎯 **Component Quick Reference**

### **Text Components**
```jsx
<DisplayText neon>Hero text</DisplayText>
<H1>Page titles</H1>
<H2>Section headers</H2>
<BodyText>Readable content</BodyText>
<Label uppercase>Metadata</Label>
<DarkText variant="h1">For dark backgrounds</DarkText>
```

### **Layout Components**
```jsx
<HeroCard>Hero moments</HeroCard>
<MinimalCard>Standard content</MinimalCard>
<NeonCard accentColor={color}>High priority</NeonCard>
```

### **Interactive Components**
```jsx
<HeroButton title="Primary CTA" />
<PrimaryButton title="Standard action" />
<GhostButton title="Secondary action" />
```

---

## 🚀 **Implementation Checklist**

When creating a new screen:

- [ ] **One hero moment** identified and implemented
- [ ] **Generous spacing** (64px) around hero element
- [ ] **Maximum one neon accent** used
- [ ] **Clear typography hierarchy** established
- [ ] **High contrast text** for readability
- [ ] **Consistent spacing** from system values
- [ ] **Calm background** color (usually cream)
- [ ] **Functional animations** that guide attention

---

## 📊 **Examples**

### **Home Screen Pattern**
- **Hero**: Large completion percentage in black card
- **Supporting**: Small stat cards with minimal styling
- **Actions**: Single primary button for main action
- **Background**: Calm cream color

### **Empty State Pattern**
- **Hero**: Large CTA button in prominent card
- **Supporting**: Minimal explanatory text
- **Background**: Calm, uncluttered

### **List Pattern**
- **Hero**: Progress indicator or add button
- **Supporting**: Clean list items with subtle accents
- **Priority items**: Neon left border for high priority

---

Remember: **Bold, not chaotic. One surprise per screen. Breathing room is a feature.**