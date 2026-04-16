const express = require("express");
const app = express();
const { Client, GatewayIntentBits } = require("discord.js");

app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;

client.once("ready", () => {
  console.log("🤖 Bot online");
});

app.get("/", (req, res) => {
  res.send(`
    <h2>Verificação</h2>
    <input id="codigo" placeholder="Código" />
    <button onclick="enviar()">Gerar código</button>
    <button onclick="confirmar()">Confirmar</button>

    <script>
      const id = new URLSearchParams(window.location.search).get("id");
      const fingerprint = navigator.userAgent;

      function enviar() {
        fetch("/enviar", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ discordId: id, fingerprint })
        });
      }

      function confirmar() {
        fetch("/confirmar", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            discordId: id,
            codigo: document.getElementById("codigo").value
          })
        });
      }
    </script>
  `);
});

app.post("/enviar", async (req, res) => {
  console.log("Código solicitado:", req.body);
  res.json({ ok: true });
});

app.post("/confirmar", async (req, res) => {
  const { discordId } = req.body;

  const guild = client.guilds.cache.first();
  if (!guild) return res.json({ ok: false });

  try {
    const member = await guild.members.fetch(discordId);

    let role = guild.roles.cache.find(r => r.name === "Verificado");

    if (!role) {
      role = await guild.roles.create({
        name: "Verificado",
        color: "Green"
      });
    }

    await member.roles.add(role);

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
});

app.listen(3000, () => {
  console.log("🌐 Site rodando");
});

client.login(TOKEN);
