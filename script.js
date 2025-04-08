// Configuração inicial e constantes globais

const ENDPOINT_CHARADAS = 'https://api-charadas-seven.vercel.app/charadas';
const ENDPOINT_LISTA_TODAS = "https://api-charadas-seven.vercel.app/charadas/lista";

let formularioCriacao = document.getElementById('add-form');
let inputPerguntaCriacao = document.getElementById('new-question');
let inputRespostaCriacao = document.getElementById('new-answer');
let botaoAdicionarCharada = document.getElementById('add-btn');

let formularioAtualizacao = document.getElementById('edit-form');
let inputAtualizacaoId = document.createElement('input');
inputAtualizacaoId.type = 'hidden';
formularioAtualizacao.appendChild(inputAtualizacaoId);
let inputPerguntaAtualizacao = document.getElementById('edit-question');
let inputRespostaAtualizacao = document.getElementById('edit-answer');
let botaoSalvarEdicao = document.getElementById('save-edit');
let botaoCancelarAtualizacao = document.getElementById('cancel-edit');

let listaCharadasElemento = document.getElementById('charadas-list');
let inputBusca = document.getElementById('search');
let paginacaoElemento = document.getElementById('pagination');

let todasCharadas = [];
let paginaAtual = 1;
let itensPorPagina = 10;

// Funções para interagir com a API

async function buscarListarCharadas() {
    try {
        const resposta = await fetch(ENDPOINT_LISTA_TODAS);
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
        todasCharadas = await resposta.json();
        atualizarListaNaTela();
    } catch (erro) {
        listaCharadasElemento.innerHTML = `<p class="text-red-500">Erro ao carregar: ${erro.message}</p>`;
    }
}

async function criarCharada(event) {
    event.preventDefault();
    const pergunta = inputPerguntaCriacao.value.trim();
    const resposta = inputRespostaCriacao.value.trim();
    if (!pergunta || !resposta) return alert('Preencha ambos os campos.');

    const novaCharada = { pergunta, resposta };
    try {
        const respostaHttp = await fetch(ENDPOINT_CHARADAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaCharada)
        });
        const resultado = await respostaHttp.json();
        if (!respostaHttp.ok) throw new Error(resultado.mensagem);
        alert('Charada criada!');
        inputPerguntaCriacao.value = '';
        inputRespostaCriacao.value = '';
        buscarListarCharadas();
    } catch (erro) {
        alert(`Erro: ${erro.message}`);
    }
}

async function atualizarCharada(event) {
    event.preventDefault();
    const id = inputAtualizacaoId.value;
    const pergunta = inputPerguntaAtualizacao.value.trim();
    const resposta = inputRespostaAtualizacao.value.trim();
    if (!id || !pergunta || !resposta) return alert('Preencha todos os campos.');

    try {
        const respostaHttp = await fetch(`${ENDPOINT_CHARADAS}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pergunta, resposta })
        });
        const resultado = await respostaHttp.json();
        if (!respostaHttp.ok) throw new Error(resultado.mensagem);
        alert('Charada atualizada.');
        esconderFormularioAtualizacao();
        buscarListarCharadas();
    } catch (erro) {
        alert(`Erro: ${erro.message}`);
    }
}

async function excluirCharada(id) {
    if (!confirm('Deseja excluir esta charada?')) return;
    try {
        const respostaHttp = await fetch(`${ENDPOINT_CHARADAS}/${id}`, { method: 'DELETE' });
        const resultado = await respostaHttp.json();
        if (!respostaHttp.ok) throw new Error(resultado.mensagem);
        alert('Charada excluída.');
        buscarListarCharadas();
    } catch (erro) {
        alert(`Erro: ${erro.message}`);
    }
}

// Atualiza a lista de charadas com base na página e filtro
function atualizarListaNaTela() {
    let termoBusca = inputBusca.value.toLowerCase();
    let filtradas = todasCharadas.filter(c =>
        c.pergunta.toLowerCase().includes(termoBusca) ||
        c.resposta.toLowerCase().includes(termoBusca)
    );

    const totalPaginas = Math.ceil(filtradas.length / itensPorPagina);
    if (paginaAtual > totalPaginas) paginaAtual = 1;

    let inicio = (paginaAtual - 1) * itensPorPagina;
    let fim = inicio + itensPorPagina;
    let pagina = filtradas.slice(inicio, fim);

    listaCharadasElemento.innerHTML = '';
    if (pagina.length === 0) {
        listaCharadasElemento.innerHTML = '<p class="text-gray-500">Nenhuma charada encontrada.</p>';
    } else {
        for (let charada of pagina) {
            const item = document.createElement('div');
            item.className = 'bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-100';
            item.innerHTML = `
                <p class="mb-1"><strong>Pergunta:</strong> ${charada.pergunta}</p>
                <p class="mb-1"><strong>Resposta:</strong> ${charada.resposta}</p>
                <p class="text-sm text-gray-400">ID: ${charada.id}</p>
                <div class="flex gap-2 mt-3">
                    <button class="bg-yellow-300 px-4 py-1 rounded hover:bg-yellow-400 transition">Editar</button>
                    <button class="bg-red-300 px-4 py-1 rounded hover:bg-red-400 transition">Excluir</button>
                </div>
            `;
            const [btnEditar, btnExcluir] = item.querySelectorAll('button');
            btnEditar.onclick = () => exibirFormularioAtualizacao(charada);
            btnExcluir.onclick = () => excluirCharada(charada.id);
            listaCharadasElemento.appendChild(item);
        }
    }

    atualizarPaginacao(totalPaginas);
}

function atualizarPaginacao(totalPaginas) {
    paginacaoElemento.innerHTML = '';
    for (let i = 1; i <= totalPaginas; i++) {
        let btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-full border ${i === paginaAtual ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} hover:bg-blue-100 hover:text-blue-600 transition`;
        btn.onclick = () => {
            paginaAtual = i;
            atualizarListaNaTela();
        };
        paginacaoElemento.appendChild(btn);
    }
}

function exibirFormularioAtualizacao(charada) {
    formularioCriacao.classList.add('hidden');
    formularioAtualizacao.classList.remove('hidden');
    inputAtualizacaoId.value = charada.id;
    inputPerguntaAtualizacao.value = charada.pergunta;
    inputRespostaAtualizacao.value = charada.resposta;
    formularioAtualizacao.scrollIntoView({ behavior: 'smooth' });
}

function esconderFormularioAtualizacao() {
    formularioAtualizacao.classList.add('hidden');
    formularioCriacao.classList.remove('hidden');
    inputAtualizacaoId.value = '';
    inputPerguntaAtualizacao.value = '';
    inputRespostaAtualizacao.value = '';
}

// Event listeners

document.addEventListener('DOMContentLoaded', buscarListarCharadas);
formularioCriacao.addEventListener('submit', criarCharada);
formularioAtualizacao.addEventListener('submit', atualizarCharada);
botaoCancelarAtualizacao.addEventListener('click', esconderFormularioAtualizacao);
inputBusca.addEventListener('input', () => {
    paginaAtual = 1;
    atualizarListaNaTela();
});
