# Аутентифікація та Авторизація з JS. З нуля

## Опис проекту
Цей проект створений для вивчення основ аутентифікації та авторизації з використанням JavaScript без застосування фреймворків і сторонніх бібліотек. Проект демонструє, як реалізувати сервер, маршрути, middleware, а також базові принципи безпеки даних і доступу.

---

## Особливості
- Чисте впровадження HTTP-сервера на Node.js.
- Підтримка маршрутів для публічного і приватного доступу.
- Реалізація middleware для обробки запитів.
- Проста структура для навчання та експериментів.

---

## Вимоги
- **Node.js** версії 18 і вище.
- Термінал або командний рядок.

---

## Встановлення та запуск

### 1. Клонування репозиторію
Склонуйте проект із GitHub:
```bash
git clone https://github.com/leva13007/learn_auth.git
```

Перейдіть до директорії проекту:
```bash
cd learn_auth
```

### 2. Встановлення залежностей

На даному етапі залежності відсутні, але це може змінитися з додаванням нових функцій.

### 3. Запуск сервера

Скористайтеся вбудованим скриптом для запуску сервера з автоматичним спостереженням за змінами:
```bash
npm start
```
Альтернативний спосіб:
```bash
node --watch server.js
```
Сервер буде запущено на http://127.0.0.1:3000.

### Мета проекту
	•	Вивчення основ Node.js і створення HTTP-серверів.
	•	Розуміння концепцій middleware, маршрутів і ролей (user/guest).
	•	Поступове введення в більш складні теми, такі як шифрування, JWT, і сторонні сервіси (OAuth2, Auth0, AWS Cognito).

### Додаткова інформація

Для більш глибокого розуміння теми дивіться відео на моєму [YouTube-каналі](https://www.youtube.com/playlist?list=PLa5SS6id3wWWbTku0CqcFqkvCIFrPd2NQ) у плейлисті “Authentication & Authorization with JS. From zero”.

### Ліцензія

Цей проект доступний під ліцензією MIT. Вільно використовуйте, модифікуйте та поширюйте.