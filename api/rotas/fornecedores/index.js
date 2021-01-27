const roteador = require('express').Router();
const TabelaFornecedor = require('./TabelaFornecedor');
const Fornecedor = require('./Fornecedor');
const SerializadorFornecedor = require('../../Serializador').SerializadorFornecedor;

roteador.options('/', (requisicao, resposta) => {
    resposta.set('Acess-Control-Allow-Methods', 'GET,POST');
    resposta.set('Acess-Control-Allow-Headers', 'Content-Type');
    resposta.status(204).end();
});

roteador.options('/:idFornecedor', (requisicao, resposta) => {
    resposta.set('Acess-Control-Allow-Methods', 'GET,PUT,DELETE');
    resposta.set('Acess-Control-Allow-Headers', 'Content-Type');
    resposta.status(204).end();
});

roteador.get('/', async (requisicao, resposta) => {
    const resultados = await TabelaFornecedor.listar()
    const serializador = new SerializadorFornecedor(
        resposta.getHeader('Content-Type'),
        ['empresa']
    );
    resposta.status(200).send(
        serializador.serializar(resultados)
    );
});

roteador.post('/', async(requisicao, resposta, proximo) => {
    try{
        const dadosRecebidos = requisicao.body;
        const fornecedor = new Fornecedor(dadosRecebidos);
        await fornecedor.criar();
        const serializador = new SerializadorFornecedor(
            resposta.getHeader('Content-Type'),
            ['empresa']
        );
        resposta.status(201).send(
            serializador.serializar(fornecedor)
        );
    }catch (erro){
        proximo(erro);
    }
});

roteador.get('/:idFornecedor', async(requisicao, resposta, proxima) => {
    try{
        const id = requisicao.params.idFornecedor;
        const fornecedor = new Fornecedor({id: id});
        await fornecedor.carregar();
        const serializador = new SerializadorFornecedor(
            resposta.getHeader('Content-Type'),
            ['empresa', 'email', 'dataCriacao', 'dataAtualizacao', 'versao']
        );
        resposta.status(200).send(
            serializador.serializar(fornecedor)
        );
    }catch (erro){
        proxima(erro);
    }
});

roteador.put('/:idFornecedor', async (requisicao, resposta, proximo) => {
    try{
        const id = requisicao.params.idFornecedor;
        const dadosRecebidos = requisicao.body;
        const dados = Object.assign({}, dadosRecebidos, {id: id});
        const fornecedor = new Fornecedor(dados);
        await fornecedor.atualizar();
        resposta.status(204).end();
    }catch (erro){
        proximo(erro);
    }
});

roteador.delete('/:idFornecedor', async(requisicao, resposta, proximo) => {
    try{
        const id = requisicao.params.idFornecedor;
        const fornecedor = new Fornecedor({id: id});
        await fornecedor.carregar(id);
        await fornecedor.remover();
        resposta.status(204).end();
    }catch (erro){
        proximo(erro);
    }
});

const roteadorProdutos = require('./produtos');

const verificarFornecedor = async (req, resp, proximo) => {
    try{
        const id = req.params.idFornecedor;
        const fornecedor = new Fornecedor({id: id});
        await fornecedor.carregar();
        req.fornecedor = fornecedor;
        proximo()
    }catch (erro){
        proximo(erro);
    }
}

roteador.use('/:idFornecedor/produtos', verificarFornecedor, roteadorProdutos);

module.exports = roteador;