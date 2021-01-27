class NaoEncontrado extends Error{
    constructor(item) {
        const msg = `${item} não foi encontrado`;
        super(msg);
        this.name = 'NaoEncontrado';
        this.idErro = 0;
    }
}

module.exports = NaoEncontrado;