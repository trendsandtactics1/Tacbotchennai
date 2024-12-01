# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8a2dcb7b-deda-45b0-a084-64d2a15c87a2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8a2dcb7b-deda-45b0-a084-64d2a15c87a2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Install Visual Studio Code
# Download and install VS Code from https://code.visualstudio.com/

# Step 2: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 3: Open the project in VS Code
# Either drag the folder into VS Code or use the terminal:
code <YOUR_PROJECT_NAME>

# Step 4: Open VS Code's integrated terminal
# Use the keyboard shortcut: Ctrl + ` (backtick)
# Or go to View -> Terminal

# Step 5: Navigate to the project directory if you haven't already
cd <YOUR_PROJECT_NAME>

# Step 6: Install the necessary dependencies
npm i

# Step 7: Create a .env file in the root directory and add your environment variables
# Copy the content below into .env:
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key

# Step 8: Start the development server with auto-reloading and an instant preview
npm run dev

# The app should now be running on http://localhost:5173
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- OpenAI

## How can I deploy this project?

This project can be easily deployed to Vercel. Follow these steps:

1. Push your code to GitHub if you haven't already
2. Go to [Vercel](https://vercel.com) and sign up/login with your GitHub account
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: dist
6. Add the following environment variables:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY
   - OPENAI_API_KEY
7. Click "Deploy"

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)