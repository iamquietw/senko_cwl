const {Keyboard} = require("vk-io");
const { VK } = require("vk-io");
const Rcon = require("modern-rcon")

const ip = "IP сервера";
const serverPort = 25575;
const password = "Пароль от RCON";

const rcon = new Rcon(ip, port=serverPort, password);

const vk = new VK({
    token: "Токен группы ВК"
})
vk.updates.on(`message`, async (context) => {
    if(context.isOutbox && context.text.startsWith("Новый ответ в опросе")) {
        const messageByLines = context.text.split("\n")
        const userNickname = messageByLines[5].replace("A: ", "");
        const builder = Keyboard.builder();
        builder.
        textButton({
            label: "Да",
            payload: {
                type: "confirm",
                user: messageByLines[1].split("vk.com/id")[1],
                nick: userNickname
            }
        })
            .row()
            .textButton({
                label: "Нет",
                payload: {
                    type: "deny",
                    user: messageByLines[1].split("vk.com/id")[1],
                }
            })
            .row()
            .inline(true)
        await vk.api.messages.send({
            peer_id: 2000000003,
            message: context.text,
            random_id: 0,
            keyboard: builder
        })
    } else if(context.peerId === 2000000003 && context.messagePayload) {
        switch (context.messagePayload["type"]) {
            case "confirm":
                await rcon.send(`sl add ${context.messagePayload["nick"]}`)
                    .then(response => {
                        context.send(`Ответ сервера: ${response}`
                            .replace("§6", "")
                            .replace("§f ", " ")
                            .replace("§f", "")
                            .replace("§c", ""))
                    })
                await vk.api.messages.send({
                    message: "Ваша заявка принята!\n" +
                        "IP: senkocraft.ru\n" +
                        "Дискорд:https://discord.gg/76h9VdqE3B\n" +
                        "(рекомендуется зайти в Дискорд сервер)",
                    peer_id: context.messagePayload["user"],
                    random_id: 0
                })
                break
            case "deny":
                await vk.api.messages.send({
                    message: "К сожалению, Ваша заявка не принята.",
                    peer_id: context.messagePayload["user"],
                    random_id: 0
                })
                break
        }
    }
})

vk.updates.start()
    .then(() => {
        rcon.connect().catch(err => {
            console.log(`Ошибка при подключении к серверу:`);
            return console.log(err);
        })
    })
    .catch(console.log)
