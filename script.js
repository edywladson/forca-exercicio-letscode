let btnLetras = document.querySelectorAll(".btn-letra");
for (let i = 0; i < btnLetras.length; i++) {
    btnLetras[i].addEventListener("click", function () {
        Palavra.verificaSePalavraPossuiLetra(btnLetras[i].textContent)
        btnLetras[i].setAttribute("disabled", "disabled");
    });
}

const AJAX = {
    pesquisarPalavra() {
        fetch('https://api.dicionario-aberto.net/random').then(response => {
                return response.json();
            })
            .then(data => {
                Palavra.atribuirPalavraSecreta(data);
                this.pesquisarSignificado(data.word);
                DOM.encriptarPalavraSecreta();
            })
    },
    pesquisarSignificado(palavra) {
        fetch(`https://api.dicionario-aberto.net/word/${palavra}`).then(response => {
                return response.json();
            })
            .then(data => {
                Palavra.atribuirSignificado(data);
            })
    }
}

const DOM = {
    jogoForca: document.querySelector('.jogo-forca'),
    resultado: document.querySelector('.resultado'),
    palavra: document.querySelector('.palavra-secreta'),
    tituloResultado: document.querySelector('.titulo-resultado'),
    palavraCerta: document.querySelector('.palavra-certa'),
    significado: document.querySelector('.significado-palavra'),
    boneco: [
        'cabeca',
        'tronco',
        'braco-esquerdo',
        'braco-direito',
        'perna-esquerda',
        'perna-direita',
    ],

    encriptarPalavraSecreta() {
        this.palavra.textContent = Palavra.palavraSecreta.word.replace(/[A-Za-zÁÉÍÓÚáéíóúâêîôûàèìòùãẽĩõũÇç]/g, '*');
    },
    descriptografarLetra(letras, indices) {
        let palavraSecretaArray = this.palavra.textContent.split('');
        for (let i = 0; i < letras.length; i++) {
            palavraSecretaArray.splice(indices[i], 1, letras[i]);
        }
        this.palavra.textContent = palavraSecretaArray.join('').toUpperCase();
    },
    resultadoFinal(titulo) {
        this.tituloResultado.textContent = titulo;
        this.significado.innerHTML = Palavra.significadoDaPalavraSecreta[0].xml;
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

const Palavra = {
    palavraSecreta: '',
    significadoDaPalavraSecreta: '',
    letrasChutadas: [],
    letrasChutadasCorretamente: [],
    letrasChutadasIncorretamente: [],
    dicas: 0,

    atribuirPalavraSecreta(data) {
        this.palavraSecreta = data;
    },
    atribuirSignificado(data) {
        this.significadoDaPalavraSecreta = data;
    },
    dica() {
        if (this.dicas < 1) {
            let palavraSecretaArray = this.palavraSecreta.word.split('');
            let letraDica = palavraSecretaArray[Math.floor(Math.random() * (palavraSecretaArray.length))];
            alert(`A palavra secreta possui a letra ${letraDica.toUpperCase()}`)
            this.dicas++;
        } else {
            alert(`Você já utilizou a sua dica!`);
        }
    },
    zerarLetrasChutadas() {
        this.letrasChutadas = [];
        this.letrasChutadasCorretamente = [];
        this.letrasChutadasIncorretamente = [];
        this.dicas = 0;
    },
    verificaSePalavraPossuiLetra(letraChutada) {
        if (!this.verificaLetraChutada(letraChutada)) {
            const palavraSecretaMaiuscula = this.palavraSecreta.word.toUpperCase();
            const palavraSecretaSemAcento = palavraSecretaMaiuscula.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            if (palavraSecretaSemAcento.includes(letraChutada)) {
                let palavraSecretaArray = palavraSecretaSemAcento.split('');
                let letrasOriginais = [];
                let letrasIndex = [];
                for (let i = 0; i < palavraSecretaArray.length; i++) {
                    if (palavraSecretaArray[i] === letraChutada) {
                        letrasOriginais.push(this.palavraSecreta.word.charAt(i));
                        letrasIndex.push(i);
                        this.letrasChutadasCorretamente.push(palavraSecretaArray[i]);
                    }
                }

                DOM.descriptografarLetra(letrasOriginais, letrasIndex);
                this.verificaSeGanhou();
            } else {
                this.letrasChutadasIncorretamente.push(letraChutada);

                this.verificaSePerder();
                if (this.letrasChutadasIncorretamente.length <= 6) {
                    DOM.montarBoneco(this.letrasChutadasIncorretamente.length - 1);
                }
            }
            this.letrasChutadas.push(letraChutada);
        } else {
            alert(`Você já chutou a letra ${letraChutada}`);
        }
    },
    verificaLetraChutada(letraChutada) {
        for (const letra of this.letrasChutadas) {
            if (letra == letraChutada) {
                return true;
            }
        }

        return false;
    },
    verificaSeGanhou() {
        const palavraSecreta = this.palavraSecreta.word.replace(/[-]/g, '');
        if (palavraSecreta.length === this.letrasChutadasCorretamente.length) {
            this.ganhou();
        }
    },
    verificaSePerder() {
        if (this.letrasChutadasIncorretamente.length > 6) {
            this.perdeu();
        }
    },
    ganhou() {
        DOM.adicionarRemoverClass();
        DOM.resultadoFinal(`VOCÊ ACERTOU!`);
    },
    perdeu() {
        DOM.adicionarRemoverClass();
        DOM.resultadoFinal(`VOCÊ PERDEU!`);
    }
}

const App = {
    init() {
        AJAX.pesquisarPalavra();
    },
    reload() {
        this.init();
    }
}

App.init();