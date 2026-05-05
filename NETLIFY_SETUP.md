# Netlify Deploy

This frontend is a Vite SPA. Netlify should build the app into `dist/` and serve all routes through `index.html`.

## 1. Create the Netlify site

1. Create or log into a Netlify account.
2. Choose **Add new site** > **Import an existing project**.
3. Connect the repository that contains `pi-web`.
4. Use these build settings:

   ```text
   Build command: npm run build
   Publish directory: dist
   ```

The same settings are also stored in `netlify.toml`.

## 2. Configure environment variables

In Netlify, open **Site configuration** > **Environment variables** and add:

```text
VITE_API_BASE_URL=https://motokiyo.pythonanywhere.com/
VITE_DEBUG=false
```

Keep the trailing slash on `VITE_API_BASE_URL`.

## 3. Deploy

Trigger a deploy from Netlify. After the deploy finishes, your frontend will be available at:

```text
https://arraia-tech.netlify.app
```

## 4. Update the backend after Netlify gives you the URL

Go back to PythonAnywhere and update the backend environment variables in the WSGI file:

```python
os.environ["CSRF_TRUSTED_ORIGINS"] = "https://arraia-tech.netlify.app,https://motokiyo.pythonanywhere.com"
os.environ["CORS_ALLOWED_ORIGINS"] = "https://arraia-tech.netlify.app"
os.environ["FRONTEND_URL"] = "https://arraia-tech.netlify.app"
```

Then reload the PythonAnywhere web app.

## Updating Later

Push changes to the connected branch. Netlify will rebuild automatically.
