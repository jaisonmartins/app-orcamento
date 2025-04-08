import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Calendar, DollarSign, Wallet, Download, Upload, Save, Database } from 'lucide-react';

const App = () => {
  // Estado para armazenar todos os meses
  const [meses, setMeses] = useState(() => {
    const dadosArmazenados = localStorage.getItem('orcamentoFinanceiro');
    return dadosArmazenados ? JSON.parse(dadosArmazenados) : [];
  });
  
  // Estado para o mês atualmente selecionado
  const [mesSelecionado, setMesSelecionado] = useState(null);
  
  // Estados para adicionar nova despesa
  const [novaDespesa, setNovaDespesa] = useState({ descricao: '', valor: '' });
  
  // Estados para adicionar nova renda
  const [novaRenda, setNovaRenda] = useState({ fonte: '', valor: '' });
  
  // Estado para o nome do novo mês
  const [novoMes, setNovoMes] = useState('');

  // Efeito para salvar dados no localStorage sempre que o estado meses mudar
  useEffect(() => {
    if (meses.length > 0) {
      localStorage.setItem('orcamentoFinanceiro', JSON.stringify(meses));
    }
  }, [meses]);
  
  // Função para exportar dados para um arquivo
  const exportarDados = () => {
    const dadosJSON = JSON.stringify(meses, null, 2);
    const blob = new Blob([dadosJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orcamento_financeiro_backup.json';
    document.body.appendChild(a);
    a.click();
    
    // Limpeza
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  
  // Função para importar dados de um arquivo
  const importarDados = (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;
    
    const leitor = new FileReader();
    
    leitor.onload = (e) => {
      try {
        const dadosImportados = JSON.parse(e.target.result);
        
        if (Array.isArray(dadosImportados)) {
          setMeses(dadosImportados);
          alert('Dados importados com sucesso!');
        } else {
          alert('Formato de arquivo inválido.');
        }
      } catch (erro) {
        alert('Erro ao importar o arquivo: ' + erro.message);
      }
    };
    
    leitor.readAsText(arquivo);
    
    // Resetar o valor do input de arquivo para permitir importar o mesmo arquivo novamente
    event.target.value = null;
  };

  // Função para adicionar um novo mês
  const adicionarMes = () => {
    if (!novoMes.trim()) return;
    
    const mesExiste = meses.some(m => m.nome.toLowerCase() === novoMes.toLowerCase());
    
    if (mesExiste) {
      alert('Este mês já existe!');
      return;
    }
    
    const novoMesObj = {
      nome: novoMes,
      despesas: [],
      rendas: [],
      totalDespesas: 0,
      totalRendas: 0,
      saldo: 0
    };
    
    setMeses([...meses, novoMesObj]);
    setNovoMes('');
    setMesSelecionado(meses.length);
  };

  // Função para adicionar uma nova despesa
  const adicionarDespesa = () => {
    if (!novaDespesa.descricao.trim() || !novaDespesa.valor || isNaN(novaDespesa.valor)) return;
    
    const valor = parseFloat(novaDespesa.valor);
    
    const despesasAtualizadas = [...meses[mesSelecionado].despesas, {
      descricao: novaDespesa.descricao,
      valor: valor,
      valorPago: null,
      status: 'Pendente'
    }];
    
    const totalDespesas = despesasAtualizadas.reduce((total, despesa) => total + despesa.valor, 0);
    const saldo = meses[mesSelecionado].totalRendas - totalDespesas;
    
    const mesesAtualizados = [...meses];
    mesesAtualizados[mesSelecionado] = {
      ...mesesAtualizados[mesSelecionado],
      despesas: despesasAtualizadas,
      totalDespesas,
      saldo
    };
    
    setMeses(mesesAtualizados);
    setNovaDespesa({ descricao: '', valor: '' });
  };

  // Função para adicionar uma nova renda
  const adicionarRenda = () => {
    if (!novaRenda.fonte.trim() || !novaRenda.valor || isNaN(novaRenda.valor)) return;
    
    const valor = parseFloat(novaRenda.valor);
    
    const rendasAtualizadas = [...meses[mesSelecionado].rendas, {
      fonte: novaRenda.fonte,
      valor: valor
    }];
    
    const totalRendas = rendasAtualizadas.reduce((total, renda) => total + renda.valor, 0);
    const saldo = totalRendas - meses[mesSelecionado].totalDespesas;
    
    const mesesAtualizados = [...meses];
    mesesAtualizados[mesSelecionado] = {
      ...mesesAtualizados[mesSelecionado],
      rendas: rendasAtualizadas,
      totalRendas,
      saldo
    };
    
    setMeses(mesesAtualizados);
    setNovaRenda({ fonte: '', valor: '' });
  };

  // Função para remover uma despesa
  const removerDespesa = (index) => {
    const despesasAtualizadas = meses[mesSelecionado].despesas.filter((_, i) => i !== index);
    const totalDespesas = despesasAtualizadas.reduce((total, despesa) => total + despesa.valor, 0);
    const saldo = meses[mesSelecionado].totalRendas - totalDespesas;
    
    const mesesAtualizados = [...meses];
    mesesAtualizados[mesSelecionado] = {
      ...mesesAtualizados[mesSelecionado],
      despesas: despesasAtualizadas,
      totalDespesas,
      saldo
    };
    
    setMeses(mesesAtualizados);
  };

  // Função para remover uma renda
  const removerRenda = (index) => {
    const rendasAtualizadas = meses[mesSelecionado].rendas.filter((_, i) => i !== index);
    const totalRendas = rendasAtualizadas.reduce((total, renda) => total + renda.valor, 0);
    const saldo = totalRendas - meses[mesSelecionado].totalDespesas;
    
    const mesesAtualizados = [...meses];
    mesesAtualizados[mesSelecionado] = {
      ...mesesAtualizados[mesSelecionado],
      rendas: rendasAtualizadas,
      totalRendas,
      saldo
    };
    
    setMeses(mesesAtualizados);
  };

  // Função para marcar uma despesa como paga
  const marcarComoPaga = (index) => {
    const despesasAtualizadas = [...meses[mesSelecionado].despesas];
    const despesa = despesasAtualizadas[index];
    
    despesasAtualizadas[index] = {
      ...despesa,
      valorPago: despesa.valorPago === null ? despesa.valor : null,
      status: despesa.status === 'Pendente' ? 'Pago' : 'Pendente'
    };
    
    const mesesAtualizados = [...meses];
    mesesAtualizados[mesSelecionado] = {
      ...mesesAtualizados[mesSelecionado],
      despesas: despesasAtualizadas
    };
    
    setMeses(mesesAtualizados);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-center mb-2 md:mb-0">Orçamento Financeiro</h1>
          
          <div className="flex space-x-2">
            {/* Botão de exportar dados */}
            <button 
              className="bg-green-700 hover:bg-green-800 text-white py-1 px-3 rounded flex items-center"
              onClick={exportarDados}
              title="Fazer backup dos dados em um arquivo"
            >
              <Download size={16} className="mr-1" />
              <span className="text-sm">Backup</span>
            </button>
            
            {/* Botão de importar dados (escondido, ativado pelo label) */}
            <input 
              type="file" 
              id="importarArquivo" 
              className="hidden" 
              accept=".json" 
              onChange={importarDados} 
            />
            <label 
              htmlFor="importarArquivo" 
              className="bg-blue-800 hover:bg-blue-900 text-white py-1 px-3 rounded flex items-center cursor-pointer"
              title="Restaurar dados de um arquivo de backup"
            >
              <Upload size={16} className="mr-1" />
              <span className="text-sm">Restaurar</span>
            </label>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-4">
        {/* Adicionar novo mês */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold">Adicionar Novo Mês</h2>
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Nome do mês (ex: Janeiro 2025)"
              className="border rounded p-2 flex-grow mr-2"
              value={novoMes}
              onChange={(e) => setNovoMes(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white rounded px-4 py-2"
              onClick={adicionarMes}
            >
              <PlusCircle className="inline-block mr-1" size={16} />
              Adicionar
            </button>
          </div>
        </div>
        
        {/* Seleção de mês */}
        {meses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Selecionar Mês</h2>
            <div className="flex flex-wrap gap-2">
              {meses.map((mes, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg ${
                    mesSelecionado === index ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setMesSelecionado(index)}
                >
                  {mes.nome}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Conteúdo do mês selecionado */}
        {mesSelecionado !== null && mesSelecionado < meses.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seção de Despesas */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center mb-4">
                <DollarSign className="mr-2 text-red-500" />
                <h2 className="text-lg font-semibold">Despesas</h2>
              </div>
              
              {/* Adicionar nova despesa */}
              <div className="mb-4 border-b pb-4">
                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="Descrição"
                    className="border rounded p-2 flex-grow mr-2"
                    value={novaDespesa.descricao}
                    onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Valor"
                    className="border rounded p-2 w-24"
                    value={novaDespesa.valor}
                    onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                  />
                </div>
                <button
                  className="bg-blue-600 text-white rounded px-4 py-2 w-full"
                  onClick={adicionarDespesa}
                >
                  <PlusCircle className="inline-block mr-1" size={16} />
                  Adicionar Despesa
                </button>
              </div>
              
              {/* Lista de despesas */}
              <div className="overflow-auto max-h-96">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Descrição</th>
                      <th className="text-right py-2">Valor</th>
                      <th className="text-center py-2">Status</th>
                      <th className="text-center py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meses[mesSelecionado].despesas.map((despesa, index) => (
                      <tr key={index} className={`border-b ${despesa.status === 'Pago' ? 'bg-green-50' : ''}`}>
                        <td className="py-2">{despesa.descricao}</td>
                        <td className="py-2 text-right text-red-500">
                          R$ {despesa.valor.toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              despesa.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {despesa.status}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <button
                            className="text-blue-600 mr-2"
                            onClick={() => marcarComoPaga(index)}
                          >
                            {despesa.status === 'Pendente' ? 'Pagar' : 'Desfazer'}
                          </button>
                          <button
                            className="text-red-600"
                            onClick={() => removerDespesa(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="py-2">Total</td>
                      <td className="py-2 text-right text-red-500">
                        R$ {meses[mesSelecionado].totalDespesas.toFixed(2)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Seção de Rendas */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center mb-4">
                <Wallet className="mr-2 text-green-500" />
                <h2 className="text-lg font-semibold">Rendas</h2>
              </div>
              
              {/* Adicionar nova renda */}
              <div className="mb-4 border-b pb-4">
                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="Fonte"
                    className="border rounded p-2 flex-grow mr-2"
                    value={novaRenda.fonte}
                    onChange={(e) => setNovaRenda({...novaRenda, fonte: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Valor"
                    className="border rounded p-2 w-24"
                    value={novaRenda.valor}
                    onChange={(e) => setNovaRenda({...novaRenda, valor: e.target.value})}
                  />
                </div>
                <button
                  className="bg-green-600 text-white rounded px-4 py-2 w-full"
                  onClick={adicionarRenda}
                >
                  <PlusCircle className="inline-block mr-1" size={16} />
                  Adicionar Renda
                </button>
              </div>
              
              {/* Lista de rendas */}
              <div className="overflow-auto max-h-96">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Fonte</th>
                      <th className="text-right py-2">Valor</th>
                      <th className="text-center py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meses[mesSelecionado].rendas.map((renda, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{renda.fonte}</td>
                        <td className="py-2 text-right text-green-500">
                          R$ {renda.valor.toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            className="text-red-600"
                            onClick={() => removerRenda(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="py-2">Total</td>
                      <td className="py-2 text-right text-green-500">
                        R$ {meses[mesSelecionado].totalRendas.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Resumo */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Resumo do Mês</h3>
                <div className="flex justify-between mb-1">
                  <span>Total de Rendas:</span>
                  <span className="text-green-500">R$ {meses[mesSelecionado].totalRendas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Total de Despesas:</span>
                  <span className="text-red-500">R$ {meses[mesSelecionado].totalDespesas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Saldo:</span>
                  <span className={meses[mesSelecionado].saldo >= 0 ? 'text-green-600' : 'text-red-600'}>
                    R$ {meses[mesSelecionado].saldo.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {meses.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Bem-vindo ao seu Orçamento Financeiro</h2>
            <p className="text-gray-600 mb-4">Comece adicionando um novo mês para controlar suas finanças.</p>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-200 p-4 text-center text-gray-600">
        <div className="max-w-3xl mx-auto">
          <p className="mb-2">App de Orçamento Financeiro © 2025</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <div className="bg-yellow-100 p-2 rounded-lg flex items-center">
              <Database size={14} className="mr-1 text-yellow-700" />
              <span>
                <strong>Dados armazenados localmente</strong> - Faça backups regularmente para maior segurança
              </span>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg flex items-center">
              <Save size={14} className="mr-1 text-blue-700" />
              <span>
                <strong>Dica:</strong> Use o botão "Backup" para salvar seus dados em um arquivo seguro
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;