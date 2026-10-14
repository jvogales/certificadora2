/* =========================================================
   VALIDAÇÃO DOS FORMULÁRIOS (seção 3.5: "validação de dados")
   Recebe os dados do formulário e devolve { campo: "mensagem" }.
   Objeto vazio = tudo certo.

   As regras obrigatórias são as mesmas do Back-End
   (referencia.service.js e conteudos.service.js); validar aqui
   evita mandar ao servidor um formulário que ele vai recusar.
   ========================================================= */

const Validacao = (() => {
  const ANO_MINIMO = 1900;
  const TIPOS = ["serie", "filme", "musica", "outro"];

  function vazio(valor) {
    return valor === undefined || valor === null || String(valor).trim() === "";
  }

  function inteiroPositivo(valor) {
    return /^\d+$/.test(String(valor)) && Number(valor) > 0;
  }

  function urlValida(valor) {
    try {
      const url = new URL(valor);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  function validarConteudo(dados) {
    const erros = {};
    const categoria = dados.categoria;

    if (vazio(dados.titulo)) erros.titulo = "Informe o nome ou título.";
    else if (dados.titulo.trim().length < 2) erros.titulo = "O título precisa ter pelo menos 2 caracteres.";

    if (categoria === "referencia") {
      if (!TIPOS.includes(dados.tipo)) erros.tipo = "Escolha o tipo de material.";

      if (!vazio(dados.ano)) {
        const anoMaximo = new Date().getFullYear() + 1;
        if (!inteiroPositivo(dados.ano) || dados.ano < ANO_MINIMO || dados.ano > anoMaximo) {
          erros.ano = `Informe um ano entre ${ANO_MINIMO} e ${anoMaximo}.`;
        }
      }

      // Back-End: série exige temporada e episódio; música exige artista
      if (dados.tipo === "serie") {
        if (!inteiroPositivo(dados.temporada)) erros.temporada = "Informe a temporada (número maior que zero).";
        if (!inteiroPositivo(dados.episodio)) erros.episodio = "Informe o episódio (número maior que zero).";
      }
      if (dados.tipo === "musica" && vazio(dados.artista)) erros.artista = "Informe o autor ou artista.";

      if (vazio(dados.ondeEncontrar)) erros.ondeEncontrar = "Informe onde o conteúdo pode ser encontrado.";
      if (!vazio(dados.link) && !urlValida(dados.link)) erros.link = "Link inválido. Use um endereço começando com https://";
    }

    // Material e atividade: link do PDF e referência são obrigatórios (RF05, RF06)
    if (categoria === "material" || categoria === "atividade") {
      if (vazio(dados.link)) erros.link = "Informe o link do PDF (ex.: Google Drive).";
      else if (!urlValida(dados.link)) erros.link = "Link inválido. Use um endereço começando com https://";
      if (vazio(dados.referenciaId)) erros.referenciaId = "Escolha a referência audiovisual usada.";
    }

    return erros;
  }

  return { validarConteudo };
})();
