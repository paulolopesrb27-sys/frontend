import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Boxes, BriefcaseBusiness,
  ChartNoAxesCombined, ChevronDown, ChevronLeft, ChevronRight, ClipboardList,
  Clock3, FileText, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings2,
  ShoppingBag, SlidersHorizontal, Tags, Trash2, Truck, UserRound, Users, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Field = { key: string; label: string; type?: 'text' | 'email' | 'number' | 'date' | 'password' | 'textarea' | 'select'; required?: boolean; step?: string; options?: [string, string][] }
type Resource = { id: string; label: string; singular: string; endpoint: string; primaryKey: string; icon: LucideIcon; fields: Field[]; columns: string[] }
type Row = Record<string, unknown>
type User = { nome?: string; email?: string }

const API_DEFAULT = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://backend-unze.onrender.com')
const inventoryFields: Field[] = [
  { key: 'id_produto', label: 'ID do produto', type: 'number', required: true },
  { key: 'quantidade', label: 'Quantidade', type: 'number', required: true },
  { key: 'estoque_minimo', label: 'Estoque mínimo', type: 'number' },
  { key: 'estoque_maximo', label: 'Estoque máximo', type: 'number' },
  { key: 'localizacao', label: 'Localização' },
]
const resources: Resource[] = [
  { id: 'produtos', label: 'Produtos', singular: 'Produto', endpoint: '/produtos', primaryKey: 'id_produto', icon: Package, fields: [
    { key: 'nome', label: 'Nome', required: true }, { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
    { key: 'preco', label: 'Preço', type: 'number', step: '0.01' }, { key: 'imagem_produto', label: 'Imagem do produto (URL)', required: true },
  ], columns: ['id_produto', 'nome', 'preco', 'descricao'] },
  { id: 'categorias', label: 'Categorias', singular: 'Categoria', endpoint: '/categorias', primaryKey: 'id_categoria', icon: Tags, fields: [
    { key: 'nome', label: 'Nome', required: true }, { key: 'descricao', label: 'Descrição', type: 'textarea' }, { key: 'ativo', label: 'Ativo', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] },
  ], columns: ['id_categoria', 'nome', 'descricao', 'ativo'] },
  { id: 'estoque', label: 'Estoque', singular: 'Estoque', endpoint: '/estoque', primaryKey: 'id_estoque', icon: Boxes, fields: inventoryFields, columns: ['id_estoque', 'id_produto', 'quantidade', 'estoque_minimo', 'localizacao'] },
  { id: 'entradas', label: 'Entradas', singular: 'Entrada', endpoint: '/entradas', primaryKey: 'id_entrada', icon: ArrowDownToLine, fields: [
    { key: 'id_produto', label: 'ID do produto', type: 'number', required: true }, { key: 'id_fornecedor', label: 'ID do fornecedor', type: 'number', required: true },
    { key: 'quantidade', label: 'Quantidade', type: 'number', required: true }, { key: 'valor_unitario', label: 'Valor unitário', type: 'number', step: '0.01', required: true },
    { key: 'data_entrada', label: 'Data da entrada', type: 'date' }, { key: 'observacao', label: 'Observação', type: 'textarea' },
  ], columns: ['id_entrada', 'id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario', 'data_entrada'] },
  { id: 'saidas', label: 'Saídas', singular: 'Saída', endpoint: '/saidas', primaryKey: 'id_saida', icon: ArrowUpFromLine, fields: [
    { key: 'id_produto', label: 'ID do produto', type: 'number', required: true }, { key: 'id_funcionario', label: 'ID do funcionário', type: 'number', required: true },
    { key: 'quantidade', label: 'Quantidade', type: 'number', required: true }, { key: 'valor_unitario', label: 'Valor unitário', type: 'number', step: '0.01', required: true },
    { key: 'data_saida', label: 'Data da saída', type: 'date' }, { key: 'destino', label: 'Destino' },
  ], columns: ['id_saida', 'id_produto', 'id_funcionario', 'quantidade', 'valor_unitario', 'data_saida'] },
  { id: 'clientes', label: 'Clientes', singular: 'Cliente', endpoint: '/clientes', primaryKey: 'id_cliente', icon: Users, fields: [
    { key: 'nome', label: 'Nome', required: true }, { key: 'email', label: 'E-mail', type: 'email', required: true }, { key: 'contato', label: 'Contato' },
    { key: 'ativo', label: 'Ativo', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] },
  ], columns: ['id_cliente', 'nome', 'email', 'contato', 'ativo'] },
  { id: 'fornecedores', label: 'Fornecedores', singular: 'Fornecedor', endpoint: '/fornecedores', primaryKey: 'id_fornecedor', icon: Truck, fields: [
    { key: 'nome', label: 'Nome', required: true }, { key: 'empresa', label: 'Empresa' }, { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'telefone', label: 'Telefone' }, { key: 'cidade', label: 'Cidade' }, { key: 'estado', label: 'Estado' },
    { key: 'ativo', label: 'Ativo', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] },
  ], columns: ['id_fornecedor', 'nome', 'empresa', 'email', 'telefone', 'cidade'] },
  { id: 'funcionarios', label: 'Funcionários', singular: 'Funcionário', endpoint: '/funcionarios', primaryKey: 'id_funcionario', icon: BriefcaseBusiness, fields: [
    { key: 'nome', label: 'Nome' }, { key: 'cargo', label: 'Cargo' }, { key: 'salario', label: 'Salário', type: 'number', step: '0.01' },
    { key: 'telefone', label: 'Telefone' }, { key: 'email', label: 'E-mail', type: 'email' }, { key: 'data_admissao', label: 'Data de admissão', type: 'date' },
    { key: 'ativo', label: 'Ativo', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] },
  ], columns: ['id_funcionario', 'nome', 'cargo', 'email', 'telefone', 'ativo'] },
  { id: 'pedidos', label: 'Pedidos', singular: 'Pedido', endpoint: '/pedidos', primaryKey: 'id_pedido', icon: ShoppingBag, fields: [
    { key: 'id_cliente', label: 'ID do cliente', type: 'number' }, { key: 'status', label: 'Status' }, { key: 'data_pedido', label: 'Data do pedido', type: 'date' },
  ], columns: ['id_pedido', 'id_cliente', 'status', 'data_pedido'] },
  { id: 'pedido_itens', label: 'Itens de pedido', singular: 'Item de pedido', endpoint: '/pedido_itens', primaryKey: 'id_item', icon: ClipboardList, fields: [
    { key: 'id_pedido', label: 'ID do pedido', type: 'number' }, { key: 'id_produto', label: 'ID do produto', type: 'number' },
    { key: 'quantidade', label: 'Quantidade', type: 'number' }, { key: 'valor_unitario', label: 'Valor unitário', type: 'number', step: '0.01' },
    { key: 'subtotal', label: 'Subtotal', type: 'number', step: '0.01' },
  ], columns: ['id_item', 'id_pedido', 'id_produto', 'quantidade', 'valor_unitario', 'subtotal'] },
  { id: 'historico_precos', label: 'Histórico de preços', singular: 'Preço', endpoint: '/historico_precos', primaryKey: 'id_historico', icon: Clock3, fields: [
    { key: 'id_produto', label: 'ID do produto', type: 'number' }, { key: 'preco', label: 'Preço', type: 'number', step: '0.01' }, { key: 'vigencia', label: 'Vigência', type: 'date' },
  ], columns: ['id_historico', 'id_produto', 'preco', 'vigencia'] },
  { id: 'movimentacoes', label: 'Movimentações', singular: 'Movimentação', endpoint: '/movimentacoes', primaryKey: 'id_movimentacao', icon: ArrowLeftRight, fields: [
    { key: 'id_produto', label: 'ID do produto', type: 'number' }, { key: 'tipo', label: 'Tipo', type: 'select', options: [['E', 'Entrada'], ['S', 'Saída'], ['A', 'Ajuste'], ['P', 'Pedido'], ['T', 'Transferência']] },
    { key: 'quantidade', label: 'Quantidade', type: 'number' }, { key: 'data_movimentacao', label: 'Data', type: 'date' }, { key: 'observacao', label: 'Observação', type: 'textarea' },
  ], columns: ['id_movimentacao', 'id_produto', 'tipo', 'quantidade', 'data_movimentacao', 'observacao'] },
  { id: 'usuarios', label: 'Usuários', singular: 'Usuário', endpoint: '/usuarios', primaryKey: 'id_usu', icon: UserRound, fields: [
    { key: 'nome', label: 'Nome' }, { key: 'email', label: 'E-mail', type: 'email' }, { key: 'senha', label: 'Senha', type: 'password', required: true },
    { key: 'contato', label: 'Contato' }, { key: 'genero', label: 'Gênero' }, { key: 'ativo', label: 'Ativo', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] },
  ], columns: ['id_usu', 'nome', 'email', 'contato', 'ativo'] },
  { id: 'logs', label: 'Logs', singular: 'Log', endpoint: '/logs', primaryKey: 'id_log', icon: FileText, fields: [
    { key: 'usuario', label: 'Usuário' }, { key: 'tabela_afetada', label: 'Tabela afetada' }, { key: 'acao', label: 'Ação' }, { key: 'registro', label: 'Registro', type: 'textarea' }, { key: 'data_hora', label: 'Data e hora', type: 'date' },
  ], columns: ['id_log', 'usuario', 'tabela_afetada', 'acao', 'data_hora'] },
]

async function apiRequest(url: string, token: string, path: string, init?: RequestInit) {
  const response = await fetch(`${url.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  })
  const text = await response.text()
  let body: unknown = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!response.ok) {
    const data = body as { mensagem?: string; error?: string; erro?: { mensagem?: string } } | null
    throw new Error(data?.mensagem || data?.erro?.mensagem || data?.error || `Falha na API (${response.status})`)
  }
  return body
}

function recordsFrom(data: unknown, key: string): Row[] {
  if (Array.isArray(data)) return data as Row[]
  if (data && typeof data === 'object') {
    const object = data as Record<string, unknown>
    const direct = object[key]
    if (Array.isArray(direct)) return direct as Row[]
    const array = Object.values(object).find(Array.isArray)
    if (Array.isArray(array)) return array as Row[]
  }
  return []
}
function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  if (value === 1 || value === '1' || value === true) return 'Ativo'
  if (value === 0 || value === '0' || value === false) return 'Inativo'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
function getRowId(row: Row, primaryKey: string) {
  const id = row[primaryKey] ?? Object.entries(row).find(([key]) => key.startsWith('id_'))?.[1]
  return id === undefined ? '' : String(id)
}

export default function App() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('loja-api-url') || API_DEFAULT)
  const [token, setToken] = useState(() => localStorage.getItem('loja-token') || '')
  const [user, setUser] = useState<User>(() => {
    try { return JSON.parse(localStorage.getItem('loja-user') || '{}') as User } catch { return {} }
  })
  const [activeId, setActiveId] = useState('dashboard')
  const [rows, setRows] = useState<Row[]>([])
  const [dashboard, setDashboard] = useState<Record<string, Row[]>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'record' | 'settings' | null>(null)
  const [editing, setEditing] = useState<Row | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginUrl, setLoginUrl] = useState(apiUrl)
  const [settingsUrl, setSettingsUrl] = useState(apiUrl)
  const [loginBusy, setLoginBusy] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  const resource = resources.find(item => item.id === activeId)
  const resourceLabel = resource?.label || 'Visão geral'

  function openSettings() {
    setSettingsUrl(apiUrl)
    setModal('settings')
  }

  useEffect(() => {
    if (!token) return
    if (activeId === 'dashboard') void loadDashboard()
    else if (resource) void loadResource(resource)
  }, [token, apiUrl, activeId])

  async function loadDashboard() {
    setLoading(true)
    setMessage('')
    const result: Record<string, Row[]> = {}
    const dashboardResources = ['produtos', 'clientes', 'pedidos', 'estoque', 'entradas', 'saidas']
      .map(id => resources.find(item => item.id === id))
      .filter((item): item is Resource => Boolean(item))
    const requested = await Promise.all(dashboardResources.map(async (item): Promise<[string, Row[]]> => {
      try { return [item.id, recordsFrom(await apiRequest(apiUrl, token, item.endpoint), item.id)] }
      catch { return [item.id, []] }
    }))
    requested.forEach(([key, value]) => { result[key] = value })
    setDashboard(result)
    setLoading(false)
  }

  async function loadResource(item: Resource) {
    setLoading(true)
    setMessage('')
    try { setRows(recordsFrom(await apiRequest(apiUrl, token, item.endpoint), item.id)) }
    catch (error) { setRows([]); setMessage(error instanceof Error ? error.message : 'Não foi possível carregar os registros.') }
    finally { setLoading(false) }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginBusy(true)
    setMessage('')
    try {
      const normalizedUrl = loginUrl.trim().replace(/\/$/, '')
      const response = await apiRequest(normalizedUrl, '', '/login', { method: 'POST', body: JSON.stringify({ email, senha: password }) }) as { token?: string; usuario?: User }
      if (!response.token) throw new Error('A API não retornou um token de acesso.')
      localStorage.setItem('loja-token', response.token)
      localStorage.setItem('loja-user', JSON.stringify(response.usuario || {}))
      localStorage.setItem('loja-api-url', normalizedUrl)
      setApiUrl(normalizedUrl)
      setToken(response.token)
      setUser(response.usuario || {})
      setActiveId('dashboard')
      setPassword('')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.') }
    finally { setLoginBusy(false) }
  }

  function logout() {
    localStorage.removeItem('loja-token')
    localStorage.removeItem('loja-user')
    setToken('')
    setUser({})
    setRows([])
    setDashboard({})
  }

  function openCreate() {
    setEditing(null)
    setForm(Object.fromEntries((resource?.fields || []).map(field => [field.key, ''])))
    setModal('record')
  }
  function openEdit(row: Row) {
    setEditing(row)
    setForm(Object.fromEntries((resource?.fields || []).map(field => [field.key, row[field.key] === undefined || row[field.key] === null ? '' : String(row[field.key]).slice(0, field.type === 'date' ? 10 : undefined)])))
    setModal('record')
  }
  function closeModal() { setModal(null); setEditing(null) }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!resource) return
    const payload: Record<string, unknown> = {}
    resource.fields.forEach(field => {
      const value = form[field.key]?.trim()
      if (!value) return
      payload[field.key] = field.type === 'number' ? Number(value) : field.key === 'ativo' ? Number(value) : value
    })
    if (editing && resource.id === 'usuarios' && !payload.senha) delete payload.senha
    setLoading(true)
    try {
      const rowId = editing ? getRowId(editing, resource.primaryKey) : ''
      await apiRequest(apiUrl, token, `${resource.endpoint}${editing ? `/${encodeURIComponent(rowId)}` : ''}`, {
        method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload),
      })
      closeModal()
      setMessage(`${resource.singular} ${editing ? 'atualizado' : 'cadastrado'} com sucesso.`)
      await loadResource(resource)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar o registro.') }
    finally { setLoading(false) }
  }

  async function deleteRecord(row: Row) {
    if (!resource) return
    const id = getRowId(row, resource.primaryKey)
    if (!id || !window.confirm(`Excluir ${resource.singular.toLowerCase()} ${id}? Esta ação não pode ser desfeita.`)) return
    setLoading(true)
    try {
      await apiRequest(apiUrl, token, `${resource.endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setMessage(`${resource.singular} excluído.`)
      await loadResource(resource)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível excluir o registro.') }
    finally { setLoading(false) }
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = settingsUrl.trim().replace(/\/$/, '')
    localStorage.setItem('loja-api-url', normalized)
    setApiUrl(normalized)
    setModal(null)
    setMessage('Endereço da API atualizado.')
  }

  const filteredRows = rows.filter(row => Object.values(row).some(value => displayValue(value).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))))

  if (!token) return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} apiUrl={loginUrl} setApiUrl={setLoginUrl} busy={loginBusy} message={message} onSubmit={handleLogin} />

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#inicio" onClick={event => { event.preventDefault(); setActiveId('dashboard'); setMobileNav(false) }}>
          <span className="brand-mark"><Package size={20} strokeWidth={2.2} /></span>
          <span className="brand-copy"><strong>armazém</strong><small>painel de gestão</small></span>
        </a>
        <div className="workspace-switch"><span className="workspace-dot" /><span><b>Loja principal</b><small>Operação diária</small></span><ChevronDown size={15} /></div>
        <nav className="navigation" aria-label="Navegação principal">
          <span className="nav-caption">VISÃO GERAL</span>
          <NavButton active={activeId === 'dashboard'} icon={LayoutDashboard} label="Painel" onClick={() => { setActiveId('dashboard'); setMobileNav(false) }} />
          <span className="nav-caption nav-caption-spaced">OPERAÇÃO</span>
          {resources.slice(0, 5).map(item => <NavButton key={item.id} active={activeId === item.id} icon={item.icon} label={item.label} onClick={() => { setActiveId(item.id); setMobileNav(false) }} />)}
          <span className="nav-caption nav-caption-spaced">RELACIONAMENTO</span>
          {resources.slice(5, 8).map(item => <NavButton key={item.id} active={activeId === item.id} icon={item.icon} label={item.label} onClick={() => { setActiveId(item.id); setMobileNav(false) }} />)}
          <span className="nav-caption nav-caption-spaced">GESTÃO</span>
          {resources.slice(8).map(item => <NavButton key={item.id} active={activeId === item.id} icon={item.icon} label={item.label} onClick={() => { setActiveId(item.id); setMobileNav(false) }} />)}
        </nav>
        <div className="sidebar-bottom">
          <button className="help-link" type="button" onClick={() => { openSettings(); setMobileNav(false) }}><Settings2 size={17} /> Configuração da API</button>
          <div className="profile-row"><span className="avatar">{(user.nome || user.email || 'U').slice(0, 1).toUpperCase()}</span><span className="profile-copy"><b>{user.nome || 'Usuário'}</b><small>{user.email || 'Conta conectada'}</small></span><button className="icon-button profile-logout" title="Sair" aria-label="Sair" onClick={logout}><LogOut size={17} /></button></div>
        </div>
      </aside>
      {mobileNav && <button className="nav-scrim" aria-label="Fechar navegação" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Loja</span><ChevronRight size={14} /><b>{resourceLabel}</b></div>
          <div className="topbar-actions"><span className="connection-indicator"><i /> API configurada</span><button className="icon-button" title="Configuração da API" aria-label="Configuração da API" onClick={openSettings}><Settings2 size={18} /></button><span className="top-avatar">{(user.nome || user.email || 'U').slice(0, 1).toUpperCase()}</span></div>
        </header>
        <div className="page-content">
          {message && <div className={`notice ${message.includes('sucesso') || message.includes('atualizado') || message.includes('excluído') || message.includes('cadastrado') ? 'notice-success' : ''}`} role="status"><span>{message}</span><button aria-label="Fechar aviso" onClick={() => setMessage('')}><X size={15} /></button></div>}
          {activeId === 'dashboard' ? <DashboardView dashboard={dashboard} loading={loading} onNavigate={id => setActiveId(id)} onRefresh={loadDashboard} /> : resource ? <ResourceView resource={resource} rows={filteredRows} total={rows.length} loading={loading} search={search} setSearch={setSearch} onCreate={openCreate} onEdit={openEdit} onDelete={deleteRecord} onRefresh={() => loadResource(resource)} /> : null}
        </div>
      </main>
      {modal === 'record' && resource && <RecordModal resource={resource} editing={editing} form={form} setForm={setForm} busy={loading} onClose={closeModal} onSubmit={saveRecord} />}
      {modal === 'settings' && <Modal title="Conexão da API" onClose={() => setModal(null)}><form className="form-body" onSubmit={saveSettings}><p className="modal-description">Endereço base usado nas chamadas do painel.</p><FieldControl field={{ key: 'url', label: 'URL base da API', type: 'text', required: true }} value={settingsUrl} onChange={setSettingsUrl} /><div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => setModal(null)}>Cancelar</button><button className="button button-primary" type="submit">Salvar endereço</button></div></form></Modal>}
    </div>
  )
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return <button type="button" className={`nav-item ${active ? 'nav-item-active' : ''}`} onClick={onClick}><Icon size={17} strokeWidth={active ? 2.2 : 1.8} /><span>{label}</span>{active && <span className="nav-active-mark" />}</button>
}

function LoginScreen({ email, setEmail, password, setPassword, apiUrl, setApiUrl, busy, message, onSubmit }: {
  email: string; setEmail: (value: string) => void; password: string; setPassword: (value: string) => void; apiUrl: string; setApiUrl: (value: string) => void; busy: boolean; message: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return <main className="login-page">
    <section className="login-art" aria-label="Gestão de loja">
      <div className="art-top"><a className="brand brand-light" href="#inicio"><span className="brand-mark"><Package size={20} /></span><span className="brand-copy"><strong>armazém</strong><small>painel de gestão</small></span></a><span className="art-location"><span className="workspace-dot" /> OPERAÇÃO CENTRAL</span></div>
      <div className="art-center"><span className="eyebrow"><i /> ESTOQUE EM MOVIMENTO</span><h1>O ritmo certo<br />para sua loja.</h1><p>Estoque, pedidos e relações em um só lugar. Entre e deixe a operação fluir.</p><div className="art-graphic" aria-hidden="true"><div className="graphic-grid" /><div className="graphic-sun" /><div className="shelf shelf-back"><i /><i /><i /><i /></div><div className="shelf shelf-front"><i /><i /><i /><i /><i /></div><div className="graphic-line line-one" /><div className="graphic-line line-two" /><span className="graphic-note note-one">+12,8% <small>esta semana</small></span><span className="graphic-note note-two"><b>●</b> Estoque saudável</span></div></div>
      <div className="art-footer"><span>GESTÃO COM VISÃO DE PONTA A PONTA</span><span>01 — 04</span></div>
    </section>
    <section className="login-panel"><div className="login-form-wrap"><div className="login-heading"><span className="login-kicker">BEM-VINDO DE VOLTA</span><h2>Acesse sua conta</h2><p>Use suas credenciais de usuário para continuar.</p></div>
      <form className="login-form" onSubmit={onSubmit}>
        <label className="form-field"><span>E-mail</span><input type="email" autoComplete="username" placeholder="voce@loja.com.br" value={email} onChange={event => setEmail(event.target.value)} required /></label>
        <label className="form-field"><span>Senha</span><input type="password" autoComplete="current-password" placeholder="Sua senha" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        <label className="form-field api-url-field"><span>URL da API</span><input type="text" value={apiUrl} onChange={event => setApiUrl(event.target.value)} required /></label>
        {message && <div className="login-error" role="alert">{message}</div>}
        <button className="button button-primary login-submit" type="submit" disabled={busy}>{busy ? <><span className="spinner" /> Conectando...</> : <>Entrar no painel <ChevronRight size={17} /></>}</button>
      </form>
      <div className="login-security"><span className="security-icon"><Settings2 size={16} /></span><span><b>Acesso protegido</b><small>Sessão autenticada por token JWT</small></span></div>
      <div className="login-bottom">© 2026 Armazém <span>•</span> Gestão de loja</div>
    </div></section>
  </main>
}

function DashboardView({ dashboard, loading, onNavigate, onRefresh }: { dashboard: Record<string, Row[]>; loading: boolean; onNavigate: (id: string) => void; onRefresh: () => void }) {
  const productCount = dashboard.produtos?.length || 0
  const customerCount = dashboard.clientes?.length || 0
  const orderCount = dashboard.pedidos?.length || 0
  const stockRows = dashboard.estoque || []
  const lowStock = stockRows.filter(row => Number(row.quantidade) <= Number(row.estoque_minimo || 0)).length
  const cards = [
    { label: 'Produtos ativos', value: productCount, caption: 'itens no catálogo', icon: Package, tint: 'mint', target: 'produtos' },
    { label: 'Clientes', value: customerCount, caption: 'cadastros realizados', icon: Users, tint: 'peach', target: 'clientes' },
    { label: 'Pedidos', value: orderCount, caption: 'pedidos registrados', icon: ShoppingBag, tint: 'yellow', target: 'pedidos' },
    { label: 'Estoque baixo', value: lowStock, caption: 'itens no limite mínimo', icon: Boxes, tint: 'rose', target: 'estoque' },
  ]
  const shortcuts = [
    { id: 'entradas', label: 'Registrar entrada', sub: 'Atualizar quantidades', icon: ArrowDownToLine, tone: 'shortcut-green' },
    { id: 'saidas', label: 'Registrar saída', sub: 'Dar baixa no estoque', icon: ArrowUpFromLine, tone: 'shortcut-orange' },
    { id: 'produtos', label: 'Novo produto', sub: 'Adicionar ao catálogo', icon: Plus, tone: 'shortcut-blue' },
  ]
  const recent: (Row & { movement: string })[] = [...(dashboard.entradas || []).map(row => ({ ...row, movement: 'Entrada' })), ...(dashboard.saidas || []).map(row => ({ ...row, movement: 'Saída' }))].slice(-5).reverse()
  return <div className="dashboard-view">
    <div className="page-title-row"><div><span className="page-eyebrow">SEXTA-FEIRA, 13 DE NOVEMBRO</span><h1>Bom dia, operação.</h1><p>Acompanhe o que está acontecendo na sua loja.</p></div><button className="button button-secondary refresh-button" onClick={onRefresh} disabled={loading}><Activity size={16} /> Atualizar</button></div>
    <section className="metric-grid" aria-label="Resumo da loja">{cards.map(card => <button className="metric-card" key={card.label} onClick={() => onNavigate(card.target)}><span className={`metric-icon ${card.tint}`}><card.icon size={19} /></span><span className="metric-label">{card.label}</span><strong className="metric-value">{loading ? '—' : card.value.toLocaleString('pt-BR')}</strong><span className="metric-caption">{card.caption}</span><ChevronRight className="metric-arrow" size={17} /></button>)}</section>
    <div className="dashboard-columns"><section className="dashboard-section quick-section"><div className="section-heading"><div><span className="section-overline">ATALHOS</span><h2>O que vamos fazer?</h2></div><SlidersHorizontal size={17} /></div><div className="shortcut-list">{shortcuts.map(item => <button className="shortcut-row" key={item.id} onClick={() => onNavigate(item.id)}><span className={`shortcut-icon ${item.tone}`}><item.icon size={18} /></span><span className="shortcut-text"><b>{item.label}</b><small>{item.sub}</small></span><ChevronRight size={17} className="shortcut-chevron" /></button>)}</div><div className="stock-callout"><span className="callout-mark"><ChartNoAxesCombined size={17} /></span><span><b>{lowStock > 0 ? `${lowStock} ${lowStock === 1 ? 'produto precisa' : 'produtos precisam'} de atenção` : 'Estoque em dia'}</b><small>{lowStock > 0 ? 'Confira o nível mínimo dos itens.' : 'Nenhum item abaixo do mínimo cadastrado.'}</small></span><button aria-label="Ver estoque" onClick={() => onNavigate('estoque')}><ChevronRight size={18} /></button></div></section>
      <section className="dashboard-section activity-section"><div className="section-heading"><div><span className="section-overline">ACOMPANHAMENTO</span><h2>Movimento recente</h2></div><button className="text-button" onClick={() => onNavigate('movimentacoes')}>Ver tudo <ChevronRight size={15} /></button></div>{recent.length ? <div className="activity-list">{recent.map((item, index) => <div className="activity-row" key={`${item.movement}-${getRowId(item, 'id_entrada')}-${index}`}><span className={`activity-icon ${item.movement === 'Entrada' ? 'activity-in' : 'activity-out'}`}>{item.movement === 'Entrada' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}</span><span className="activity-copy"><b>{item.movement} de produto</b><small>Produto #{displayValue(item.id_produto)} · {displayValue(item.quantidade)} un.</small></span><span className="activity-date">{displayValue(item.data_entrada || item.data_saida)}</span></div>)}</div> : <div className="empty-activity"><span className="empty-activity-icon"><Activity size={20} /></span><b>Nenhum movimento recente</b><small>Entradas e saídas aparecerão aqui.</small></div>}<button className="activity-footer" onClick={() => onNavigate('entradas')}>Abrir histórico de operações <ChevronRight size={15} /></button></section></div>
    <div className="dashboard-footnote"><span><i /> Dados sincronizados com sua API</span><button onClick={onRefresh}>Atualizar dados</button></div>
  </div>
}

function ResourceView({ resource, rows, total, loading, search, setSearch, onCreate, onEdit, onDelete, onRefresh }: {
  resource: Resource; rows: Row[]; total: number; loading: boolean; search: string; setSearch: (value: string) => void; onCreate: () => void; onEdit: (row: Row) => void; onDelete: (row: Row) => void; onRefresh: () => void
}) {
  return <section className="resource-view"><div className="page-title-row resource-title-row"><div><span className="page-eyebrow">CADASTROS DA LOJA</span><h1>{resource.label}</h1><p>Consulte e mantenha os registros de {resource.label.toLocaleLowerCase('pt-BR')}.</p></div><button className="button button-primary" onClick={onCreate}><Plus size={17} /> Novo {resource.singular.toLocaleLowerCase('pt-BR')}</button></div>
    <div className="table-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Buscar em ${resource.label.toLocaleLowerCase('pt-BR')}...`} aria-label={`Buscar em ${resource.label}`} /><kbd>⌘ K</kbd></div><div className="table-tools"><span>{loading ? 'Carregando...' : `${rows.length}${rows.length !== total ? ` de ${total}` : ''} registros`}</span><button className="icon-button table-refresh" title="Atualizar" aria-label="Atualizar" onClick={onRefresh} disabled={loading}><Activity size={17} /></button></div></div>
    <div className="table-wrap"><table><thead><tr>{resource.columns.map(column => <th key={column}>{fieldLabel(resource, column)}</th>)}<th className="actions-heading">AÇÕES</th></tr></thead><tbody>{loading && !rows.length ? <tr><td className="table-empty" colSpan={resource.columns.length + 1}><span className="spinner spinner-dark" /> Carregando registros...</td></tr> : rows.length ? rows.map((row, index) => <tr key={getRowId(row, resource.primaryKey) || index}>{resource.columns.map(column => <td key={column}>{renderCell(row[column], column)}</td>)}<td><div className="row-actions"><button className="row-action" title="Editar" aria-label="Editar registro" onClick={() => onEdit(row)}><SlidersHorizontal size={15} /></button><button className="row-action row-delete" title="Excluir" aria-label="Excluir registro" onClick={() => onDelete(row)}><Trash2 size={15} /></button></div></td></tr>) : <tr><td className="table-empty" colSpan={resource.columns.length + 1}><span className="empty-table-icon"><Package size={20} /></span><b>{search ? 'Nenhum resultado encontrado' : 'Nenhum registro por aqui'}</b><small>{search ? 'Tente outra palavra-chave.' : 'Comece adicionando o primeiro registro.'}</small>{!search && <button className="button button-secondary empty-create" onClick={onCreate}><Plus size={15} /> Novo registro</button>}</td></tr>}</tbody></table></div>
    <div className="table-footer"><span>Exibindo {rows.length} de {total} registros</span><div className="pagination"><button disabled aria-label="Página anterior"><ChevronLeft size={16} /></button><span className="page-current">1</span><button disabled aria-label="Próxima página"><ChevronRight size={16} /></button></div></div>
  </section>
}

function fieldLabel(resource: Resource, key: string) {
  return resource.fields.find(field => field.key === key)?.label || key.replace(/_/g, ' ')
}
function renderCell(value: unknown, key: string) {
  if (value === null || value === undefined || value === '') return <span className="muted-value">—</span>
  if (key === 'ativo') return <span className={`status-pill ${Number(value) === 0 ? 'status-inactive' : 'status-active'}`}><i />{Number(value) === 0 ? 'Inativo' : 'Ativo'}</span>
  if (key.includes('preco') || key.includes('valor') || key === 'subtotal' || key === 'salario') return <span className="money-value">{Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
  const text = displayValue(value)
  return <span className={key.startsWith('id_') ? 'id-value' : ''} title={text}>{text.length > 54 ? `${text.slice(0, 54)}…` : text}</span>
}

function RecordModal({ resource, editing, form, setForm, busy, onClose, onSubmit }: {
  resource: Resource; editing: Row | null; form: Record<string, string>; setForm: (form: Record<string, string>) => void; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return <Modal title={`${editing ? 'Editar' : 'Novo'} ${resource.singular.toLocaleLowerCase('pt-BR')}`} onClose={onClose}><form className="form-body" onSubmit={onSubmit}><p className="modal-description">{editing ? 'Atualize os campos necessários.' : 'Preencha os dados para adicionar à sua operação.'}</p><div className="field-grid">{resource.fields.map(field => <FieldControl key={field.key} field={editing && field.type === 'password' ? { ...field, required: false } : field} value={form[field.key] || ''} onChange={value => setForm({ ...form, [field.key]: value })} />)}</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit" disabled={busy}>{busy ? <><span className="spinner" /> Salvando...</> : editing ? 'Salvar alterações' : 'Criar registro'}</button></div></form></Modal>
}

function FieldControl({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  return <label className={`form-field ${field.type === 'textarea' ? 'field-wide' : ''}`}><span>{field.label}{field.required && <i className="required-mark"> *</i>}</span>{field.type === 'textarea' ? <textarea value={value} onChange={event => onChange(event.target.value)} required={field.required} rows={3} /> : field.type === 'select' ? <select value={value} onChange={event => onChange(event.target.value)} required={field.required}><option value="">Selecione</option>{field.options?.map(([option, label]) => <option value={option} key={option}>{label}</option>)}</select> : <input type={field.type || 'text'} value={value} onChange={event => onChange(event.target.value)} required={field.required} step={field.step} />}</label>
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></header>{children}</section></div>
}
