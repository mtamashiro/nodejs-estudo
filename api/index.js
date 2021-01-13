const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const NaoEncontrado = require('./erros/NaoEncontrado');
const CampoInvalido = require('./erros/CampoInvalido');
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos')
const ValorNaoSuportado = require('./erros/ValorNaoSuportado');
const formatosAceitos = require('./Serializador').formatosAceitos;
const SerializadorErro = require('./Serializador').SerializadorErro;

app.use(bodyParser.json());

app.use((req, resp, proximo) => {
    let formatoRequisitado = req.header('Accept');

    if(formatoRequisitado === '*/*'){
        formatoRequisitado = 'application/json';
    }

    if(formatosAceitos.indexOf(formatoRequisitado) === -1){

        resp.status(406);
        resp.end();
    }else{
        resp.setHeader('Content-Type', formatoRequisitado);
        proximo();
    }
});

const roteador = require('./rotas/fornecedores')
app.use('/api/fornecedores', roteador)

app.use((erro, requisicao, resposta, proximo) => {
    let status = 500;

    if(erro instanceof NaoEncontrado){
        status = 404;
    }

    if(erro instanceof CampoInvalido || erro instanceof DadosNaoFornecidos){
        status = 400;
    }

    if(erro instanceof ValorNaoSuportado){
        status = 406;
    }

    resposta.status(status);

    const serializador = new SerializadorErro(
      resposta.getHeader('Content-Type')
    );
    resposta.send(
        serializador.serializar({
            mensagem: erro.message,
            id: erro.idErro
        })
    );
});

app.listen(config.get('api.porta'), () => console.log('API funcionando!'));
