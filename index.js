// const TelegramBot = require('node-telegram-bot-api');
// const express = require('express');
// const cors = require('cors');

// const token = '7803264095:AAHGq6nz8KhsdB5AZxXyY7WRKiHdZkovTRA';

// const webAppUrl = 'https://tripgraff.netlify.app'

// const bot = new TelegramBot(token, {polling: true});
// const app = express();

// app.use(express.json());
// app.use(cors());

// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const text = msg.text;

//     if(text === '/start') {
//         await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
//             reply_markup: {
//                 keyboard: [
//                     [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
//                 ]
//             }
//         })

//         await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
//                 ]
//             }
//         })
//     }

//     if(msg?.web_app_data?.data) {
//         try {
//             const data = JSON.parse(msg?.web_app_data?.data)
//             console.log(data)
//             await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
//             await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
//             await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

//             setTimeout(async () => {
//                 await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
//             }, 3000)
//         } catch (e) {
//             console.log(e);
//         }
//     }
// });

// app.post('/web-data', async (req, res) => {
//     const {queryId, products = [], totalPrice} = req.body;
//     try {
//         await bot.answerWebAppQuery(queryId, {
//             type: 'article',
//             id: queryId,
//             title: 'Успешная покупка',
//             input_message_content: {
//                 message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
//             }
//         })
//         return res.status(200).json({});
//     } catch (e) {
//         return res.status(500).json({})
//     }
// })

// const PORT = 8000;

// app.listen(PORT, () => console.log('server started on PORT ' + PORT))

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '7803264095:AAHGq6nz8KhsdB5AZxXyY7WRKiHdZkovTRA';
const webAppUrl = 'https://tripgfaff.netlify.app';

const bot = new TelegramBot(token, { polling: true });
const app = express();

// Настройка middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: ['https://tripgraff.netlify.app', 'https://web.telegram.org'],
    methods: ['POST', ' OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Заголовки:', req.headers);
    console.log('Тело запроса:', req.body);
    next();
});

// Обработка сообщений Telegram
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Заполнить форму', web_app: { url: webAppUrl + '/form' } }],
                ],
            },
        });

        await bot.sendMessage(chatId, 'Ниже появится кнопка', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Открыть приложение', web_app: { url: webAppUrl } }],
                ],
            },
        });
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            }, 3000);
        } catch (e) {
            console.error('Ошибка обработки web_app_data:', e);
        }
    }
});

// Обработка POST-запроса
app.post('/web-data', async (req, res) => {
    try {
        console.log('Получено тело запроса:', req.body); // Логирование для отладки
        if (!req.body) {
            console.error('Тело запроса отсутствует');
            return res.status(400).json({ error: 'Тело запроса отсутствует' });
        }

        const { queryId, products = [], totalPrice } = req.body;

        if (!queryId) {
            console.error('queryId отсутствует');
            return res.status(400).json({ error: 'queryId обязателен' });
        }

        console.log('Обработка данных:', { queryId, products, totalPrice });

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`,
            },
        });

        return res.status(200).json({ message: 'Успешно обработано' });
    } catch (e) {
        console.error('Ошибка в /web-data:', e.message, e.stack);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера', details: e.message });
    }
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Глобальная ошибка:', err.message, err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: err.message });
});

const PORT = 8000;
app.listen(PORT, () => console.log('Сервер запущен на порту ' + PORT));