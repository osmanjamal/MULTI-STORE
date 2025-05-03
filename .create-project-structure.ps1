# PowerShell script to create multi-store-sync project structure
# Save this as create-project-structure.ps1

# Create the root directory if it doesn't exist
$rootDir = "multi-store-sync"
if (-not (Test-Path $rootDir)) {
    New-Item -ItemType Directory -Path $rootDir | Out-Null
}

# Create directory structure with empty files
$structure = @(
    # GitHub workflow files
    ".github\workflows\ci.yml",
    ".github\workflows\deploy.yml",
    
    # Server directory structure
    "server\config\database.js",
    "server\config\marketplace\shopify.js",
    "server\config\marketplace\lazada.js",
    "server\config\marketplace\shopee.js",
    "server\config\marketplace\woocommerce.js",
    "server\config\app.js",
    
    # Controllers
    "server\controllers\auth\authController.js",
    "server\controllers\auth\userController.js",
    "server\controllers\store\storeController.js",
    "server\controllers\store\connectionController.js",
    "server\controllers\product\productController.js",
    "server\controllers\product\variantController.js",
    "server\controllers\product\categoryController.js",
    "server\controllers\inventory\inventoryController.js",
    "server\controllers\inventory\stockController.js",
    "server\controllers\order\orderController.js",
    "server\controllers\order\fulfillmentController.js",
    "server\controllers\sync\syncController.js",
    "server\controllers\sync\syncRuleController.js",
    "server\controllers\sync\webhookController.js",
    "server\controllers\sync\logController.js",
    
    # Models
    "server\models\user.js",
    "server\models\store.js",
    "server\models\connection.js",
    "server\models\product.js",
    "server\models\variant.js",
    "server\models\category.js",
    "server\models\inventory.js",
    "server\models\order.js",
    "server\models\fulfillment.js",
    "server\models\syncRule.js",
    "server\models\syncLog.js",
    "server\models\webhook.js",
    
    # Routes
    "server\routes\auth.js",
    "server\routes\store.js",
    "server\routes\product.js",
    "server\routes\inventory.js",
    "server\routes\order.js",
    "server\routes\sync.js",
    "server\routes\webhook.js",
    
    # Services
    "server\services\auth\authService.js",
    "server\services\auth\tokenService.js",
    "server\services\marketplace\shopifyService.js",
    "server\services\marketplace\lazadaService.js",
    "server\services\marketplace\shopeeService.js",
    "server\services\marketplace\woocommerceService.js",
    "server\services\product\productService.js",
    "server\services\product\importService.js",
    "server\services\product\exportService.js",
    "server\services\inventory\inventoryService.js",
    "server\services\inventory\stockAdjustmentService.js",
    "server\services\order\orderService.js",
    "server\services\order\fulfillmentService.js",
    "server\services\sync\syncService.js",
    "server\services\sync\webhookService.js",
    "server\services\sync\matchingService.js",
    "server\services\sync\logService.js",
    
    # Utils
    "server\utils\logger.js",
    "server\utils\errors.js",
    "server\utils\validators.js",
    "server\utils\formatter.js",
    "server\utils\helpers.js",
    
    # Middleware
    "server\middleware\auth.js",
    "server\middleware\errorHandler.js",
    "server\middleware\rateLimiter.js",
    "server\middleware\webhookValidator.js",
    
    # Jobs
    "server\jobs\syncInventory.js",
    "server\jobs\syncProducts.js",
    "server\jobs\syncOrders.js",
    "server\jobs\cleanupLogs.js",
    
    # Server main files
    "server\migrations",
    "server\app.js",
    "server\server.js",
    "server\package.json",
    
    # Client directory structure
    "client\public\favicon.ico",
    "client\public\index.html",
    "client\public\assets\images",
    "client\public\assets\icons",
    
    # Client source files
    "client\src\assets\images",
    "client\src\assets\icons",
    "client\src\assets\styles",
    
    # Components
    "client\src\components\layout\Header.jsx",
    "client\src\components\layout\Sidebar.jsx",
    "client\src\components\layout\Footer.jsx",
    "client\src\components\layout\Layout.jsx",
    "client\src\components\common\Button.jsx",
    "client\src\components\common\Card.jsx",
    "client\src\components\common\Table.jsx",
    "client\src\components\common\Modal.jsx",
    "client\src\components\common\Alert.jsx",
    "client\src\components\common\Loader.jsx",
    "client\src\components\common\Pagination.jsx",
    "client\src\components\auth\LoginForm.jsx",
    "client\src\components\auth\RegisterForm.jsx",
    "client\src\components\dashboard\StatsCard.jsx",
    "client\src\components\dashboard\SyncStatus.jsx",
    "client\src\components\dashboard\ActivityLog.jsx",
    "client\src\components\stores\StoreList.jsx",
    "client\src\components\stores\StoreForm.jsx",
    "client\src\components\stores\StoreCard.jsx",
    "client\src\components\products\ProductList.jsx",
    "client\src\components\products\ProductForm.jsx",
    "client\src\components\products\ProductDetail.jsx",
    "client\src\components\products\ProductMapping.jsx",
    "client\src\components\inventory\InventoryList.jsx",
    "client\src\components\inventory\InventoryForm.jsx",
    "client\src\components\inventory\StockAdjustment.jsx",
    "client\src\components\orders\OrderList.jsx",
    "client\src\components\orders\OrderDetail.jsx",
    "client\src\components\orders\FulfillmentForm.jsx",
    "client\src\components\sync\SyncRuleList.jsx",
    "client\src\components\sync\SyncRuleForm.jsx",
    "client\src\components\sync\SyncLogList.jsx",
    "client\src\components\sync\SyncSettings.jsx",
    
    # Pages
    "client\src\pages\Auth\Login.jsx",
    "client\src\pages\Auth\Register.jsx",
    "client\src\pages\Auth\ForgotPassword.jsx",
    "client\src\pages\Dashboard.jsx",
    "client\src\pages\Stores\StoresPage.jsx",
    "client\src\pages\Stores\AddStore.jsx",
    "client\src\pages\Stores\EditStore.jsx",
    "client\src\pages\Products\ProductsPage.jsx",
    "client\src\pages\Products\AddProduct.jsx",
    "client\src\pages\Products\EditProduct.jsx",
    "client\src\pages\Products\ProductMapping.jsx",
    "client\src\pages\Inventory\InventoryPage.jsx",
    "client\src\pages\Inventory\AdjustStock.jsx",
    "client\src\pages\Orders\OrdersPage.jsx",
    "client\src\pages\Orders\OrderDetail.jsx",
    "client\src\pages\Sync\SyncRules.jsx",
    "client\src\pages\Sync\SyncLogs.jsx",
    "client\src\pages\Sync\SyncSettings.jsx",
    "client\src\pages\Settings\ProfileSettings.jsx",
    "client\src\pages\Settings\AccountSettings.jsx",
    "client\src\pages\Settings\ApiSettings.jsx",
    
    # Context
    "client\src\context\AuthContext.jsx",
    "client\src\context\StoreContext.jsx",
    "client\src\context\ProductContext.jsx",
    "client\src\context\SyncContext.jsx",
    
    # Hooks
    "client\src\hooks\useAuth.js",
    "client\src\hooks\useStore.js",
    "client\src\hooks\useProduct.js",
    "client\src\hooks\useInventory.js",
    "client\src\hooks\useOrder.js",
    "client\src\hooks\useSync.js",
    
    # Services (Client)
    "client\src\services\api.js",
    "client\src\services\auth.js",
    "client\src\services\store.js",
    "client\src\services\product.js",
    "client\src\services\inventory.js",
    "client\src\services\order.js",
    "client\src\services\sync.js",
    
    # Utils (Client)
    "client\src\utils\formatters.js",
    "client\src\utils\validators.js",
    "client\src\utils\storage.js",
    "client\src\utils\helpers.js",
    
    # Config (Client)
    "client\src\config\routes.js",
    "client\src\config\theme.js",
    
    # Client main files
    "client\src\App.jsx",
    "client\src\index.jsx",
    "client\src\routes.jsx",
    "client\package.json",
    "client\README.md",
    
    # Database
    "database\schema.sql",
    "database\seeds\stores.js",
    "database\seeds\products.js",
    "database\seeds\users.js",
    
    # Documentation
    "docs\api\auth.md",
    "docs\api\stores.md",
    "docs\api\products.md",
    "docs\api\inventory.md",
    "docs\api\orders.md",
    "docs\api\sync.md",
    "docs\setup.md",
    "docs\architecture.md",
    "docs\sync.md",
    "docs\user-guide.md",
    
    # Tests
    "tests\server\controllers",
    "tests\server\services",
    "tests\server\models",
    "tests\server\integration",
    "tests\client\components",
    "tests\client\hooks",
    "tests\client\integration",
    
    # Scripts
    "scripts\setup.sh",
    "scripts\deploy.sh",
    "scripts\seed.js",
    
    # Root files
    ".env.example",
    ".gitignore",
    ".eslintrc",
    ".prettierrc",
    "jest.config.js",
    "docker-compose.yml",
    "Dockerfile",
    "README.md",
    "package.json"
)

foreach ($item in $structure) {
    $path = Join-Path -Path $rootDir -ChildPath $item
    
    # Check if this is a directory (no file extension) or ends with a backslash
    if (($item -notmatch "\.") -or ($item -match "\\$")) {
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Host "Created directory: $path"
        }
    } else {
        # Make sure the parent directory exists
        $dir = Split-Path -Path $path -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        # Create empty file if it doesn't exist
        if (-not (Test-Path $path)) {
            $null = New-Item -ItemType File -Path $path -Force
            Write-Host "Created file: $path"
        }
    }
}

Write-Host "Project structure created successfully!"