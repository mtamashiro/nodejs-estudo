const Modelo = require('./ModeloTabelaProduto');
const NaoEncontrado = require('../../../erros/NaoEncontrado');
const instancia = require('../../../banco-de-dados');

module.exports = {
    listar(idFornecedor){
        return Modelo.findAll({
            where: {
                fornecedor: idFornecedor
            },
            raw: true
        });
    },
    inserir(dados){
        return Modelo.create(dados)
    }
    ,remover(idProduto, idFornecedor){
        return Modelo.destroy({
            where: {
                id: idProduto,
                fornecedor: idFornecedor
            },
            raw: true
        });
    },
    async pegarPorid(idProduto, idFornecedor){
        const encontrado = await Modelo.findOne(
            {
                where: {
                    id: idProduto,
                    fornecedor: idFornecedor
                }
            }
            );

        if(!encontrado){
            throw new NaoEncontrado('Produto');
        }else{
            return encontrado;
        }
    },
    atualizar(dadosDoProduto, dadosParaAtualizar){
        return Modelo.update(
            dadosParaAtualizar,
            {
                where: dadosDoProduto
            }
        )
    },
    subtrair(idProduto, idFornecedor, campo, quantidade){
        return instancia.transaction(async transacao => {
           const produto = await Modelo.findOne({
               where: {
                   id: idProduto,
                   fornecedor: idFornecedor
               }
           });

           produto[campo] = quantidade;

           await produto.save();

           return produto;
        });

    }
}