# LOVR

LOVR is a student productivity platform designed to make academic life easier.  
Instead of forcing users to manually manage tasks in a rigid calendar, LOVR lets them add things naturally, almost like talking to someone.

You can write something like:

> "Entregar la cosa de historia para el siguiente martes"

and LOVR will understand it, create the task, and place it on the correct day.  
From there, you can add context, generate academic content, export it to Google Docs with MLA or APA formatting, or turn the response into slides.

LOVR also lets you build your own writing models by importing your own documents or texts, so generated content matches your style instead of sounding like generic AI.

## Features

- Smart calendar with natural-language task input
- Task context support for organizing all the material you need
- AI-powered content generation
- Export to Google Docs
- MLA and APA formatting support
- Slide generation from generated content
- Custom writing models based on your own texts
- Google API integration
- OpenAI API integration

## Tech Stack

- **Frontend:** Next.js
- **Database:** MySQL, later migrated to PostgreSQL
- **ORM:** Prisma
- **APIs:** Google APIs, OpenAI API, REST APIs
- **Language:** JavaScript / TypeScript

## Project Goal

The goal of LOVR is to reduce friction in student workflow.

Instead of:
- opening a calendar,
- selecting a date manually,
- typing tasks in a strict format,
- rewriting content in different tools,

LOVR lets users enter information naturally and then turns it into something useful.

## How It Works

### 1. Add tasks naturally
Users type tasks in plain language. LOVR interprets the date and task automatically.

### 2. Add context
Each task can store extra context such as:
- notes
- copied text
- instructions
- images
- reference material

### 3. Generate output
LOVR uses the stored context to generate structured responses that can be exported to:
- Google Docs
- Slides

### 4. Match the user’s style
Users can create LOVR models from their own writing so the generated text sounds more personal and less like AI.

## Getting Started

### Prerequisites
Make sure you have:
- Node.js installed
- a database running
- API keys for Google and OpenAI

### Installation

```bash
git clone https://github.com/Arts-HCS/LOVR.git
cd lovr
npm install
```

### Environment Variables
Create a .env file in the root of the project and add your variables:
```bash
DATABASE_URL="your-database-url"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="your-google-redirect-uri"
OPENAI_API_KEY="your-openai-api-key"
```

### Database Setup
If you're using Prisma:
```bash
npx prisma generate
npx prisma migrate dev
```

### Run the project
```bash
npm run dev
```

## Future Improvements

- Better task parsing  
- Improved AI context handling  
- More export formats  
- Better slide customization  
- Stronger model training for writing style  
- Collaboration features  
- Mobile-friendly improvements  

## Contributing

This project is currently developed by a single creator, but suggestions and feedback are always welcome.

Areas where contributions would be especially valuable:

- Adding support for modifying the date and time of existing tasks  
- Expanding features within the LOVR panel  
- Improving data handling, validation, and overall data flow  
- Enhancing performance and scalability  
- Improving UI/UX consistency across the platform  

If you plan to contribute, consider opening an issue first to discuss the change before submitting a pull request.

## Contact

Created by Arturo Sandoval Cervantes  
www.linkedin.com/in/arturo-sandoval-cervantes-67a892377



