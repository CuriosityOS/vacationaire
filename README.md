# Vacationaire

AI-powered vacation planning application that creates personalized travel recommendations based on user preferences.

## Features

- **Personalized Recommendations**: Get tailored vacation suggestions based on your preferences, budget, and travel style
- **AI-Powered**: Uses Perplexity AI (sonar-pro model) for intelligent destination recommendations
- **Sustainability Focus**: Built-in eco-friendly scoring and sustainable travel options
- **Interactive Questionnaire**: Multi-step form collecting detailed preferences
- **Beautiful UI**: Modern, responsive design with smooth animations

## Tech Stack

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4.17
- **Animations**: Framer Motion 12.23.12
- **AI Integration**: Perplexity AI API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Perplexity API key (optional - app works with mock data if not provided)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CuriosityOS/vacationaire.git
cd vacationaire
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
PERPLEXITY_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
vacationaire/
├── app/
│   ├── api/
│   │   └── perplexity/     # API route for AI integration
│   ├── page.tsx            # Main application controller
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── Hero.tsx            # Welcome screen
│   ├── Questionnaire.tsx   # Multi-step preference form
│   ├── Loading.tsx         # AI processing indicator
│   ├── Results.tsx         # Recommendations display
│   └── SustainabilityBadge.tsx
├── lib/
│   └── perplexity.ts       # AI integration logic
├── types/
│   └── index.ts            # TypeScript definitions
└── public/                 # Static assets
```

## Application Flow

1. **Hero Screen**: Welcome users with branding and call-to-action
2. **Questionnaire**: Collect preferences including:
   - Destination type (beach, mountain, city, etc.)
   - Budget range and currency
   - Travel dates and duration
   - Activities and interests
   - Accommodation preferences
   - Group composition
3. **AI Processing**: Generate personalized recommendations
4. **Results**: Display 3 tailored vacation destinations with:
   - Detailed cost breakdowns
   - Activities and accommodations
   - Sustainability scores
   - Weather information
   - Local cuisine and cultural tips

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PERPLEXITY_API_KEY` | Your Perplexity AI API key | No (uses mock data if not set) |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## API Integration

The app integrates with Perplexity AI's sonar-pro model to generate intelligent vacation recommendations. The API route includes:

- Comprehensive error handling
- Response validation and logging
- Fallback to mock data when API is unavailable
- Server-side debugging for parsing issues

## Customization

### Design System

The app uses a custom Tailwind configuration with a warm, travel-themed color palette:

- **Primary Colors**: Sand, beige, cream tones
- **Accent Colors**: Sunset orange, ocean blue
- **Responsive Design**: Mobile-first approach

### Adding New Features

1. **New Preference Fields**: Update `types/index.ts` and `components/Questionnaire.tsx`
2. **Additional Destinations**: Modify the prompt in `lib/perplexity.ts`
3. **Custom Styling**: Edit `tailwind.config.js` for design system changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Built with Next.js and React
- Powered by Perplexity AI
- Icons by Lucide React
- Animations by Framer Motion