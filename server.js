require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/teste", (req, res) => {
    res.status(200).send("Vercel funcionando!");
});
// ==============================
// CONEXÃO COM O SUPABASE
// ==============================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
);

// ==============================
// GET - BUSCAR PRODUTOS
// ==============================

app.get("/produtos", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("produtos")
            .select("id, nome, preco, quantidade")
            .order("id", { ascending: true });

        if (error) {
            console.error("Erro ao buscar produtos:", error);
            return res.status(500).json({
                erro: "Erro ao buscar produtos."
            });
        }

        res.status(200).json(data);

    } catch (erro) {
        console.error("Erro:", erro);
        res.status(500).json({
            erro: "Erro ao buscar produtos."
        });
    }
});

// ==============================
// POST - CADASTRAR PRODUTO
// ==============================

app.post("/produtos", async (req, res) => {
    const { nome, preco, quantidade } = req.body;

    const p = parseFloat(preco);
    const q = parseInt(quantidade, 10);

    if (!nome || isNaN(p) || isNaN(q) || p <= 0 || q <= 0) {
        return res.status(400).json({
            erro: "Dados inválidos enviados para o servidor."
        });
    }

    try {
        const { data, error } = await supabase
            .from("produtos")
            .insert([
                {
                    nome: nome,
                    preco: p,
                    quantidade: q
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Erro ao salvar produto:", error);
            return res.status(500).json({
                erro: "Erro ao salvar produto."
            });
        }

        res.status(201).json(data);

    } catch (erro) {
        console.error("Erro:", erro);
        res.status(500).json({
            erro: "Erro interno ao salvar produto."
        });
    }
});

// ==============================
// DELETE - EXCLUIR PRODUTO
// ==============================

app.delete("/produtos/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from("produtos")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            console.error("Erro ao deletar produto:", error);
            return res.status(500).json({
                erro: "Erro ao deletar produto."
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                erro: "Produto não encontrado."
            });
        }

        res.status(204).send();

    } catch (erro) {
        console.error("Erro:", erro);
        res.status(500).json({
            erro: "Erro ao deletar produto."
        });
    }
});

// ==============================
// DELETE - LIMPAR TODOS
// ==============================

app.delete("/produtos", async (req, res) => {
    try {
        const { error } = await supabase
            .from("produtos")
            .delete()
            .not("id", "is", null);

        if (error) {
            console.error("Erro ao limpar produtos:", error);
            return res.status(500).json({
                erro: "Erro ao limpar banco de dados."
            });
        }

        res.status(204).send();

    } catch (erro) {
        console.error("Erro:", erro);
        res.status(500).json({
            erro: "Erro ao limpar banco de dados."
        });
    }
});

// ==============================
// FRONT-END
// ==============================

app.use(
    express.static(
        path.join(__dirname, "FRONT-END")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "FRONT-END", "index.html")
    );
});

// ==============================
// SERVIDOR
// ==============================

if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

// Para a Vercel
module.exports = app;