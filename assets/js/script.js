class Game {
    constructor () {
        this.Forca = new Forca;
        this.Palavra = new Palavra;
        this.chutesIncorretos = 0;
    }

    async init(){
        await this.Palavra.pesquisarPalavra();
        await this.Palavra.getPalavra();
        console.log(this.Palavra.getPalavra());

        this.Palavra.pesquisarSignificado(this.Palavra.getPalavra().word)
        this.Palavra.getSignificadoDaPalavra();

        this.encriptarPalavraSecreta();
        DOM.cliqueBotaoAlfabeto(this);
    }

    reload(){}

    encriptarPalavraSecreta() {
        DOM.palavra.textContent = this.Palavra.getPalavra().word.replace(/[A-Za-zÁÉÍÓÚáéíóúâêîôûàèìòùãẽĩõũÇç]/g, '*');
    }

    desencriptarLetra(palavra, letraChutada) {
        let palavraSecretaEncriptada = DOM.palavra.textContent.split('');
        let palavraSecretaArray = palavra.split('');
        for (let i = 0; i < palavraSecretaArray.length; i++) {
            if (palavraSecretaArray[i] === letraChutada) {
                let letraOriginal = this.Palavra.getPalavra().word.charAt(i);
                palavraSecretaEncriptada.splice(i, 1, letraOriginal);
            }
        }

        DOM.palavra.textContent = palavraSecretaEncriptada.join('').toUpperCase();
    }

    dica(){}

    ganhou(){
        const palavraSecreta = DOM.palavra.textContent.replace(/[-]/g, '');
        if (!palavraSecreta.includes("*")) {
            DOM.adicionarRemoverClass();
            DOM.resultadoFinal(`VOCÊ ACERTOU!`, this);
        }
    }

    perdeu(){
        const palavraSecreta = DOM.palavra.textContent.replace(/[-]/g, '');
        if (palavraSecreta.includes("*") && this.chutesIncorretos > 6) {
            DOM.adicionarRemoverClass();
            DOM.resultadoFinal(`VOCÊ PERDEU!`, this);
        }
    }
}

class Forca {

}

class Palavra {
    #palavraSecreta;
    #significadoPalavraSecreta;

    async pesquisarPalavra() {
        const resposta = await fetch('https://api.dicionario-aberto.net/random');
        const data = await resposta.json();
        this.#palavraSecreta = data;
    }

    async pesquisarSignificado(palavra) {
        const resposta = await fetch(`https://api.dicionario-aberto.net/word/${palavra}`);
        const data = await resposta.json();
        this.#significadoPalavraSecreta = data;
    }

    getPalavra(){
        return this.#palavraSecreta;
    }

    getSignificadoDaPalavra(){
        return this.#significadoPalavraSecreta;
    }

    verificaSePalavraPossuiLetra(letraChutada) {
        const palavraSecretaMaiusculaSemAcento = this.#palavraSecreta.word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (palavraSecretaMaiusculaSemAcento.includes(letraChutada)) {
            return palavraSecretaMaiusculaSemAcento;
        }

        return false;
    }
}

const DOM = {
    jogoForca: document.querySelector('.jogo-forca'),
    resultado: document.querySelector('.resultado'),
    palavra: document.querySelector('.palavra-secreta'),
    tituloResultado: document.querySelector('.titulo-resultado'),
    palavraCerta: document.querySelector('.palavra-certa'),
    significado: document.querySelector('.significado-palavra'),
    botoesAlfabeto: document.querySelectorAll(".btn-letra"),
    boneco: [
        'cabeca',
        'tronco',
        'braco-esquerdo',
        'braco-direito',
        'perna-esquerda',
        'perna-direita',
    ],
    cliqueBotaoAlfabeto(Game) {
        const botoes = this.botoesAlfabeto;
        for (let i = 0; i < botoes.length; i++) {
            let botao = botoes[i];
            botao.addEventListener("click", function () {
                const palavra = Game.Palavra.verificaSePalavraPossuiLetra(botao.textContent);
                botao.setAttribute("disabled", "disabled");

                if(palavra){
                    botao.classList.add("btn-outline-success");
                    Game.desencriptarLetra(palavra, botao.textContent);
                    Game.ganhou();
                } else {
                    botao.classList.add("btn-outline-danger");
                    Game.chutesIncorretos++;
                    Game.perdeu();
                }
            });
        }
    },
    resultadoFinal(titulo, Game) {
        this.tituloResultado.textContent = titulo;
        this.significado.innerHTML = Game.Palavra.getSignificadoDaPalavra()[0].xml;
    },
    adicionarRemoverClass() {
        this.jogoForca.classList.toggle('active');
        this.resultado.classList.toggle('active');
    },
    removerAtributosBotoes() {
        let btnLetras = document.querySelectorAll(".btn-letra");
        for (let i = 0; i < btnLetras.length; i++) {
            btnLetras[i].removeAttribute("disabled");
        }
    },
    novoJogo() {
        App.reload();
        this.adicionarRemoverClass();
        this.removerAtributosBotoes();
        this.limparBoneco();
        Palavra.zerarLetrasChutadas();
    },
    novaPalavra() {
        App.reload();
        this.removerAtributosBotoes();
        this.limparBoneco();
        Palavra.zerarLetrasChutadas();
    },
    montarBoneco(indice) {
        document.querySelector(`.${this.boneco[indice]}`).classList.add('active');
    },
    limparBoneco() {
        let boneco = document.querySelectorAll(".boneco");
        for (let i = 0; i < boneco.length; i++) {
            boneco[i].classList.remove('active');
        }
    }
}

const game = new Game;
game.init();