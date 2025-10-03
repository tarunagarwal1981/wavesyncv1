# shadcn/ui Component Library Setup

This document outlines the complete setup of shadcn/ui with a custom maritime theme for the WaveSync Seafarer application.

## 📋 Configuration Overview

### Project Setup
- **Style**: New York style (professional, clean)
- **Base Color**: Navy blue (maritime theme)
- **CSS Variables**: Enabled for theme customization
- **App Router**: Configured for Next.js 14 App Router
- **TypeScript**: Full TypeScript support

### Installed Components
✅ **Core Components**
- `button` - Styled buttons with maritime variants
- `card` - Containers with maritime styling
- `input` - Form inputs with validation styling
- `label` - Form labels with accessibility
- `form` - Form components with validation
- `dropdown-menu` - Context menus
- `dialog` - Advanced modal dialogs
- `badge` - Status indicators with maritime colors
- `avatar` - User profile images
- `tabs` - Tabbed navigation
- `table` - Data tables with professional styling
- `alert` - Notification alerts
- `calendendar` - Date picker components
- `select` - Dropdown select inputs
- `checkbox` - Form checkboxes
- `sonner` - Toast notifications (replaces deprecated toast)

## 🎨 Maritime Theme Color Palette

### Light Theme Colors
```css
/* Primary Navy */
--primary: 215 25% 25%;           /* Deep navy blue */
--primary-foreground: 0 0% 98%;   /* Light text on navy */

/* Ocean Secondary */
--secondary: 210 40% 95%;         /* Light blue-gray */
--secondary-foreground: 222 84% 20%; /* Navy text on secondary */

/* Accent Gold */
--accent: 43 96% 85%;             /* Light amber/gold */
--accent-foreground: 222 84% 20%; /* Navy text on gold */

/* State Colors */
--destructive: 0 84% 60%;         /* Maritime red for errors */
--success: hsl(142, 76%, 50%);    /* Success green */
--warning: hsl(43, 96%, 70%);     /* Gold for warnings */

/* Background */
--background: 210 40% 98%;        /* Light blue-gray */
--foreground: 222 84% 20%;        /* Deep navy text */
```

### Dark Theme Colors
```css
/* Dark Navy Theme */
--background: 222 84% 4%;         /* Very dark navy */
--foreground: 210 40% 98%;        /* Light blue-gray text */

/* Gold Primary in Dark Mode */
--primary: 43 96% 70%;            /* Gold primary */
--primary-foreground: 222 84% 20%; /* Navy text on gold */

/* Chart Colors */
--chart-1: Navy blue
--chart-2: Ocean blue
--chart-3: Deep blue
--chart-4: Gold
--chart-5: Success green
```

## 📝 Typography Scale

### Font Sizes
```css
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 1.875rem;   /* 30px */
--font-size-4xl: 2.25rem;    /* 36px */
--font-size-5xl: 3rem;       /* 48px */
```

### Line Heights
```css
--line-height-tight: 1.25;    /* Headings */
--line-height-snug: 1.375;     /* Large text */
--line-height-normal: 1.5;     /* Body text */
--line-height-relaxed: 1.625;  /* Readable prose */
--line-height-loose: 2;        /* Large spacing */
```

### Letter Spacing
```css
--letter-spacing-tighter: -0.05em;  /* Large headings */
--letter-spacing-tight: -0.025em;   /* Medium headings */
--letter-spacing-normal: 0em;        /* Body text */
--letter-spacing-wide: 0.025em;     /* Small caps */
--letter-spacing-wider: 0.05em;     /* Emphasis */
--letter-spacing-widest: 0.1em;     /* Very wide */
```

## 🧩 Custom Components

### MaritimeButton
Extended button component with maritime-specific variants:
```tsx
import { MaritimeButton } from '@/components/ui/maritime-button';

// Usage examples
<MaritimeButton variant="navy">Navy Button</MaritimeButton>
<MaritimeButton variant="ocean">Ocean Button</MaritimeButton>
<MaritimeButton variant="gold">Gold Button</MaritimeButton>
<MaritimeButton variant="success">Success</MaritimeButton>
<MaritimeButton size="lg">Large Button</MaritimeButton>
```

### MaritimeCard
Enhanced card component with maritime styling:
```tsx
import { 
  MaritimeCard, 
  MaritimeCardHeader, 
  MaritimeCardTitle,
  MaritimeCardDescription,
  MaritimeCardContent,
  MaritimeCardFooter 
} from '@/components/ui/maritime-card';

// Usage example
<MaritimeCard variant="ocean" elevation="lg">
  <MaritimeCardHeader>
    <MaritimeCardTitle>Card Title</MaritimeCardTitle>
    <MaritimeCardDescription>Card description</MaritimeCardDescription>
  </MaritimeCardHeader>
  <MaritimeCardContent>
    Card content goes here
  </MaritimeCardContent>
  <MaritimeCardFooter>
    Card footer actions
  </MaritimeCardFooter>
</MaritimeCard>
```

## 🌓 Theme Provider Setup

### App Integration
```tsx
// src/app/layout.tsx
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Theme Context Usage
```tsx
import { useMaritimeTheme } from '@/components/ui/theme-provider';

function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useMaritimeTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## 📁 File Structure

```
src/
├── app/
│   ├── globals.css              # Maritime theme CSS variables
│   └── layout.tsx              # Theme provider integration
├── components/
│   └── ui/
│       ├── maritime-button.tsx  # Custom maritime button
│       ├── maritime-card.tsx    # Custom maritime card
│       ├── theme-provider.tsx   # Theme context & utilities
│       └── [shadcn components]  # All standard shadcn components
├── lib/
│   └── utils.ts                # shadcn utility functions
└── components.json             # shadcn configuration
```

## 🎯 Usage Guidelines

### Color Usage
- **Primary Navy**: Use for main actions and navigation
- **Ocean Blue**: Use for secondary actions and backgrounds
- **Gold/Amber**: Use for warnings and highlights
- **Success Green**: Use for positive actions and indicators
- **Maritime Red**: Use for errors and destructive actions

### Typography Hierarchy
1. **H1**: Page titles (36px, bold)
2. **H2**: Section headers (30px, semibold) 
3. **H3**: Subsection headers (24px, semibold)
4. **H4**: Component titles (20px, semibold)
5. **H5**: Group labels (18px, medium)
6. **H6**: Small labels (16px, medium)
7. **Body**: Default text (16px, normal)

### Spacing Scale
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 0.75rem (12px)
- **lg**: 1rem (16px)
- **xl**: 1.5rem (24px)
- **2xl**: 2rem (32px)
- **3xl**: 3rem (48px)

### Shadows and Elevation
```css
.shadow-maritime      /* Subtle professional shadow */
.shadow-maritime-lg   /* Medium elevation shadow */
.shadow-maritime-xl   /* High elevation shadow */
```

## 🔧 Configuration Files

### components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "navy",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Dependencies Installed
```json
{
  "dependencies": {
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "next-themes": "^0.x",
    "@radix-ui/react-slot": "^x.x"
  }
}
```

## 🚀 Next Steps

1. **Component Usage**: Start using shadcn/ui components throughout the app
2. **Custom Variants**: Create additional maritime-specific component variants
3. **Theme Switching**: Implement theme toggle in the navbar
4. **Documentation**: Document custom component APIs
5. **Testing**: Test components in both light and dark themes

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Radix UI Components](https://www.radix-ui.com/docs)
- [Class Variance Authority](https://cva.style/)
- [Tailwind Merge](https://tailwind-merge.vercel.app/)
- [Next Themes](https://github.com/pacocoursey/next-themes)

The maritime theme is now fully configured and ready for professional maritime applications!


