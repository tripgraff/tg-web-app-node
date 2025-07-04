const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors')

const token = '7803264095:AAHGq6nz8KhsdB5AZxXyY7WRKiHdZkovTRA';

const webAppUrl = 'https://tripgraff.netlify.app'

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async(msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму йоу', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Ниже появится кнопка', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Открыть приложение', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

  if(msg?.web_app_data?.data) {
    try {
      const data = JSON. parse(msg?.web_app_data?.data)
      await bot.sendMessage(chatId, 'Спасибо за обратную связь !')
      await bot.sendMessage(chatId, 'Ваша страна:' + data?.country);
      await bot.sendMessage(chatId, 'Ваша улица:' + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
      }, 3000)
    } catch (e) {
      console.log(e);
    }
  }
});

app.post('/web-data', async (req, res) => {
  const {qureId, products, totalPrice} = req.body;
  try {
    await bot.answerWebAppQuery(qureId, {
      type: 'article',
      id: qureId,
      title: 'Успешная покупка',
      input_message_content: {message_text: 'Поздравляю с покупкой. Сумма покупки: ' + totalPrice}
    })
    return res.status(200).json({})
  } catch (e) {
    await bot.answerWebAppQuery(qureId, {
      type: 'article',
      id: qureId,
      title: 'Не удалось приобрести товар',
      input_message_content: {message_text: 'Не удалось приобрести товар'}
    })
    return res.status(500).json({})
  }
})

const PORT = 8000;
app.listen(PORT, () => console.log('server start on PORT ' + PORT))