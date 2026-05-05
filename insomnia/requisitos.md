# Documento de Requisitos — Sistema de Lista de Mercado Compartilhada - VaiComprar

## 1. Visão Geral

O sistema será uma aplicação **web e mobile** para criação e gerenciamento colaborativo de listas de compras de mercado.

Um usuário poderá criar uma **sala de compras**, compartilhar um **link de acesso** com outras pessoas e permitir que todos os participantes adicionem, editem, removam e acompanhem os itens da lista em tempo real ou quase em tempo real.

A aplicação também terá um modo específico para quando alguém estiver indo fazer as compras, permitindo marcar itens como comprados, visualizar itens pendentes e registrar o valor total final da compra.

---

## 2. Objetivo do Sistema

Facilitar a organização de compras de mercado em grupo, permitindo que famílias, amigos, colegas de casa ou equipes compartilhem uma lista única, atualizada e acessível por link.

---

## 3. Atores do Sistema

| Ator            | Descrição                                                        |
| --------------- | ---------------------------------------------------------------- |
| Criador da sala | Usuário que cria uma sala/lista de compras                       |
| Participante    | Pessoa que acessa a sala pelo link compartilhado                 |
| Comprador       | Participante que seleciona a opção “Estou indo fazer as compras” |

---

# 4. Requisitos Funcionais

## RF01 — Criar sala de compras

O sistema deve permitir que um usuário crie uma sala de compras.

## RF02 — Gerar link compartilhável

O sistema deve gerar um link único para cada sala criada.

## RF03 — Acessar sala por link

O sistema deve permitir que outros usuários acessem uma sala através do link compartilhado.

## RF04 — Visualizar lista de compras

O sistema deve exibir todos os itens cadastrados na sala.

## RF05 — Adicionar item à lista

O sistema deve permitir adicionar itens de compra, informando pelo menos:

* Nome do item;
* Quantidade;
* Categoria.

Exemplo: Arroz — 5 kg — Comida.

## RF06 — Editar item da lista

O sistema deve permitir que qualquer participante da sala edite um item existente.

## RF07 — Excluir item da lista

O sistema deve permitir que qualquer participante da sala exclua um item da lista.

## RF08 — Definir categoria do item

O sistema deve permitir classificar os itens por categorias, como:

* Comida;
* Limpeza;
* Higiene;
* Dia a dia;
* Bebidas;
* Outros.

## RF09 — Definir data prevista da compra

O sistema deve permitir informar uma data prevista para realização das compras.

## RF10 — Marcar opção “Estou indo fazer as compras”

O sistema deve permitir que um participante indique que está indo realizar as compras.

## RF11 — Abrir tela de compras em andamento

Ao selecionar “Estou indo fazer as compras”, o sistema deve abrir uma tela específica com a lista de itens pendentes.

## RF12 — Marcar item como comprado

O sistema deve permitir marcar um item como comprado através de checkbox.

## RF13 — Separar itens pendentes e comprados

O sistema deve exibir os itens ainda não comprados em uma seção principal e os itens já comprados em uma seção separada abaixo.

## RF14 — Informar valor total da compra

Ao finalizar as compras, o sistema deve permitir informar o valor total gasto.

## RF15 — Salvar histórico da compra

O sistema deve salvar:

* Data da compra;
* Valor total;
* Itens comprados;
* Itens não comprados;
* Participante responsável pela compra, se houver identificação.

## RF16 — Visualizar compras anteriores

O sistema deve permitir consultar compras já finalizadas daquela sala.

## RF17 — Atualizar status dos itens

O sistema deve permitir alterar o status dos itens entre:

* Pendente;
* Comprado.

## RF18 — Sincronizar alterações entre participantes

O sistema deve atualizar as informações da sala para todos os participantes.

## RF19 — Remover participante da sala

Opcionalmente, o sistema pode permitir remover participantes da sala.

## RF20 — Encerrar sala

O sistema pode permitir que a sala seja encerrada ou arquivada.

---

# 5. Requisitos Não Funcionais

## RNF01 — Plataforma

O sistema deve funcionar em navegadores web e dispositivos mobile.

## RNF02 — Responsividade

A interface deve se adaptar a celulares, tablets e desktops.

## RNF03 — Usabilidade

O sistema deve ser simples, direto e fácil de usar, mesmo por pessoas com pouca familiaridade com tecnologia.

## RNF04 — Desempenho

As telas principais devem carregar rapidamente, preferencialmente em até 2 segundos em conexões comuns.

## RNF05 — Disponibilidade

O sistema deve estar disponível para acesso sempre que o usuário precisar consultar ou editar a lista.

## RNF06 — Segurança do link

Cada sala deve possuir um link único e difícil de adivinhar.

## RNF07 — Controle de acesso

Somente pessoas com o link da sala devem conseguir acessar a lista.

## RNF08 — Integridade dos dados

O sistema deve evitar perda de informações durante edições simultâneas.

## RNF09 — Persistência dos dados

As listas, itens e históricos de compras devem ficar salvos mesmo após o usuário fechar o navegador ou aplicativo.

## RNF10 — Compatibilidade

O sistema deve funcionar nos principais navegadores modernos, como Chrome, Edge, Firefox e Safari.

## RNF11 — Acessibilidade

O sistema deve possuir boa legibilidade, contraste adequado e navegação simples por toque.

## RNF12 — Escalabilidade

O sistema deve permitir várias salas e vários participantes sem comprometer o funcionamento.

## RNF13 — Feedback visual

O sistema deve informar claramente quando um item for adicionado, editado, excluído ou marcado como comprado.

## RNF14 — Prevenção de erros

O sistema deve solicitar confirmação antes de excluir itens importantes ou finalizar uma compra.

## RNF15 — Organização visual

Os itens devem ser organizados por status, categoria ou ordem de criação.

---

# 6. Regras de Negócio

## RN01 — Acesso por sala

Cada lista pertence a uma sala específica.

## RN02 — Edição colaborativa

Todos os participantes da sala podem adicionar, editar, excluir e marcar itens.

## RN03 — Item obrigatório

Um item deve ter, no mínimo, nome e quantidade.

## RN04 — Compra em andamento

Quando um usuário clicar em “Estou indo fazer as compras”, ele acessa uma tela focada apenas no acompanhamento da compra.

## RN05 — Finalização da compra

Uma compra só pode ser finalizada após informar o valor total gasto.

## RN06 — Histórico

Após finalizar uma compra, os dados devem ser armazenados no histórico da sala.

---

# 7. Principais Telas do Sistema

## Tela 1 — Criação da sala

Permite criar uma nova sala e gerar o link de compartilhamento.

## Tela 2 — Sala/lista compartilhada

Exibe os itens da lista e permite adicionar, editar ou excluir compras.

## Tela 3 — Adicionar/editar item

Formulário para cadastrar ou atualizar item, quantidade e categoria.

## Tela 4 — Compra em andamento

Tela usada por quem está no mercado, com checkboxes para marcar itens comprados.

## Tela 5 — Finalização da compra

Permite informar o valor total gasto e salvar o histórico.

## Tela 6 — Histórico de compras

Exibe compras anteriores, valores e itens comprados.

---
