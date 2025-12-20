# How to Deploy to Vercel

This guide assumes you have already pushed your code to GitHub.

## Prerequisites
1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repo**: Ensure your project is pushed to GitHub.

## Step 1: Prepare the Project (Done)
I have already added the necessary `vercel.json` file to your project root. This ensures that when you refresh a page (like `/user/home`), it doesn't give a 404 error but correctly loads the Angular app.

## Step 2: Import to Vercel
1.  Go to your **Vercel Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select **"Continue with GitHub"**.
4.  Find your repository `keraai-urban-parking` (or whatever you named it) and click **"Import"**.

## Step 3: Configure Build Settings
Vercel usually detects Angular automatically, but verify these settings:

*   **Framework Preset**: `Angular`
*   **Root Directory**: `./` (Leave as is)
*   **Build Command**: `ng build` (Default)
*   **Output Directory**: `dist`
    *   *Note: If the deploy fails saying "Output files not found", change this to `dist/browser` or just `dist` based on the logs. Based on your config, `dist` should be correct.*

## Step 4: Environment Variables (Important!)
Since you are using Supabase and GraphQL, you need to add your environment variables in Vercel.

1.  In the Project Settings, go to **Environment Variables**.
2.  Add the same variables you have in your local setup (if any).
    *   *Note: Since this is a Frontend-only build, your Supabase URL/Key might be hardcoded in `supabase-config.ts`. If they are hardcoded, you don't need to add them here. If they use `process.env`, you MUST add them.*

## Step 5: Deploy
Click **"Deploy"**. Vercel will build your project. user
Once green, you will get a URL like `https://keraai-parking.vercel.app`.

## Troubleshooting
*   **404 on Refresh**: Ensure `vercel.json` is in the root (I added it).
*   **Build Fail**: Check the "Build Logs" on Vercel. It usually tells you exactly what line failed.
