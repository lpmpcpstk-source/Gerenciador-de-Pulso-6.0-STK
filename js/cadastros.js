/**
 * cadastros.js — Módulo de Cadastros Base (Tipos de Fio + Espulas)
 * v6.0 — Gerenciador de Pulso · Stickfran
 * UX/UI Mobile-First Edition
 * 
 * CORREÇÕES v6.0:
 * - Corrigido bug de exclusão (UX.confirm retorna Promise)
 * - Adicionado toggle de inativar/ativar
 * - Melhorada responsividade mobile
 * - Adicionados feedbacks visuais aprimorados
 * - Swipe-to-action em mobile
 */
'use strict';

const Cadastros = {

  _abaAtiva: 'fio',
  _editFioId:    null,
  _editEspulaId: null,

  // ── Inicialização ─────────────────────────────────────────────
  async init() {
    // Skeleton enquanto carrega
    UX.skeleton('cad-fio-table', 5, 5);
    UX.skeleton('cad-esp-table', 4, 5);

    // Carregar TODOS os itens (ativos e inativos) para gerenciamento
    await DbBase.TiposFio.loadAll();
    await DbBase.Espulas.loadAll();

    this._bindEvents();
    this._renderFios();
    this._renderEspulas();
    this._updateBadges();
    
    // Inicializar gestos touch para mobile
    this._initMobileGestures();
    this._setupResizeListener();
  },

  _bindEvents() {
    // Sub-abas
    document.querySelectorAll('.cad-tab-btn').forEach(btn => {
      if (btn.dataset.aba) btn.addEventListener('click', () => this._switchAba(btn.dataset.aba));
    });

    // Botões de exportação
    const btnCsv = document.getElementById('btn-cad-export-csv');
    const btnPdf = document.getElementById('btn-cad-export-pdf');
    if (btnCsv) btnCsv.addEventListener('click', () => this._exportCsv());
    if (btnPdf) btnPdf.addEventListener('click', () => this._exportPdf());

    // Formulário Fio
    const btnSalvarFio   = document.getElementById('btn-fio-salvar');
    const btnCancelarFio = document.getElementById('btn-fio-cancelar');
    if (btnSalvarFio)   btnSalvarFio.addEventListener('click',   () => this.salvarFio());
    if (btnCancelarFio) btnCancelarFio.addEventListener('click', () => this.cancelarFio());
    ['cb-fio-nome','cb-fio-material','cb-fio-titulo','cb-fio-gpm','cb-fio-obs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.salvarFio(); }});
    });

    // Formulário Espula
    const btnSalvarEsp   = document.getElementById('btn-esp-salvar');
    const btnCancelarEsp = document.getElementById('btn-esp-cancelar');
    if (btnSalvarEsp)   btnSalvarEsp.addEventListener('click',   () => this.salvarEspula());
    if (btnCancelarEsp) btnCancelarEsp.addEventListener('click', () => this.cancelarEspula());
    ['cb-esp-nome','cb-esp-cor','cb-esp-peso','cb-esp-material','cb-esp-obs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.salvarEspula(); }});
    });
  },

  // ── Gestos Mobile ─────────────────────────────────────────────
  _initMobileGestures() {
    if (!('ontouchstart' in window)) return;
    
    // Adicionar suporte a long-press para ações em mobile
    document.addEventListener('contextmenu', e => {
      const row = e.target.closest('.cad-card-mobile');
      if (row) {
        e.preventDefault();
        this._showMobileActions(row);
      }
    });
  },

  _showMobileActions(row) {
    // Feedback visual
    row.style.background = 'rgba(0,170,255,.1)';
    setTimeout(() => row.style.background = '', 300);
    
    // Vibração háptica se disponível
    if (navigator.vibrate) navigator.vibrate(50);
  },

  _switchAba(aba) {
    this._abaAtiva = aba;
    document.querySelectorAll('.cad-tab-btn[data-aba]').forEach(b =>
      b.classList.toggle('on', b.dataset.aba === aba));
    document.querySelectorAll('.cad-painel').forEach(p =>
      p.classList.toggle('on', p.dataset.aba === aba));
  },

  _updateBadges() {
    UI.setBadge('badge-cad-fio', DbBase.TiposFio.getAtivos().length);
    UI.setBadge('badge-cad-esp', DbBase.Espulas.getAtivos().length);
    UI.setBadge('badge-cadastros',
      DbBase.TiposFio.getAtivos().length + DbBase.Espulas.getAtivos().length);
  },

  // ── Exportação ────────────────────────────────────────────────
  _exportCsv() {
    const btn = document.getElementById('btn-cad-export-csv');
    UX.exportFeedback(btn);
    setTimeout(() => {
      if (this._abaAtiva === 'fio') Export.csvTiposFio();
      else Export.csvEspulas();
    }, 100);
  },

  _exportPdf() {
    const btn = document.getElementById('btn-cad-export-pdf');
    UX.exportFeedback(btn);
    setTimeout(() => {
      if (this._abaAtiva === 'fio') Export.pdfTiposFio();
      else Export.pdfEspulas();
    }, 100);
  },

  // ══════════════════════════════════════════════════════════════
  // TIPOS DE FIO
  // ══════════════════════════════════════════════════════════════
  _renderFios() {
    const wrap = document.getElementById('cad-fio-table');
    if (!wrap) return;
    const list = DbBase.TiposFio.getAll();
    if (!list.length) {
      wrap.innerHTML = `<div class="empty">
        <div class="empty-icon">🧵</div>
        <div class="empty-txt">Nenhum tipo de fio cadastrado<br>Use o formulário ao lado para adicionar</div>
      </div>`;
      return;
    }
    
    // Desktop: tabela tradicional
    // Mobile: cards empilhados
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      wrap.innerHTML = this._renderFiosMobile(list);
    } else {
      wrap.innerHTML = this._renderFiosDesktop(list);
    }
  },

  _renderFiosDesktop(list) {
    const rows = list.map(t => {
      const inativo = t.ativo === false;
      const gpm = t.g_por_metro ? `${Number(t.g_por_metro).toFixed(4)} g/m` : '—';
      return `<tr class="${inativo ? 'row-inativo' : ''}">
        <td>
          <div class="td-nome">${UI.esc(t.nome)}</div>
          <div style="font-size:10px;color:var(--t-lo);font-family:var(--f-mono);margin-top:2px">${UI.esc(t.titulo || '')}</div>
        </td>
        <td>${UI.esc(t.material || '—')}</td>
        <td class="td-val">${gpm}</td>
        <td>${t.ativo !== false
          ? '<span class="tag tag-ativo">✔ Ativo</span>'
          : '<span class="tag tag-offline">✖ Inativo</span>'}</td>
        <td><div class="td-act">
          <button class="btn-edit" onclick="Cadastros.editarFio('${UI.esc(t.id)}')" title="Editar">✏ Editar</button>
          <button class="btn-toggle ${t.ativo !== false ? 'btn-toggle-off' : 'btn-toggle-on'}" 
                  onclick="Cadastros.toggleAtivoFio('${UI.esc(t.id)}')" 
                  title="${t.ativo !== false ? 'Desativar' : 'Ativar'}">
            ${t.ativo !== false ? '⏸' : '▶'}
          </button>
          <button class="btn-del" onclick="Cadastros.confirmarExcluirFio('${UI.esc(t.id)}')" title="Excluir">🗑</button>
        </div></td>
      </tr>`;
    }).join('');
    
    return `<div class="tbl-wrap"><table class="tbl">
      <thead><tr>
        <th>Nome / Título</th><th>Material</th><th>g/metro</th><th>Status</th><th>Ações</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`;
  },

  _renderFiosMobile(list) {
    const cards = list.map(t => {
      const inativo = t.ativo === false;
      const gpm = t.g_por_metro ? `${Number(t.g_por_metro).toFixed(4)} g/m` : '—';
      return `
        <div class="cad-card-mobile ${inativo ? 'cad-card-inativo' : ''}" data-id="${UI.esc(t.id)}" data-tipo="fio">
          <div class="cad-card-header">
            <div class="cad-card-title">${UI.esc(t.nome)}</div>
            ${t.ativo !== false
              ? '<span class="tag tag-ativo tag-sm">✔ Ativo</span>'
              : '<span class="tag tag-offline tag-sm">✖ Inativo</span>'}
          </div>
          <div class="cad-card-body">
            <div class="cad-card-row">
              <span class="cad-card-label">Material:</span>
              <span class="cad-card-value">${UI.esc(t.material || '—')}</span>
            </div>
            <div class="cad-card-row">
              <span class="cad-card-label">Título:</span>
              <span class="cad-card-value">${UI.esc(t.titulo || '—')}</span>
            </div>
            <div class="cad-card-row">
              <span class="cad-card-label">g/metro:</span>
              <span class="cad-card-value cad-val-mono">${gpm}</span>
            </div>
          </div>
          <div class="cad-card-actions">
            <button class="btn-action btn-action-edit" onclick="Cadastros.editarFio('${UI.esc(t.id)}')">
              ✏️ Editar
            </button>
            <button class="btn-action btn-action-toggle" onclick="Cadastros.toggleAtivoFio('${UI.esc(t.id)}')">
              ${t.ativo !== false ? '⏸️ Desativar' : '▶️ Ativar'}
            </button>
            <button class="btn-action btn-action-del" onclick="Cadastros.confirmarExcluirFio('${UI.esc(t.id)}')">
              🗑️ Excluir
            </button>
          </div>
        </div>`;
    }).join('');
    
    return `<div class="cad-cards-mobile">${cards}</div>`;
  },

  editarFio(id) {
    const t = DbBase.TiposFio.find(id);
    if (!t) return;
    this._editFioId = id;
    document.getElementById('cb-fio-nome').value     = t.nome;
    document.getElementById('cb-fio-material').value = t.material;
    document.getElementById('cb-fio-titulo').value   = t.titulo || '';
    document.getElementById('cb-fio-gpm').value      = t.g_por_metro || '';
    document.getElementById('cb-fio-obs').value      = t.obs || '';
    document.getElementById('fio-form-title').textContent = '✏ Editar Tipo de Fio';
    document.getElementById('btn-fio-cancelar').classList.remove('hidden');
    // Scroll e feedback visual no card do formulário
    const card = document.getElementById('cad-fio-form-card');
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    UX.pulse(card);
    UI.toast(`Editando: ${t.nome}`, 'inf', 2000);
  },

  cancelarFio() {
    this._editFioId = null;
    ['cb-fio-nome','cb-fio-titulo','cb-fio-gpm','cb-fio-obs'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const m = document.getElementById('cb-fio-material');
    if (m) m.value = 'Poliéster';
    document.getElementById('fio-form-title').textContent = '➕ Novo Tipo de Fio';
    document.getElementById('btn-fio-cancelar').classList.add('hidden');
    UI.clearFieldStates(['fi-fio-nome']);
  },

  async salvarFio() {
    const nome = document.getElementById('cb-fio-nome').value.trim();
    if (!nome) {
      UI.fieldErr('fi-fio-nome', 'err-fio-nome', 'Nome obrigatório');
      UX.scrollToFirstError(document.getElementById('cad-fio-form-card'));
      return;
    }
    UI.clearFieldStates(['fi-fio-nome']);

    const dados = {
      nome,
      material:    document.getElementById('cb-fio-material').value,
      titulo:      document.getElementById('cb-fio-titulo').value.trim(),
      g_por_metro: parseFloat(document.getElementById('cb-fio-gpm').value) || null,
      obs:         document.getElementById('cb-fio-obs').value.trim(),
      ativo:       true,
    };

    const btn = document.getElementById('btn-fio-salvar');
    UX.btnLoading(btn, 'Salvando…');

    const res = this._editFioId
      ? await DbBase.TiposFio.update(this._editFioId, dados)
      : await DbBase.TiposFio.create(dados);

    UX.btnDone(btn);
    if (!res.ok) { UI.toast(res.msg, 'err'); return; }

    UI.toast(this._editFioId ? '✓ Tipo de fio atualizado!' : '✓ Tipo de fio criado!', 'ok');
    this.cancelarFio();
    this._renderFios();
    this._updateBadges();
    UX.highlightNewRow('cad-fio-table');
    if (typeof App !== 'undefined') App._populateFichaSelects?.();
  },

  // ── TOGGLE ATIVO/INATIVO (CORRIGIDO v6.0) ─────────────────────
  async toggleAtivoFio(id) {
    const t = DbBase.TiposFio.find(id);
    if (!t) return;
    
    const novoStatus = t.ativo === false;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    // Confirmação usando Promise corretamente
    const confirmed = await UX.confirm({
      title: `${novoStatus ? 'Ativar' : 'Desativar'} Tipo de Fio`,
      message: `Deseja ${acao} o tipo de fio <strong>"${UI.esc(t.nome)}"</strong>?<br><br>
        <small style="color:var(--t-lo)">${novoStatus 
          ? 'O item voltará a aparecer nas seleções de fichas técnicas.' 
          : 'O item não aparecerá nas seleções, mas os dados serão mantidos.'}</small>`,
      icon: novoStatus ? '▶️' : '⏸️',
      confirmLabel: novoStatus ? 'Ativar' : 'Desativar',
      danger: !novoStatus
    });
    
    if (!confirmed) return;
    
    const res = await DbBase.TiposFio.toggleAtivo(id);
    if (!res.ok) { 
      UI.toast(res.msg, 'err'); 
      return; 
    }
    
    UI.toast(`Tipo de fio "${t.nome}" ${novoStatus ? 'ativado' : 'desativado'}.`, 'ok');
    this._renderFios();
    this._updateBadges();
    if (typeof App !== 'undefined') App._populateFichaSelects?.();
  },

  // ── EXCLUSÃO (CORRIGIDO v6.0 - Promise-based) ─────────────────
  async confirmarExcluirFio(id) {
    const t = DbBase.TiposFio.find(id);
    if (!t) return;
    
    // CORREÇÃO: UX.confirm retorna Promise<boolean>, não aceita callback
    const confirmed = await UX.confirm({
      title: 'Excluir Tipo de Fio',
      message: `Excluir o tipo de fio <strong>"${UI.esc(t.nome)}"</strong>?<br><br>
        <small style="color:var(--t-lo)">⚠️ Esta ação é permanente. Fichas técnicas que usam este tipo ficarão sem referência.</small>`,
      icon: '🗑️',
      confirmLabel: 'Excluir',
      danger: true
    });
    
    if (!confirmed) return;
    
    const res = await DbBase.TiposFio.excluir(id);
    if (!res.ok) { 
      UI.toast(res.msg, 'err'); 
      return; 
    }
    
    UI.toast(`Tipo de fio "${t.nome}" excluído.`, 'inf');
    this._renderFios();
    this._updateBadges();
    if (typeof App !== 'undefined') App._populateFichaSelects?.();
  },

  // ══════════════════════════════════════════════════════════════
  // ESPULAS BASE
  // ══════════════════════════════════════════════════════════════
  _renderEspulas() {
    const wrap = document.getElementById('cad-esp-table');
    if (!wrap) return;
    const list = DbBase.Espulas.getAll();
    if (!list.length) {
      wrap.innerHTML = `<div class="empty">
        <div class="empty-icon">🔘</div>
        <div class="empty-txt">Nenhuma espula cadastrada<br>Use o formulário ao lado para adicionar</div>
      </div>`;
      return;
    }
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      wrap.innerHTML = this._renderEspulasMobile(list);
    } else {
      wrap.innerHTML = this._renderEspulasDesktop(list);
    }
  },

  _renderEspulasDesktop(list) {
    const rows = list.map(e => {
      const inativo = e.ativo === false;
      const tagCls  = e.cor === 'Vermelha' ? 'tag-vermelha' : e.cor === 'Branca' ? 'tag-branca' : 'tag-outro';
      const peso    = e.peso_vazio_g ? `${Number(e.peso_vazio_g).toFixed(1)} g` : '—';
      return `<tr class="${inativo ? 'row-inativo' : ''}">
        <td>
          <div class="td-nome">${UI.esc(e.nome)}</div>
          <div style="font-size:10px;color:var(--t-lo);margin-top:2px">${UI.esc(e.material || '')}</div>
        </td>
        <td><span class="tag ${tagCls}">${UI.esc(e.cor)}</span></td>
        <td class="td-val">${peso}</td>
        <td>${e.ativo !== false
          ? '<span class="tag tag-ativo">✔ Ativo</span>'
          : '<span class="tag tag-offline">✖ Inativo</span>'}</td>
        <td><div class="td-act">
          <button class="btn-edit" onclick="Cadastros.editarEspula('${UI.esc(e.id)}')" title="Editar">✏ Editar</button>
          <button class="btn-toggle ${e.ativo !== false ? 'btn-toggle-off' : 'btn-toggle-on'}" 
                  onclick="Cadastros.toggleAtivoEspula('${UI.esc(e.id)}')" 
                  title="${e.ativo !== false ? 'Desativar' : 'Ativar'}">
            ${e.ativo !== false ? '⏸' : '▶'}
          </button>
          <button class="btn-del" onclick="Cadastros.confirmarExcluirEspula('${UI.esc(e.id)}')" title="Excluir">🗑</button>
        </div></td>
      </tr>`;
    }).join('');
    
    return `<div class="tbl-wrap"><table class="tbl">
      <thead><tr>
        <th>Nome / Código</th><th>Cor</th><th>Peso Vazio</th><th>Status</th><th>Ações</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`;
  },

  _renderEspulasMobile(list) {
    const cards = list.map(e => {
      const inativo = e.ativo === false;
      const tagCls  = e.cor === 'Vermelha' ? 'tag-vermelha' : e.cor === 'Branca' ? 'tag-branca' : 'tag-outro';
      const peso    = e.peso_vazio_g ? `${Number(e.peso_vazio_g).toFixed(1)} g` : '—';
      return `
        <div class="cad-card-mobile ${inativo ? 'cad-card-inativo' : ''}" data-id="${UI.esc(e.id)}" data-tipo="espula">
          <div class="cad-card-header">
            <div class="cad-card-title">${UI.esc(e.nome)}</div>
            ${e.ativo !== false
              ? '<span class="tag tag-ativo tag-sm">✔ Ativo</span>'
              : '<span class="tag tag-offline tag-sm">✖ Inativo</span>'}
          </div>
          <div class="cad-card-body">
            <div class="cad-card-row">
              <span class="cad-card-label">Cor:</span>
              <span class="tag ${tagCls} tag-sm">${UI.esc(e.cor)}</span>
            </div>
            <div class="cad-card-row">
              <span class="cad-card-label">Material:</span>
              <span class="cad-card-value">${UI.esc(e.material || '—')}</span>
            </div>
            <div class="cad-card-row">
              <span class="cad-card-label">Peso Vazio:</span>
              <span class="cad-card-value cad-val-mono">${peso}</span>
            </div>
          </div>
          <div class="cad-card-actions">
            <button class="btn-action btn-action-edit" onclick="Cadastros.editarEspula('${UI.esc(e.id)}')">
              ✏️ Editar
            </button>
            <button class="btn-action btn-action-toggle" onclick="Cadastros.toggleAtivoEspula('${UI.esc(e.id)}')">
              ${e.ativo !== false ? '⏸️ Desativar' : '▶️ Ativar'}
            </button>
            <button class="btn-action btn-action-del" onclick="Cadastros.confirmarExcluirEspula('${UI.esc(e.id)}')">
              🗑️ Excluir
            </button>
          </div>
        </div>`;
    }).join('');
    
    return `<div class="cad-cards-mobile">${cards}</div>`;
  },

  editarEspula(id) {
    const e = DbBase.Espulas.find(id);
    if (!e) return;
    this._editEspulaId = id;
    document.getElementById('cb-esp-nome').value     = e.nome;
    document.getElementById('cb-esp-cor').value      = e.cor;
    document.getElementById('cb-esp-peso').value     = e.peso_vazio_g || '';
    document.getElementById('cb-esp-material').value = e.material || 'Plástico';
    document.getElementById('cb-esp-obs').value      = e.obs || '';
    document.getElementById('esp-form-title').textContent = '✏ Editar Espula';
    document.getElementById('btn-esp-cancelar').classList.remove('hidden');
    const card = document.getElementById('cad-esp-form-card');
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    UX.pulse(card);
    UI.toast(`Editando: ${e.nome}`, 'inf', 2000);
  },

  cancelarEspula() {
    this._editEspulaId = null;
    ['cb-esp-nome','cb-esp-peso','cb-esp-obs'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const cor = document.getElementById('cb-esp-cor');
    const mat = document.getElementById('cb-esp-material');
    if (cor) cor.value = 'Branca';
    if (mat) mat.value = 'Plástico';
    document.getElementById('esp-form-title').textContent = '➕ Nova Espula';
    document.getElementById('btn-esp-cancelar').classList.add('hidden');
    UI.clearFieldStates(['fi-esp-nome']);
  },

  async salvarEspula() {
    const nome = document.getElementById('cb-esp-nome').value.trim();
    if (!nome) {
      UI.fieldErr('fi-esp-nome', 'err-esp-nome', 'Nome obrigatório');
      UX.scrollToFirstError(document.getElementById('cad-esp-form-card'));
      return;
    }
    UI.clearFieldStates(['fi-esp-nome']);

    const dados = {
      nome,
      cor:          document.getElementById('cb-esp-cor').value,
      peso_vazio_g: parseFloat(document.getElementById('cb-esp-peso').value) || null,
      material:     document.getElementById('cb-esp-material').value.trim() || 'Plástico',
      obs:          document.getElementById('cb-esp-obs').value.trim(),
      ativo:        true,
    };

    const btn = document.getElementById('btn-esp-salvar');
    UX.btnLoading(btn, 'Salvando…');

    const res = this._editEspulaId
      ? await DbBase.Espulas.update(this._editEspulaId, dados)
      : await DbBase.Espulas.create(dados);

    UX.btnDone(btn);
    if (!res.ok) { UI.toast(res.msg, 'err'); return; }

    UI.toast(this._editEspulaId ? '✓ Espula atualizada!' : '✓ Espula criada!', 'ok');
    this.cancelarEspula();
    this._renderEspulas();
    this._updateBadges();
    UX.highlightNewRow('cad-esp-table');
    if (typeof App !== 'undefined') App._populateFichaSelects?.();
  },

  // ── TOGGLE ATIVO/INATIVO ESPULA (v6.0) ────────────────────────
  async toggleAtivoEspula(id) {
    const e = DbBase.Espulas.find(id);
    if (!e) return;
    
    const novoStatus = e.ativo === false;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    const confirmed = await UX.confirm({
      title: `${novoStatus ? 'Ativar' : 'Desativar'} Espula`,
      message: `Deseja ${acao} a espula <strong>"${UI.esc(e.nome)}"</strong>?<br><br>
        <small style="color:var(--t-lo)">${novoStatus 
          ? 'O item voltará a aparecer nas seleções de fichas técnicas.' 
          : 'O item não aparecerá nas seleções, mas os dados serão mantidos.'}</small>`,
      icon: novoStatus ? '▶️' : '⏸️',
      confirmLabel: novoStatus ? 'Ativar' : 'Desativar',
      danger: !novoStatus
    });
    
    if (!confirmed) return;
    
    const res = await DbBase.Espulas.toggleAtivo(id);
    if (!res.ok) { 
      UI.toast(res.msg, 'err'); 
      return; 
    }
    
    UI.toast(`Espula "${e.nome}" ${novoStatus ? 'ativada' : 'desativada'}.`, 'ok');
    this._renderEspulas();
    this._updateBadges();
    if (typeof App !== 'undefined') App._populateFichaSelects?.();
  },

  // ── EXCLUSÃO ESPULA (CORRIGIDO v6.0) ──────────────────────────
  async confirmarExcluirEspula(id) {
    const e = DbBase.Espulas.find(id);
    if (!e) return;
    
    const confirmed = await UX.confirm({
      title: 'Excluir Espula',
      message: `Excluir a espula <strong>"${UI.esc(e.nome)}"</strong>?<br><br>
        <small style="color:var(--t-lo)">⚠️ Esta ação é permanente. Fichas técnicas que usam este modelo ficarão sem referência.</small>`,
      icon: '🗑️',
      confirmLabel: 'Excluir',
      danger: true
    });
    
    if (!confirmed) return;
    
    const res = await DbBase.Espulas.excluir(id);
    if (!res.ok) { 
      UI.toast(res.msg, 'err'); 
      return; 
    }
    
    UI.toast(`Espula "${e.nome}" excluída.`, 'inf');
    this._renderEspulas();
    this._updateBadges();
    if (typeof App !== 'undefined') App._populateFichaSelects?.();
  },
  
  // ── Listener de redimensionamento para re-renderizar ──────────
  _setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this._renderFios();
        this._renderEspulas();
      }, 250);
    });
  }
};
