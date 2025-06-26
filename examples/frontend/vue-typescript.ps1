# Vue.js TypeScript Frontend Scaffold - PowerShell Version
Write-Host "🚀 Creating Vue.js TypeScript project..." -ForegroundColor Blue

# Create project structure
Set-Location frontend
npm create vue@latest app -- --typescript --router --pinia --vitest --eslint --prettier
Set-Location app

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
$directories = @(
    "src\components\common",
    "src\components\layout", 
    "src\components\ui",
    "src\composables",
    "src\stores",
    "src\types",
    "src\utils",
    "src\views\admin",
    "src\assets\icons",
    "src\assets\images",
    "public\assets"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  ✓ Created $dir" -ForegroundColor Green
}

# Create component files
Write-Host "📄 Creating component files..." -ForegroundColor Yellow
$files = @(
    "src\components\common\PageHeader.vue",
    "src\components\common\LoadingSpinner.vue",
    "src\components\layout\AppLayout.vue",
    "src\components\layout\Sidebar.vue",
    "src\components\layout\NavBar.vue",
    "src\components\ui\Button.vue",
    "src\components\ui\Input.vue",
    "src\components\ui\Modal.vue",
    "src\composables\useApi.ts",
    "src\composables\useAuth.ts",
    "src\stores\auth.ts",
    "src\stores\app.ts",
    "src\types\api.ts",
    "src\types\user.ts",
    "src\utils\helpers.ts",
    "src\utils\constants.ts",
    "src\views\admin\Dashboard.vue",
    "src\views\admin\Users.vue"
)

foreach ($file in $files) {
    New-Item -ItemType File -Force -Path $file | Out-Null
    Write-Host "  ✓ Created $file" -ForegroundColor Green
}

# Install additional dependencies
Write-Host "📦 Installing additional dependencies..." -ForegroundColor Yellow
npm install @vueuse/core axios lodash-es @types/lodash-es

# Create configuration files
Write-Host "⚙️  Creating configuration files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path ".env.local" | Out-Null
New-Item -ItemType File -Force -Path ".env.production" | Out-Null

Write-Host "✅ Vue.js TypeScript project created successfully!" -ForegroundColor Green
Write-Host "📂 Project location: $PWD" -ForegroundColor Cyan
Write-Host "🏃 Run 'npm run dev' to start development server" -ForegroundColor Cyan