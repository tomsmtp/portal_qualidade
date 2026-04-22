export const recomendacoes = [
    {
        id: 1,
        nome: "TIAMETOXAM + LAMBDA-CIALOTRINA",
        descricao: "TIAMETOXAM + LAMBDA-CIALOTRINA - 2,0 l/há + BIOLOGICO TMT + BIOLOGICO ON FARM BACTERIA + BIOLOGICO ON FARM FUNGOS + EXPERTGROW"
    },
    {
        id: 2,
        nome: "FIPRONIL + BIFENTRINA",
        descricao: "FIPRONIL + BIFENTRINA + BIOLOGICO TMT + BIOLOGICO ON FARM BACTERIA + BIOLOGICO ON FARM FUNGOS + EXPERTGROW"
    },
    {
        id: 3,
        nome: "IMIDACLOPRID + BIFENTRINA",
        descricao: "IMIDACLOPRID + BIFENTRINA + IOLÓGICO TMT + BIOLÓGICO ON FARM BACTERIA + BACTÉRIA ON FARM FUNGOS + EXPERTGROW"
    },
    {
        id: 4,
        nome: "ACETAMIPRIDO + BIFENTRINA",
        descricao: "ACETAMIPRIDO + BIFENTRINA + BIOLÓGICO TMT + BIOLÓGICO ON FARM BACTERIA + BACTÉRIA ON FARM FUNGOS + EXPERTGROW"
    }
];

export const getRecomendacaoById = (id) => recomendacoes.find(r => r.id === id);
export const getRecomendacoes = () => recomendacoes.map(r => r.descricao);