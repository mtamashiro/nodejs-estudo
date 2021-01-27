const roteador = require('express').Router({mergeParams:true});
const Tabela = require('./TabelaProduto');
const Produto = require('./Produto');
const Serializador = require('../../../Serializador').SerializadorProduto;

roteador.options('/', (requisicao, resposta) => {
    resposta.set('Acess-Control-Allow-Methods', 'GET,POST');
    resposta.set('Acess-Control-Allow-Headers', 'Content-Type');
    resposta.status(204).end();
});

roteador.options('/:idProduto', (requisicao, resposta) => {
    resposta.set('Acess-Control-Allow-Methods', 'GET,PUT,DELETE,HEAD');
    resposta.set('Acess-Control-Allow-Headers', 'Content-Type');
    resposta.status(204).end();
});

roteador.options('/:idProduto/diminuir-estoque', (requisicao, resposta) => {
    resposta.set('Acess-Control-Allow-Methods', 'POST');
    resposta.set('Acess-Control-Allow-Headers', 'Content-Type');
    resposta.status(204).end();
});


roteador.get('/', async (req, resp) => {
    const produtos = await Tabela.listar(req.fornecedor.id);
    const serializador = new Serializador(
        resp.getHeader('Content-Type')
    )
    resp.send(serializador.serializar(produtos));
});

roteador.post('/', async (req, resp, proximo) => {
    try{
        const idFornecedor = req.fornecedor.id;
        const corpo = req.body;
        const dados = Object.assign({}, corpo, {fornecedor: idFornecedor});

        const produto = new Produto(dados);
        await produto.criar();

        const serializador = new Serializador(
            resp.getHeader('Content-Type')
        )
        resp.set('Etag', produto.versao);
        const timestamp = (new Date(produto.dataAtualizacao)).getTime();
        resp.set('LastModified', timestamp);
        resp.set('Location', `/api/fornecedores/${produto.fornecedor}/produtos/${produto.id}`);
        resp.status(201).send(serializador.serializar(produto));
    }catch (erro){
        proximo(erro);
    }
});

roteador.delete('/:id', async (req, resp) => {
    const dados = {
        id: req.params.id,
        fornecedor: req.fornecedor.id
    }

    const produto = new Produto(dados);
    await produto.apagar();
    resp.status(204).end();
});

roteador.get('/:id', async(req, resp, proximo) => {
    try{
        const dados = {
            id: req.params.id,
            fornecedor: req.fornecedor.id
        }

        const produto = new Produto(dados);
        await produto.carregar();

        const serializador = new Serializador(
            resp.getHeader('Content-Type'),
                ['preco', 'estoque', 'fonecedor', 'dataCriacao', 'dataAtualizacao', 'versao']
        )

        resp.set('Etag', produto.versao);
        const timestamp = (new Date(produto.dataAtualizacao)).getTime();
        resp.set('LastModified', timestamp);

        resp.status(200).send(serializador.serializar(produto));
    }catch (erro){
        proximo(erro);
    }
});

roteador.head('/:id', async (requisicao, resposta, proximo) => {
    try{
        const dados = {
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
        }

        const produto = new Produto(dados);
        await produto.carregar();

        resposta.set('Etag', produto.versao);
        const timestamp = (new Date(produto.dataAtualizacao)).getTime();
        resposta.set('LastModified', timestamp);

        resposta.status(200);
        resposta.end();

    }catch (erro){
        proximo(erro);
    }
});


roteador.put('/:id', async (requisicao, resposta, proximo) => {
    try{
        const dados = Object.assign(
            {},
            requisicao.body,
            {
                id: requisicao.params.id,
                fornecedor: requisicao.fornecedor.id,
            }
        );

        const produto = new Produto(dados);
        await produto.atualizar();
        await produto.carregar();
        resposta.set('Etag', produto.versao);
        const timestamp = (new Date(produto.dataAtualizacao)).getTime();
        resposta.set('LastModified', timestamp);
        resposta.set('Location', `/api/fornecedores/${produto.fornecedor}/produtos/${produto.id}`);
        resposta.status(204).end();
    }catch (erro){
        proximo(erro);
    }
});

roteador.post('/:id/diminuir-estoque', async (requisicao, resposta, proximo) => {
    const produto = new Produto({
        id: requisicao.params.id,
        fornecedor: requisicao.fornecedor.id
    });

    try{
        await produto.carregar();
        produto.estoque = produto.estoque - requisicao.body.quantidade;
        produto.diminuirEstoque();
        await produto.carregar();
        resposta.set('Etag', produto.versao);
        const timestamp = (new Date(produto.dataAtualizacao)).getTime();
        resposta.set('LastModified', timestamp);
        resposta.set('Location', `/api/fornecedores/${produto.fornecedor}/produtos/${produto.id}`);
        resposta.status(204);
        resposta.end();
    }catch (erro){
        proximo(erro);
    }



});



module.exports = roteador