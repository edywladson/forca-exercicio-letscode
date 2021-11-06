class Game {
    constructor() {
        this.Forca = new Forca;
        this.Palavra = new Palavra;
        this.chutesIncorretos = 0;
        this.pontuacao = 0;
        DOM.cliqueBotaoNovoJogo(this);
        DOM.cliqueBotaoAlfabeto(this);
        DOM.cliqueBotaoNovaPalavra(this);
        DOM.cliqueBotaoChutar(this);
        DOM.cliqueBotaoDica(this);
        DOM.ativarDesativarTeclado();
    }
  
    async init() {
        await this.Palavra.pesquisarPalavra();
        await this.Palavra.getPalavra();
        console.log(this.Palavra.getPalavra());
        this.chutesIncorretos = 0;
        this.Palavra.pesquisarSignificado(this.Palavra.getPalavra().word)
        this.Palavra.getSignificadoDaPalavra();
        this.encriptarPalavraSecreta();
    }
  
    encriptarPalavraSecreta() {
        DOM.palavra.textContent = this.Palavra.getPalavra().word.replace(/[A-Za-zÁÉÍÓÚáéíóúâêîôûàèìòùãẽĩõũÇçÝý]/g, '*');
    }
  
    desencriptarLetra(palavra, letraChutada) {
        let palavraSecretaEncriptada = DOM.palavra.textContent.split('');
        let palavraSecretaArray = palavra.split('');
        for (let i = 0; i < palavraSecretaArray.length; i++) {
            if (palavraSecretaArray[i] === letraChutada) {
                this.pontuacao++
                let letraOriginal = this.Palavra.getPalavra().word.charAt(i);
                palavraSecretaEncriptada.splice(i, 1, letraOriginal);
                console.log(this.pontuacao)
            }
        }
        
        
  
        DOM.palavra.textContent = palavraSecretaEncriptada.join('').toUpperCase();
    }
  
    chutarPalavraCompleta(palavraInput) {
        if(palavraInput === this.Palavra.getPalavra().word) {
            this.ganhou(true);
        } else {
            this.perdeu(true);
        }
    }
  
    dica() {
        let dicasPossiveis = []
        let palavraSecretaArray = DOM.palavra.textContent.split('');
        palavraSecretaArray.map((letra, index) => {                   
            if(letra === '*'){
                dicasPossiveis.push(index);
            }
        })
        
        let letraDica = dicasPossiveis[Math.floor(Math.random() * (dicasPossiveis.length))];
        letraDica = this.Palavra.getPalavra().word.charAt(letraDica);
        alert(`A palavra secreta possui a letra ${letraDica.toUpperCase()}`)
        
        console.log(dicasPossiveis) 
        console.log(this.Palavra.getPalavra().word.charAt(letraDica), letraDica)
  
        
    }
  
    ganhou(win) {
        const palavraSecreta = DOM.palavra.textContent.replace(/[-]/g, '');
        if (!palavraSecreta.includes("*") || win) {
            DOM.ocultarExibirResultado();
            DOM.resultadoFinal(`VOCÊ ACERTOU!`, this);
        }
    }
  
    perdeu(loser) {
        const palavraSecreta = DOM.palavra.textContent.replace(/[-]/g, '');
        if (palavraSecreta.includes("*") && this.chutesIncorretos > 6 || loser) {
            DOM.ocultarExibirResultado();
            DOM.resultadoFinal(`VOCÊ PERDEU!`, this);
        }
    }
  }
  
  class Forca {
  
    montarBoneco(indice) {
        document.querySelector(`.${DOM.boneco[indice]}`).classList.add('active');
    }
  
    limparBoneco() {
        let boneco = document.querySelectorAll(".boneco");
        for (let i = 0; i < boneco.length; i++) {
            boneco[i].classList.remove('active');
        }
    }
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
  
    getPalavra() {
        return this.#palavraSecreta;
    }
  
    getSignificadoDaPalavra() {
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
    botaoNovoJogo: document.getElementById('btn-novo-jogo'),
    botaoNovaPalavra: document.getElementById('btn-nova-palavra'),
    botaoChutarPalavra: document.querySelector('#btn-chutar-palavra'),
    botaoDica: document.querySelector('.btn-dica'),
    inputChuteCompleto: document.querySelector('#palavra-completa'),
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
  
                if (palavra) {
                    botao.classList.add("btn-outline-success");
                    Game.desencriptarLetra(palavra, botao.textContent);
                    Game.ganhou();
                } else {
                    botao.classList.add("btn-outline-danger");
                    Game.chutesIncorretos++;
                    let chutes = Game.chutesIncorretos;
                    Game.perdeu()
                    if (chutes <= 6) {
                        Game.Forca.montarBoneco(chutes - 1);
                    }
                }
            });
        }
    },
    cliqueBotaoNovoJogo(Game) {
        const botao = this.botaoNovoJogo;
        botao.addEventListener("click", () => {
            this.novoJogo(Game, false);
            Game.init();
        });
    },
    cliqueBotaoNovaPalavra(Game) {
        const botao = this.botaoNovaPalavra;
        botao.addEventListener("click", () => {
            this.novoJogo(Game, true);
            Game.init();
        });
    },
    cliqueBotaoChutar(Game) {
        const botao = this.botaoChutarPalavra;
        botao.addEventListener('click', () => {
            Game.chutarPalavraCompleta(document.querySelector('#palavra-completa').value);
            DOM.inputChuteCompleto.value = "";
        });
    },
    cliqueBotaoDica(Game) {
        const botao = this.botaoDica;
        botao.addEventListener('click', () => {
            Game.dica();
        });
    },
    verificarTeclado(event) {
        const keycode = event.keyCode,
            key = String.fromCharCode(keycode),
            source = event.target,
            exclude = ['input'];
        if (exclude.indexOf(source.tagName.toLowerCase()) === -1) {
            let botoes = DOM.botoesAlfabeto;
        
            for (let i = 0; i < botoes.length; i++) {
                let botao = botoes[i];
                if(event.key === botao.textContent.toLowerCase()) {
                    botao.click();
                    break;
                }
            }
        }
        return;
    },
    ativarDesativarTeclado() {
        document.addEventListener('keypress', DOM.verificarTeclado);
    },
    resultadoFinal(titulo, Game) {
        this.tituloResultado.textContent = titulo;
        this.significado.innerHTML = Game.Palavra.getSignificadoDaPalavra()[0].xml;
    },
    ocultarExibirResultado() {
        this.jogoForca.classList.toggle('active');
        this.resultado.classList.toggle('active');
    },
    removerAtributosBotoes() {
        let btnLetras = document.querySelectorAll(".btn-letra");
        for (let i = 0; i < btnLetras.length; i++) {
            btnLetras[i].removeAttribute("disabled");
            if (btnLetras[i].classList.contains("btn-outline-danger")) {
                btnLetras[i].classList.remove("btn-outline-danger");
            }
            if (btnLetras[i].classList.contains("btn-outline-success")) {
                btnLetras[i].classList.remove("btn-outline-success");
            }
        }
    },
    novoJogo(Game, verificar) {
        if (!verificar) {
            this.ocultarExibirResultado();
        }
        this.removerAtributosBotoes();
        Game.Forca.limparBoneco();
    }
  }
  
  const game = new Game;
  game.init();