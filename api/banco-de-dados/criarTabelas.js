const ModeloTabela = require('../rotas/fornecedores/modeloTabelaFornecedor');

ModeloTabela
    .sync()
    .then(() => console.log('tabela fornecedor criada com sucesso'));