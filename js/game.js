// Variáveis globais para o estado do jogo
let cards = []; // Armazena as cartas do jogo
let flippedCards = []; // Armazena as cartas que foram viradas
let matchedCards = []; // Armazena os pares de cartas combinadas
let movesLeft = 12; // Número de movimentos restantes
let timeLeft = 60; // Tempo restante
let timer; // Referência ao timer
let level = 1; // Nível atual do jogo
let mode = 'time'; // Armazena o modo de jogo atual

// Dados dos níveis de dificuldade
const levels = {
    1: { pairs: 3, time: 15, moves: 6 }, // Dados para o nível 1
    2: { pairs: 4, time: 30, moves: 10 }, // Dados para o nível 2
    3: { pairs: 6, time: 40, moves: 14 } // Dados para o nível 3
};

// Inicializa o jogo com base no modo selecionado
document.getElementById('time-mode').addEventListener('click', () => startGame('time'));
document.getElementById('move-mode').addEventListener('click', () => startGame('moves'));

// Função para iniciar o jogo
function startGame(selectedMode) {
    level = 1; // Define o nível inicial
    mode = selectedMode; // Define o modo de jogo selecionado
    loadLevel(level, mode); // Carrega o nível inicial com o modo de jogo
    // Oculta a seleção de modos e exibe o painel de status e o tabuleiro do jogo
    document.getElementById('game-modes').style.display = 'none';
    document.getElementById('status').style.display = 'flex';
    document.getElementById('game-board').style.display = 'flex';
    document.getElementById('game-over').style.display = 'none'; // Oculta a tela de game over

    // Ajusta a visibilidade dos elementos com base no modo selecionado
    if (mode === 'time') {
        document.getElementById('moves-display').style.display = 'none'; // Oculta o contador de movimentos no modo de tempo
        document.getElementById('timer').style.display = 'flex'; // Exibe o cronômetro
    } else if (mode === 'moves') {
        document.getElementById('moves-display').style.display = 'flex'; // Exibe o contador de movimentos
        document.getElementById('timer').style.display = 'none'; // Oculta o cronômetro
    }
}

// Função para carregar o nível atual
function loadLevel(level, mode) {
    const levelData = levels[level]; // Obtém os dados do nível atual
    movesLeft = levelData.moves; // Define o número de movimentos restantes
    timeLeft = levelData.time; // Define o tempo restante

    // Atualiza os elementos da interface com os dados do nível
    document.getElementById('level-display').textContent = `Nível: ${level}`;
    document.getElementById('moves-left').textContent = movesLeft;
    document.getElementById('time-left').textContent = timeLeft;

    generateCards(levelData.pairs); // Gera as cartas para o nível
    matchedCards = []; // Reseta os pares combinados

    // Inicia o cronômetro se o modo for 'time'
    if (mode === 'time') {
        startTimer(timeLeft);
    }
}

// Função para gerar as cartas do jogo
function generateCards(pairs) {
    const animals = ['tatu', 'anta', 'ave', 'preguica', 'hipo', 'tigre']; // Lista de animais
    const animalImages = animals.slice(0, pairs); // Seleciona o número necessário de animais
    cards = []; // Reseta o array de cartas

    // Adiciona pares de cartas ao array
    animalImages.forEach(animal => {
        cards.push({ animal: animal, flipped: false });
        cards.push({ animal: animal, flipped: false });
    });
    shuffle(cards); // Embaralha as cartas
    renderCards(); // Renderiza as cartas no tabuleiro
}

// Função para renderizar as cartas no tabuleiro
function renderCards() {
    const board = document.getElementById('game-board');
    board.innerHTML = ''; // Limpa o tabuleiro
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        
        // Adiciona a classe 'flipped' se a carta estiver virada
        if (card.flipped) {
            cardElement.classList.add('flipped');
        }

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="img/${card.animal}.png" alt="${card.animal}" class="card-image">
                </div>
            </div>`;
        
        // Adiciona o evento de clique para virar a carta
        cardElement.addEventListener('click', () => flipCard(index));
        board.appendChild(cardElement);
    });
}

// Função para virar as cartas
function flipCard(index) {
    const card = cards[index];
    if (flippedCards.length < 2 && !card.flipped && !matchedCards.includes(card)) {
        card.flipped = true; // Marca a carta como virada
        flippedCards.push(card); // Adiciona a carta ao array de cartas viradas
        
        // Adiciona a classe 'flipped' à carta
        document.querySelectorAll('.card')[index].classList.add('flipped');
        
        if (flippedCards.length === 2) {
            checkMatch(); // Verifica se as duas cartas viradas combinam
        }
    }
}

// Função para verificar se as cartas combinam
function checkMatch() {
    const [first, second] = flippedCards;
    if (first.animal === second.animal) {
        // Par encontrado, mantemos as cartas viradas
        matchedCards.push(first, second);
        flippedCards = []; // Reseta o array de cartas viradas
        
        if (matchedCards.length === cards.length) {
            endLevel(); // Encerra o nível se todos os pares foram encontrados
        }
    } else {
        // Não formou par, espera 1 segundo e desvira as cartas
        setTimeout(() => {
            first.flipped = false;
            second.flipped = false;

            // Remove a classe 'flipped' das cartas
            const firstIndex = cards.indexOf(first);
            const secondIndex = cards.indexOf(second);
            
            document.querySelectorAll('.card')[firstIndex].classList.remove('flipped');
            document.querySelectorAll('.card')[secondIndex].classList.remove('flipped');

            flippedCards = []; // Reseta o array de cartas viradas
        }, 1000); // Adiciona um delay de 1 segundo para que as cartas desvirarem
    }

    movesLeft--; // Decrementa o número de movimentos restantes
    document.getElementById('moves-left').textContent = movesLeft; // Atualiza a interface com os movimentos restantes
    if (movesLeft === 0 && matchedCards.length < cards.length) {
        endGame(false); // Encerra o jogo se os movimentos acabaram e nem todos os pares foram encontrados
    }
}

// Função para iniciar o cronômetro
function startTimer(duration) {
    timer = setInterval(() => {
        timeLeft--; // Decrementa o tempo restante
        document.getElementById('time-left').textContent = timeLeft; // Atualiza a interface com o tempo restante
        if (timeLeft <= 0 && matchedCards.length < cards.length) {
            clearInterval(timer); // Para o cronômetro
            endGame(false); // Encerra o jogo se o tempo acabou e nem todos os pares foram encontrados
        }
    }, 1000); // Atualiza a cada segundo
}

// Função para encerrar o nível
function endLevel() {
    clearInterval(timer); // Para o cronômetro
    if (matchedCards.length === cards.length) { // Verifica se todas as combinações foram feitas
        if (level < 3) {
            level++; // Avança para o próximo nível
            loadLevel(level, mode); // Carrega o próximo nível com o modo atual
        } else {
            endGame(true); // Finaliza o jogo se o jogador venceu todos os níveis
        }
    }
}

// Função para encerrar o jogo
function endGame(won) {
    clearInterval(timer); // Para o cronômetro
    document.getElementById('game-over').style.display = 'block'; // Exibe a tela de game over
    document.getElementById('status').style.display = 'none'; // Oculta o painel de status
    document.getElementById('game-board').style.display = 'none'; // Oculta o tabuleiro do jogo
    const messageElement = document.getElementById('game-over-message');
    if (won) {
        messageElement.innerHTML = '<span class="win">Você venceu!</span>'; // Mensagem de vitória
    } else {
        messageElement.innerHTML = '<span class="loose">Game Over</span>'; // Mensagem de derrota
    }
}

// Função para reiniciar o jogo
document.getElementById('restart-button').addEventListener('click', () => {
    resetGame(); // Reseta o estado do jogo
    document.getElementById('game-over').style.display = 'none'; // Oculta a tela de game over
    document.getElementById('game-modes').style.display = 'block'; // Exibe a seleção de modos de jogo
});

// Função para redefinir o estado do jogo
function resetGame() {
    cards = []; // Reseta o array de cartas
    flippedCards = []; // Reseta o array de cartas viradas
    matchedCards = []; // Reseta o array de pares combinados
    movesLeft = 12; // Reinicia o número de movimentos restantes
    timeLeft = 60; // Reinicia o tempo restante
    level = 1; // Reinicia o nível
    clearInterval(timer); // Para o cronômetro
}

// Função para embaralhar o array de cartas
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
    }
    return array; // Retorna o array embaralhado
}
