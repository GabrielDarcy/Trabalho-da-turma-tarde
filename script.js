function login() {
    // Lógica simples de navegação de interface
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').style.display = 'flex';
}

function register() {
    alert('Você iniciou o processo de registro! \nApós o registro, você seria redirecionado para a tela inicial.');
    login();
}
