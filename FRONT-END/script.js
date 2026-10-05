/**
 * MANTENDO A POO NO FRONTEND
 * ABSTRAÇÃO
 */

class Produto {

    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        if (!nome || preco <= 0 || quantidade <= 0) {
            throw new Error("Dados inválidos para o produto");
        }

        this.id = null;
        this.nome = nome;
        this.#preco = parseFloat(preco);
        this.#quantidade = parseInt(quantidade);
    }

    get preco() {
        return this.#preco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    valorTotal() {
        return this.#preco * this.#quantidade;
    }

    toJSON() {

        return {
            nome: this.nome,
            preco: this.#preco,
            quantidade: this.#quantidade
        };

    }
}

// ==============================
// URL DA API
// ==============================

const API_URL = "/produtos";

// ==============================
// ADICIONAR PRODUTO
// ==============================

document
    .getElementById("produto-form")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const preco = document.getElementById("preco").value;
        const quantidade = document.getElementById("quantidade").value;

        try {

            const novoProduto = new Produto(
                nome,
                preco,
                quantidade
            );

            const resposta = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(
                    novoProduto.toJSON()
                )

            });

            if (!resposta.ok) {

                const erro = await resposta.json();

                throw new Error(
                    erro.erro || "Erro ao salvar o produto no servidor."
                );
            }

            e.target.reset();

            await renderizarTabela();

        } catch (erro) {

            alert(erro.message);

        }

    });

// ==============================
// BUSCAR PRODUTOS
// ==============================

async function renderizarTabela() {

    try {

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar produtos.");
        }

        const dadosBrutosDoServidor =
            await resposta.json();

        const tabela =
            document.querySelector("#tabela-produtos tbody");

        tabela.innerHTML = "";

        let totalAcumulado = 0;

        dadosBrutosDoServidor.forEach((dados) => {

            const produto = new Produto(
                dados.nome,
                dados.preco,
                dados.quantidade
            );

            produto.id = dados.id;

            totalAcumulado += produto.valorTotal();

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${produto.nome}</td>

                <td>
                    R$ ${produto.preco.toFixed(2)}
                </td>

                <td>
                    ${produto.quantidade}
                </td>

                <td>
                    R$ ${produto.valorTotal().toFixed(2)}
                </td>

                <td>

                    <button
                        class="btn-excluir"
                        onclick="excluirProduto(${produto.id}, '${produto.nome}')">

                        Excluir

                    </button>

                </td>
            `;

            tabela.appendChild(row);

        });

        document.getElementById("total-estoque").textContent =
            `Total em estoque: R$ ${totalAcumulado.toFixed(2)}`;

    } catch (erro) {

        console.error(
            "Erro ao buscar dados no servidor:",
            erro
        );

    }

}

// ==============================
// EXCLUIR UM PRODUTO
// ==============================

async function excluirProduto(id, nome) {

    if (!confirm(`Deseja excluir o produto "${nome}"?`)) {
        return;
    }

    try {

        const resposta = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!resposta.ok) {

            const erro = await resposta.json();

            throw new Error(
                erro.erro || "Erro ao excluir produto."
            );
        }

        await renderizarTabela();

    } catch (erro) {

        console.error(
            "Erro ao excluir produto:",
            erro
        );

        alert(erro.message);

    }

}

// ==============================
// LIMPAR TODA A TABELA
// ==============================

document
    .getElementById("limpar-tabela")
    .addEventListener("click", async function () {

        if (!confirm("Deseja mesmo limpar toda a tabela?")) {
            return;
        }

        try {

            const resposta = await fetch(
                API_URL,
                {
                    method: "DELETE"
                }
            );

            if (!resposta.ok) {

                const erro = await resposta.json();

                throw new Error(
                    erro.erro || "Erro ao limpar a tabela."
                );
            }

            await renderizarTabela();

        } catch (erro) {

            console.error(
                "Erro ao limpar dados:",
                erro
            );

            alert(erro.message);

        }

    });

// ==============================
// CARREGAR OS DADOS
// ==============================

renderizarTabela();