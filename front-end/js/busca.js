/* =========================================================
   BUSCA, FILTRAGEM E ORDENAÇÃO (RF07)
   Aplicação de algoritmos e estruturas de dados (seção 3.5
   do planejamento):

   1. Normalização de texto: minúsculas e sem acentos, para que
      "musica" encontre "Música".
   2. Índice invertido: um Map que liga cada palavra ao conjunto
      (Set) de ids dos conteúdos que a contêm. Ele é montado uma
      vez; depois cada busca só consulta o índice, sem reler o
      texto de todos os conteúdos.
   3. Busca por prefixo: "sher" já encontra "Sherlock".
   4. Interseção de conjuntos: com várias palavras, o resultado
      precisa conter TODAS (lógica "E").
   5. Filtros combinados e ordenação com comparadores.
   ========================================================= */

const Busca = (() => {
  // "Música Britânica!" -> "musica britanica!"
  function normalizar(texto) {
    return String(texto ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  // "Inside the mind (TED)" -> ["inside", "the", "mind", "ted"]
  function tokenizar(texto) {
    return normalizar(texto)
      .split(/[^a-z0-9]+/)
      .filter((palavra) => palavra.length > 0);
  }

  // Campos de cada conteúdo que entram na busca
  function textoPesquisavel(item) {
    return [
      item.titulo,
      item.descricao,
      item.artista,
      item.trecho,
      item.ondeEncontrar,
      item.ano,
      Rotulos.tipo[item.tipo],
      Rotulos.categoria[item.categoria],
    ].join(" ");
  }

  class IndiceInvertido {
    constructor(itens) {
      this.indice = new Map(); // palavra -> Set de ids
      for (const item of itens) {
        for (const palavra of tokenizar(textoPesquisavel(item))) {
          if (!this.indice.has(palavra)) this.indice.set(palavra, new Set());
          this.indice.get(palavra).add(item.id);
        }
      }
    }

    // Ids de todos os conteúdos com alguma palavra que começa com o prefixo
    idsPorPrefixo(prefixo) {
      const resultado = new Set();
      for (const [palavra, ids] of this.indice) {
        if (palavra.startsWith(prefixo)) {
          for (const id of ids) resultado.add(id);
        }
      }
      return resultado;
    }

    // Devolve o Set de ids que atendem a TODAS as palavras da consulta,
    // ou null se a consulta estiver vazia (= não filtrar por texto)
    buscar(consulta) {
      const termos = tokenizar(consulta);
      if (termos.length === 0) return null;

      let resultado = null;
      for (const termo of termos) {
        const ids = this.idsPorPrefixo(termo);
        if (resultado === null) {
          resultado = ids;
        } else {
          // interseção: mantém só os ids presentes nos dois conjuntos
          resultado = new Set([...resultado].filter((id) => ids.has(id)));
        }
        if (resultado.size === 0) break; // nenhuma chance de achar mais nada
      }
      return resultado;
    }
  }

  /* Aplica todos os filtros de uma vez.
     filtros = { categoria, tipos: Set, apenasMeus, usuarioId, idsBusca } */
  function filtrar(itens, filtros) {
    return itens.filter((item) => {
      if (filtros.categoria && filtros.categoria !== "todos" && item.categoria !== filtros.categoria) return false;
      if (filtros.tipos && filtros.tipos.size > 0 && !filtros.tipos.has(item.tipo)) return false;
      if (filtros.apenasMeus && (!item.criadoPor || item.criadoPor.id !== filtros.usuarioId)) return false;
      if (filtros.idsBusca && !filtros.idsBusca.has(item.id)) return false;
      return true;
    });
  }

  const comparadores = {
    recentes: (a, b) => String(b.criadoEm || "").localeCompare(String(a.criadoEm || "")),
    antigos: (a, b) => String(a.criadoEm || "").localeCompare(String(b.criadoEm || "")),
    titulo: (a, b) => a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" }),
    // mais novos primeiro; quem não tem ano vai para o fim
    ano: (a, b) => (b.ano || 0) - (a.ano || 0),
  };

  // Ordena sem alterar o array original
  function ordenar(itens, criterio) {
    const comparar = comparadores[criterio] || comparadores.recentes;
    return [...itens].sort(comparar);
  }

  return { normalizar, tokenizar, IndiceInvertido, filtrar, ordenar };
})();
