const roteador = require('express').Router();
const TabelaFornecedor = require('./TabelaFornecedor');
const SerializadorFornecedor = require('../../Serializador').SerializadorFornecedor;

roteador.options('/', (requisicao, resposta) => {
    resposta.set('Acess-Control-Allow-Methods', 'GET');
    resposta.set('Acess-Control-Allow-Headers', 'Content-Type');
    resposta.status(204).end();
});

roteador.get('/', async (requisicao, resposta) => {
    const resultados = await TabelaFornecedor.listar()
    const serializador = new SerializadorFornecedor(
        resposta.getHeader('Content-Type')
    );
    resposta.status(200).send(
        serializador.serializar(resultados)
    );
});

module.exports = roteador