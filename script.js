// ---------------------
// DADOS INICIAIS (Estrutura de Cartões/Seções e Tarefas)
// ---------------------
let cards = [
    { 
        id: 'sprint1', 
        title: 'Sprint 1', 
        type: 'sprint', 
        tarefas: [
            { id: 1, tarefa: "Projeto", responsavel: "👤", status: "Em andamento", tipo: "Outro", sp: 3 },
            { id: 2, tarefa: "Solução", responsavel: "👤", status: "Pronto para começar", tipo: "Outro", sp: 3 }
        ]
    },
    { 
        id: 'backlog1', 
        title: 'Backlog', 
        type: 'backlog', 
        tarefas: []
    }
];

let nextTarefaId = 3; 

const STATUS_MAP = {
    "Pronto para começar": "status-pronto-inicio", "Em andamento": "status-em-andamento",
    "Aguardando revisão": "status-aguardando", "Feito": "status-feito", "Parado": "status-parado",
};
const TIPO_MAP = {
    "Outro": "tipo-outro", "Qualidade": "tipo-qualidade", "Funcionalidade": "tipo-funcionalidade",
    "Bug": "tipo-bug", "Teste": "tipo-teste", "Segurança": "tipo-seguranca",
};

// ---------------------
// VARIÁVEIS DO DOM E ESTADO
// ---------------------
const painelMain = document.getElementById('painel-main');
const btnCriarCartao = document.getElementById('btnCriarCartao');

// --- Referências para o Modal de Cartão ---
const cardFormModal = document.getElementById('cardFormModal');
const cardForm = document.getElementById('card-form');
const btnCloseCardModal = document.getElementById('btn-close-card-modal');
// ------------------------------------------

const modalBackdrop = document.getElementById('modal-backdrop');
const taskForm = document.getElementById('task-form');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnDeleteModal = document.getElementById('btn-delete-modal');

let currentEditingTaskId = null; 
let currentContainerId = null;  

// ---------------------
// FUNÇÕES DE RENDERIZAÇÃO
// ---------------------

function formatarIdTarefa(idNumerico) {
    return `TTAS-${String(idNumerico).padStart(3, '0')}`;
}

function getBadge(value, map) {
    const className = map[value] || 'status-pronto-inicio';
    return `<span class="badge ${className}">${value}</span>`;
}

function renderTarefas() {
    painelMain.innerHTML = ''; 

    cards.forEach(card => {
        const cardElement = document.createElement('section');
        cardElement.className = 'task-section';
        cardElement.dataset.id = card.id;

        cardElement.innerHTML = `
            <div class="section-header">
                <h2>${card.title}</h2>
                <div class="section-actions">
                    <button onclick="excluirCartao('${card.id}')" class="action-btn" style="background-color: var(--color-danger);"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tarefa</th>
                        <th>Responsável</th>
                        <th>Status</th>
                        <th>Tipo</th>
                        <th>ID da Tarefa</th>
                        <th>Tempo Estimado</th> 
                    </tr>
                </thead>
                <tbody id="tabela-${card.id}"></tbody>
            </table>
            <button class="adicionar-btn" data-container-id="${card.id}" onclick="abrirModalCriacao('${card.id}')">
                <i class="fas fa-plus-circle"></i> Adicionar tarefa
            </button>
        `;

        painelMain.appendChild(cardElement);
        
        const tbody = document.getElementById(`tabela-${card.id}`);
        tbody.innerHTML = card.tarefas.map(t => `
            <tr data-id="${t.id}" onclick="abrirModalEdicao(${t.id}, '${card.id}')">
                <td><span class="task-title-data">${t.tarefa}</span></td>
                <td>${t.responsavel || '👤'}</td>
                <td>${getBadge(t.status, STATUS_MAP)}</td>
                <td>${getBadge(t.tipo, TIPO_MAP)}</td>
                <td>${formatarIdTarefa(t.id)}</td> 
                <td>${t.sp}</td> 
            </tr>
        `).join("");
    });
}

// ---------------------
// FUNÇÕES DO MODAL DE TAREFA
// ---------------------

function abrirModal(taskId, containerId, isNew = true) {
    currentEditingTaskId = taskId;
    currentContainerId = containerId;
    
    const card = cards.find(c => c.id === containerId);
    const task = isNew ? {} : card?.tarefas.find(t => t.id === taskId);
    
    document.getElementById('modal-title-text').textContent = isNew ? 'Criar Nova Tarefa' : `Editar Tarefa: ${task?.tarefa || '...'}`;
    document.getElementById('modal-task-id').value = taskId;
    document.getElementById('modal-container-type').value = containerId;
    
    if (!isNew && task) {
        document.getElementById('modal-tarefa').value = task.tarefa;
        document.getElementById('modal-status').value = task.status;
        document.getElementById('modal-tipo').value = task.tipo;
        document.getElementById('modal-sp').value = task.sp;
        document.getElementById('modal-resp').value = task.responsavel;
        btnDeleteModal.classList.remove('hidden'); 
    } else {
        taskForm.reset();
        document.getElementById('modal-sp').value = 0;
        btnDeleteModal.classList.add('hidden'); 
    }

    modalBackdrop.classList.remove('hidden');
}

function abrirModalCriacao(containerId) { abrirModal(null, containerId, true); }
function abrirModalEdicao(taskId, containerId) { abrirModal(taskId, containerId, false); }
function fecharModal() { modalBackdrop.classList.add('hidden'); currentEditingTaskId = null; currentContainerId = null; }

// ---------------------
// FUNÇÕES DO MODAL DE CARTÃO (NOVO)
// ---------------------
function abrirCardModal() { cardFormModal.classList.remove('hidden'); }
function fecharCardModal() { cardFormModal.classList.add('hidden'); cardForm.reset(); }

// ---------------------
// FUNÇÕES DE MANIPULAÇÃO DE DADOS (Cartões e Tarefas)
// ---------------------

function criarCartao(titulo, tipo) {
    const novoId = `C-${Date.now()}`; 
    const novoCartao = {
        id: novoId,
        title: titulo,
        type: tipo, 
        tarefas: []
    };
    cards.push(novoCartao);
    renderTarefas();
}

// FUNÇÃO MODIFICADA: EXCLUSÃO INSTANTÂNEA
function excluirCartao(id) {
    cards = cards.filter(c => c.id !== id);
    renderTarefas();
}

function excluirTarefa(event, taskId) {
    if (event) event.stopPropagation(); 
    
    let found = false;
    cards.forEach(card => {
        const initialLength = card.tarefas.length;
        card.tarefas = card.tarefas.filter(t => t.id !== taskId);
        if (card.tarefas.length < initialLength) found = true;
    });
    if (found) {
        fecharModal(); 
        renderTarefas();
    }
}

// FUNÇÃO DE SUBMISSÃO PARA O MODAL SIMPLIFICADO DE CARTÃO (SÓ TÍTULO)
function handleCardFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('card-title').value.trim();
    
    // Tipo fixo para o novo cartão, pois o select foi removido do HTML
    const defaultType = 'sprint'; 

    if (!title) {
        alert('O título do cartão é obrigatório.');
        return;
    }
    
    criarCartao(title, defaultType); 
    fecharCardModal(); 
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const isNew = currentEditingTaskId === null;
    const containerId = document.getElementById('modal-container-type').value; 
    if (!containerId) {
        alert("Erro interno: Não foi possível identificar o contêiner da tarefa.");
        fecharModal();
        return;
    }

    const card = cards.find(c => c.id === containerId);
    
    if (!card && !isNew) {
        alert("Erro: O cartão ao qual esta tarefa pertencia não foi encontrado.");
        fecharModal();
        renderTarefas();
        return;
    }
    
    const data = {
        tarefa: document.getElementById('modal-tarefa').value,
        status: document.getElementById('modal-status').value,
        tipo: document.getElementById('modal-tipo').value,
        sp: document.getElementById('modal-sp').value, 
        responsavel: document.getElementById('modal-resp').value || '👤'
    };
    
    if (isNew) {
        const novaTarefa = { id: nextTarefaId++, ...data }; 
        if (card) card.tarefas.push(novaTarefa);
    } else {
        const taskIndex = card?.tarefas.findIndex(t => t.id === currentEditingTaskId);
        if (taskIndex !== -1) {
            card.tarefas[taskIndex] = { ...card.tarefas[taskIndex], ...data };
        }
    }

    fecharModal();
    renderTarefas();
}


// ---------------------
// INICIALIZAÇÃO E LISTENERS
// ---------------------

document.addEventListener('DOMContentLoaded', () => {
    renderTarefas();

    // O botão agora chama o modal gráfico de criação de cartão
    btnCriarCartao.addEventListener('click', abrirCardModal);

    // Listeners do Modal de Tarefa
    taskForm.addEventListener('submit', handleFormSubmit);
    btnCloseModal.addEventListener('click', fecharModal);

    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            fecharModal();
        }
    });
    
    btnDeleteModal.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (currentEditingTaskId) {
            excluirTarefa(null, currentEditingTaskId);
        }
    });
    
    // Listeners do Modal de Cartão
    cardForm.addEventListener('submit', handleCardFormSubmit);
    btnCloseCardModal.addEventListener('click', fecharCardModal);
    
    cardFormModal.addEventListener('click', (e) => {
        if (e.target === cardFormModal) {
            fecharCardModal();
        }
    });
});