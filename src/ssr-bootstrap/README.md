Пакет SSR-bootstrap был выделен мною в отдельный пакет из нескольких проектов чтобы его можно было 
совершенствовать и развивать в одном месте

#### Что он делает?

* При помощи набора простых в использовании и конфигурации функций создает полноценное SSR-окружение
для express с использованием react, react-router и redux:
  * Инициализирует redux, принимая на вход набор редюсеров и несколько функций для управления 
  состоянием авторизации пользователя
  * Инициализирует react-router, принимая схему роутинга начиная с корневого Route
  * Обеспечивает cookie-based авторизацию при помощи bcrypt и jwt
* Предоставляет набор инструментов для логина;

В планах: 

* Инструменты для регистрации, в том числе через социальные сети 

# API 

## createStaticGenerator
функция генерирующая на выходе листенер URL-вызова express, например:
```javascript
import {createStaticGenerator} from 'ssr-bootstrap'

const generateStaticPage = createStaticGenerator({
    ...params
})

app.get('/*', generateStaticPage)
```
Как видно, на вход она принимает ряд простых параметров, а на выходе мы получаем готовую функцию
серверного рендеринга с управлением URL-роутингом, логином, инициализацией redux-контейнеров итд.

#### Интерфейс функции 
(дополняется по мере реализации функционала):

**getTemplate:** (required) function(dynamicHTML, initialReduxState) -> HTML String  
**getRootRoute:** (required) function(onEnter, onChange) -> React router's root route  
**jwtSecret:** (required) String (JSON web token secret key для логина)  
**domain:** (required)  
**reducers:** (required) обычный для redux объект с редюсерами (_не_ то что возвращает функция combineReduces, а то, 
что она принимает)  
**loginPagePath:** //todo  
**rootPath:** //todo   
**setUserState:** //todo   
**isLoggedInFromState:** //todo   
**keyExpiresIn:** defaults to 30 days  
**authCookieName:** //todo

## createLoginEP
Создает эндпоинт для экспресс, ставится на POST адреса логина, например `/login`
```javascript
app.post('/login', createLoginEP({
    ...params
}))
```

#### Интерфейс функции 
(дополняется по мере реализации функционала):  
**domain:** (required)  
**jwtSecret:** (required)  
**getUser:** (required) (async) функция получения пользователя из БД для сравнения пароля  
**keyExpiresIn:** defaults to 30 days  
**authCookieName:**  
**loginPagePath:**  
**rootPath:** 

## createLogoutEP 
