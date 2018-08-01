Пакет SSR-bootstrap был выделен мною из нескольких своих проектов чтобы при желании обновить что-то
в его коде не нужно было делать это в нескольких проектах одновременно

#### Что он делает?

Предоставляет базовые функции серверного рендеринга для использования изоморфных приложениях, а
именно:

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
**loginPagePath:**  
**rootPath:**  
**setUserState:**  
**isLoggedInFromState:**   
**keyExpiresIn:** defaults to 30 days  
**authCookieName:**

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
