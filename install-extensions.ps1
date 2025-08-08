# Script de instalacao das extensoes VS Code
Write-Host "Instalando extensões do VS Code..." -ForegroundColor Green

$extensions = @(
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint", 
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "dsznajder.es7-react-js-snippets",
    "eamodio.gitlens",
    "PKief.material-icon-theme",
    "ms-vscode.vscode-docker",
    "aaron-bond.better-comments",
    "usernamehw.errorlens"
)

foreach ($ext in $extensions) {
    Write-Host "Instalando: $ext"
    code --install-extension $ext --force
}

Write-Host "Concluído!" -ForegroundColor Green
Read-Host "Pressione Enter para continuar"