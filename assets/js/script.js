class Game {
    constructor() {
        this.Forca = new Forca;
        this.Palavra = new Palavra;
        DOM.cliqueBotaoNovoJogo(this);
        DOM.cliqueBotaoAlfabeto(this);
        DOM.cliqueBotaoNovaPalavra(this);
        DOM.cliqueBotaoChutar(this);
        DOM.cliqueBotaoDica(this);
        DOM.ativarDesativarTeclado();
    }

    async init() {
        let dadosDoJogo = this.carregar();

        if (dadosDoJogo !== null && dadosDoJogo.hasOwnProperty('state') && Object.keys(dadosDoJogo.state).length !== 0) {
            this.pontuacao = dadosDoJogo.score;
            this.chutesIncorretos = dadosDoJogo.chutesIncorretos;
            this.letrasCorretas = dadosDoJogo.state.letrasCorretas || [];
            this.letrasErradas = dadosDoJogo.state.letrasErradas || [];
            this.Palavra.setPalavra(dadosDoJogo.state.palavra);
            this.Palavra.setSignificadoPalavraSecreta(dadosDoJogo.state.significadoPalavra);
            this.Forca.remontarBoneco(this.letrasErradas.length - 1);
            this.encriptarPalavraSecreta();

            this.recarregarLetras([...this.letrasCorretas, ...this.letrasErradas]);

        } else {
            this.pontuacao = (dadosDoJogo) ? dadosDoJogo.score : 0;
            this.letrasErradas = [];
            this.letrasCorretas = [];
            await this.Palavra.pesquisarPalavra();
            await this.Palavra.getPalavra();
            this.Palavra.pesquisarSignificado(this.Palavra.getPalavra().word);
            this.Palavra.getSignificadoDaPalavra();
            this.encriptarPalavraSecreta();
        }

        if (!DOM.pontuacao.classList.contains('active') && this.pontuacao > 0) {
            DOM.pontuacao.classList.add('active');
        }

        DOM.pontos.textContent = this.pontuacao;

    }

    encriptarPalavraSecreta() {
        DOM.palavra.textContent = this.Palavra.getPalavra().word.normalize('NFD').replace(/[A-Za-z\u0300-\u036f]/g, '*');
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

    recarregarLetras(letras) {
        let todasAsLetras = letras;

        todasAsLetras.forEach((letra) => {
            let botoes = DOM.botoesAlfabeto;

            for (let i = 0; i < botoes.length; i++) {
                let botao = botoes[i];
                if (letra === botao.textContent) {
                    botao.click();
                }
            }
        });
    }

    chutarPalavraCompleta(palavraInput) {
        if (palavraInput === this.Palavra.getPalavra().word) {
            this.ganhou(true);
        } else {
            this.perdeu(true);
        }
    }

    dica() {
        let dicasPossiveis = [];
        if (this.pontuacao > 3) {
            let palavraSecretaArray = DOM.palavra.textContent.split('');
            palavraSecretaArray.map((letra, index) => {
                if (letra === '*') {
                    dicasPossiveis.push(index);
                }
            })

            let letraDica = dicasPossiveis[Math.floor(Math.random() * (dicasPossiveis.length))];
            letraDica = this.Palavra.getPalavra().word.charAt(letraDica);
            alert(`A palavra secreta possui a letra ${letraDica.toUpperCase()}`)
            this.pontuacao = this.pontuacao - 3;
            DOM.pontos.textContent = this.pontuacao;
        } else {
            alert('Você precisa ter no mínimo 3 pontos para pedir uma dica.');
        }
    }

    salvar(fimDeJogo) {
        const dataGame = {
            "score": this.pontuacao,
            "state": fimDeJogo ? {} : {
                "palavra": this.Palavra.getPalavra(),
                "significadoPalavra": this.Palavra.getSignificadoDaPalavra(),
                "letrasCorretas": this.letrasCorretas,
                "letrasErradas": this.letrasErradas,
            }
        }

        localStorage.setItem("dataGame", JSON.stringify(dataGame));
    }

    carregar() {
        return JSON.parse(localStorage.getItem("dataGame"));
    }

    ganhou(win) {
        let fimDeJogo = false;
        const palavraSecreta = DOM.palavra.textContent.replace(/[-]/g, '');
        if (!palavraSecreta.includes("*") || win) {
            DOM.ocultarExibirResultado();
            DOM.resultadoFinal(`VOCÊ ACERTOU!`, this);
            fimDeJogo = true;
            this.pontuacao = this.Palavra.getPalavra().word.replace(/[-]/g, '').length + this.pontuacao;

            if (!DOM.pontuacao.classList.contains('active')) {
                DOM.pontuacao.classList.add('active');
            }

            DOM.pontos.textContent = this.pontuacao;
        }
        this.salvar(fimDeJogo);
    }

    perdeu(loser) {
        let fimDeJogo = false;
        const palavraSecreta = DOM.palavra.textContent.replace(/[-]/g, '');
        if (palavraSecreta.includes("*") && this.letrasErradas.length > 6 || loser) {
            DOM.ocultarExibirResultado();
            DOM.resultadoFinal(`VOCÊ PERDEU!`, this);
            fimDeJogo = true;
        }
        this.salvar(fimDeJogo);
    }
}

class Forca {
    montarBoneco(indice) {
        document.querySelector(`.${DOM.boneco[indice]}`).classList.add('active');
    }

    remontarBoneco(indice) {
        for (let i = 0; i < indice; i++) {
            document.querySelector(`.${DOM.boneco[i]}`).classList.add('active');
        }
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

    setPalavra(palavra) {
        this.#palavraSecreta = palavra;
    }

    setSignificadoPalavraSecreta(significadoPalavraSecreta) {
        this.#significadoPalavraSecreta = significadoPalavraSecreta;
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
    pontuacao: document.querySelector('.pontuacao'),
    pontos: document.querySelector('.pontos'),

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

                    if (!Game.letrasCorretas.includes(botao.textContent)) {
                        Game.letrasCorretas.push(botao.textContent);
                    }

                    Game.ganhou();
                } else {
                    botao.classList.add("btn-outline-danger");

                    if (!Game.letrasErradas.includes(botao.textContent)) {
                        Game.letrasErradas.push(botao.textContent);
                    }

                    let chutes = Game.letrasErradas.length;
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
            if (Game.pontuacao > 5) {
                Game.pontuacao = Game.pontuacao - 5;
                Game.perdeu(true);
                this.pontos.textContent = Game.pontuacao;
            } else {
                alert("Você precisa ter no mínimo 5 pontos para pedir uma nova palavra.");
            }
        });
    },
    cliqueBotaoChutar(Game) {
        const botao = this.botaoChutarPalavra;
        botao.addEventListener('click', () => {
            if (document.querySelector('#palavra-completa').value != '') {
                Game.chutarPalavraCompleta(document.querySelector('#palavra-completa').value);
                DOM.inputChuteCompleto.value = "";
            } else {
                alert("Insira a palavra que deseja chutar");
            }

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
                if (event.key === botao.textContent.toLowerCase()) {
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