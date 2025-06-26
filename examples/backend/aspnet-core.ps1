# ASP.NET Core Backend Scaffold - PowerShell Version
Write-Host "🚀 Creating ASP.NET Core Web API project..." -ForegroundColor Blue

# Create project
Set-Location backend
dotnet new webapi -f net8.0 --no-https --output . --name "WebApiProject"

Write-Host "📁 Creating project structure..." -ForegroundColor Yellow

# Create directory structure
$directories = @(
    "Controllers\Api",
    "Models\Entities",
    "Models\DTOs", 
    "Models\Requests",
    "Models\Responses",
    "Services\Interfaces",
    "Services\Implementations",
    "Data\Contexts",
    "Data\Repositories",
    "Data\Configurations",
    "Middleware",
    "Extensions",
    "Filters",
    "Hubs",
    "Infrastructure\Logging",
    "Infrastructure\Caching",
    "Infrastructure\Email"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  ✓ Created $dir" -ForegroundColor Green
}

# Create essential files
Write-Host "📄 Creating essential files..." -ForegroundColor Yellow
$files = @(
    "Controllers\Api\UsersController.cs",
    "Controllers\Api\AuthController.cs",
    "Models\Entities\User.cs",
    "Models\Entities\BaseEntity.cs",
    "Models\DTOs\UserDto.cs",
    "Models\DTOs\LoginDto.cs",
    "Models\Requests\CreateUserRequest.cs",
    "Models\Requests\LoginRequest.cs",
    "Models\Responses\ApiResponse.cs",
    "Models\Responses\LoginResponse.cs",
    "Services\Interfaces\IUserService.cs",
    "Services\Interfaces\IAuthService.cs",
    "Services\Implementations\UserService.cs",
    "Services\Implementations\AuthService.cs",
    "Data\Contexts\ApplicationDbContext.cs",
    "Data\Repositories\IRepository.cs",
    "Data\Repositories\Repository.cs",
    "Data\Repositories\IUserRepository.cs",
    "Data\Repositories\UserRepository.cs",
    "Data\Configurations\UserConfiguration.cs",
    "Middleware\ExceptionMiddleware.cs",
    "Middleware\LoggingMiddleware.cs",
    "Extensions\ServiceExtensions.cs",
    "Extensions\ApplicationExtensions.cs",
    "Filters\ValidationFilter.cs",
    "Hubs\NotificationHub.cs",
    "Infrastructure\Logging\ILoggerService.cs",
    "Infrastructure\Logging\LoggerService.cs"
)

foreach ($file in $files) {
    New-Item -ItemType File -Force -Path $file | Out-Null
    Write-Host "  ✓ Created $file" -ForegroundColor Green
}

# Install NuGet packages
Write-Host "📦 Installing NuGet packages..." -ForegroundColor Yellow
$packages = @(
    "Microsoft.EntityFrameworkCore.SqlServer",
    "Microsoft.EntityFrameworkCore.Tools",
    "Microsoft.EntityFrameworkCore.Design",
    "Microsoft.AspNetCore.Authentication.JwtBearer",
    "Microsoft.AspNetCore.SignalR",
    "AutoMapper.Extensions.Microsoft.DependencyInjection",
    "FluentValidation.AspNetCore",
    "Serilog.AspNetCore",
    "Serilog.Sinks.File",
    "Swashbuckle.AspNetCore"
)

foreach ($package in $packages) {
    Write-Host "  Installing $package..." -ForegroundColor Cyan
    dotnet add package $package
}

# Create configuration files
Write-Host "⚙️  Creating configuration files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path "appsettings.Development.json" | Out-Null
New-Item -ItemType File -Force -Path "appsettings.Production.json" | Out-Null

Write-Host "✅ ASP.NET Core Web API project created successfully!" -ForegroundColor Green
Write-Host "📂 Project location: $PWD" -ForegroundColor Cyan
Write-Host "🏃 Run 'dotnet run' to start the development server" -ForegroundColor Cyan
Write-Host "🌐 API will be available at https://localhost:5001" -ForegroundColor Cyan