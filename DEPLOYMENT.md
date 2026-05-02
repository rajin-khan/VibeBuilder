# Deployment

## Before you deploy (checklist)

Cross-check this list against the official flow: [Deploy and observe](https://docs.seliseblocks.com/cloud/deploy-and-observe/) and [Getting started → branches](https://docs.seliseblocks.com/cloud/getting-started).

| Step | What Selise docs / this repo expects |
|------|--------------------------------------|
| 1. Git access | Blocks Cloud can clone your repo: [Adding a repository](https://docs.seliseblocks.com/cloud/getting-started#adding-a-repository). |
| 2. Branch for **Production** | For “prod” / production builds, Selise maps **Production → `main`**. Push the commit you want live to **`main`**. (Other environments use `dev`, `stg`, etc.) |
| 3. Build works locally | From repo root: `npm ci && npm run lint && npm run test` (optional but recommended), then **`npm run build:prod`**. Output folder **`build/`** must exist. |
| 4. Production env in the **repo** | Selise’s Deploy docs do **not** describe a separate “build env vars” screen. This project uses **Vite’s [`.env.production`](.env.production)** (loaded on `vite build` / `npm run build:prod`). Keep **`VITE_*`** in sync with **Environment Overview** (API URL, X-Blocks-Key, project slug). See table below. |
| 5. Dockerfile | Blocks builds the image from your **[`Dockerfile`](Dockerfile)** (`npm run build:${ci_build}`). No extra Selise-specific file is documented for a custom Vite app beyond a valid build. |
| 6. Deploy in portal | **Deployment** → **Deployment Overview** → your repo → **Repository Details** → **Deploy Now** or **Git-based deployment** ([docs](https://docs.seliseblocks.com/cloud/deploy-and-observe/)). |
| 7. After green deploy | Use **Deploys To** URL. Add that **origin** to **Identity / IAM** redirect/CORS if login or APIs reject the new host (see [After deploy](#after-deploy-iam-and-allowed-origins)). |
| 8. SPA deep links | `/app/...`, `/site/...` need **`index.html` fallback** on the host. If refresh on a deep link 404s, nginx/host must match [nginx.conf](nginx.conf) / [staticwebapp.config.json](staticwebapp.config.json) behaviour. |

**Official caveat:** Docs still state deployments are intended for repos built on **Blocks Construct**; a Vite SPA may still be accepted in practice (your pipeline already built). If a future deploy fails with a Construct-only message, contact Selise/course support.

---

## Selise Blocks Cloud (primary hosting)

This app is a **Vite** SPA: `npm run build` writes to **`build/`**. Use **SELISE Blocks Cloud → Deployment** as the main way to host it next to your Blocks APIs.

**Official guide:** [Deploy and observe](https://docs.seliseblocks.com/cloud/deploy-and-observe/)

### Build settings (if the portal asks)

| Setting | Value |
|--------|--------|
| Install | `npm ci` (or `npm install`) |
| Build | `npm run build` |
| Output / publish directory | `build` |
| Node | Match [.nvmrc](.nvmrc) (20.x or newer recommended) |

### Build-time environment variables

**Blocks Cloud** often has no “build env” UI. This repo uses **committed [`.env.production`](.env.production)**: Vite loads it automatically when you run **`npm run build:prod`** (which is just `vite build`). The Docker image build copies the repo then runs that script, so **`VITE_*`** values are baked in without portal configuration.

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Selise API base URL |
| `VITE_X_BLOCKS_KEY` | Project X-Blocks-Key (also sent as `x-blocks-key`; visible in the client bundle) |
| `VITE_PROJECT_SLUG` | Project slug for the GraphQL gateway path |
| `VITE_VIBE_PUBLIC_READ_TOKEN` | **Optional fallback** for anonymous `/site/...` GraphQL reads if you keep Data Gateway **View** on **logged-in users only**. Prefer [public schema View access](#public-data-gateway-view-for-anonymous-reads) so this can stay unset. |
| `VITE_CAPTCHA_SITE_KEY` | Optional; if IAM uses captcha |
| `VITE_CAPTCHA_TYPE` | Optional; must match IAM |

Keep [.env.example](.env.example) as a template for **local** `.env` (gitignored). If you rotate the key or slug in **Environment Overview**, update **`.env.production`** and redeploy.

#### Public Data Gateway View (for anonymous reads)

For **anonymous** visitors on `/site/...`, the app calls `getVibeWebsites` / `getVibePages` with **`x-blocks-key` only** (no session Bearer) when those collections allow public reads.

In **Blocks Cloud → Data Gateway** ([overview](https://cloud.seliseblocks.com/services/data-gateway)), open each Vibe collection → **Schema Access** → **View** tab → set access to **Public** → confirm. At minimum set **View** to Public for **VibeWebsite**, **VibePage**, and **VibeAsset** (and any other schema your published site queries anonymously). Leave **Create** / **Edit** / **Delete** restricted to logged-in users unless you intend otherwise.

**Security:** Public **View** exposes read access to those records to anyone with the project key (already in the client bundle). Ensure published payloads do not contain secrets.

#### Public site reads — optional JWT (`VITE_VIBE_PUBLIC_READ_TOKEN`)

If you **cannot** use public **View** on those schemas, anonymous users need a **Bearer** token: the app sends this JWT (when set) via `queryWithVisitorBearer` instead of a user session token.

Verified flow in **Blocks Cloud** (prod environment, sidebar **Users / IAM** icon):

1. **Authentication → General** [`/services/authentication?tab=general`](https://cloud.seliseblocks.com/services/authentication?tab=general)  
   - Under **Grant Types**, enable **Client Credential** and click **Save**. (Without this, machine clients cannot use the client-credentials grant.)

2. **Authentication → Client Credential** [`/services/authentication?tab=client_credential`](https://cloud.seliseblocks.com/services/authentication?tab=client_credential)  
   - Click **Create**.  
   - **Client Name:** any label (e.g. `vibe-public-readonly-site`).  
   - **Audience:** use your **API base** (same host as `VITE_API_BASE_URL`, typically `https://api.seliseblocks.com`). The portal may normalize or override this; if GraphQL still returns 401 after setting the token, recreate the client or ask Selise support for the correct audience for Data Gateway tokens.  
   - **Assign Role(s):** assign the **`user`** role only (avoid **`cloudadmin`** for a public-read key). Tighter scoping is possible via **IAM → Roles / Permissions** [roles](https://cloud.seliseblocks.com/services/iam?tab=roles), [permissions](https://cloud.seliseblocks.com/services/iam?tab=permissions) if your tenant exposes Data Gateway permissions.  
   - Click **Add** and copy **Client Id** and **Client Secret** (shown once / via copy buttons).

3. **Mint an access token** (JWT) with the IdP — same contract as interactive login, see [Swagger `POST /idp/v1/Authentication/Token`](https://api.seliseblocks.com/idp/v1/swagger/index.html) (`grant_type`, `client_id`, `client_secret` in multipart form). Example:

```bash
curl -s -X POST 'https://api.seliseblocks.com/idp/v1/Authentication/Token' \
  -H "x-blocks-key: YOUR_PROJECT_X_BLOCKS_KEY" \
  -F 'grant_type=client_credentials' \
  -F 'client_id=YOUR_CLIENT_ID' \
  -F 'client_secret=YOUR_CLIENT_SECRET'
```

Parse **`access_token`** from the JSON response and set **`VITE_VIBE_PUBLIC_READ_TOKEN`** to that value in [`.env.production`](.env.production), then rebuild and redeploy.

4. **Expiry:** Client-credentials access tokens expire per **Access token validity** on **Authentication → General**. For a static env var in the bundle, raise validity (within org policy) or plan to rotate `VITE_VIBE_PUBLIC_READ_TOKEN` when it expires.

**Security:** The value is **public** in the JavaScript bundle—treat it like an **anonymous read key**. Prefer **`user`** (or a custom read-only role), never **`cloudadmin`**, for this client; rotate **Client Secret** / delete the client if it leaks.

If **View** is **Public** on the schemas above, leave **`VITE_VIBE_PUBLIC_READ_TOKEN` unset** (or empty) and rely on `x-blocks-key` only for those reads.

**Note:** If the repository is **public**, anyone can read the committed key from Git—rotate the key in Blocks if needed. Private repos match how the Construct CLI scaffolds `--x-blocks-key` into app config.

`getBlocksApiBaseUrl()` in code still defaults API origin to `https://api.seliseblocks.com` when unset—`.env.production` makes the full set explicit for your tenant.

**Selise Blocks Docker build:** `Dockerfile` runs `npm run build:prod` → **`vite build`** (no `.env.prod` / `set-env` required for production). `build:dev` / `build:stg` still use [set-env.cjs](set-env.cjs) when you maintain `.env.dev` / `.env.stg` locally.

### Portal flow (summary)

1. Open [Blocks Cloud](https://cloud.seliseblocks.com) (or your tenant URL).
2. Ensure the Git provider can access this repo: [Adding a repository](https://docs.seliseblocks.com/cloud/getting-started#adding-a-repository).
3. Sidebar: **Deployment** → **Deployment Overview**.
4. Open the repository card → **Repository Details**.
5. **Deploy Now**, or enable **Git-based deployment** for your branch.
6. When the job completes, use **Deploys To** on the overview / logs for the live URL.

**SPA routing:** Deep links like `/app/...` and `/site/...` require the host to serve `index.html` for routes that are not static files. [staticwebapp.config.json](staticwebapp.config.json) shows the expected fallback (`navigationFallback` / rewrite to `/index.html`). Configure the equivalent in Blocks if the default static hosting does not.

### Data Gateway (real persistence for VibeBuilder)

GraphQL errors like **`getVibeWebsites does not exist on the type Query`** (or **`VibeWebsites` does not exist**) mean the **Data Gateway** for this environment has no published schemas that expose the Vibe collections, or the client is using the wrong **query root field** name. After publish, Blocks generates **`get*`-prefixed** list queries (same pattern as `getInventoryItems`). This app calls:

| Entity (schema) | List query (read) | Insert mutation example |
|-----------------|-------------------|---------------------------|
| **VibeWebsite** | `getVibeWebsites(input: DynamicQueryInput)` | `insertVibeWebsite` |
| **VibePage** | `getVibePages` | `insertVibePage` |
| **VibeAsset** | `getVibeAssets` | `insertVibeAsset` |

**In Blocks Cloud:** open your **environment → Data** (Data Gateway). Ensure **Blocks Database** (or your DB) is configured and the gateway is **started**. Under **Schemas**, **Add** each **Entity** with the properties below (remove any default columns you do not want), then **Publish** ([Data Gateway docs](https://docs.seliseblocks.com/cloud/data-gateway)).

**Navigation:** **Console** → open your project (e.g. **VibeBuilder**) → **Cloud** → pick the environment (e.g. **prod**) → sidebar **Data** (or **Data Gateway**). If you only see **Deployment / Workflow**, you are on **Environment Overview**—use the environment switcher or project card until the **Data** entry appears.

| Entity name | Properties (type: String unless noted) | Notes |
|-------------|----------------------------------------|--------|
| **VibeWebsite** | `ItemId`, `OwnerId`, `Slug`, `Payload`, `CreatedDate`, `LastUpdatedDate`, optional `IsDeleted` (Boolean) | **App list filter:** `OwnerId` only in `DynamicQueryInput.filter` (JSON string). Omit `IsDeleted: false` unless every row has that field—Mongo-style equality excludes documents where the field is missing. |
| **VibePage** | `ItemId`, `WebsiteId`, `OwnerId`, `Slug`, `Payload`, `CreatedDate`, `LastUpdatedDate`, optional `IsDeleted` (Boolean) | **App list filter:** `WebsiteId` only (same note on `IsDeleted`). |
| **VibeAsset** | `ItemId`, `OwnerId`, `WebsiteId`, `FileName`, `Payload`, `CreatedDate`, optional `IsDeleted` (Boolean) | **App list filter:** `WebsiteId` only (same note on `IsDeleted`). |

The GraphQL **`InsertInput`** types for these entities **omit `CreatedDate` / `LastUpdatedDate`** (the gateway sets them). **Do not send `ItemId` on insert** — let the gateway assign `_id` and use the mutation’s **`itemId`** return value (same as inventory). Client-generated ids like `site_<uuid>` can cause insert failures. **`UpdateInput`** types include **`OwnerId` / `Slug` / `Payload`** (and **`WebsiteId`** on pages) plus optional **`Language` / `OrganizationIds` / `Tags`** — not `ItemId` or timestamps. **`DeleteInput`** is only **`isHardDelete`** (boolean), same as other Blocks entities (e.g. inventory). Confirm fields in **Data Playground → Schemas → Input Types** after each publish.

The app keeps canonical dates inside **`Payload`** on create/update. **`insertVibeWebsite` / `insertVibePage` / `insertVibeAsset`** return **`ActionResponse`**: `acknowledged`, `itemId`, `message`, and (in Playground) **`totalImpactedData`**—use **`itemId`** as the persisted id.

Use **Data Playground → Schemas** to confirm **`getVibeWebsites` / `getVibePages` / `getVibeAssets`** and mutation input shapes. **Publish** after schema edits or the API will not match.

**`_id` vs `ItemId`:** mutations use `filter: JSON.stringify({ _id: "<id>" })` for updates/deletes using the website/page **id** stored in `ItemId` / payload. With Blocks Database, confirm new rows use `_id` equal to `ItemId` (or change [vibe-builder.service.ts](src/modules/vibe-builder/services/vibe-builder.service.ts) filters to the field your gateway uses).

Until those schemas exist, the app **falls back to `localStorage`** for Vibe data (one browser only, not shared across devices).

---

1. Copy the **production origin** from **Deploys To** (e.g. `https://your-host.example`).
2. In Blocks **Identity / IAM** (or project auth settings), allow that origin for **redirect / callback URLs** and any **CORS / allowed web origins** required by your API setup.
3. Add **preview** hostnames too if you use per-branch deploys and need sign-in there.

### If deployment fails (Construct-only pipeline)

Documentation states deployment is supported for repositories built on **Blocks Construct**. This repository is a **custom Vite + React** app; the pipeline may fail until Selise or your course staff confirms a compatible build.

1. Read the **deployment log** in Blocks for the exact error.
2. Escalate to **instructor / Selise support** before assuming a misconfiguration.
3. Only with approval, use **Azure Static Web Apps** (below) or another static host as a fallback while keeping `VITE_*` pointed at Selise.

---

## Azure Static Web Apps (fallback)

Use this path if Blocks Cloud hosting is unavailable or you are deploying a manual static bundle to your own Azure resource.

### Prerequisites

*   An Azure subscription. If you don't have one, you can [create a free Azure account](https://azure.microsoft.com/en-us/free/).
*   A production build (`npm run build` → `build/`).
*   Node.js and npm installed ([nodejs.org](https://nodejs.org/)).

### Steps

1. **Create a Static Web App in Azure:**

    *   Navigate to the Azure portal ([https://portal.azure.com](https://portal.azure.com)).
    *   Search for "Static Web Apps" in the search bar and select it.
    *   Click "Create" to create a new Static Web App. You'll need to provide details like the subscription, resource group, and name for your app. *Important:* You do *not* need to connect a repository at this stage if you are deploying manually.

2. **Create `swa-cli.config.json`:**

    *   Create a file named `swa-cli.config.json` in the root directory of your React project (alongside `package.json`).
    *   Paste the following configuration into the file, replacing `<static-app name>` with the *exact* name of your Static Web App in Azure:

    ```json
    {
      "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
      "configurations": {
        "<static-app name>": {
          "appDir": "build",
          "outputLocation": "build"
        }
      }
    }
    ```

    *   **Explanation:**
        *   `$schema`: Points to the schema for validation.
        *   `configurations`: Contains the configuration for your static web app.
        *   `<static-app name>`: The *name* of your static web app in Azure. **This must match exactly.**
        *   `appDir`: Specifies the directory containing your built application files (usually `build` after running `npm run build`).
        *   `outputLocation`: Should match the `appDir` in this case. This is where the built files will be located.

3. **Create `staticwebapp.config.json`:**

    *   Create a file named `staticwebapp.config.json` in the root directory of your React project (alongside `package.json` and `swa-cli.config.json`).
    *   Paste the following configuration into the file:

    ```json
    {
        "navigationFallback": {
            "rewrite": "/index.html"
        }
    }
    ```

    *   **Explanation:**
        *   `navigationFallback`: Tells Azure Static Web Apps to serve `index.html` for requests that don't match static files (CSS, JavaScript, images). This is how client-side routing works.

4. **Install the Azure Static Web Apps CLI:**

    *   Open your terminal in the root directory of your React project.
    *   Run the following command to install the CLI globally:

    ```bash
    npm install -g @azure/static-web-apps-cli
    ```

5. **Verify Installation:**

    *   Run the following command to check the CLI version:

    ```bash
    swa --version
    ```

6. **Get the Deployment Token:**

    *   In the Azure portal, navigate to your Static Web App.
    *   In the left-hand menu, under "Settings," find "Deployment credentials."
    *   Copy the "Manage deployment token" value. **Keep this token secure!** Treat it like a password.

7. **Deploy the Application:**

    *   In your terminal, navigate to the root directory of your React project.
    *   Run the following command, replacing `<token>` with the deployment token you copied and `<static-app name>` with the name of your static web app in Azure:

    ```bash
    swa deploy --deployment-token "<token>" --config-name "<static-app name>" --env production
    ```

    *   If you do not set `--env` it will deploy in preview mode.

8. **Access Your Application:**

    *   Once the deployment is complete, the CLI will output the URL of your deployed application. You can also find this URL in the Azure portal on the overview page of your Static Web App.

---

## Troubleshooting

* **`swa` command not found:** Ensure Node.js and npm (or yarn) are installed correctly, and that you installed the `@azure/static-web-apps-cli` globally.
* **Deployment errors:** Double-check the `<static-app name>` in your `swa-cli.config.json` file and the `swa deploy` command. Verify the deployment token is correct. Examine the output in the terminal for specific error messages.

---

### Deployment Script for Manual Deployment

You can also use the following deployment script to automate the process:

```bash
#!/bin/bash
 
# Function to check if a command exists
dependencies=("node" "npm" "swa")
check_dependency() {
    if ! command -v "$1" &>/dev/null; then
        echo "Error: $1 is not installed. Please install it before running this script."
        exit 1
    fi
}
 
# Check dependencies
for dep in "${dependencies[@]}"; do
    check_dependency "$dep"
done
 
# Ensure Azure Static Web Apps CLI is installed
if ! npm list -g @azure/static-web-apps-cli &>/dev/null; then
    echo "Installing Azure Static Web Apps CLI..."
    npm install -g @azure/static-web-apps-cli
fi
 
# Get user input for Static Web App details
echo "Enter your Azure Static Web App name:"
read STATIC_APP_NAME
 
if [ -z "$STATIC_APP_NAME" ]; then
    echo "Error: Static Web App name cannot be empty."
    exit 1
fi
 
# Get the deployment token
echo "Enter your Azure Static Web App deployment token (paste and press Enter):"
read DEPLOYMENT_TOKEN
 
if [ -z "$DEPLOYMENT_TOKEN" ]; then
    echo "Error: Deployment token cannot be empty."
    exit 1
fi
 
# Build the React app
echo "Building the React application..."
npm install && npm run build
 
if [ $? -ne 0 ]; then
    echo "Error: React app build failed. Check the logs above."
    exit 1
fi
 
# Check and create swa-cli.config.json if it doesn't exist
if [ ! -f swa-cli.config.json ]; then
    cat > swa-cli.config.json <<EOL
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "$STATIC_APP_NAME": {
      "appDir": "build",
      "outputLocation": "build"
    }
  }
}
EOL
    echo "swa-cli.config.json created successfully."
else
    echo "swa-cli.config.json already exists. Skipping creation."
fi
 
# Check and create staticwebapp.config.json if it doesn't exist
if [ ! -f staticwebapp.config.json ]; then
    cat > staticwebapp.config.json <<EOL
{
    "navigationFallback": {
        "rewrite": "/index.html"
    }
}
EOL
    echo "staticwebapp.config.json created successfully."
else
    echo "staticwebapp.config.json already exists. Skipping creation."
fi
 
# Deploy the application
echo "Deploying to Azure Static Web Apps..."
swa deploy --deployment-token "$DEPLOYMENT_TOKEN" --config-name "$STATIC_APP_NAME" --env production
 
if [ $? -eq 0 ]; then
    echo "Deployment successful!"
else
    echo "Deployment failed. Check the error messages above."
    exit 1
fi
```

### Run Script for Manual Deployment

This script will:
1. Verify dependencies are installed.
2. Build your React app.
3. Check for existing configuration files or create them.
4. Deploy the app to Azure Static Web Apps using your deployment token.

To run the script using `npm run build-and-deploy`, you can add the following `"build-and-deploy"` script to your `package.json`:

```json
{
  "scripts": {
    ....
    ....
    "build-and-deploy": "bash deploy.sh",
    ....
    ....
  }
}
```

This way, when you run:

```bash
npm run build-and-deploy
```

It will first execute the `build` script (which builds your React app) and then run the `deploy.sh` script to deploy your app to Azure Static Web Apps. Make sure the `deploy.sh` script is in the root directory of your project.

