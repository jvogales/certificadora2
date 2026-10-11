# Requisitos Funcionais — Plataforma Web Talkflix

## 1. Introdução

Os requisitos funcionais apresentados neste documento foram definidos a partir do planejamento do projeto de extensão Talkflix e refinados durante o levantamento de requisitos.

O sistema será composto por uma área pública e áreas autenticadas destinadas aos diferentes perfis de usuários: **administrador, monitor e aluno**.

No sistema, o perfil de **administrador** será destinado ao professor/coordenador responsável pelo projeto. Os monitores e alunos terão permissões específicas de acordo com suas funções no projeto.

Durante o refinamento dos requisitos, algumas funcionalidades originalmente previstas no planejamento foram simplificadas. As atividades serão disponibilizadas em formato PDF e realizadas fora da plataforma, não havendo correção automática, atribuição de notas ou registro das respostas dos alunos. O acompanhamento do progresso será realizado com base nas atividades que o aluno marcar manualmente como concluídas.

Além das atividades, a plataforma também disponibilizará **materiais de aula** utilizados durante as aulas, igualmente em formato PDF. Esses materiais terão finalidade de consulta e não serão considerados no cálculo do progresso.

---

# 2. Perfis de Usuário

A plataforma contará com três perfis de acesso:

### 2.1 Administrador

Perfil destinado ao **professor/coordenador responsável pelo projeto**.

Será responsável pelo gerenciamento dos usuários e pela supervisão geral dos conteúdos cadastrados na plataforma.

### 2.2 Monitor

Integrante responsável pelo gerenciamento dos conteúdos disponibilizados na plataforma e pelo acompanhamento do progresso dos alunos.

Os monitores poderão gerenciar referências audiovisuais, materiais de aula e atividades.

### 2.3 Aluno

Participante do projeto que terá acesso às funcionalidades destinadas aos alunos, incluindo o repositório, os materiais de aula, as referências audiovisuais, as atividades e o acompanhamento do próprio progresso.

---

# 3. Requisitos Funcionais

## 3.1 Área Pública

### RF01 — Informações sobre o projeto

O sistema deve disponibilizar publicamente informações sobre o projeto Talkflix, incluindo:

- proposta;
- funcionamento;
- horários;
- formas de participação;
- canais de contato;
- informações sobre as atividades desenvolvidas.

### RF02 — Cadastro de interessados

O sistema deve permitir que pessoas interessadas cadastrem seu endereço de e-mail para receber notificações sobre a abertura de novas turmas e períodos de inscrição.

O cadastro terá caráter informativo e não representará uma inscrição ou garantia de vaga no projeto, considerando que as turmas possuem quantidade limitada de participantes.

---

# 4. Repositório de Materiais

O repositório será destinado à organização dos conteúdos utilizados e referenciados pelo projeto.

Os conteúdos serão divididos em três categorias:

1. **Referências audiovisuais**;
2. **Materiais de aula**;
3. **Atividades**.

O sistema não deverá armazenar ou reproduzir filmes, séries, músicas ou outros conteúdos audiovisuais de terceiros. Serão armazenadas apenas as informações de referência desses conteúdos.

## RF03 — Controle de acesso ao repositório

O sistema deve restringir o acesso ao repositório aos **alunos e monitores autenticados**.

A área pública não deverá disponibilizar diretamente os materiais e referências armazenados no repositório.

## RF04 — Gerenciamento de referências audiovisuais

O sistema deve permitir o cadastro, consulta, edição e exclusão das referências dos conteúdos audiovisuais utilizados nas atividades do projeto.

As informações cadastradas poderão incluir:

- título;
- tipo de conteúdo;
- ano;
- trecho utilizado;
- temporada, quando aplicável;
- episódio, quando aplicável;
- artista ou autor, quando aplicável;
- plataforma ou fonte oficial;
- descrição.

O sistema não deverá armazenar ou reproduzir os conteúdos audiovisuais de terceiros.

## RF05 — Gerenciamento de materiais de aula

O sistema deve permitir o cadastro, consulta, edição e exclusão do link de acesso aos arquivos PDF correspondentes aos materiais de apoio utilizados durante as aulas, hospedados em serviço de armazenamento externo (ex: Google Drive). O sistema não armazenará os arquivos diretamente.

Os materiais de aula deverão estar disponíveis para consulta e download pelos alunos autenticados, através do link cadastrado.

Os materiais de aula não participarão do cálculo do progresso do aluno.

## RF06 — Gerenciamento de atividades

O sistema deve permitir o cadastro, consulta, edição e exclusão do link de acesso aos arquivos PDF correspondentes às atividades propostas pelos monitores, hospedados em serviço de armazenamento externo (ex: Google Drive). O sistema não armazenará os arquivos diretamente.

As atividades deverão estar disponíveis para download pelos alunos autenticados, através do link cadastrado.

Após realizar a atividade fora da plataforma, o aluno poderá registrá-la como concluída no sistema.

## RF07 — Busca e filtragem de materiais

O sistema deve permitir a busca e filtragem dos conteúdos cadastrados no repositório, utilizando categorias e outras informações relevantes para facilitar sua localização e consulta.

---

# 5. Autenticação e Controle de Acesso

## RF08 — Autenticação de usuários

O sistema deve permitir a autenticação de usuários previamente cadastrados, de acordo com seu perfil de acesso.

Os perfis de usuário serão:

- **Administrador:** professor/coordenador responsável pela administração da plataforma;
- **Monitor:** integrante responsável pelo gerenciamento dos conteúdos e acompanhamento dos alunos;
- **Aluno:** participante do projeto que terá acesso aos materiais, referências e atividades disponibilizados.

## RF09 — Controle de permissões

O sistema deve restringir as funcionalidades e operações disponíveis de acordo com o perfil do usuário autenticado.

Cada perfil deverá possuir as permissões necessárias para o desempenho de suas funções.

O cadastro de alunos e monitores será realizado previamente pelo administrador.

---

# 6. Área do Aluno

## RF10 — Acesso aos materiais de aula

O sistema deve permitir que o aluno autenticado consulte e baixe os materiais de apoio utilizados nas aulas, disponibilizados pelos monitores em formato PDF.

Os materiais de aula terão finalidade de consulta e não exigirão qualquer registro de conclusão.

## RF11 — Acesso às atividades

O sistema deve permitir que o aluno autenticado consulte e baixe as atividades disponibilizadas pelos monitores em formato PDF.

As atividades serão realizadas fora da plataforma, não sendo necessário que o sistema disponibilize um formulário para responder às questões.

## RF12 — Registro de conclusão das atividades

O sistema deve permitir que o aluno registre manualmente a conclusão de uma atividade disponibilizada em PDF.

A marcação de conclusão deverá ser associada ao aluno e à respectiva atividade.

Uma mesma atividade não deverá ser registrada como concluída mais de uma vez pelo mesmo aluno, salvo se a marcação anterior tiver sido desfeita.

O sistema deve permitir que o aluno desfaça o registro de conclusão de uma atividade marcada anteriormente, podendo registrá-la como concluída novamente quando desejar.

## RF13 — Histórico e progresso do aluno

O sistema deve registrar o histórico das atividades marcadas como concluídas pelo aluno e apresentar seu percentual de progresso com base na quantidade de atividades concluídas em relação às atividades disponíveis.

O progresso poderá ser apresentado, por exemplo, no formato:

> **3 de 5 atividades concluídas — 60%**

O percentual poderá ser calculado pela seguinte fórmula:

> **Progresso = (atividades concluídas / atividades disponíveis) × 100**

O progresso apresentado representará a participação e a conclusão declarada das atividades, não correspondendo a uma avaliação automática do desempenho ou domínio da língua inglesa.

---

# 7. Área do Monitor

## RF14 — Gerenciamento de referências audiovisuais

O sistema deve permitir que qualquer monitor cadastrado:

- cadastre referências audiovisuais;
- consulte referências audiovisuais;
- edite referências audiovisuais;
- exclua referências audiovisuais.

O gerenciamento não será restrito ao monitor que realizou o cadastro original.

## RF15 — Gerenciamento de materiais de aula

O sistema deve permitir que qualquer monitor cadastrado:

- cadastre o link de acesso aos materiais de apoio;
- consulte materiais;
- edite materiais;
- exclua materiais.

Os materiais serão disponibilizados em formato PDF.

O gerenciamento não será restrito ao monitor que realizou o cadastro original.

## RF16 — Gerenciamento de atividades

O sistema deve permitir que qualquer monitor cadastrado:

- crie atividades;
- cadastre atividades;
- consulte atividades;
- edite atividades;
- exclua atividades;
- cadastre o link de acesso ao respectivo arquivo PDF.

As atividades cadastradas deverão ficar disponíveis para download pelos alunos autenticados.

O gerenciamento não será restrito ao monitor que realizou o cadastro original.

## RF17 — Consulta ao progresso dos alunos

O sistema deve permitir que o monitor consulte o progresso dos alunos com base nas atividades registradas como concluídas.

O monitor poderá consultar:

- quais atividades foram concluídas por cada aluno;
- o percentual de progresso de cada aluno;
- o histórico de conclusões das atividades.

O progresso não representará uma avaliação automática de desempenho ou domínio da língua inglesa.

---

# 8. Administração

## RF18 — Gerenciamento de usuários

O sistema deve permitir que o usuário com perfil de administrador, correspondente ao professor/coordenador do projeto:

- cadastre usuários com perfil de aluno;
- cadastre usuários com perfil de monitor;
- remova usuários;
- gerencie o acesso dos participantes à plataforma.

O cadastro prévio realizado pelo administrador será necessário para permitir o acesso às áreas autenticadas da plataforma.

## RF19 — Gerenciamento geral de conteúdos

O sistema deve permitir que o administrador altere ou exclua qualquer:

- referência audiovisual;
- material de aula;
- atividade.

Essa permissão deverá permitir ao administrador supervisionar e manter a organização geral do acervo e dos conteúdos do projeto.

---

# 9. Regras de Negócio

As regras de negócio complementam os requisitos funcionais e definem condições que devem ser respeitadas pelo sistema.

### RN01 — Perfis de acesso

O sistema possuirá três perfis:

- Administrador;
- Monitor;
- Aluno.

### RN02 — Administrador

O perfil de administrador será exercido pelo professor/coordenador responsável pelo projeto.

### RN03 — Cadastro de usuários

Alunos e monitores deverão ser previamente cadastrados pelo administrador para acessar as áreas autenticadas.

### RN04 — Login dos alunos e monitores

Alunos e monitores vinculados à UTFPR utilizarão o RA (registro acadêmico) como identificador de login. Participantes externos ao projeto utilizarão um identificador de matrícula definido pelo administrador no momento do cadastro, seguindo a mesma regra de unicidade.

### RN05 — Login do administrador

O administrador utilizará um login previamente cadastrado para acesso à área administrativa.

### RN06 — Atividades em PDF

As atividades serão disponibilizadas em formato PDF e realizadas fora da plataforma.

### RN07 — Conclusão de atividades

O aluno deverá marcar manualmente uma atividade como concluída após realizá-la.

### RN08 — Progresso

O progresso será calculado com base na quantidade de atividades concluídas em relação à quantidade de atividades disponíveis.

### RN09 — Materiais de aula

Materiais de aula possuem finalidade de consulta e não serão contabilizados como atividades concluídas.

### RN10 — Referências audiovisuais

A plataforma armazenará somente informações de referência sobre conteúdos audiovisuais de terceiros, não armazenando nem reproduzindo os conteúdos.

### RN11 — Gerenciamento pelos monitores

Qualquer monitor poderá criar, editar e excluir referências audiovisuais, materiais de aula e atividades, independentemente de quem realizou o cadastro original.

### RN12 — Gerenciamento pelo administrador

O administrador poderá alterar ou excluir qualquer conteúdo cadastrado na plataforma.

### RN13 — Conclusão única

Um aluno não poderá registrar a mesma atividade como concluída mais de uma vez.

### RN14 — Ausência de avaliação automática

A plataforma não realizará correção automática, não atribuirá notas e não armazenará as respostas das atividades.

### RN15 — Interpretação do progresso

O percentual de progresso representa a conclusão declarada das atividades pelo aluno e não deve ser interpretado como uma avaliação de desempenho ou domínio da língua inglesa.

### RN16 — Vínculo com refêrencia audiovisual

Toda atividade e todo material de aula deverão estar associados a uma referência audiovisual correspondente, não sendo permitido o cadastro de conteúdo desvinculado.
